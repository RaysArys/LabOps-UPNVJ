<template>
  <div class="page">
    <header class="page-heading">
      <div>
        <span class="eyebrow">MITRA & AKREDITASI</span>
        <h1>Vendor</h1>
        <p>Kelola perusahaan penyedia layanan serta masa berlaku akreditasinya.</p>
      </div>
      <button v-if="isTU" class="btn primary" @click="openCreate">＋ Tambah vendor</button>
    </header>
    <div v-if="notice" class="alert success">
      {{ notice }}<button @click="notice = ''">×</button>
    </div>
    <div v-if="error" class="alert danger">
      {{ error }}<button @click="error = ''">×</button>
    </div>
    <section class="stats-grid">
      <StatCard label="Total vendor" :value="vendors.length" hint="Seluruh mitra" icon="◇" />
      <StatCard label="Aktif" :value="count('aktif')" hint="Akreditasi berlaku" icon="✓" />
      <StatCard label="Akan expired" :value="count('akan_expired')" hint="Perlu diperbarui" icon="◷" />
      <StatCard label="Expired" :value="count('expired')" hint="Tidak berlaku" icon="!" tone="danger" />
    </section>
    <section class="panel">
      <div class="toolbar">
        <label class="search">⌕<input v-model="query" placeholder="Cari nama, kontak, atau akreditasi…" /></label>
        <select v-model="status">
          <option value="all">Semua status</option>
          <option v-for="(label, value) in statusLabel" :key="value" :value="value">{{ label }}</option>
        </select>
        <button class="btn ghost" @click="load">↻</button>
      </div>
      <div class="result-line">Menampilkan <b>{{ filtered.length }}</b> dari {{ vendors.length }} vendor</div>
      <div v-if="loading" class="loading-block"><div /><div /><div /></div>
      <EmptyState v-else-if="!filtered.length" title="Vendor tidak ditemukan" text="Tambahkan vendor atau ubah pencarian." />
      <div v-else class="vendor-grid">
        <article v-for="vendor in filtered" :key="vendor.vendor_id" class="vendor-card">
          <div class="vendor-top">
            <span class="vendor-icon">◇</span>
            <StatusBadge :text="statusLabel[vendor.status_akreditasi]" :tone="tone(vendor.status_akreditasi)" />
          </div>
          <h3>{{ vendor.nama_vendor }}</h3>
          <p>{{ vendor.kontak }}</p>
          <div class="vendor-info">
            <span>No. akreditasi <b>{{ vendor.no_akreditasi }}</b></span>
            <span>Berlaku sampai <b>{{ vendor.tanggal_expired_akreditasi ? date(vendor.tanggal_expired_akreditasi) : "—" }}</b></span>
          </div>
          <div v-if="isTU" class="row-actions">
            <button class="btn tiny ghost" @click="edit(vendor)">Edit</button>
            <button class="btn tiny ghost" @click="refresh(vendor)">↻ Status</button>
            <button class="btn tiny danger" @click="deleteTarget = vendor">Hapus</button>
          </div>
        </article>
      </div>
    </section>
    <Modal
      v-if="modal"
      :title="editing ? 'Edit vendor' : 'Tambah vendor'"
      subtitle="Lengkapi identitas dan dokumen akreditasi."
      @close="modal = false"
    >
      <form @submit.prevent="save">
        <label>Nama vendor *<input v-model="form.nama" placeholder="Isi nama vendor" required /></label>
        <label>Kontak *<input v-model="form.kontak" placeholder="Isi email atau telepon" required /></label>
        <label>Nomor akreditasi *<input v-model="form.nomor" placeholder="Isi nomor akreditasi" required /></label>
        <label>Tanggal kedaluwarsa *<input v-model="form.expired" type="date" required /></label>
        <div class="modal-actions">
          <button type="button" class="btn ghost" @click="modal = false">Batal</button>
          <button class="btn primary" :disabled="busy">{{ busy ? "Menyimpan…" : "Simpan vendor" }}</button>
        </div>
      </form>
    </Modal>
    <Modal
      v-if="deleteTarget"
      title="Hapus vendor?"
      subtitle="Vendor tanpa riwayat kalibrasi akan dihapus permanen."
      @close="deleteTarget = null"
    >
      <p>{{ deleteTarget.nama_vendor }}</p>
      <div class="modal-actions">
        <button class="btn ghost" :disabled="busy" @click="deleteTarget = null">Batal</button>
        <button class="btn danger" :disabled="busy" @click="removeVendor">{{ busy ? "Menghapus…" : "Hapus vendor" }}</button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { vendorsApi } from "../api";
import { errorMessage } from "../api/client";
import { useAuthStore } from "../stores/auth";
import type { Vendor, VendorAccreditationStatus } from "../types";
import { StatCard, StatusBadge, EmptyState, Modal } from "../components/ui";

const auth = useAuthStore();
const isTU = computed(() => auth.user?.role === "tata_usaha");
const statusLabel: Record<VendorAccreditationStatus, string> = {
  aktif: "Aktif",
  akan_expired: "Akan expired",
  expired: "Expired",
};
const vendors = ref<Vendor[]>([]);
const loading = ref(true);
const busy = ref(false);
const error = ref("");
const notice = ref("");
const query = ref("");
const status = ref<"all" | VendorAccreditationStatus>("all");
const modal = ref(false);
const editing = ref<Vendor | null>(null);
const deleteTarget = ref<Vendor | null>(null);
const form = reactive({ nama: "", kontak: "", nomor: "", expired: "" });

const filtered = computed(() =>
  vendors.value.filter(
    (vendor) =>
      (status.value === "all" || vendor.status_akreditasi === status.value) &&
      (!query.value ||
        [vendor.nama_vendor, vendor.kontak, vendor.no_akreditasi]
          .join(" ")
          .toLowerCase()
          .includes(query.value.toLowerCase())),
  ),
);
const count = (value: VendorAccreditationStatus) =>
  vendors.value.filter((vendor) => vendor.status_akreditasi === value).length;

async function load() {
  loading.value = true;
  try {
    vendors.value = await vendorsApi.list();
  } catch (e) {
    error.value = errorMessage(e, "Vendor gagal dimuat.");
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  Object.assign(form, { nama: "", kontak: "", nomor: "", expired: "" });
  modal.value = true;
}

function edit(vendor: Vendor) {
  editing.value = vendor;
  Object.assign(form, {
    nama: vendor.nama_vendor,
    kontak: vendor.kontak || "",
    nomor: vendor.no_akreditasi || "",
    expired: vendor.tanggal_expired_akreditasi || "",
  });
  modal.value = true;
}

function payload() {
  return {
    nama_vendor: form.nama.trim(),
    kontak: form.kontak.trim(),
    no_akreditasi: form.nomor.trim(),
    tanggal_expired_akreditasi: form.expired,
  };
}

async function save() {
  if (!form.nama.trim() || !form.kontak.trim() || !form.nomor.trim() || !form.expired) {
    error.value = "Isi semua data vendor sebelum menyimpan.";
    return;
  }
  busy.value = true;
  try {
    const wasEditing = Boolean(editing.value);
    let vendor = wasEditing
      ? await vendorsApi.update(editing.value!.vendor_id, payload())
      : await vendorsApi.create(payload());
    vendor = await vendorsApi.refresh(vendor.vendor_id);
    vendors.value = wasEditing
      ? vendors.value.map((item) => (item.vendor_id === vendor.vendor_id ? vendor : item))
      : [vendor, ...vendors.value];
    modal.value = false;
    notice.value = "Vendor berhasil disimpan.";
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

async function removeVendor() {
  const target = deleteTarget.value;
  if (!target) return;
  busy.value = true;
  try {
    await vendorsApi.remove(target.vendor_id);
    vendors.value = vendors.value.filter((vendor) => vendor.vendor_id !== target.vendor_id);
    deleteTarget.value = null;
    notice.value = `Vendor ${target.nama_vendor} berhasil dihapus.`;
  } catch (e) {
    error.value = errorMessage(e, "Vendor tidak dapat dihapus.");
  } finally {
    busy.value = false;
  }
}

async function refresh(vendor: Vendor) {
  try {
    const updated = await vendorsApi.refresh(vendor.vendor_id);
    vendors.value = vendors.value.map((item) =>
      item.vendor_id === updated.vendor_id ? updated : item,
    );
    notice.value = "Status akreditasi diperbarui.";
  } catch (e) {
    error.value = errorMessage(e);
  }
}

const date = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
const tone = (value: VendorAccreditationStatus) =>
  value === "aktif" ? "success" : value === "akan_expired" ? "warning" : "danger";

onMounted(load);
</script>
