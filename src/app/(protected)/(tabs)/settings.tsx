import { useAuth } from "@/context/AuthContext";
import { contractorDeviceService } from "@/services/contractorService";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
const Settings = () => {
  const [contractor, setContractor] = useState<any>(null);
  const [devices, setDevices] = useState<any>(null);
  const [deviceBySerial, setDeviceBySerial] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const user = useAuth();
  const onSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const res = await contractorDeviceService.updateDeviceStatus({
        serialNumber: "ALCLB472B285",
        newStatus: "Activated",
      });
      if (!res.ok) {
        console.log("Login failed. Please try again.");
      } else {
        fetchAll();
      }
    } catch (e: any) {
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };
  const fetchAll = async () => {
    const contractorRes = await contractorDeviceService.getCurrentContractor();
    setContractor(contractorRes.ok ? contractorRes.value : contractorRes.error);

    const devicesRes = await contractorDeviceService.getDevices({
      page: 1,
      pageSize: 10,
    });
    setDevices(devicesRes.ok ? devicesRes.value : devicesRes.error);
    // console.log(devicesRes);
    // const serial =
    //   devicesRes.ok && devicesRes.value.Items.length > 0
    //     ? devicesRes.value.Items[0].serialNumber
    //     : "ABC123"; // fallback serialas
    // console.log(serial);
    const deviceRes = await contractorDeviceService.getDeviceBySerial(
      "ALCLB472B285"
    );
    setDeviceBySerial(deviceRes.ok ? deviceRes.value : deviceRes.error);
    console.log(user.user?.contractorId);
    const dashboardRes = await contractorDeviceService.getContractorDashboard(
      user.user?.contractorId ?? "1"
    );
    setDashboard(dashboardRes.ok ? dashboardRes.value : dashboardRes.error);

    setLoading(false);
    setRefreshing(false);
  };
  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <SafeAreaView>
      <ScrollView
        style={{ padding: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          🔍 Contractor Test View
        </Text>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: "600" }}>
            🧑 Contractor Info
          </Text>
          <Text style={{ fontFamily: "monospace" }}>
            {JSON.stringify(contractor, null, 2)}
          </Text>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: "600" }}>📦 Devices</Text>
          <Text style={{ fontFamily: "monospace" }}>
            {JSON.stringify(devices, null, 2)}
          </Text>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: "600" }}>
            🔍 Device by Serial
          </Text>
          <Text style={{ fontFamily: "monospace" }}>
            {JSON.stringify(deviceBySerial, null, 2)}
          </Text>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: "600" }}>📊 Dashboard</Text>
          <Text style={{ fontFamily: "monospace" }}>
            {JSON.stringify(dashboard, null, 2)}
          </Text>
        </View>
        <View>
          <Button onPress={onSubmit} loading={loading} disabled={loading}>
            <Text>Change status</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({});
