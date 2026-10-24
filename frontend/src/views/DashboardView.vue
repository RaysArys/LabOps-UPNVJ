<template>
  <div class="page">
    <header class="page-heading">
      <div>
        <div class="welcome">
          <h1>Welcome back, {{ firstName }}!</h1>
        </div>
        <p>Berikut ringkasan kondisi Laboratorium FIK hari ini.</p>
      </div>
    </header>

    <div v-if="error" class="alert danger">{{ error }}</div>

    <section class="stats-grid dashboard-stats">
      <StatCard
        v-for="card in cards"
        :key="card.label"
        v-bind="card"
      />
    </section>

    <section v-if="canViewAssets" class="dashboard-grid">
      <DashboardOverview :categories="categories" :max="maxCategoryTotal" />
      <SystemHealth
        :scope="data?.cakupan_data === 'full' ? '100%' : 'Scope'"
        :total-assets="data?.kpi.total_aset || 0"
        :attention-count="visibleAttention.length"
      />
    </section>

    <section
      class="dashboard-grid bottom"
      :class="{ 'single-panel': !visibleAttention.length }"
    >
      <AttentionPanel v-if="visibleAttention.length" :items="visibleAttention" />
      <QuickLinks :links="quickLinks" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { menuByRole, roleLabel } from "../config/menu";
import { StatCard } from "../components/ui";
import AttentionPanel from "../components/dashboard/AttentionPanel.vue";
import DashboardOverview from "../components/dashboard/DashboardOverview.vue";
import QuickLinks from "../components/dashboard/QuickLinks.vue";
import SystemHealth from "../components/dashboard/SystemHealth.vue";
import { useDashboard } from "../composables/useDashboard";

const auth = useAuthStore();
const { data, error, categories, maxCategoryTotal, values } =
  useDashboard();

const cardDefinitions = [
  {
    module: "/assets",
    valueIndex: 0,
    label: "Total aset",
    hint: "Disetujui dan aktif",
    icon: "□",
    tone: "featured",
  },
  { module: "/calibration", valueIndex: 1, label: "Kalibrasi overdue", hint: "Melewati jadwal", icon: "⌖" },
  { module: "/calibration", valueIndex: 2, label: "Akan jatuh tempo", hint: "Perlu dijadwalkan", icon: "◷" },
  { module: "/stock-opname", valueIndex: 3, label: "Temuan opname", hint: "Belum ditindaklanjuti", icon: "☷" },
  { module: "/work-orders", valueIndex: 4, label: "Work order aktif", hint: "Dalam penanganan", icon: "⌁" },
  { module: "/vendors", valueIndex: 5, label: "Sertifikat vendor", hint: "Akan kedaluwarsa", icon: "◇" },
];

const permittedPaths = computed(() =>
  auth.user ? menuByRole[auth.user.role].map((item) => item.path) : [],
);
const canViewAssets = computed(() => permittedPaths.value.includes("/assets"));
const cards = computed(() =>
  cardDefinitions
    .filter((card) => permittedPaths.value.includes(card.module))
    .map(({ module: _module, valueIndex, ...card }) => ({
      ...card,
      value: values.value[valueIndex],
    })),
);
const visibleAttention = computed(() => {
  if (!data.value) return [];
  return [
    ...(permittedPaths.value.includes("/calibration")
      ? data.value.perlu_perhatian.aset_overdue_kalibrasi
      : []),
    ...(permittedPaths.value.includes("/stock-opname")
      ? data.value.perlu_perhatian.temuan_opname_open
      : []),
    ...(permittedPaths.value.includes("/vendors")
      ? data.value.perlu_perhatian.sertifikat_vendor_mendekati_expired
      : []),
  ].slice(0, 5);
});
const firstName = computed(
  () =>
    auth.user?.nama?.split(" ")[0] ||
    (auth.user ? roleLabel[auth.user.role] : "Pengguna"),
);
const quickLinks = computed(() =>
  auth.user
    ? menuByRole[auth.user.role].filter((item) => item.path !== "/dashboard")
    : [],
);
</script>
