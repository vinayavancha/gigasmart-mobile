import { contractorDeviceService } from "@/services/contractorService";
import * as React from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import {
  Button,
  Card,
  Chip,
  IconButton,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
// You'll need to install: npm install react-native-vision-camera
// import { Camera, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';

export default function UpdateDeviceStatusScreen() {
  const theme = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const [currentStep, setCurrentStep] = React.useState(1);
  const [serial, setSerial] = React.useState("");
  const [device, setDevice] = React.useState<{
    serialNumber: string;
    status: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [showCamera, setShowCamera] = React.useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const openBarcodeScanner = () => {
    // For now, we'll show an alert. In a real app, you'd open the camera
    Alert.alert(
      "Barcode Scanner",
      "Camera functionality would open here. For demo purposes, please enter the serial number manually.",
      [{ text: "OK" }]
    );

    // Real implementation would be:
    // setShowCamera(true);
  };

  const onBarcodeScanned = (code: string) => {
    setSerial(code);
    setShowCamera(false);
  };

  const checkDevice = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await contractorDeviceService.getDeviceBySerial(
        serial.trim()
      );
      if (!res.ok) throw new Error(res.error.message || "Device not found");

      const d = res.value;
      setDevice({ serialNumber: d.serialNumber, status: d.status });
      setCurrentStep(2);
    } catch (e: any) {
      setError(
        e?.message ?? "Device not found. Please check the serial number."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: "Installed" | "Activated") => {
    try {
      setLoading(true);
      setError(null);

      const res = await contractorDeviceService.updateDeviceStatus({
        serialNumber: serial.trim(),
        newStatus,
      });

      if (!res.ok) throw new Error(res.error.message || "Failed to update");

      setSuccess(`✅ Device successfully marked as ${newStatus}!`);
      setCurrentStep(3);
    } catch (e: any) {
      setError(e?.message ?? "Failed to update device status");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSerial("");
    setDevice(null);
    setError(null);
    setSuccess(null);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "OutToContractor":
        return {
          color: "#f59e0b",
          bgColor: "#fef3c7",
          icon: "truck-delivery",
          label: "Out to Contractor",
          nextAction: "Mark as Installed",
          nextStatus: "Installed" as const,
          description: "Device is currently with contractor",
        };
      case "Installed":
        return {
          color: "#3b82f6",
          bgColor: "#dbeafe",
          icon: "tools",
          label: "Installed",
          nextAction: "Mark as Activated",
          nextStatus: "Activated" as const,
          description: "Device has been installed",
        };
      case "Activated":
        return {
          color: "#10b981",
          bgColor: "#d1fae5",
          icon: "check-circle",
          label: "Activated",
          nextAction: null,
          nextStatus: null,
          description: "Device is fully activated and ready",
        };
      default:
        return {
          color: "#6b7280",
          bgColor: "#f3f4f6",
          icon: "help-circle",
          label: status,
          nextAction: null,
          nextStatus: null,
          description: "Unknown status",
        };
    }
  };

  const renderStep1 = () => (
    <Animated.View style={{ opacity: fadeAnim }} className="flex-1">
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
          <IconButton icon="barcode-scan" size={32} iconColor="white" />
        </View>
        <Text
          variant="headlineSmall"
          className="text-gray-900 font-bold text-center mb-2"
        >
          Scan Device
        </Text>
        <Text
          variant="bodyLarge"
          className="text-gray-600 text-center max-w-sm"
        >
          Enter or scan the device serial number to get started
        </Text>
      </View>

      <Card className="mb-6 bg-white rounded-2xl">
        <View className="p-6">
          <TextInput
            mode="outlined"
            placeholder="Enter serial number..."
            value={serial}
            onChangeText={setSerial}
            left={
              <TextInput.Icon icon="qrcode-scan" onPress={openBarcodeScanner} />
            }
            right={
              serial ? (
                <TextInput.Icon icon="close" onPress={() => setSerial("")} />
              ) : undefined
            }
            className="mb-4"
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <Button
            mode="contained"
            onPress={checkDevice}
            loading={loading}
            disabled={!serial.trim() || loading}
            icon="magnify"
            className="rounded-full"
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 16, fontWeight: "600" }}
          >
            {loading ? "Searching..." : "Find Device"}
          </Button>
        </View>
      </Card>

      <View className="flex-row items-center justify-center space-x-2">
        <IconButton icon="information-outline" size={16} iconColor="#6b7280" />
        <Text variant="bodySmall" className="text-gray-500">
          Make sure the serial number is correct
        </Text>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => {
    if (!device) return null;
    const statusInfo = getStatusInfo(device.status);

    return (
      <Animated.View style={{ opacity: fadeAnim }} className="flex-1">
        <View className="items-center mb-8">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: statusInfo.bgColor }}
          >
            <IconButton
              icon={statusInfo.icon}
              size={32}
              iconColor={statusInfo.color}
            />
          </View>
          <Text
            variant="headlineSmall"
            className="text-gray-900 font-bold text-center mb-2"
          >
            Device Found
          </Text>
          <Text variant="bodyLarge" className="text-gray-600 text-center">
            {statusInfo.description}
          </Text>
        </View>

        <Card className="mb-6 bg-white rounded-2xl">
          <View className="p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                variant="labelLarge"
                className="text-gray-600 uppercase tracking-wide"
              >
                Device Details
              </Text>
              <Chip
                icon={statusInfo.icon}
                textStyle={{ color: statusInfo.color, fontWeight: "600" }}
                style={{ backgroundColor: statusInfo.bgColor }}
              >
                {statusInfo.label}
              </Chip>
            </View>

            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <Text variant="labelMedium" className="text-gray-500 mb-1">
                Serial Number
              </Text>
              <Text
                variant="titleLarge"
                className="text-gray-900 font-mono font-bold"
              >
                {device.serialNumber}
              </Text>
            </View>

            {statusInfo.nextAction ? (
              <View className="space-y-3">
                <Text
                  variant="titleMedium"
                  className="text-gray-900 font-semibold"
                >
                  Next Action
                </Text>
                <Button
                  mode="contained"
                  onPress={() => updateStatus(statusInfo.nextStatus!)}
                  loading={loading}
                  icon={
                    statusInfo.nextStatus === "Installed"
                      ? "tools"
                      : "check-circle"
                  }
                  className="rounded-full"
                  contentStyle={{ paddingVertical: 8 }}
                  labelStyle={{ fontSize: 16, fontWeight: "600" }}
                  buttonColor={
                    statusInfo.nextStatus === "Installed"
                      ? "#3b82f6"
                      : "#10b981"
                  }
                >
                  {loading ? "Updating..." : statusInfo.nextAction}
                </Button>
              </View>
            ) : (
              <View className="bg-green-50 rounded-xl p-4 border border-green-200">
                <View className="flex-row items-center">
                  <IconButton icon="check-all" size={20} iconColor="#10b981" />
                  <Text className="text-green-800 font-semibold ml-2">
                    Device is fully activated
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        <Button
          mode="text"
          onPress={resetFlow}
          icon="arrow-left"
          className="self-center"
          labelStyle={{ color: "#6b7280" }}
        >
          Scan Another Device
        </Button>
      </Animated.View>
    );
  };

  const renderStep3 = () => (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="flex-1 items-center justify-center"
    >
      <View className="w-24 h-24 bg-green-500 rounded-full items-center justify-center mb-6">
        <IconButton icon="check" size={40} iconColor="white" />
      </View>

      <Text
        variant="headlineSmall"
        className="text-gray-900 font-bold text-center mb-4"
      >
        Success!
      </Text>

      <Text
        variant="bodyLarge"
        className="text-gray-600 text-center mb-8 max-w-sm"
      >
        {success}
      </Text>

      <View className="w-full max-w-sm space-y-3">
        <Button
          mode="contained"
          onPress={resetFlow}
          icon="plus"
          className="rounded-full"
          contentStyle={{ paddingVertical: 8 }}
          labelStyle={{ fontSize: 16, fontWeight: "600" }}
        >
          Update Another Device
        </Button>

        <Button
          mode="text"
          onPress={resetFlow}
          icon="home"
          labelStyle={{ color: "#6b7280" }}
        >
          Back to Home
        </Button>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text variant="titleLarge" className="text-gray-900 font-bold">
              Device Status Update
            </Text>
            <Text variant="bodyMedium" className="text-gray-600">
              Step {currentStep} of 3
            </Text>
          </View>
          {currentStep > 1 && (
            <IconButton
              icon="arrow-left"
              onPress={() => setCurrentStep(Math.max(1, currentStep - 1))}
              iconColor="#6b7280"
            />
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbars */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={4000}
        action={{
          label: "Dismiss",
          onPress: () => setError(null),
          textColor: "#ef4444",
        }}
        style={{ backgroundColor: "#fef2f2", marginHorizontal: 16 }}
      >
        <Text style={{ color: "#dc2626", fontWeight: "500" }}>{error}</Text>
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess(null)}
        duration={4000}
        action={{
          label: "OK",
          onPress: () => setSuccess(null),
          textColor: "#10b981",
        }}
        style={{ backgroundColor: "#f0fdf4", marginHorizontal: 16 }}
      >
        <Text style={{ color: "#059669", fontWeight: "500" }}>{success}</Text>
      </Snackbar>
    </SafeAreaView>
  );
}
