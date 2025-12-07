import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Card, Button, Snackbar, Avatar, Divider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { usePartnerStore } from "../store/partnerStore";
import { useNavigation } from "@react-navigation/native";

export default function PartnerProfileScreen() {
  const navigation = useNavigation();
  const {
    currentPartner,
    unlinkPartner,
    fetchPartnerStatus,
    isLoading,
    error,
    clearError,
  } = usePartnerStore();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    fetchPartnerStatus();
  }, []);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleUnlink = () => {
    if (!currentPartner) return;

    Alert.alert(
      "Unlink Partner",
      `Are you sure you want to unlink from ${currentPartner.name}? This will remove all shared budgets and transactions.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            try {
              await unlinkPartner();
              setSnackbarMessage("Successfully unlinked from partner");
              setSnackbarVisible(true);
              // Navigate back after unlinking
              setTimeout(() => {
                navigation.goBack();
              }, 1500);
            } catch (err) {
              // Error handled by store
            }
          },
        },
      ]
    );
  };

  if (!currentPartner) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No Partner Connected</Text>
          <Text style={styles.emptyText}>
            You don't have a partner connected yet. Send a partner request to
            get started!
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            buttonColor="#FF8FAB"
            style={styles.backButton}
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Partner Header */}
          <View style={styles.header}>
            <Avatar.Text
              size={100}
              label={getInitials(currentPartner.name)}
              style={styles.avatar}
              color="#FFFFFF"
              labelStyle={styles.avatarLabel}
            />
            <Text style={styles.partnerName}>{currentPartner.name}</Text>
            <Text style={styles.partnerEmail}>{currentPartner.email}</Text>
            <Text style={styles.connectedDate}>
              Connected since{" "}
              {new Date(currentPartner.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Partner Info Card */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Partner Information</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{currentPartner.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{currentPartner.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Partner ID:</Text>
                <Text style={styles.infoValue}>#{currentPartner.id}</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Shared Features Card */}
          <Card style={styles.featuresCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>What You Can Do Together</Text>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>
                  Create and manage shared budgets
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>
                  Track shared expenses and transactions
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>
                  View each other's budget progress
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>
                  Collaborate on financial goals
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Unlink Button */}
          <Button
            mode="outlined"
            onPress={handleUnlink}
            loading={isLoading}
            disabled={isLoading}
            textColor="#FF6B6B"
            style={styles.unlinkButton}
          >
            Unlink Partner
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          clearError();
        }}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => {
            setSnackbarVisible(false);
            clearError();
          },
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE4E9",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: "#FF8FAB",
    marginBottom: 16,
  },
  avatarLabel: {
    fontSize: 36,
    fontWeight: "bold",
  },
  partnerName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  partnerEmail: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  connectedDate: {
    fontSize: 14,
    color: "#999999",
    fontStyle: "italic",
  },
  divider: {
    marginVertical: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  featuresCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF8FAB",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#999999",
  },
  infoValue: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  featureBullet: {
    fontSize: 16,
    color: "#4CAF50",
    marginRight: 12,
    fontWeight: "bold",
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  unlinkButton: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  backButton: {
    paddingHorizontal: 30,
  },
});
