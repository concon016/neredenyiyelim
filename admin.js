/* neredenyiyelim — admin paneli */

const ADMIN_KEY_STORAGE = "nny_admin_key";

function initAdminTheme() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  const apply = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    toggle.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
  };
  apply(document.documentElement.getAttribute("data-theme") || "light");
  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    apply(next);
  });
}

function adminKey() {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE) || "";
}

function showMsg(text, ok) {
  const el = document.getElementById("adminMsg");
  el.textContent = text;
  el.className = "admin-msg " + (ok ? "ok" : "err");
  el.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

let allVenues = [];

async function fetchVenues() {
  const res = await fetch("/api/venues");
  allVenues = await res.json();
  drawList();
}

function fillIlSelect() {
  const sel = document.getElementById("f_il");
  sel.innerHTML = ILLER.map((i) => `<option value="${i.slug}">${i.ad}</option>`).join("");
}

function drawList() {
  const term = document.getElementById("adminSearch").value.trim().toLocaleLowerCase("tr");
  const list = document.getElementById("adminList");
  const filtered = allVenues.filter((v) =>
    !term || v.ad.toLocaleLowerCase("tr").includes(term) || v.il.toLocaleLowerCase("tr").includes(term)
  ).sort((a, b) => a.il.localeCompare(b.il) || a.ad.localeCompare(b.ad));

  list.innerHTML = filtered.map((v) => `
    <div class="admin-list-row">
      <div class="info">
        <b>${v.ad}</b>
        <span>${v.il} · ${v.kategori || ""}</span>
      </div>
      <div class="admin-actions">
        <button class="btn-edit" data-edit="${v.id}">Düzenle</button>
        <button class="btn-delete" data-delete="${v.id}">Sil</button>
      </div>
    </div>`).join("") || `<p>Eşleşen mekan bulunamadı.</p>`;
}

function resetForm() {
  document.getElementById("venueForm").reset();
  document.getElementById("f_id").value = "";
  document.getElementById("formTitle").textContent = "Yeni Mekan Ekle";
  document.getElementById("cancelEditBtn").style.display = "none";
}

function fillForm(v) {
  document.getElementById("f_id").value = v.id;
  document.getElementById("f_il").value = v.il;
  document.getElementById("f_ad").value = v.ad;
  document.getElementById("f_kategori").value = v.kategori || "";
  document.getElementById("f_fiyat").value = v.fiyat || "";
  document.getElementById("f_puan").value = v.puan ?? "";
  document.getElementById("f_yorumSayisi").value = v.yorumSayisi ?? "";
  document.getElementById("f_adres").value = v.adres || "";
  document.getElementById("f_lat").value = v.lat ?? "";
  document.getElementById("f_lng").value = v.lng ?? "";
  document.getElementById("f_calismaSaatleri").value = v.calismaSaatleri || "";
  document.getElementById("f_rezervasyon").value = v.rezervasyon || "";
  document.getElementById("f_gorsel").value = v.gorsel || "";
  document.getElementById("f_galeri").value = (v.galeri || []).join("\n");
  document.getElementById("f_ozellikler").value = (v.ozellikler || []).join(", ");
  document.getElementById("f_alinti").value = v.alinti || "";
  document.getElementById("f_neden").value = v.neden || "";
  document.getElementById("f_menu").value = (v.menu || []).join("\n");
  document.getElementById("f_yorumlar").value = (v.yorumlar || [])
    .map((y) => `${y.ad} | ${y.puan} | ${y.yorum}`).join("\n");
  document.getElementById("f_trend").checked = !!v.trend;
  document.getElementById("f_michelin").checked = !!v.michelin;
  document.getElementById("f_yildiz").value = v.yildiz || "";
  document.getElementById("f_bibGourmand").checked = !!v.bibGourmand;
  document.getElementById("f_michelinMention").checked = !!v.michelinMention;
  document.getElementById("formTitle").textContent = `Düzenle: ${v.ad}`;
  document.getElementById("cancelEditBtn").style.display = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formToVenue() {
  const lines = (val) => val.split("\n").map((s) => s.trim()).filter(Boolean);
  const yorumlar = lines(document.getElementById("f_yorumlar").value).map((line) => {
    const [ad, puan, ...rest] = line.split("|").map((s) => s.trim());
    return { ad, puan: Number(puan) || 5, yorum: rest.join("|").trim() };
  });
  return {
    id: document.getElementById("f_id").value || undefined,
    il: document.getElementById("f_il").value,
    ad: document.getElementById("f_ad").value.trim(),
    kategori: document.getElementById("f_kategori").value.trim(),
    fiyat: document.getElementById("f_fiyat").value,
    puan: document.getElementById("f_puan").value ? Number(document.getElementById("f_puan").value) : null,
    yorumSayisi: document.getElementById("f_yorumSayisi").value ? Number(document.getElementById("f_yorumSayisi").value) : null,
    adres: document.getElementById("f_adres").value.trim(),
    lat: document.getElementById("f_lat").value ? Number(document.getElementById("f_lat").value) : null,
    lng: document.getElementById("f_lng").value ? Number(document.getElementById("f_lng").value) : null,
    calismaSaatleri: document.getElementById("f_calismaSaatleri").value.trim(),
    rezervasyon: document.getElementById("f_rezervasyon").value.trim(),
    gorsel: document.getElementById("f_gorsel").value.trim(),
    galeri: lines(document.getElementById("f_galeri").value).slice(0, 3),
    ozellikler: document.getElementById("f_ozellikler").value.split(",").map((s) => s.trim()).filter(Boolean),
    alinti: document.getElementById("f_alinti").value.trim(),
    neden: document.getElementById("f_neden").value.trim(),
    menu: lines(document.getElementById("f_menu").value),
    yorumlar,
    trend: document.getElementById("f_trend").checked,
    michelin: document.getElementById("f_michelin").checked,
    yildiz: document.getElementById("f_yildiz").value ? Number(document.getElementById("f_yildiz").value) : null,
    bibGourmand: document.getElementById("f_bibGourmand").checked,
    michelinMention: document.getElementById("f_michelinMention").checked,
  };
}

async function handleSubmit(e) {
  e.preventDefault();
  const venue = formToVenue();
  const id = document.getElementById("f_id").value;
  const url = id ? `/api/venues?id=${encodeURIComponent(id)}` : "/api/venues";
  const method = id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "x-admin-key": adminKey() },
    body: JSON.stringify(venue),
  });

  if (res.status === 401) {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    showMsg("Şifre hatalı görünüyor, lütfen tekrar giriş yap.", false);
    document.getElementById("adminGate").style.display = "";
    document.getElementById("adminPanel").style.display = "none";
    return;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    showMsg(err.error || "Bir hata oluştu.", false);
    return;
  }
  showMsg(id ? "Mekan güncellendi." : "Yeni mekan eklendi.", true);
  resetForm();
  fetchVenues();
}

async function handleDelete(id) {
  if (!confirm("Bu mekanı silmek istediğine emin misin?")) return;
  const res = await fetch(`/api/venues?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "x-admin-key": adminKey() },
  });
  if (res.status === 401) {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    showMsg("Şifre hatalı görünüyor, lütfen tekrar giriş yap.", false);
    document.getElementById("adminGate").style.display = "";
    document.getElementById("adminPanel").style.display = "none";
    return;
  }
  if (!res.ok) {
    showMsg("Silinemedi.", false);
    return;
  }
  showMsg("Mekan silindi.", true);
  fetchVenues();
}

function enterPanel() {
  document.getElementById("adminGate").style.display = "none";
  document.getElementById("adminPanel").style.display = "";
  fillIlSelect();
  fetchVenues();
}

document.addEventListener("DOMContentLoaded", () => {
  initAdminTheme();

  if (adminKey()) {
    enterPanel();
  }

  document.getElementById("adminEnterBtn").addEventListener("click", () => {
    const pass = document.getElementById("adminPass").value;
    if (!pass) return;
    sessionStorage.setItem(ADMIN_KEY_STORAGE, pass);
    enterPanel();
  });

  document.getElementById("venueForm").addEventListener("submit", handleSubmit);
  document.getElementById("cancelEditBtn").addEventListener("click", resetForm);
  document.getElementById("adminSearch").addEventListener("input", drawList);

  document.getElementById("adminList").addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit]");
    if (editBtn) {
      const v = allVenues.find((x) => x.id === editBtn.dataset.edit);
      if (v) fillForm(v);
      return;
    }
    const delBtn = e.target.closest("[data-delete]");
    if (delBtn) handleDelete(delBtn.dataset.delete);
  });
});
