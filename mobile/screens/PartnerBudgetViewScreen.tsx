import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
} from "react-native";
import {
  Surface,
  Text,
  Card,
  ProgressBar,
  Chip,
  Snackbar,
  SegmentedButtons,
} from "react-native-paper";
import { useCategoryStore } from "../store/categoryStore";
import { useTransactionStore } from "../store/transactionStore";
import { usePartnerStore } from "../store/partnerStore";
import { Category } from "../services/categoryService";
import { Transaction, TransactionType } from "../services/transactionService";

type ViewMode = "categories" | "transactions";

const PartnerBudgetViewScreen = () => {
  const { currentPartner } = usePartnerStore();
  const {
    categories: partnerCategories,
    isLoading: categoriesLoading,
    error: categoriesError,
    fetchPartnerCategories,
    clearError: clearCategoriesError,
  } = useCategoryStore();
  const {
    partnerTransactions,
    isLoading: transactionsLoading,
    error: transactionsError,
    fetchPartnerTransactions,
    clearError: clearTransactionsError,
  } = useTransactionStore();

  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (categoriesError) {
      showSnackbar(categoriesError);
      clearCategoriesError();
    }
    if (transactionsError) {
      showSnackbar(transactionsError);
      clearTransactionsError();
    }
  }, [categoriesError, transactionsError]);

  const loadData = async () => {
    try {
      await Promise.all([fetchPartnerCategories(), fetchPartnerTransactions()]);
    } catch (err) {
      console.error("Failed to load partner data:", err);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getProgressColor = (spent: number, budget: number): string => {
    if (budget === 0) return "#999";
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return "#d32f2f";
    if (percentage >= 80) return "#f57c00";
    if (percentage >= 60) return "#fbc02d";
    return "#388e3c";
  };

  const getFilteredTransactions = (): Transaction[] => {
    if (!selectedCategoryId) return partnerTransactions;
    return partnerTransactions.filter((t) => t.categoryId === selectedCategoryId);
  };

  const calculateTransactionTotals = () => {
    const transactions = getFilteredTransactions();
    const income = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  };

  const renderCategoryCard = ({ item }: { item: Category }) => {
    const progressPercentage =
      item.plannedMonthlyBudget > 0
        ? item.monthlySpent / item.plannedMonthlyBudget
        : 0;
    const isOverBudget = item.monthlySpent > item.plannedMonthlyBudget;
    const progressColor = getProgressColor(
      item.monthlySpent,
      item.plannedMonthlyBudget
    );

    return (
      <Card
        style={[
          styles.categoryCard,
          selectedCategoryId === item.id && styles.selectedCard,
        ]}
        onPress={() =>
          setSelectedCategoryId(selectedCategoryId === item.id ? null : item.id)
        }
      >
        <Card.Content>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryTitleRow}>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: item.color || "#6200ee" },
                ]}
              />
              <Text variant="titleLarge" style={styles.categoryTitle}>
                {item.name}
              </Text>
            </View>
          </View>

          {item.description && (
            <Text variant="bodySmall" style={styles.description}>
              {item.description}
            </Text>
          )}

          <View style={styles.amountContainer}>
            <View style={styles.amountRow}>
              <View style={styles.amountItem}>
                <Text variant="bodySmall" style={styles.amountLabel}>
                  Budget
                </Text>
                <Text variant="titleMedium" style={styles.amountValue}>
                  ${item.plannedMonthlyBudget.toFixed(2)}
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
                  ${item.monthlySpent.toFixed(2)}
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
                  ${item.monthlyRemaining.toFixed(2)}
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

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === TransactionType.INCOME;
    const amountColor = isIncome ? "#388e3c" : "#d32f2f";
    const amountPrefix = isIncome ? "+" : "-";

    return (
      <Card style={styles.transactionCard}>
        <Card.Content>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionInfo}>
              <Text variant="titleMedium" style={styles.categoryName}>
                {item.categoryName || "Unknown"}
              </Text>
              {item.description && (
                <Text variant="bodySmall" style={styles.description}>
                  {item.description}
                </Text>
              )}
              <Text variant="bodySmall" style={styles.dateText}>
                {formatDate(item.transactionDate)}
              </Text>
            </View>
            <Text
              variant="titleLarge"
              style={[styles.amount, { color: amountColor }]}
            >
              {amountPrefix}${item.amount.toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const isLoading = categoriesLoading || transactionsLoading;
  const filteredTransactions = getFilteredTransactions();
  const transactionTotals = calculateTransactionTotals();

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          {currentPartner?.name || "Partner"}'s Budget
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          View only - Read-only access
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
          buttons={[
            { value: "categories", label: "Categories" },
            { value: "transactions", label: "Transactions" },
          ]}
        />

        {viewMode === "transactions" && (
          <View style={styles.transactionFilterContainer}>
            <Text variant="bodyMedium" style={styles.filterLabel}>
              Filter by category:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
            >
              <Chip
                mode={selectedCategoryId === null ? "flat" : "outlined"}
                onPress={() => setSelectedCategoryId(null)}
                style={styles.filterChip}
              >
                All
              </Chip>
              {partnerCategories.map((category) => (
                <Chip
                  key={category.id}
                  mode={selectedCategoryId === category.id ? "flat" : "outlined"}
                  onPress={() => setSelectedCategoryId(category.id)}
                  style={styles.filterChip}
                >
                  {category.name}
                </Chip>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {viewMode === "categories" ? (
        <FlatList
          data={partnerCategories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadData} />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No categories to display
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Your partner hasn't created any categories yet
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        <>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Income
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={[styles.summaryValue, styles.incomeText]}
                  >
                    +${transactionTotals.income.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Expense
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={[styles.summaryValue, styles.expenseText]}
                  >
                    -${transactionTotals.expense.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Net
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.summaryValue,
                      transactionTotals.net >= 0
                        ? styles.incomeText
                        : styles.expenseText,
                    ]}
                  >
                    ${transactionTotals.net.toFixed(2)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <FlatList
            data={filteredTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={loadData} />
            }
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Text variant="bodyLarge" style={styles.emptyText}>
                    No transactions to display
                  </Text>
                  <Text variant="bodyMedium" style={styles.emptySubtext}>
                    {selectedCategoryId
                      ? "No transactions for this category"
                      : "Your partner hasn't added any transactions yet"}
                  </Text>
                </View>
              ) : null
            }
          />
        </>
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
  header: {
    padding: 16,
    backgroundColor: "white",
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {
    color: "#666",
    marginTop: 4,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  transactionFilterContainer: {
    marginTop: 12,
  },
  filterLabel: {
    color: "#666",
    marginBottom: 8,
  },
  chipScroll: {
    flexDirection: "row",
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  categoryCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#6200ee",
  },
  categoryHeader: {
    marginBottom: 8,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  categoryTitle: {
    fontWeight: "600",
    flex: 1,
  },
  description: {
    color: "#666",
    marginBottom: 8,
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
  summaryCard: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    color: "#666",
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: "600",
  },
  incomeText: {
    color: "#388e3c",
  },
  expenseText: {
    color: "#d32f2f",
  },
  transactionCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  categoryName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  dateText: {
    color: "#666",
  },
  amount: {
    fontWeight: "700",
    marginLeft: 12,
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

export default PartnerBudgetViewScreen;
