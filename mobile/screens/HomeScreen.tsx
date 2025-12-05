import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout } = useAuthStore();

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

        {/* Quick Stats Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Quick Stats</Title>
            <Divider style={styles.divider} />
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Title style={styles.statValue}>$0.00</Title>
                <Paragraph style={styles.statLabel}>Total Budget</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={styles.statValue}>$0.00</Title>
                <Paragraph style={styles.statLabel}>Spent</Paragraph>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Title style={styles.statValue}>0</Title>
                <Paragraph style={styles.statLabel}>Transactions</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={styles.statValue}>0</Title>
                <Paragraph style={styles.statLabel}>Categories</Paragraph>
              </View>
            </View>
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
              onPress={() => console.log('Add transaction')}
              style={styles.actionButton}
              buttonColor="#FF8FAB"
            >
              Add Transaction
            </Button>

            <Button
              mode="outlined"
              icon="chart-line"
              onPress={() => console.log('View budgets')}
              style={styles.actionButton}
              textColor="#FF8FAB"
            >
              View Budgets
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
                onPress={() => console.log('View shared budget')}
                style={styles.actionButton}
                textColor="#FF8FAB"
              >
                View Shared Budget
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
