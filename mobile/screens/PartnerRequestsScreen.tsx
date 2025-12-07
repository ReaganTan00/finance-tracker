import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Text, Card, Button, Snackbar } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { usePartnerStore } from "../store/partnerStore";

export default function PartnerRequestsScreen() {
  const {
    incomingRequest,
    acceptPartnerRequest,
    rejectPartnerRequest,
    fetchPartnerStatus,
    isLoading,
    error,
    clearError,
  } = usePartnerStore();

  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPartnerStatus();
    setRefreshing(false);
  };

  const handleAccept = async () => {
    try {
      await acceptPartnerRequest();
      setSnackbarMessage("Partner request accepted! You are now connected.");
      setSnackbarVisible(true);
    } catch (err) {
      // Error handled by store
    }
  };

  const handleReject = async () => {
    try {
      await rejectPartnerRequest();
      setSnackbarMessage("Partner request rejected");
      setSnackbarVisible(true);
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>Partner Requests</Text>

          {incomingRequest ? (
            <Card style={styles.requestCard}>
              <Card.Content>
                <Text style={styles.requestLabel}>Request From:</Text>
                <Text style={styles.requestName}>{incomingRequest.name}</Text>
                <Text style={styles.requestEmail}>{incomingRequest.email}</Text>
                <Text style={styles.requestDate}>
                  Requested on{" "}
                  {new Date(incomingRequest.createdAt).toLocaleDateString()}
                </Text>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="outlined"
                  onPress={handleReject}
                  disabled={isLoading}
                  textColor="#FF6B6B"
                  style={styles.rejectButton}
                >
                  Reject
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAccept}
                  loading={isLoading}
                  disabled={isLoading}
                  buttonColor="#FF8FAB"
                  style={styles.acceptButton}
                >
                  Accept
                </Button>
              </Card.Actions>
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyTitle}>No Pending Requests</Text>
                <Text style={styles.emptyText}>
                  You don't have any pending partner requests at the moment.
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Info Card */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.infoTitle}>About Partner Requests</Text>
              <Text style={styles.infoText}>
                When someone sends you a partner request, it will appear here.
                You can choose to accept or reject the request.
              </Text>
              <Text style={styles.infoText} style={{ marginTop: 12 }}>
                Once you accept a request, you'll be connected as partners and
                can create shared budgets together.
              </Text>
            </Card.Content>
          </Card>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF8FAB",
    marginBottom: 30,
    textAlign: "center",
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF8FAB",
  },
  requestLabel: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 4,
  },
  requestName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  requestEmail: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  requestDate: {
    fontSize: 14,
    color: "#999999",
    fontStyle: "italic",
  },
  cardActions: {
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  rejectButton: {
    borderColor: "#FF6B6B",
    marginRight: 8,
  },
  acceptButton: {
    minWidth: 100,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 64,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF8FAB",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});
