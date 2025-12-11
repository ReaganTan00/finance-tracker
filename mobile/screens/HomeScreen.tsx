import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, Divider, SegmentedButtons, IconButton, DataTable } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VictoryPie } from 'victory-native';
import { AppStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';
import { Transaction, TransactionType } from '../services/transactionService';

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Home'>;

type DateRangeType = 'day' | 'week' | 'month' | 'year' | 'period';

interface CategorySpending {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout } = useAuthStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  // Date range state
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Fetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          await Promise.all([
            fetchTransactions(),
            fetchCategories(),
          ]);
        } catch (error) {
          console.error('Failed to load dashboard data:', error);
        }
      };
      loadData();
    }, [])
  );

  // Helper function to get date range based on type
  const getDateRange = (): { startDate: Date; endDate: Date } => {
    const now = new Date(currentDate);
    let startDate: Date;
    let endDate: Date;

    switch (dateRangeType) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;

      case 'week':
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as first day
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff, 0, 0, 0);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6, 23, 59, 59);
        break;

      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;

      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;

      case 'period':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          // Default to current month if custom dates not set
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }
        break;

      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    return { startDate, endDate };
  };

  // Navigate date range forward/backward
  const navigateDateRange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    switch (dateRangeType) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
      case 'period':
        // For custom period, don't navigate automatically
        return;
    }

    setCurrentDate(newDate);
  };

  // Format date range for display
  const formatDateRangeDisplay = (): string => {
    const { startDate, endDate } = getDateRange();

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    switch (dateRangeType) {
      case 'day':
        return formatDate(startDate);
      case 'week':
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      case 'month':
        return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'year':
        return startDate.getFullYear().toString();
      case 'period':
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      default:
        return '';
    }
  };

  // Calculate spending by category for selected date range
  const categorySpending = useMemo((): CategorySpending[] => {
    const { startDate, endDate } = getDateRange();

    // Filter transactions in date range and type EXPENSE
    const filteredTransactions = transactions.filter((t: Transaction) => {
      const transactionDate = new Date(t.transactionDate);
      return (
        t.type === TransactionType.EXPENSE &&
        transactionDate >= startDate &&
        transactionDate <= endDate
      );
    });

    // Group by category
    const categoryMap = new Map<number, number>();
    filteredTransactions.forEach((t: Transaction) => {
      const current = categoryMap.get(t.categoryId) || 0;
      categoryMap.set(t.categoryId, current + t.amount);
    });

    // Calculate total
    const total = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);

    // Build result array
    const result: CategorySpending[] = [];
    categoryMap.forEach((amount, categoryId) => {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        result.push({
          categoryId,
          categoryName: category.name,
          categoryColor: category.color || '#6200ee',
          categoryIcon: category.icon || 'folder',
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
        });
      }
    });

    // Sort by amount descending
    result.sort((a, b) => b.amount - a.amount);

    return result;
  }, [transactions, categories, dateRangeType, currentDate, customStartDate, customEndDate]);

  // Calculate total spent for date range
  const totalSpentInRange = useMemo(() => {
    return categorySpending.reduce((sum, cat) => sum + cat.amount, 0);
  }, [categorySpending]);

  // Prepare data for pie chart
  const pieChartData = useMemo(() => {
    if (categorySpending.length === 0) {
      return [{
        x: 'No Data',
        y: 1,
        color: '#e0e0e0',
      }];
    }

    return categorySpending.map(cat => ({
      x: cat.categoryName,
      y: cat.amount,
      color: cat.categoryColor,
    }));
  }, [categorySpending]);

  // Calculate overall statistics from categories
  const totalBudget = categories.reduce((sum, cat) => sum + (cat.plannedMonthlyBudget || 0), 0);
  const totalSpent = categories.reduce((sum, cat) => sum + (cat.monthlySpent || 0), 0);
  const transactionCount = transactions.length;
  const categoryCount = categories.length;

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is handled automatically by RootNavigator
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Card */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <View style={styles.welcomeHeader}>
              <Avatar.Icon
                size={60}
                icon="account-circle"
                style={styles.avatar}
                color="#FF8FAB"
              />
              <View style={styles.welcomeTextContainer}>
                <Title style={styles.welcomeTitle}>Welcome back!</Title>
                <Paragraph style={styles.welcomeName}>{user?.name}</Paragraph>
                <Paragraph style={styles.welcomeEmail}>{user?.email}</Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Stats Card with Enhanced Statistics */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Quick Stats</Title>
            <Divider style={styles.divider} />

            {/* Basic Stats */}
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Title style={styles.statValue}>${totalBudget.toFixed(2)}</Title>
                <Paragraph style={styles.statLabel}>Total Budget</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={styles.statValue}>${totalSpent.toFixed(2)}</Title>
                <Paragraph style={styles.statLabel}>Spent</Paragraph>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Title style={styles.statValue}>{transactionCount}</Title>
                <Paragraph style={styles.statLabel}>Transactions</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={styles.statValue}>{categoryCount}</Title>
                <Paragraph style={styles.statLabel}>Categories</Paragraph>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Date Range Selector */}
            <Title style={styles.sectionTitle}>Spending Analysis</Title>
            <SegmentedButtons
              value={dateRangeType}
              onValueChange={(value) => setDateRangeType(value as DateRangeType)}
              buttons={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
              style={styles.segmentedButtons}
            />

            {/* Date Navigation */}
            <View style={styles.dateNavigation}>
              <IconButton
                icon="chevron-left"
                size={24}
                onPress={() => navigateDateRange('prev')}
                disabled={dateRangeType === 'period'}
              />
              <Paragraph style={styles.dateRangeText}>
                {formatDateRangeDisplay()}
              </Paragraph>
              <IconButton
                icon="chevron-right"
                size={24}
                onPress={() => navigateDateRange('next')}
                disabled={dateRangeType === 'period'}
              />
            </View>

            {/* Total Spent in Range */}
            <View style={styles.totalSpentContainer}>
              <Title style={styles.totalSpentValue}>
                ${totalSpentInRange.toFixed(2)}
              </Title>
              <Paragraph style={styles.totalSpentLabel}>Total Spent</Paragraph>
            </View>

            {/* Pie Chart */}
            {categorySpending.length > 0 ? (
              <View style={styles.chartContainer}>
                <VictoryPie
                  data={pieChartData}
                  colorScale={pieChartData.map(d => d.color)}
                  width={Dimensions.get('window').width - 64}
                  height={220}
                  padding={40}
                  innerRadius={50}
                  labelRadius={({ innerRadius }) => (innerRadius as number) + 30}
                  style={{
                    labels: {
                      fill: '#333',
                      fontSize: 12,
                      fontWeight: '600'
                    },
                  }}
                  labels={({ datum }) => `${datum.x}\n${datum.percentage?.toFixed(0) || 0}%`}
                />
              </View>
            ) : (
              <View style={styles.emptyChartContainer}>
                <Paragraph style={styles.emptyChartText}>
                  No expenses in this period
                </Paragraph>
              </View>
            )}

            {/* Breakdown Table */}
            {categorySpending.length > 0 && (
              <View style={styles.breakdownContainer}>
                <Title style={styles.breakdownTitle}>Breakdown by Category</Title>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Category</DataTable.Title>
                    <DataTable.Title numeric>%</DataTable.Title>
                    <DataTable.Title numeric>Amount</DataTable.Title>
                  </DataTable.Header>

                  {categorySpending.map((cat) => (
                    <DataTable.Row key={cat.categoryId}>
                      <DataTable.Cell>
                        <View style={styles.categoryCell}>
                          <View
                            style={[
                              styles.categoryColorDot,
                              { backgroundColor: cat.categoryColor },
                            ]}
                          />
                          <Paragraph style={styles.categoryNameText}>
                            {cat.categoryName}
                          </Paragraph>
                        </View>
                      </DataTable.Cell>
                      <DataTable.Cell numeric>
                        <Paragraph style={styles.percentageText}>
                          {cat.percentage.toFixed(1)}%
                        </Paragraph>
                      </DataTable.Cell>
                      <DataTable.Cell numeric>
                        <Paragraph style={styles.amountText}>
                          ${cat.amount.toFixed(2)}
                        </Paragraph>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions Card */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Quick Actions</Title>
            <Divider style={styles.divider} />

            <Button
              mode="contained"
              icon="plus-circle"
              onPress={() => navigation.navigate('AddTransaction')}
              style={styles.actionButton}
              buttonColor="#FF8FAB"
            >
              Add Transaction
            </Button>

            <Button
              mode="outlined"
              icon="format-list-bulleted"
              onPress={() => navigation.navigate('TransactionList')}
              style={styles.actionButton}
              textColor="#FF8FAB"
            >
              View Transactions
            </Button>

            <Button
              mode="outlined"
              icon="tag-multiple"
              onPress={() => navigation.navigate('CategoryManagement')}
              style={styles.actionButton}
              textColor="#FF8FAB"
            >
              Manage Categories
            </Button>

            <Button
              mode="outlined"
              icon="account"
              onPress={() => navigation.navigate('Profile')}
              style={styles.actionButton}
              textColor="#FF8FAB"
            >
              View Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Partner Info Card (if has partner) */}
        {user?.partnerId && (
          <Card style={styles.partnerCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Shared Budget</Title>
              <Divider style={styles.divider} />
              <Paragraph style={styles.partnerText}>
                You're sharing a budget with your partner!
              </Paragraph>
              <Button
                mode="outlined"
                icon="account-multiple"
                onPress={() => navigation.navigate('PartnerBudgetView')}
                style={styles.actionButton}
                textColor="#FF8FAB"
              >
                View Partner's Budget
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Logout Button */}
        <Button
          mode="text"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#FF5252"
        >
          Logout
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE4E9',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 4,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#FFE4E9',
  },
  welcomeTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF8FAB',
    marginBottom: 2,
  },
  welcomeEmail: {
    fontSize: 14,
    color: '#666666',
  },
  statsCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 4,
  },
  actionsCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 4,
  },
  partnerCard: {
    marginBottom: 16,
    backgroundColor: '#FFF5F7',
    borderRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: '#FFB3C6',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8FAB',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 8,
    minWidth: 200,
    textAlign: 'center',
  },
  totalSpentContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFF5F7',
    borderRadius: 12,
  },
  totalSpentValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF8FAB',
  },
  totalSpentLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyChartContainer: {
    alignItems: 'center',
    padding: 40,
    marginBottom: 24,
  },
  emptyChartText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  breakdownContainer: {
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  categoryCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryNameText: {
    fontSize: 14,
    color: '#333333',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8FAB',
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  partnerText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 8,
  },
});
