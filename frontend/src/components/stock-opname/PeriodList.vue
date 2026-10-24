<template>
  <aside class="panel period-panel">
    <div class="panel-title">
      <div>
        <h2>Periode opname</h2>
        <p>{{ filteredPeriods.length }} dari {{ periods.length }} periode</p>
      </div>
    </div>
    <div v-if="searchable" class="toolbar compact">
      <label class="search">
        ⌕<input v-model="query" placeholder="Cari opname: tanggal atau lokasi…" />
      </label>
    </div>
    <div v-if="loading" class="loading-block">
      <div />
      <div />
    </div>
    <EmptyState
      v-else-if="!filteredPeriods.length"
      :title="periods.length ? 'Opname tidak ditemukan' : 'Belum ada periode'"
      :text="periods.length ? 'Ubah tanggal atau lokasi pencarian.' : 'Buka periode pertama untuk memulai.'"
    />
    <button
      v-for="period in filteredPeriods"
      :key="period.periode_id"
      class="period-item"
      :class="{ active: selectedId === period.periode_id }"
      @click="$emit('select', period.periode_id)"
    >
      <span class="period-date">{{ formatDate(period.tanggal_mulai) }}</span>
      <StatusBadge
        :text="period.status === 'aktif' ? 'Aktif' : 'Selesai'"
        :tone="period.status === 'aktif' ? 'success' : 'neutral'"
      />
      <small>{{ period.cakupan_lokasi || "Semua lokasi" }}</small>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import EmptyState from "../ui/EmptyState.vue";
import StatusBadge from "../ui/StatusBadge.vue";
import type { StockOpnamePeriod } from "../../types";

const props = defineProps<{
  periods: StockOpnamePeriod[];
  selectedId: string;
  loading: boolean;
  formatDate: (value: string) => string;
  searchable?: boolean;
}>();
const query = defineModel<string>("query", { default: "" });
const filteredPeriods = computed(() => {
  const term = query.value.trim().toLocaleLowerCase("id-ID");
  if (!term) return props.periods;
  return props.periods.filter((period) =>
    [
      period.tanggal_mulai,
      period.tanggal_selesai,
      props.formatDate(period.tanggal_mulai),
      period.tanggal_selesai ? props.formatDate(period.tanggal_selesai) : "",
      period.cakupan_lokasi,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("id-ID")
      .includes(term),
  );
});
defineEmits<{ select: [id: string] }>();
</script>
