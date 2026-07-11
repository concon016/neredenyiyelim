/* neredenyiyelim — ortak script dosyası */

/* ---------- Tema (dark/light) ---------- */
function initTheme() {
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

/* ---------- Mobil menü ---------- */
function initMobileNav() {
  const btn = document.getElementById("menuToggle");
  const menu = document.getElementById("navMobile");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => menu.classList.toggle("open"));
}

/* ---------- Scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100;
    bar.style.width = pct + "%";
  });
}

/* ---------- Reveal-on-scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

/* ---------- Favoriler (localStorage) ---------- */
const FAV_KEY = "nny_favoriler";
function getFavoriler() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; }
}
function isFavori(id) { return getFavoriler().includes(id); }
function toggleFavori(id) {
  let favs = getFavoriler();
  if (favs.includes(id)) favs = favs.filter((x) => x !== id);
  else favs.push(id);
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  return favs.includes(id);
}

function starStr(puan) {
  return "★".repeat(Math.round(puan)) + "☆".repeat(5 - Math.round(puan));
}

/* ============================================================
   ANA SAYFA — il arama + grid + trend mekanlar
   ============================================================ */
function initHomePage() {
  const grid = document.getElementById("ilGrid");
  if (!grid) return;

  let activeRegion = "hepsi";
  let query = "";

  function ilVenueCount(slug) { return MEKANLAR.filter((m) => m.il === slug).length; }

  function draw() {
    const term = query.trim().toLocaleLowerCase("tr");
    const filtered = ILLER.filter((i) => {
      const regionOk = activeRegion === "hepsi" || i.bolge === activeRegion;
      const searchOk = !term || i.ad.toLocaleLowerCase("tr").includes(term);
      return regionOk && searchOk;
    });
    grid.innerHTML = filtered.map((i) => {
      const count = ilVenueCount(i.slug);
      return `<a class="il-card${count ? " has-data" : ""}" href="sehir.html?il=${i.slug}">
        <span>${i.ad}</span>
        <span class="count">${count ? count + " mekan" : BOLGE_ADI[i.bolge]}</span>
      </a>`;
    }).join("") || `<p style="grid-column:1/-1;text-align:center;">"${query}" ile eşleşen il bulunamadı.</p>`;
  }

  document.querySelectorAll(".region-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".region-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeRegion = tab.dataset.region;
      draw();
    });
  });

  function bestMatch() {
    const term = query.trim().toLocaleLowerCase("tr");
    if (!term) return null;
    const exact = ILLER.find((i) => i.ad.toLocaleLowerCase("tr") === term);
    if (exact) return exact;
    return ILLER.find((i) => i.ad.toLocaleLowerCase("tr").includes(term)) || null;
  }

  function goToMatch() {
    const match = bestMatch();
    if (match) window.location.href = `sehir.html?il=${match.slug}`;
  }

  const searchInput = document.getElementById("ilSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => { query = e.target.value; draw(); });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        goToMatch();
      }
    });
  }

  const searchBtn = document.getElementById("ilSearchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", goToMatch);
  }

  draw();

  // Trend mekanlar
  const trendGrid = document.getElementById("trendGrid");
  if (trendGrid) {
    const trend = MEKANLAR.filter((m) => m.trend).slice(0, 6);
    trendGrid.innerHTML = trend.map((m) => `
      <a class="venue-mini reveal" href="mekan.html?id=${m.id}">
        <img src="${m.gorsel}" alt="${m.ad}" loading="lazy">
        <span class="badge-trend">Trend</span>
        <span class="badge-rating">★ ${m.puan}</span>
        <div class="overlay">
          <h3>${m.ad}</h3>
          <div class="meta">${m.kategori} · ${ilGetir(m.il).ad}</div>
        </div>
      </a>`).join("");
    initReveal();
  }

  // Michelin yıldızlı mekanlar (öne çıkan birkaçı, tamamı michelin.html'de)
  const michelinSection = document.getElementById("michelinSection");
  const michelinGrid = document.getElementById("michelinGrid");
  if (michelinGrid) {
    const michelinList = MEKANLAR.filter((m) => m.michelin).sort((a, b) => (b.yildiz || 0) - (a.yildiz || 0)).slice(0, 6);
    if (michelinList.length) {
      michelinSection.style.display = "";
      michelinGrid.innerHTML = michelinList.map((m) => `
        <a class="venue-mini reveal" href="mekan.html?id=${m.id}">
          <img src="${m.gorsel}" alt="${m.ad}" loading="lazy">
          <span class="badge-michelin" style="position:absolute;top:10px;left:10px;">${"★".repeat(m.yildiz || 1)} Michelin</span>
          <span class="badge-rating">★ ${m.puan}</span>
          <div class="overlay">
            <h3>${m.ad}</h3>
            <div class="meta">${m.kategori} · ${ilGetir(m.il).ad}</div>
          </div>
        </a>`).join("");
      initReveal();
    }
  }

  // "Bugün nereye gitsem?" rastgele mekan
  const zarBtn = document.getElementById("zarBtn");
  if (zarBtn) {
    zarBtn.addEventListener("click", () => {
      const secim = MEKANLAR[Math.floor(Math.random() * MEKANLAR.length)];
      window.location.href = `mekan.html?id=${secim.id}`;
    });
  }
}

/* ============================================================
   ŞEHİR SAYFASI — reels + liste görünümü
   ============================================================ */
function initCityPage() {
  const root = document.getElementById("cityRoot");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("il") || "";
  const il = ilGetir(slug);

  if (!il) {
    root.innerHTML = `<div class="empty-state"><div class="emoji">🤔</div><h2>Şehir bulunamadı</h2><p>Aradığınız il listede yok. <a href="index.html" class="hl">Ana sayfaya dön</a> ve tekrar seçin.</p></div>`;
    return;
  }

  document.title = `${il.ad} — En İyi Mekanlar | neredenyiyelim`;
  document.getElementById("cityName").textContent = il.ad;
  document.getElementById("cityBreadcrumb").textContent = il.ad;

  const venues = mekanlariGetir(slug);
  document.getElementById("citySub").textContent = venues.length
    ? `${venues.length} özel seçilmiş mekan · ${BOLGE_ADI[il.bolge]}`
    : `${BOLGE_ADI[il.bolge]} · henüz özel seçmece mekan eklenmedi`;

  if (!venues.length) {
    document.getElementById("filterBar").style.display = "none";
    root.innerHTML = `<div class="empty-state">
      <div class="emoji">🍽️</div>
      <h2>${il.ad} için mekanlar yakında</h2>
      <p>Bu şehirdeki en güncel, en yüksek puanlı ve öne çıkan mekanları şu anda özenle seçiyoruz. Çok yakında burada olacak.</p>
      <a class="btn btn-accent" href="index.html">Başka bir şehre bak</a>
    </div>`;
    return;
  }

  let activeCat = "hepsi";
  let activeView = "reels";

  const categories = [...new Set(venues.map((v) => v.kategori))];
  const hasMichelin = venues.some((v) => v.michelin);
  const chipsWrap = document.getElementById("chips");
  chipsWrap.innerHTML = `<button class="chip active" data-cat="hepsi">Hepsi</button>` +
    (hasMichelin ? `<button class="chip chip-michelin" data-cat="michelin">★ Michelin Yıldızlı</button>` : "") +
    categories.map((c) => `<button class="chip" data-cat="${c}">${c}</button>`).join("");

  function filtered() {
    if (activeCat === "hepsi") return venues;
    if (activeCat === "michelin") return venues.filter((v) => v.michelin);
    return venues.filter((v) => v.kategori === activeCat);
  }

  function reelCardHtml(v) {
    const fav = isFavori(v.id);
    return `<div class="reel-card reveal" data-id="${v.id}">
      <img src="${v.gorsel}" alt="${v.ad}" loading="lazy">
      <div class="scrim"></div>
      <div class="reel-top">
        ${v.michelin ? `<span class="badge-michelin">${"★".repeat(v.yildiz || 1)} Michelin</span>` : v.trend ? '<span class="badge-trend">Bu Hafta Trend</span>' : "<span></span>"}
        <span class="badge-rating">★ ${v.puan} <span style="opacity:.8;font-weight:500;">(${v.yorumSayisi.toLocaleString("tr-TR")})</span></span>
      </div>
      <div class="reel-bottom">
        <div class="reel-quote">${v.alinti}</div>
        <h3>${v.ad}</h3>
        <div class="reel-price">${v.kategori} · ${v.fiyat} · ${v.adres}</div>
        <div class="reel-tags">${v.ozellikler.map((o) => `<span>${o}</span>`).join("")}</div>
        <div class="reel-menu"><b>Menüden:</b> ${v.menu.slice(0, 3).join(", ")}</div>
        <div class="reel-actions">
          <a class="btn btn-accent" href="mekan.html?id=${v.id}">Detayları Gör</a>
          <button class="reel-fav${fav ? " active" : ""}" data-fav="${v.id}" aria-label="Favorilere ekle">${fav ? "♥" : "♡"}</button>
        </div>
      </div>
    </div>`;
  }

  function listRowHtml(v) {
    const fav = isFavori(v.id);
    return `<div class="list-row reveal in">
      <a class="thumb" href="mekan.html?id=${v.id}"><img src="${v.gorsel}" alt="${v.ad}" loading="lazy"></a>
      <div class="body">
        <div class="list-row-head">
          <div>
            <div class="cat">${v.kategori}</div>
            <h3><a href="mekan.html?id=${v.id}">${v.ad}</a></h3>
          </div>
          <span class="rating-pill">★ ${v.puan}</span>
        </div>
        <p style="margin:0;font-size:.85rem;">${v.adres} · ${v.fiyat}</p>
        <div class="tags">${v.ozellikler.slice(0, 3).map((o) => `<span>${o}</span>`).join("")}</div>
        <p style="margin:0;font-size:.8rem;color:var(--ink-muted);"><b style="color:var(--ink);">Menüden:</b> ${v.menu.slice(0, 3).join(", ")}</p>
        <div class="list-row-foot">
          <a class="btn btn-secondary btn-sm" href="mekan.html?id=${v.id}">Detayları Gör</a>
          <button class="reel-fav${fav ? " active" : ""}" data-fav="${v.id}" aria-label="Favorilere ekle" style="background:var(--surface-2);color:${fav ? "#fff" : "var(--ink)"};">${fav ? "♥" : "♡"}</button>
        </div>
      </div>
    </div>`;
  }

  const reels = document.getElementById("reels");
  const listView = document.getElementById("listView");

  function draw() {
    const list = filtered();
    reels.innerHTML = list.map(reelCardHtml).join("");
    listView.innerHTML = list.map(listRowHtml).join("");
    initReveal();
  }

  chipsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    chipsWrap.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    activeCat = btn.dataset.cat;
    draw();
  });

  document.querySelectorAll(".view-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-toggle button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeView = btn.dataset.view;
      document.getElementById("reelsWrap").style.display = activeView === "reels" ? "block" : "none";
      listView.style.display = activeView === "list" ? "flex" : "none";
    });
  });

  root.addEventListener("click", (e) => {
    const favBtn = e.target.closest("[data-fav]");
    if (!favBtn) return;
    const active = toggleFavori(favBtn.dataset.fav);
    favBtn.classList.toggle("active", active);
    favBtn.textContent = active ? "♥" : "♡";
  });

  draw();
}

/* ============================================================
   MEKAN DETAY SAYFASI
   ============================================================ */
function initVenuePage() {
  const root = document.getElementById("venueRoot");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "";
  const v = mekanGetir(id);

  if (!v) {
    root.innerHTML = `<div class="empty-state"><div class="emoji">🤔</div><h2>Mekan bulunamadı</h2><a class="btn btn-accent" href="index.html">Ana sayfaya dön</a></div>`;
    return;
  }

  const il = ilGetir(v.il);
  document.title = `${v.ad} — ${il.ad} | neredenyiyelim`;

  root.innerHTML = `
    <div class="venue-hero">
      <img src="${v.gorsel}" alt="${v.ad}">
      <div class="scrim"></div>
      <div class="venue-hero-content">
        <div class="city-head" style="padding:0;margin-bottom:8px;">
          <div class="breadcrumb" style="color:rgba(255,255,255,.85);">
            <a href="index.html" style="color:#fff;">Ana Sayfa</a> ›
            <a href="sehir.html?il=${il.slug}" style="color:#fff;">${il.ad}</a> › ${v.ad}
          </div>
        </div>
        <h1>${v.ad}</h1>
        <div class="venue-hero-meta">
          <span class="badge-rating" style="position:static;">★ ${v.puan} (${v.yorumSayisi.toLocaleString("tr-TR")} yorum)</span>
          <span>${v.kategori}</span><span>${v.fiyat}</span>
          ${v.michelin ? `<span class="badge-michelin">${"★".repeat(v.yildiz || 1)} Michelin Yıldızlı</span>` : v.trend ? '<span class="badge-trend" style="position:static;">Bu Hafta Trend</span>' : ""}
        </div>
      </div>
    </div>

    <div class="gallery-strip">${v.galeri.map((g) => `<img src="${g}" alt="${v.ad} görseli" loading="lazy">`).join("")}</div>

    <div class="venue-body">
      <div>
        <div class="venue-block">
          <h2>Neden Seçildi?</h2>
          <p>${v.neden}</p>
          <p style="font-style:italic;color:var(--ink);">${v.alinti}</p>
        </div>
        <div class="venue-block">
          <h2>Öne Çıkan Özellikler</h2>
          <div class="feature-list">${v.ozellikler.map((o) => `<span>${o}</span>`).join("")}</div>
        </div>
        <div class="venue-block">
          <h2>Menüden Seçmeler</h2>
          <div class="feature-list">${v.menu.map((m) => `<span>${m}</span>`).join("")}</div>
        </div>
        ${v.yorumlar.length ? `<div class="venue-block">
          <h2>Müşteri Yorumlarından</h2>
          ${v.yorumlar.map((y) => `<div class="testimonial">
            <div class="testimonial-head"><span>${y.ad}</span><span class="stars">${starStr(y.puan)}</span></div>
            <p>${y.yorum}</p>
          </div>`).join("")}
        </div>` : ""}
      </div>
      <div>
        <div class="sidebar-card">
          <h2 style="font-size:1.1rem;">Konum</h2>
          <iframe class="map-embed" src="https://maps.google.com/maps?q=${encodeURIComponent(v.adres)}&z=15&output=embed" loading="lazy" title="${v.ad} konumu"></iframe>
          <p class="addr">${v.adres}</p>
          <a class="btn btn-secondary" target="_blank" rel="noopener" href="https://www.google.com/maps/search/${encodeURIComponent(v.adres)}">Google Maps'te Aç</a>
          <button class="btn btn-accent" id="favBtn" data-fav="${v.id}">${isFavori(v.id) ? "♥ Favorilerde" : "♡ Favorilere Ekle"}</button>
          <a class="btn btn-ghost" href="sehir.html?il=${il.slug}">${il.ad} Mekanlarına Dön</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById("favBtn").addEventListener("click", (e) => {
    const active = toggleFavori(v.id);
    e.target.textContent = active ? "♥ Favorilerde" : "♡ Favorilere Ekle";
  });
}

/* ============================================================
   MICHELIN SAYFASI
   ============================================================ */
function initMichelinPage() {
  const root = document.getElementById("michelinRoot");
  if (!root) return;

  const list = MEKANLAR.filter((m) => m.michelin).sort((a, b) => (b.yildiz || 0) - (a.yildiz || 0) || b.puan - a.puan);
  const iki = list.filter((m) => m.yildiz === 2);
  const bir = list.filter((m) => m.yildiz !== 2);

  function rowHtml(v) {
    const il = ilGetir(v.il);
    return `<a class="list-row reveal in" href="mekan.html?id=${v.id}" style="text-decoration:none;color:inherit;">
      <div class="thumb"><img src="${v.gorsel}" alt="${v.ad}" loading="lazy"></div>
      <div class="body">
        <div class="list-row-head">
          <div><div class="cat">${v.kategori}</div><h3>${v.ad}</h3></div>
          <span class="badge-michelin">${"★".repeat(v.yildiz || 1)} ${v.yildiz || 1} Yıldız</span>
        </div>
        <p style="margin:0;font-size:.85rem;">${v.adres} · ${il ? il.ad : ""}</p>
        <div class="tags">${v.ozellikler.slice(0, 3).map((o) => `<span>${o}</span>`).join("")}</div>
      </div>
    </a>`;
  }

  root.innerHTML = `
    ${iki.length ? `<div class="section-head reveal in"><p class="eyebrow">★★ İki Yıldız</p><h2>En üst seviye mutfak deneyimi</h2></div>
    <div class="list-view" style="padding:0 0 30px;">${iki.map(rowHtml).join("")}</div>` : ""}
    ${bir.length ? `<div class="section-head reveal in"><p class="eyebrow">★ Bir Yıldız</p><h2>Kendi kategorisinde en iyisi</h2></div>
    <div class="list-view" style="padding:0;">${bir.map(rowHtml).join("")}</div>` : ""}
  `;
}

/* ============================================================
   FAVORİLER SAYFASI
   ============================================================ */
function initFavoritesPage() {
  const root = document.getElementById("favRoot");
  if (!root) return;
  const ids = getFavoriler();
  const venues = ids.map((id) => mekanGetir(id)).filter(Boolean);
  if (!venues.length) {
    root.innerHTML = `<div class="fav-empty"><div class="emoji" style="font-size:2.4rem;">🤍</div>
      <h2>Henüz favori mekanın yok</h2>
      <p>Bir şehir seç, beğendiğin mekanların kalp ikonuna dokun — burada listelensin.</p>
      <a class="btn btn-accent" href="index.html">Şehirlere Göz At</a></div>`;
    return;
  }
  root.innerHTML = `<div class="list-view" style="padding:0;">${venues.map((v) => `
    <div class="list-row reveal in">
      <a class="thumb" href="mekan.html?id=${v.id}"><img src="${v.gorsel}" alt="${v.ad}" loading="lazy"></a>
      <div class="body">
        <div class="list-row-head">
          <div><div class="cat">${v.kategori} · ${ilGetir(v.il).ad}</div><h3><a href="mekan.html?id=${v.id}">${v.ad}</a></h3></div>
          <span class="rating-pill">★ ${v.puan}</span>
        </div>
        <p style="margin:0;font-size:.85rem;">${v.adres}</p>
        <div class="list-row-foot">
          <a class="btn btn-secondary btn-sm" href="mekan.html?id=${v.id}">Detayları Gör</a>
          <button class="reel-fav active" data-fav="${v.id}" style="background:var(--surface-2);">♥</button>
        </div>
      </div>
    </div>`).join("")}</div>`;

  root.addEventListener("click", (e) => {
    const favBtn = e.target.closest("[data-fav]");
    if (!favBtn) return;
    toggleFavori(favBtn.dataset.fav);
    initFavoritesPage();
  });
}

/* ============================================================
   İLETİŞİM FORMU (yerel simülasyon — gerçek backend yok)
   ============================================================ */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.style.display = "none";
    document.getElementById("formSuccess").classList.add("show");
  });
}

/* ============================================================
   SSS accordion
   ============================================================ */
function initFaq() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.querySelector(".faq-q").addEventListener("click", () => item.classList.toggle("open"));
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initMobileNav();
  initScrollProgress();
  initContactForm();
  initFaq();

  try {
    await loadMekanlar();
  } catch (err) {
    console.error(err);
  }

  initHomePage();
  initCityPage();
  initVenuePage();
  initMichelinPage();
  initFavoritesPage();
  initReveal();
});
