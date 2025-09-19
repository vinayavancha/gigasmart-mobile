import type { Contractor, ContractorDashboard } from "@/dtos/contractor";
import { contractorDeviceService } from "@/services/contractorService";
import { useRouter } from "expo-router";
import * as React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  DataTable,
  Divider,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";

import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  teal: "#18A999", // Total
  yellow: "#F2B300", // Pending
  green: "#2E7D32", // Installed
  blue: "#1976D2", // Activated
};

export default function ContractorDashboardScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [contractor, setContractor] = React.useState<Contractor | null>(null);
  const [dash, setDash] = React.useState<ContractorDashboard | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      // 1) who am I?
      const me = await contractorDeviceService.getCurrentContractor();
      if (!me.ok)
        throw new Error(me.error.message || "Failed to load contractor");
      setContractor(me.value);

      // 2) dashboard for my contractor
      const res = await contractorDeviceService.getContractorDashboard(
        String(me.value.contractorId)
      );
      if (!res.ok)
        throw new Error(res.error.message || "Failed to load dashboard");
      setDash(res.value);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // initial fetch
    void load();
  }, [load]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const total = dash?.total ?? 0;
  const pending = dash?.pendingInstall ?? 0;
  const installed = dash?.installed ?? 0;
  const activated = dash?.activated ?? 0;

  const kpis = [
    {
      label: "Total Devices",
      value: total,
      color: COLORS.teal,
      icon: "cube-outline",
    },
    {
      label: "Pending Install",
      value: pending,
      color: COLORS.yellow,
      icon: "clock-outline",
    },
    {
      label: "Installed",
      value: installed,
      color: COLORS.green,
      icon: "wrench-outline",
    },
    {
      label: "Activated",
      value: activated,
      color: COLORS.blue,
      icon: "check-circle-outline",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              colors={[theme.colors.primary]} // Android: spinner color(s)
              tintColor={theme.colors.primary}
              onRefresh={onRefresh}
            />
          }
        >
          <Text variant="headlineMedium" style={styles.pageTitle}>
            Dashboard
            {contractor?.contractorName
              ? ` · ${contractor.contractorName}`
              : ""}
          </Text>

          {loading ? (
            <View style={{ paddingVertical: 32 }}>
              <ActivityIndicator animating color={theme.colors.primary} />
            </View>
          ) : (
            <>
              {/* KPI tiles (non-virtualized grid, no nested FlatList) */}
              <View style={styles.kpiGridRow}>
                {kpis.map((k) => (
                  <View key={k.label} style={styles.kpiItem}>
                    <Card
                      style={[styles.kpiCard, { backgroundColor: k.color }]}
                    >
                      <Card.Content style={styles.kpiRow}>
                        <Avatar.Icon
                          size={40}
                          icon={k.icon}
                          style={styles.kpiIcon}
                          color="rgba(255,255,255,0.85)"
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            variant="headlineMedium"
                            style={styles.kpiValue}
                          >
                            {k.value}
                          </Text>
                          <Text variant="bodyMedium" style={styles.kpiLabel}>
                            {k.label}
                          </Text>
                        </View>
                      </Card.Content>
                    </Card>
                  </View>
                ))}
              </View>

              {/* Monthly Trend */}
              <Card style={styles.sectionCard} mode="elevated">
                <Card.Title
                  title="Monthly Trend"
                  left={(p) => <Avatar.Icon {...p} icon="chart-line" />}
                />
                <Divider />
                <Card.Content>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>Month</DataTable.Title>
                      <DataTable.Title numeric>Assigned</DataTable.Title>
                      <DataTable.Title numeric>Installed</DataTable.Title>
                      <DataTable.Title numeric>Activated</DataTable.Title>
                    </DataTable.Header>

                    {(dash?.monthlyTrends ?? []).length === 0 ? (
                      <DataTable.Row>
                        <DataTable.Cell>—</DataTable.Cell>
                        <DataTable.Cell numeric>0</DataTable.Cell>
                        <DataTable.Cell numeric>0</DataTable.Cell>
                        <DataTable.Cell numeric>0</DataTable.Cell>
                      </DataTable.Row>
                    ) : (
                      dash!.monthlyTrends.map((r) => (
                        <DataTable.Row key={r.month}>
                          <DataTable.Cell>{r.month}</DataTable.Cell>
                          <DataTable.Cell numeric>
                            {r.assignedCount}
                          </DataTable.Cell>
                          <DataTable.Cell numeric>
                            {r.installedCount}
                          </DataTable.Cell>
                          <DataTable.Cell numeric>
                            {r.activatedCount}
                          </DataTable.Cell>
                        </DataTable.Row>
                      ))
                    )}
                  </DataTable>
                </Card.Content>
              </Card>

              {/* Quick Actions */}
              <Card style={styles.sectionCard} mode="elevated">
                <Card.Title
                  title="Quick Actions"
                  left={(p) => <Avatar.Icon {...p} icon="flash" />}
                />
                <Divider />
                <Card.Content style={styles.actionsRow}>
                  <Button
                    mode="contained"
                    icon="barcode-scan"
                    onPress={() => router.push("/scan")}
                  >
                    Scan Device
                  </Button>
                  <Button
                    mode="outlined"
                    icon="format-list-bulleted"
                    onPress={() => router.push("/devices")}
                    textColor={theme.colors.primary}
                  >
                    My Devices
                  </Button>
                </Card.Content>
              </Card>

              <Text style={styles.footerNote}>Last sync: just now</Text>
              <View style={{ height: 16 }} />
            </>
          )}
        </ScrollView>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError(null)}
          action={{ label: "Retry", onPress: () => void load() }}
          duration={3500}
        >
          {error}
        </Snackbar>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16 },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  pageTitle: { marginBottom: 18, fontWeight: "700" },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },

  sectionCard: { borderRadius: 14, marginTop: 8 },
  actionsRow: { gap: 12, flexDirection: "row", marginTop: 8 },
  footerNote: { textAlign: "center", color: "#6B7280", marginTop: 12 },
  kpiRowWrap: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  kpiGridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  kpiItem: {
    width: "48%", // solid 2-column layout
    marginBottom: 12,
  },
  kpiCard: { borderRadius: 14 },
  kpiRow: { flexDirection: "row", alignItems: "center" },
  kpiIcon: { backgroundColor: "transparent", marginRight: 12 },
  kpiValue: { fontWeight: "800", color: "#fff" },
  kpiLabel: { color: "rgba(255,255,255,0.9)" },
});
