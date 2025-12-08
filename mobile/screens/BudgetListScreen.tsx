import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Surface,
  Text,
  Button,
  Card,
  IconButton,
  Chip,
  ProgressBar,
  Snackbar,
  SegmentedButtons,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useBudgetStore } from "../store/budgetStore";
import { useCategoryStore } from "../store/categoryStore";
import { Budget, BudgetPeriod } from "../services/budgetService";

type ViewMode = "active" | "all";

const BudgetListScreen = () => {
  const navigation = useNavigation();
  const {
    budgets,
    isLoading,
    error,
    fetchBudgets,
    fetchActiveBudgets,
    deleteBudget,
    clearError,
  } = useBudgetStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadData();
  }, [viewMode]);

  useEffect(() => {
    if (error) {
      showSnackbar(error);
      clearError();
    }
  }, [error]);

  const loadData = async () => {
    try {
      await fetchCategories();
      if (viewMode === "active") {
        await fetchActiveBudgets();
      } else {
        await fetchBudgets();
      }
    } catch (err) {
      console.error("Failed to load budgets:", err);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: number): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "#6200ee";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPeriod = (period: BudgetPeriod): string => {
    return period.charAt(0) + period.slice(1).toLowerCase();
  };

  const getProgressColor = (spent: number, amount: number): string => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return "#d32f2f";
    if (percentage >= 80) return "#f57c00";
    if (percentage >= 60) return "#fbc02d";
    return "#388e3c";
  };

  const handleDelete = (budget: Budget) => {
    Alert.alert(
      "Delete Budget",
      `Are you sure you want to delete this budget for "${getCategoryName(
        budget.categoryId
      )}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBudget(budget.id);
              showSnackbar("Budget deleted successfully");
            } catch (err) {
              console.error("Failed to delete budget:", err);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (budget: Budget) => {
    navigation.navigate("AddBudget" as never, { budget } as never);
  };

  const renderBudgetItem = ({ item }: { item: Budget }) => {
    const progressPercentage = item.amount > 0 ? item.spent / item.amount : 0;
    const isOverBudget = item.spent > item.amount;
    const progressColor = getProgressColor(item.spent, item.amount);

    return (
      <Card style={styles.budgetCard}>
        <Card.Content>
          <View style={styles.budgetHeader}>
            <View style={styles.budgetTitleRow}>
              <View
                style={[
                  styles.categoryIndicator,
                  { backgroundColor: getCategoryColor(item.categoryId) },
                ]}
              />
              <Text variant="titleLarge" style={styles.budgetTitle}>
                {getCategoryName(item.categoryId)}
              </Text>
            </View>
            <View style={styles.budgetActions}>
              <IconButton icon="pencil" size={20} onPress={() => handleEdit(item)} />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDelete(item)}
              />
            </View>
          </View>

          <View style={styles.budgetDetails}>
            <View style={styles.detailRow}>
              <Chip
                icon="calendar-range"
                mode="outlined"
                compact
                style={styles.chip}
              >
                {formatPeriod(item.period)}
              </Chip>
              {!item.active && (
                <Chip mode="flat" compact style={styles.expiredChip}>
                  Expired
                </Chip>
              )}
            </View>

            <View style={styles.dateRow}>
              <Text variant="bodySmall" style={styles.dateText}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <View style={styles.amountRow}>
              <View style={styles.amountItem}>
                <Text variant="bodySmall" style={styles.amountLabel}>
                  Budget
                </Text>
                <Text variant="titleMedium" style={styles.amountValue}>
                  ${item.amount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.amountItem}>
                <Text variant="bodySmall" style={styles.amountLabel}>
                  Spent
                </Text>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.amountValue,
                    isOverBudget && styles.overBudgetText,
                  ]}
                >
                  ${item.spent.toFixed(2)}
                </Text>
              </View>
              <View style={styles.amountItem}>
                <Text variant="bodySmall" style={styles.amountLabel}>
                  Remaining
                </Text>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.amountValue,
                    isOverBudget && styles.overBudgetText,
                  ]}
                >
                  ${item.remaining.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={Math.min(progressPercentage, 1)}
              color={progressColor}
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.progressText}>
              {(progressPercentage * 100).toFixed(0)}% used
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Budgets
        </Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate("AddBudget" as never)}
          style={styles.addButton}
        >
          Add Budget
        </Button>
      </View>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
          buttons={[
            { value: "active", label: "Active" },
            { value: "all", label: "All" },
          ]}
        />
      </View>

      <FlatList
        data={budgets}
        renderItem={renderBudgetItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No budgets yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Create your first budget to track your spending
              </Text>
            </View>
          ) : null
        }
      />

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
  },
  addButton: {
    borderRadius: 8,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  budgetCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  budgetTitle: {
    fontWeight: "600",
    flex: 1,
  },
  budgetActions: {
    flexDirection: "row",
  },
  budgetDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
  },
  expiredChip: {
    backgroundColor: "#ffebee",
  },
  dateRow: {
    flexDirection: "row",
  },
  dateText: {
    color: "#666",
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountItem: {
    flex: 1,
    alignItems: "center",
  },
  amountLabel: {
    color: "#666",
    marginBottom: 4,
  },
  amountValue: {
    fontWeight: "600",
  },
  overBudgetText: {
    color: "#d32f2f",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: "right",
    marginTop: 4,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#999",
    textAlign: "center",
  },
});

export default BudgetListScreen;
