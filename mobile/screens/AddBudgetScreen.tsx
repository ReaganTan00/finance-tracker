import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import {
  Surface,
  Text,
  Button,
  TextInput,
  SegmentedButtons,
  Snackbar,
  Card,
  IconButton,
  Menu,
  Divider,
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useBudgetStore } from "../store/budgetStore";
import { useCategoryStore } from "../store/categoryStore";
import { BudgetPeriod, Budget } from "../services/budgetService";

interface RouteParams {
  budget?: Budget;
}

const AddBudgetScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { budget: editingBudget } = (route.params as RouteParams) || {};

  const { createBudget, updateBudget, isLoading, error, clearError } =
    useBudgetStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<BudgetPeriod>(BudgetPeriod.MONTHLY);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    fetchCategories();

    if (editingBudget) {
      setCategoryId(editingBudget.categoryId);
      setAmount(editingBudget.amount.toString());
      setPeriod(editingBudget.period);
      setStartDate(new Date(editingBudget.startDate));
      setEndDate(new Date(editingBudget.endDate));
    } else {
      calculateEndDate(new Date(), period);
    }
  }, []);

  useEffect(() => {
    if (error) {
      showSnackbar(error);
      clearError();
    }
  }, [error]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const calculateEndDate = (start: Date, budgetPeriod: BudgetPeriod) => {
    const end = new Date(start);

    switch (budgetPeriod) {
      case BudgetPeriod.DAILY:
        end.setDate(end.getDate() + 1);
        break;
      case BudgetPeriod.WEEKLY:
        end.setDate(end.getDate() + 7);
        break;
      case BudgetPeriod.MONTHLY:
        end.setMonth(end.getMonth() + 1);
        break;
      case BudgetPeriod.YEARLY:
        end.setFullYear(end.getFullYear() + 1);
        break;
      case BudgetPeriod.CUSTOM:
        // For custom, user sets their own end date
        break;
    }

    setEndDate(end);
  };

  const handlePeriodChange = (value: string) => {
    const newPeriod = value as BudgetPeriod;
    setPeriod(newPeriod);
    if (newPeriod !== BudgetPeriod.CUSTOM) {
      calculateEndDate(startDate, newPeriod);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) {
      setStartDate(selectedDate);
      if (period !== BudgetPeriod.CUSTOM) {
        calculateEndDate(selectedDate, period);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const getCategoryName = (id: number): string => {
    const category = categories.find((c) => c.id === id);
    return category?.name || "Select Category";
  };

  const getCategoryColor = (id: number): string => {
    const category = categories.find((c) => c.id === id);
    return category?.color || "#6200ee";
  };

  const validateForm = (): boolean => {
    if (!categoryId) {
      showSnackbar("Please select a category");
      return false;
    }

    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      showSnackbar("Please enter a valid amount");
      return false;
    }

    if (endDate <= startDate) {
      showSnackbar("End date must be after start date");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const budgetData = {
        categoryId: categoryId!,
        amount: parseFloat(amount),
        period,
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData);
        showSnackbar("Budget updated successfully");
      } else {
        await createBudget(budgetData);
        showSnackbar("Budget created successfully");
      }

      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (err) {
      console.error("Failed to save budget:", err);
    }
  };

  return (
    <Surface style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Category
            </Text>
            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setCategoryMenuVisible(true)}
                  style={[
                    styles.categoryButton,
                    categoryId && {
                      borderColor: getCategoryColor(categoryId),
                      borderWidth: 2,
                    },
                  ]}
                  contentStyle={styles.categoryButtonContent}
                  icon={categoryId ? undefined : "chevron-down"}
                >
                  {categoryId ? (
                    <View style={styles.selectedCategory}>
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: getCategoryColor(categoryId) },
                        ]}
                      />
                      <Text>{getCategoryName(categoryId)}</Text>
                    </View>
                  ) : (
                    "Select Category"
                  )}
                </Button>
              }
            >
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                  <Menu.Item
                    onPress={() => {
                      setCategoryId(category.id);
                      setCategoryMenuVisible(false);
                    }}
                    title={
                      <View style={styles.menuItem}>
                        <View
                          style={[
                            styles.colorDot,
                            { backgroundColor: category.color || "#6200ee" },
                          ]}
                        />
                        <Text>{category.name}</Text>
                      </View>
                    }
                  />
                  <Divider />
                </React.Fragment>
              ))}
            </Menu>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Budget Amount
            </Text>
            <TextInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              mode="outlined"
              left={<TextInput.Affix text="$" />}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Budget Period
            </Text>
            <SegmentedButtons
              value={period}
              onValueChange={handlePeriodChange}
              buttons={[
                { value: BudgetPeriod.DAILY, label: "Daily" },
                { value: BudgetPeriod.WEEKLY, label: "Weekly" },
                { value: BudgetPeriod.MONTHLY, label: "Monthly" },
              ]}
              style={styles.segmentedButtons}
            />
            <SegmentedButtons
              value={period}
              onValueChange={handlePeriodChange}
              buttons={[
                { value: BudgetPeriod.YEARLY, label: "Yearly" },
                { value: BudgetPeriod.CUSTOM, label: "Custom" },
              ]}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Date Range
            </Text>

            <View style={styles.dateContainer}>
              <Text variant="bodyMedium" style={styles.dateLabel}>
                Start Date
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowStartPicker(true)}
                style={styles.dateButton}
                icon="calendar"
              >
                {formatDate(startDate)}
              </Button>
            </View>

            <View style={styles.dateContainer}>
              <Text variant="bodyMedium" style={styles.dateLabel}>
                End Date
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowEndPicker(true)}
                style={styles.dateButton}
                icon="calendar"
                disabled={period !== BudgetPeriod.CUSTOM}
              >
                {formatDate(endDate)}
              </Button>
            </View>

            {period !== BudgetPeriod.CUSTOM && (
              <Text variant="bodySmall" style={styles.helperText}>
                End date is automatically calculated based on the selected period
              </Text>
            )}
          </Card.Content>
        </Card>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            loading={isLoading}
          >
            {editingBudget ? "Update" : "Create"}
          </Button>
        </View>
      </ScrollView>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate}
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "Dismiss",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  categoryButton: {
    marginBottom: 8,
  },
  categoryButtonContent: {
    height: 48,
  },
  selectedCategory: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  input: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    marginBottom: 8,
    color: "#666",
  },
  dateButton: {
    justifyContent: "flex-start",
  },
  helperText: {
    color: "#666",
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default AddBudgetScreen;
