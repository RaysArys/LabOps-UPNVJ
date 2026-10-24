<template>
  <div class="page">
    <header class="page-heading">
      <div>
        <span class="eyebrow">VERIFIKASI INVENTARIS</span>
        <h1>Stock opname</h1>
        <p>
          {{
            isLaboran
              ? "Periksa keberadaan, lokasi, jumlah, dan kondisi fisik aset."
              : "Pantau periode dan tindak lanjuti setiap temuan."
          }}
        </p>
      </div>
      <div class="row-actions">
        <RouterLink class="btn ghost" to="/stock-opname/history">
          Riwayat Opname
        </RouterLink>
        <button v-if="isLaboran" class="btn primary" @click="periodModal = true">
          ＋ Buka periode
        </button>
      </div>
    </header>

    <div v-if="notice" class="alert success">
      {{ notice }}<button type="button" @click="notice = ''">×</button>
    </div>
    <div v-if="error" class="alert danger">
      {{ error }}<button type="button" @click="error = ''">×</button>
    </div>

    <section class="stats-grid">
      <StatCard
        label="Total diperiksa"
        :value="records.length"
        hint="Periode terpilih"
        icon="☷"
      />
      <StatCard
        label="Sesuai"
        :value="findingCount('sesuai')"
        hint="Data cocok"
        icon="✓"
      />
      <StatCard
        label="Temuan"
        :value="
          records.filter((record) => record.status_temuan !== 'sesuai').length
        "
        hint="Perlu diperiksa"
        icon="!"
      />
      <StatCard
        label="Aset rusak"
        :value="
          records.filter((record) => record.kondisi_fisik === 'rusak').length
        "
        hint="Work order otomatis"
        icon="⌁"
        tone="danger"
      />
    </section>

    <section class="opname-workspace">
      <PeriodList
        :periods="periods"
        :selected-id="selectedPeriodId"
        :loading="loading"
        :format-date="date"
        @select="selectPeriod"
      />
      <RecordsPanel
        v-model:query="query"
        v-model:finding="finding"
        :selected-period="selectedPeriod"
        :filtered="filtered"
        :records-loading="recordsLoading"
        :is-laboran="isLaboran"
        :is-head="isHead"
        :asset-map="assetMap"
        :condition-label="conditionLabel"
        :finding-label="findingLabel"
        :follow-label="followLabel"
        :format-date="date"
        :short="short"
        @inspect="inspectionModal = true"
        @close-period="requestClosePeriod"
      />
    </section>

    <StockOpnameModals
      v-model:inspection-tab="inspectionTab"
      v-model:asset-search="assetSearch"
      :period-open="periodModal"
      :inspection-open="inspectionModal"
      :busy="busy"
      :search-results="searchResults"
      :inspection="inspection"
      :new-asset="newAsset"
      :period-form="periodForm"
      :asset-map="assetMap"
      :condition-label="conditionLabel"
      :category-label="categoryLabel"
      :short="short"
      @close-period-modal="periodModal = false"
      @open-period="openPeriod"
      @close-inspection-modal="inspectionModal = false"
      @inspect="inspect"
      @search-assets="searchAssets"
      @register-new="registerNew"
    />
    <Modal
      v-if="closePeriodModal"
      title="Tutup periode opname?"
      subtitle="Data periode akan dikunci dan dipindahkan ke riwayat."
      @close="closePeriodModal = false"
    >
      <div class="modal-actions">
        <button class="btn ghost" @click="closePeriodModal = false">
          Batal
        </button>
        <button class="btn danger" :disabled="busy" @click="closePeriod">
          {{ busy ? "Memproses…" : "Tutup periode" }}
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Modal, StatCard } from "../components/ui";
import PeriodList from "../components/stock-opname/PeriodList.vue";
import RecordsPanel from "../components/stock-opname/RecordsPanel.vue";
import StockOpnameModals from "../components/stock-opname/StockOpnameModals.vue";
import { useStockOpname } from "../composables/useStockOpname";

const {
  isLaboran,
  isHead,
  conditionLabel,
  findingLabel,
  followLabel,
  categoryLabel,
  periods,
  records,
  selectedPeriodId,
  loading,
  recordsLoading,
  busy,
  error,
  notice,
  query,
  finding,
  periodModal,
  closePeriodModal,
  inspectionModal,
  inspectionTab,
  assetSearch,
  searchResults,
  periodForm,
  inspection,
  newAsset,
  selectedPeriod,
  assetMap,
  filtered,
  findingCount,
  selectPeriod,
  openPeriod,
  closePeriod,
  requestClosePeriod,
  searchAssets,
  inspect,
  registerNew,
  short,
  date,
} = useStockOpname();
</script>
