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
  Snackbar,
  SegmentedButtons,
  Menu,
  Divider,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useTransactionStore } from "../store/transactionStore";
import { useCategoryStore } from "../store/categoryStore";
import { Transaction, TransactionType } from "../services/transactionService";

type FilterType = "all" | "income" | "expense";

const TransactionListScreen = () => {
  const navigation = useNavigation();
  const {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    deleteTransaction,
    clearError,
  } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [filterType, setFilterType] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadData();
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
      await fetchTransactions();
    } catch (err) {
      console.error("Failed to load transactions:", err);
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

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getFilteredTransactions = (): Transaction[] => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType === "income") {
      filtered = filtered.filter((t) => t.type === TransactionType.INCOME);
    } else if (filterType === "expense") {
      filtered = filtered.filter((t) => t.type === TransactionType.EXPENSE);
    }

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter((t) => t.categoryId === categoryFilter);
    }

    // Sort by transaction date (most recent first)
    filtered.sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime()
    );

    return filtered;
  };

  const calculateTotals = () => {
    const filtered = getFilteredTransactions();
    const income = filtered
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  };

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
              showSnackbar("Transaction deleted successfully");
            } catch (err) {
              console.error("Failed to delete transaction:", err);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (transaction: Transaction) => {
    navigation.navigate("AddTransaction" as never, { transaction } as never);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === TransactionType.INCOME;
    const amountColor = isIncome ? "#388e3c" : "#d32f2f";
    const amountPrefix = isIncome ? "+" : "-";

    return (
      <Card style={styles.transactionCard}>
        <Card.Content>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionLeft}>
              <View
                style={[
                  styles.categoryIndicator,
                  { backgroundColor: getCategoryColor(item.categoryId) },
                ]}
              />
              <View style={styles.transactionInfo}>
                <Text variant="titleMedium" style={styles.categoryName}>
                  {getCategoryName(item.categoryId)}
                </Text>
                {item.description && (
                  <Text variant="bodySmall" style={styles.description}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.transactionMeta}>
                  <Text variant="bodySmall" style={styles.metaText}>
                    {formatDate(item.transactionDate)}
                  </Text>
                  <Text variant="bodySmall" style={styles.metaText}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text
                variant="titleLarge"
                style={[styles.amount, { color: amountColor }]}
              >
                {amountPrefix}${item.amount.toFixed(2)}
              </Text>
              <View style={styles.actions}>
                <IconButton
                  icon="pencil"
                  size={18}
                  onPress={() => handleEdit(item)}
                />
                <IconButton
                  icon="delete"
                  size={18}
                  onPress={() => handleDelete(item)}
                />
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const totals = calculateTotals();
  const filteredTransactions = getFilteredTransactions();

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Transactions
        </Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate("AddTransaction" as never)}
          style={styles.addButton}
        >
          Add
        </Button>
      </View>

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
                +${totals.income.toFixed(2)}
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
                -${totals.expense.toFixed(2)}
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
                  totals.net >= 0 ? styles.incomeText : styles.expenseText,
                ]}
              >
                ${totals.net.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filterType}
          onValueChange={(value) => setFilterType(value as FilterType)}
          buttons={[
            { value: "all", label: "All" },
            { value: "income", label: "Income" },
            { value: "expense", label: "Expense" },
          ]}
          style={styles.typeFilter}
        />

        <View style={styles.categoryFilterRow}>
          <Text variant="bodyMedium" style={styles.filterLabel}>
            Category:
          </Text>
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Chip
                mode="outlined"
                onPress={() => setCategoryMenuVisible(true)}
                style={styles.categoryChip}
                icon="filter"
              >
                {categoryFilter
                  ? getCategoryName(categoryFilter)
                  : "All Categories"}
              </Chip>
            }
          >
            <Menu.Item
              onPress={() => {
                setCategoryFilter(null);
                setCategoryMenuVisible(false);
              }}
              title="All Categories"
            />
            <Divider />
            {categories.map((category) => (
              <React.Fragment key={category.id}>
                <Menu.Item
                  onPress={() => {
                    setCategoryFilter(category.id);
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
        </View>
      </View>

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
                No transactions yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Start tracking your income and expenses
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
  filterContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  typeFilter: {
    marginBottom: 12,
  },
  categoryFilterRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterLabel: {
    marginRight: 12,
    color: "#666",
  },
  categoryChip: {
    flex: 1,
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
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  transactionCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionLeft: {
    flexDirection: "row",
    flex: 1,
  },
  categoryIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  categoryName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    color: "#666",
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaText: {
    color: "#999",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  amount: {
    fontWeight: "700",
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    marginTop: -8,
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

export default TransactionListScreen;
