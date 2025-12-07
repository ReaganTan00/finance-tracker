import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, List, Divider, Avatar, Button, Badge } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { usePartnerStore } from '../store/partnerStore';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { currentPartner, incomingRequest, fetchPartnerStatus } = usePartnerStore();

  useEffect(() => {
    fetchPartnerStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePartnerNavigation = () => {
    if (currentPartner) {
      navigation.navigate('PartnerProfile');
    } else if (incomingRequest) {
      navigation.navigate('PartnerRequests');
    } else {
      navigation.navigate('PartnerConnection');
    }
  };

  const getPartnerDescription = () => {
    if (currentPartner) {
      return `Connected with ${currentPartner.name}`;
    } else if (incomingRequest) {
      return `Pending request from ${incomingRequest.name}`;
    } else {
      return 'No partner linked';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Icon
              size={80}
              icon="account"
              style={styles.avatar}
              color="#FF8FAB"
            />
            <Title style={styles.profileName}>{user?.name}</Title>
            <Paragraph style={styles.profileEmail}>{user?.email}</Paragraph>
          </Card.Content>
        </Card>

        {/* Account Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Account Information</Title>
            <Divider style={styles.divider} />

            <List.Item
              title="User ID"
              description={user?.userId.toString()}
              left={(props) => <List.Icon {...props} icon="identifier" color="#FF8FAB" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
            <Divider />

            <List.Item
              title="Full Name"
              description={user?.name}
              left={(props) => <List.Icon {...props} icon="account" color="#FF8FAB" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
            <Divider />

            <List.Item
              title="Email"
              description={user?.email}
              left={(props) => <List.Icon {...props} icon="email" color="#FF8FAB" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
            <Divider />

            <List.Item
              title="Partner Status"
              description={getPartnerDescription()}
              left={(props) => <List.Icon {...props} icon="account-multiple" color="#FF8FAB" />}
              right={(props) => incomingRequest ? <Badge size={24} style={styles.badge}>!</Badge> : null}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Settings</Title>
            <Divider style={styles.divider} />

            <List.Item
              title="Edit Profile"
              left={(props) => <List.Icon {...props} icon="pencil" color="#FF8FAB" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => console.log('Edit profile')}
              titleStyle={styles.listTitle}
            />
            <Divider />

            <List.Item
              title="Change Password"
              left={(props) => <List.Icon {...props} icon="lock-reset" color="#FF8FAB" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => console.log('Change password')}
              titleStyle={styles.listTitle}
            />
            <Divider />

            <List.Item
              title={currentPartner ? "Partner Profile" : "Manage Partner"}
              left={(props) => <List.Icon {...props} icon="link-variant" color="#FF8FAB" />}
              right={(props) => (
                <>
                  {incomingRequest && <Badge size={24} style={styles.badge}>1</Badge>}
                  <List.Icon {...props} icon="chevron-right" />
                </>
              )}
              onPress={handlePartnerNavigation}
              titleStyle={styles.listTitle}
            />
            <Divider />

            <List.Item
              title="Notifications"
              left={(props) => <List.Icon {...props} icon="bell" color="#FF8FAB" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => console.log('Notifications')}
              titleStyle={styles.listTitle}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#FF5252"
          textColor="#FFFFFF"
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
  profileCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: '#FFE4E9',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666666',
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 4,
  },
  settingsCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
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
    marginBottom: 8,
    backgroundColor: '#FFB3C6',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  listDescription: {
    fontSize: 14,
    color: '#666666',
  },
  logoutButton: {
    borderRadius: 8,
    paddingVertical: 4,
  },
  badge: {
    backgroundColor: '#FF6B6B',
    marginRight: 8,
  },
});
