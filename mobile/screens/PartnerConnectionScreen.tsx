import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  HelperText,
  Snackbar,
  Card,
  IconButton,
  Divider,
} from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { usePartnerStore } from "../store/partnerStore";

export default function PartnerConnectionScreen() {
  const {
    sendPartnerRequest,
    fetchPartnerStatus,
    outgoingRequest,
    cancelPartnerRequest,
    isLoading,
    error,
    clearError,
  } = usePartnerStore();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Fetch partner status on mount
  useEffect(() => {
    fetchPartnerStatus();
  }, []);

  // Show snackbar when there's an error from the store
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
    }
  }, [error]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendRequest = async () => {
    // Reset errors
    setEmailError("");
    clearError();

    // Validation
    if (!email.trim()) {
      setEmailError("Partner's email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      await sendPartnerRequest(email.trim().toLowerCase());
      setEmail("");
      setSnackbarMessage("Partner request sent successfully!");
      setSnackbarVisible(true);
    } catch (err) {
      // Error is handled by the store and shown via snackbar
    }
  };

  const handleCancelRequest = () => {
    Alert.alert(
      "Cancel Partner Request",
      `Are you sure you want to cancel your request to ${outgoingRequest?.name}?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelPartnerRequest();
              setSnackbarMessage("Partner request canceled");
              setSnackbarVisible(true);
            } catch (err) {
              // Error handled by store
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Connect with Partner</Text>
          <Text style={styles.subtitle}>
            Enter your partner's email to send a connection request
          </Text>

          {/* Outgoing Request Card */}
          {outgoingRequest && (
            <>
              <Card style={styles.requestCard}>
                <Card.Content>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestLabel}>
                        Pending Request Sent To:
                      </Text>
                      <Text style={styles.requestName}>
                        {outgoingRequest.name}
                      </Text>
                      <Text style={styles.requestEmail}>
                        {outgoingRequest.email}
                      </Text>
                    </View>
                    <IconButton
                      icon="close-circle"
                      iconColor="#FF6B6B"
                      size={28}
                      onPress={handleCancelRequest}
                    />
                  </View>
                </Card.Content>
              </Card>
              <Divider style={styles.divider} />
            </>
          )}

          {/* Send Request Form */}
          {!outgoingRequest && (
            <>
              <TextInput
                mode="outlined"
                label="Partner's Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!emailError}
                style={styles.input}
                outlineColor="#FFB3C1"
                activeOutlineColor="#FF8FAB"
                left={<TextInput.Icon icon="email" />}
              />
              <HelperText type="error" visible={!!emailError}>
                {emailError}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleSendRequest}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                buttonColor="#FF8FAB"
                textColor="#FFFFFF"
              >
                Send Partner Request
              </Button>
            </>
          )}

          {/* Info Card */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.infoTitle}>How it works:</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  Send a connection request to your partner's email
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  They'll receive your request and can accept or reject it
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  Once connected, you can create shared budgets together
                </Text>
              </View>
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
    </KeyboardAvoidingView>
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
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 30,
    textAlign: "center",
  },
  requestCard: {
    backgroundColor: "#FFF5F7",
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF8FAB",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestInfo: {
    flex: 1,
  },
  requestLabel: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 4,
  },
  requestName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  requestEmail: {
    fontSize: 14,
    color: "#666666",
  },
  divider: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: 4,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF8FAB",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoBullet: {
    fontSize: 16,
    color: "#FF8FAB",
    marginRight: 8,
    fontWeight: "bold",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});
