<template>
  <div class="page">
    <header class="page-heading">
      <div>
        <span class="eyebrow">ARSIP KALIBRASI</span>
        <h1>Riwayat Kalibrasi</h1>
        <p>Hasil kalibrasi yang sudah disetujui Kepala Lab.</p>
      </div>
      <RouterLink class="btn ghost" to="/calibration">Jadwal aktif</RouterLink>
    </header>
    <div v-if="error" class="alert danger">
      {{ error }}<button @click="error = ''">×</button>
    </div>
    <section class="panel">
      <div class="toolbar compact">
        <label class="search">⌕<input v-model="query" placeholder="Cari aset…" /></label>
      </div>
      <div v-if="loading" class="loading-block"><div /><div /><div /></div>
      <EmptyState
        v-else-if="!filtered.length"
        title="Belum ada riwayat kalibrasi"
        text="Hasil yang disetujui akan tampil di sini."
      />
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Aset</th>
              <th>Tanggal kalibrasi</th>
              <th>Hasil</th>
              <th>Status</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filtered" :key="log.log_id">
              <td>
                <strong>{{ assetMap.get(log.asset_id)?.nama_aset || "Aset tidak ditemukan" }}</strong>
                <small class="block">{{ assetMap.get(log.asset_id)?.no_inventaris || short(log.asset_id) }}</small>
              </td>
              <td>{{ date(log.tanggal_pelaksanaan) }}</td>
              <td>
                <StatusBadge
                  :text="resultLabel[log.hasil]"
                  :tone="log.hasil === 'tidak_lulus' ? 'danger' : 'success'"
                />
              </td>
              <td><StatusBadge text="Selesai" tone="success" /></td>
              <td>{{ log.deviasi || "—" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { assetsApi, calibrationApi } from "../api";
import { errorMessage } from "../api/client";
import { EmptyState, StatusBadge } from "../components/ui";
import type { Asset, CalibrationLog, CalibrationResult } from "../types";

const logs = ref<CalibrationLog[]>([]);
const assets = ref<Asset[]>([]);
const loading = ref(true);
const error = ref("");
const query = ref("");
const assetMap = computed(
  () => new Map(assets.value.map((asset) => [asset.asset_id, asset])),
);
const resultLabel: Record<CalibrationResult, string> = {
  lulus: "Lulus",
  lulus_bersyarat: "Lulus bersyarat",
  tidak_lulus: "Tidak lulus",
};
const filtered = computed(() =>
  logs.value.filter((log) => {
    const asset = assetMap.value.get(log.asset_id);
    return [asset?.nama_aset, asset?.no_inventaris]
      .join(" ")
      .toLowerCase()
      .includes(query.value.toLowerCase());
  }),
);

function date(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
    new Date(value),
  );
}
function short(value: string) {
  return value.slice(0, 8).toUpperCase();
}

onMounted(async () => {
  try {
    [logs.value, assets.value] = await Promise.all([
      calibrationApi.history(),
      assetsApi.list(),
    ]);
  } catch (cause) {
    error.value = errorMessage(cause, "Riwayat kalibrasi gagal dimuat.");
  } finally {
    loading.value = false;
  }
});
</script>