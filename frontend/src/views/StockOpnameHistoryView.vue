<template>
  <div class="page">
    <header class="page-heading">
      <div>
        <span class="eyebrow">ARSIP INVENTARIS</span>
        <h1>Riwayat Opname</h1>
        <p>Periksa hasil stock opname dari periode yang sudah ditutup.</p>
      </div>
      <RouterLink class="btn ghost" to="/stock-opname">Periode aktif</RouterLink>
    </header>
    <div v-if="error" class="alert danger">
      {{ error }}<button @click="error = ''">×</button>
    </div>
    <section class="opname-workspace">
      <PeriodList
        v-model:query="periodQuery"
        :periods="periods"
        :selected-id="selectedPeriodId"
        :loading="loading"
        :format-date="date"
        searchable
        @select="selectPeriod"
      />
      <RecordsPanel
        v-model:query="query"
        v-model:finding="finding"
        :selected-period="selectedPeriod"
        :filtered="filtered"
        :records-loading="recordsLoading"
        :is-laboran="false"
        :is-head="isHead"
        :is-read-only="true"
        :asset-map="assetMap"
        :condition-label="conditionLabel"
        :finding-label="findingLabel"
        :follow-label="followLabel"
        :format-date="date"
        :short="short"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import PeriodList from "../components/stock-opname/PeriodList.vue";
import RecordsPanel from "../components/stock-opname/RecordsPanel.vue";
import { useAuthStore } from "../stores/auth";
import { useStockOpname } from "../composables/useStockOpname";

const isHead = useAuthStore().user?.role === "kepala_lab";
const periodQuery = ref("");
const {
  conditionLabel,
  findingLabel,
  followLabel,
  periods,
  selectedPeriodId,
  loading,
  recordsLoading,
  error,
  query,
  finding,
  selectedPeriod,
  assetMap,
  filtered,
  selectPeriod,
  short,
  date,
} = useStockOpname("selesai");
</script>
