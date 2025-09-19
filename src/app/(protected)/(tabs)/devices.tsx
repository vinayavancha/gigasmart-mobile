import type { Device, PagedResultResponse } from "@/dtos/contractor";
import { contractorDeviceService } from "@/services/contractorService";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  DataTable,
  Divider,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
// ---- optional: align these to your backend status values
const STATUS_OPTIONS = [
  "All",
  "OutToContractor",
  "Installed",
  "Activated",
] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const PAGE_SIZES = [10, 25, 50];

export default function DevicesScreen() {
  const theme = useTheme();

  // table state
  const [page, setPage] = React.useState(1); // 1-based for server
  const [pageSize, setPageSize] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const [items, setItems] = React.useState<Device[]>([]);

  // filters
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("All");

  // ui state
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // debounce search
  const debouncedQuery = useDebouncedValue(query, 400);

  const numberOfPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const load = React.useCallback(
    async (opts?: { resetPage?: boolean }) => {
      try {
        setError(null);
        if (!refreshing) setLoading(true);

        // if filters changed, go back to page 1
        const serverPage = opts?.resetPage ? 1 : page;

        const params: any = {
          page: serverPage,
          pageSize,
        };
        if (status !== "All") params.status = status.toLowerCase();
        if (debouncedQuery.trim().length > 0)
          params.search = debouncedQuery.trim(); // if your API supports it
        console.log("Device fetch params:", params);
        const res = await contractorDeviceService.getDevices(params);

        if (!res.ok)
          throw new Error(res.error.message || "Failed to load devices");

        const data: PagedResultResponse<Device> = res.value;
        setItems(data.items ?? []);
        setTotalCount(data.totalCount ?? 0);
        // if we reset to page 1, reflect it in state
        if (opts?.resetPage) setPage(1);
      } catch (e: any) {
        setError(e?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, pageSize, status, debouncedQuery, refreshing]
  );

  // initial load + refetch on focus (keeps current filters/paging)
  useFocusEffect(
    React.useCallback(() => {
      void load();
    }, [load])
  );

  // refetch when filters change (reset page)
  React.useEffect(() => {
    void load({ resetPage: true });
  }, [debouncedQuery, status, pageSize]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await load();
  }, [load]);

  const onPageChange = (newPageIndex0: number) => {
    // DataTable.Pagination gives 0-based index
    setPage(newPageIndex0 + 1);
  };

  const formatDate = (iso?: string) => (iso ? iso.slice(0, 10) : "—");

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text variant="headlineMedium" style={styles.pageTitle}>
            Devices
          </Text>

          <Card style={styles.sectionCard} mode="elevated">
            <Divider />

            {/* Controls row: page size + search + status */}
            <View style={styles.controlsRow}>
              {/* Page size menu */}
              {/* <Menu
                visible={psMenuOpen}
                onDismiss={() => setPsMenuOpen(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setPsMenuOpen(true)}
                    icon="format-list-numbered"
                  >
                    Show {pageSize}
                  </Button>
                }
              >
                {PAGE_SIZES.map((s) => (
                  <Menu.Item
                    key={s}
                    onPress={() => {
                      setPsMenuOpen(false);
                      setPageSize(s);
                    }}
                    title={`${s} entries`}
                  />
                ))}
              </Menu> */}

              {/* Status filter chips */}
              <View style={styles.chipsRow}>
                {STATUS_OPTIONS.map((s) => (
                  <Chip
                    key={s}
                    selected={status === s}
                    onPress={() => setStatus(s)}
                    mode={status === s ? "flat" : "outlined"}
                    compact
                  >
                    {s}
                  </Chip>
                ))}
              </View>

              {/* Search input */}
              <TextInput
                mode="outlined"
                placeholder="Search serial…"
                value={query}
                onChangeText={setQuery}
                left={<TextInput.Icon icon="magnify" />}
                style={styles.search}
                dense
              />
            </View>

            {/* Table */}
            {loading ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator animating color={theme.colors.primary} />
              </View>
            ) : (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Serial Number</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title numeric>Assigned Date</DataTable.Title>
                </DataTable.Header>

                {items.length === 0 ? (
                  <DataTable.Row>
                    <DataTable.Cell>—</DataTable.Cell>
                    <DataTable.Cell>—</DataTable.Cell>
                    <DataTable.Cell numeric>—</DataTable.Cell>
                  </DataTable.Row>
                ) : (
                  items.map((d) => (
                    <DataTable.Row key={d.serialNumber}>
                      <DataTable.Cell>{d.serialNumber}</DataTable.Cell>
                      <DataTable.Cell>{d.status}</DataTable.Cell>
                      <DataTable.Cell numeric>
                        {formatDate(d.assignedDate)}
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))
                )}

                <DataTable.Pagination
                  page={Math.max(0, Math.min(page - 1, numberOfPages - 1))} // 0-based
                  numberOfPages={numberOfPages}
                  onPageChange={onPageChange}
                  label={`Showing ${
                    (items.length && (page - 1) * pageSize + 1) || 0
                  }–${(page - 1) * pageSize + items.length} of ${totalCount}`}
                  numberOfItemsPerPage={pageSize}
                  showFastPaginationControls
                  selectPageDropdownLabel={"Page"}
                />
              </DataTable>
            )}
          </Card>

          <View style={{ height: 16 }} />
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

/* ---------- small debounce hook ---------- */
function useDebouncedValue<T>(value: T, delay = 400) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const styles = StyleSheet.create({
  scroll: { padding: 16 },
  pageTitle: { marginBottom: 8, fontWeight: "700" },
  sectionCard: { borderRadius: 14 },
  controlsRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  search: { marginTop: 4 },
  loaderBox: { paddingVertical: 24, alignItems: "center" },
});
