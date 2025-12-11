import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
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
  Menu,
  Divider,
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTransactionStore } from "../store/transactionStore";
import { useCategoryStore } from "../store/categoryStore";
import { Transaction, TransactionType } from "../services/transactionService";

interface RouteParams {
  transaction?: Transaction;
}

const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { transaction: editingTransaction } = (route.params as RouteParams) || {};

  const { createTransaction, updateTransaction, isLoading, error, clearError } =
    useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadData();

    if (editingTransaction) {
      setType(editingTransaction.type);
      setCategoryId(editingTransaction.categoryId);
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description || "");
      setTransactionDate(new Date(editingTransaction.transactionDate));
    }
  }, []);

  useEffect(() => {
    if (error) {
      showSnackbar(error);
      clearError();
    }
  }, [error]);

  const loadData = async () => {
    try {
      await fetchCategories();
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getCategoryName = (id: number): string => {
    const category = categories.find((c) => c.id === id);
    return category?.name || "Select Category";
  };

  const getCategoryColor = (id: number): string => {
    const category = categories.find((c) => c.id === id);
    return category?.color || "#6200ee";
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setTransactionDate(selectedDate);
    }
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

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const transactionData = {
        type,
        categoryId: categoryId!,
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        transactionDate: formatDateForAPI(transactionDate),
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData);
        showSnackbar("Transaction updated successfully");
      } else {
        await createTransaction(transactionData);
        showSnackbar("Transaction created successfully");
      }

      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (err) {
      console.error("Failed to save transaction:", err);
    }
  };

  return (
    <Surface style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Transaction Type
            </Text>
            <SegmentedButtons
              value={type}
              onValueChange={(value) => setType(value as TransactionType)}
              buttons={[
                {
                  value: TransactionType.INCOME,
                  label: "Income",
                  icon: "plus",
                },
                {
                  value: TransactionType.EXPENSE,
                  label: "Expense",
                  icon: "minus",
                },
              ]}
            />
          </Card.Content>
        </Card>

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
                    styles.selectButton,
                    categoryId && {
                      borderColor: getCategoryColor(categoryId),
                      borderWidth: 2,
                    },
                  ]}
                  contentStyle={styles.selectButtonContent}
                  icon={categoryId ? undefined : "chevron-down"}
                >
                  {categoryId ? (
                    <View style={styles.selectedItem}>
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
              Amount
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
              Description (Optional)
            </Text>
            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Add notes about this transaction"
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Transaction Date
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
              icon="calendar"
            >
              {formatDate(transactionDate)}
            </Button>
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
            {editingTransaction ? "Update" : "Create"}
          </Button>
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={transactionDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
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
  selectButton: {
    marginBottom: 8,
  },
  selectButtonContent: {
    height: 48,
    justifyContent: "flex-start",
  },
  selectedItem: {
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
  dateButton: {
    justifyContent: "flex-start",
  },
  helperText: {
    color: "#666",
    fontStyle: "italic",
    marginTop: 8,
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

export default AddTransactionScreen;
