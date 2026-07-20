// Generates one static, fully-SEO'd HTML page per venue (e.g. pandeli-mekan.html)
// so Google can index real venue content without running client-side JS.
// Re-run this any time venue data changes in the DB (via admin.html) to keep pages in sync.
require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { neon } = require("@neondatabase/serverless");

const ROOT = path.join(__dirname, "..");
const sql = neon(process.env.DATABASE_URL);

function loadIller() {
  const src = fs.readFileSync(path.join(ROOT, "data.js"), "utf8");
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(src + "\nthis.ILLER = ILLER;", sandbox);
  return sandbox.ILLER;
}

function starStr(puan) {
  const full = Math.round(puan || 0);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const NO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23eee'/%3E%3C/svg%3E";

function jsonld(v, il, url) {
  const obj = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: v.ad,
    url,
    servesCuisine: v.kategori,
    priceRange: v.fiyat || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: v.adres,
      addressLocality: il ? il.ad : undefined,
      addressCountry: "TR",
    },
  };
  if (v.gorsel) obj.image = v.gorsel;
  if (v.puan && v.yorumSayisi) {
    obj.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: v.puan,
      reviewCount: v.yorumSayisi,
    };
  }
  if (v.lat && v.lng) {
    obj.geo = { "@type": "GeoCoordinates", latitude: v.lat, longitude: v.lng };
  }
  return JSON.stringify(obj);
}

function pageHtml(v, il) {
  const url = `https://neredenyiyelim.com/${v.id}-mekan.html`;
  const title = `${v.ad} — ${il ? il.ad : ""} | neredenyiyelim`;
  const desc = `${v.ad}, ${il ? il.ad : ""} — ${v.kategori}, ${v.fiyat || ""}${v.puan ? ` — ★ ${v.puan} (${v.yorumSayisi ? v.yorumSayisi.toLocaleString("tr-TR") : 0} yorum)` : ""}. ${v.neden || ""}`.slice(0, 300);
  const heroImg = v.gorsel || NO_IMG;

  const mapSrc = v.lat && v.lng
    ? `https://maps.google.com/maps?q=${v.lat},${v.lng}&z=16&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(v.adres)}&z=15&output=embed`;
  const mapsLink = v.lat && v.lng
    ? `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(v.adres)}`;

  const gallery = (v.galeri || []).map((g) => `<img src="${g}" alt="${esc(v.ad)} görseli" loading="lazy">`).join("");
  const features = (v.ozellikler || []).map((o) => `<span>${o}</span>`).join("");
  const menu = (v.menu || []).map((m) => `<span>${m}</span>`).join("");
  const yorumlar = (v.yorumlar || []).length
    ? `<div class="venue-block">
          <h2>Müşteri Yorumlarından</h2>
          ${v.yorumlar.map((y) => `<div class="testimonial">
            <div class="testimonial-head"><span>${y.ad}</span><span class="stars">${starStr(y.puan)}</span></div>
            <p>${y.yorum}</p>
          </div>`).join("")}
        </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MK8XLK9LF3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-MK8XLK9LF3");
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8D%B4%3C/text%3E%3C/svg%3E">
<script>
  (function () {
    var saved = localStorage.getItem("theme");
    document.documentElement.setAttribute("data-theme", saved || "light");
  })();
</script>
<link rel="stylesheet" href="style.css">
<script type="application/ld+json">${jsonld(v, il, url)}</script>
</head>
<body>

<div class="scroll-progress"></div>

<nav class="nav">
  <div class="nav-inner">
    <a href="index.html" class="logo"><img src="assets/logo.svg" class="logo-icon" alt="" width="28" height="28">nereden<span class="hl">yiyelim</span></a>
    <ul class="nav-links" id="navMobile">
      <li><a href="index.html">Ana Sayfa</a></li>
      <li><a href="michelin.html">★ Michelin</a></li>
      <li><a href="favoriler.html">Favorilerim</a></li>
      <li><a href="hakkinda.html">Hakkında</a></li>
      <li><a href="sss.html">SSS</a></li>
    </ul>
    <div class="nav-right">
      <button class="theme-toggle" id="themeToggle" role="switch" aria-checked="false" aria-label="Karanlık modu değiştir">
        <span class="theme-toggle-thumb"></span>
      </button>
      <button class="menu-toggle" id="menuToggle" aria-label="Menü"><span></span><span></span><span></span></button>
    </div>
  </div>
</nav>

<main>
  <div id="venueContent">
    <div class="venue-hero">
      <img src="${heroImg}" alt="${esc(v.ad)}">
      <div class="scrim"></div>
      <div class="venue-hero-content">
        <div class="city-head" style="padding:0;margin-bottom:8px;">
          <div class="breadcrumb" style="color:rgba(255,255,255,.85);">
            <a href="index.html" style="color:#fff;">Ana Sayfa</a> ›
            <a href="sehir.html?il=${il ? il.slug : v.il}" style="color:#fff;">${il ? il.ad : v.il}</a> › ${v.ad}
          </div>
        </div>
        <h1>${v.ad}</h1>
        <div class="venue-hero-meta">
          <span class="badge-rating" style="position:static;">★ ${v.puan} (${v.yorumSayisi ? v.yorumSayisi.toLocaleString("tr-TR") : 0} yorum)</span>
          <span>${v.kategori}</span><span>${v.fiyat}</span>
          ${v.michelin ? `<span class="badge-michelin">${"★".repeat(v.yildiz || 1)} Michelin Yıldızlı</span>` : v.trend ? '<span class="badge-trend" style="position:static;">Bu Hafta Trend</span>' : ""}
        </div>
      </div>
    </div>

    <div class="gallery-strip">${gallery}</div>

    <div class="venue-body">
      <div>
        <div class="venue-block">
          <h2>Neden Seçildi?</h2>
          <p>${v.neden || ""}</p>
          <p style="font-style:italic;color:var(--ink);">${v.alinti || ""}</p>
        </div>
        <div class="venue-block">
          <h2>Öne Çıkan Özellikler</h2>
          <div class="feature-list">${features}</div>
        </div>
        <div class="venue-block">
          <h2>Menüden Seçmeler</h2>
          <div class="feature-list">${menu}</div>
        </div>
        ${yorumlar}
      </div>
      <div>
        <div class="sidebar-card">
          <h2 style="font-size:1.1rem;">Konum</h2>
          <iframe class="map-embed" src="${mapSrc}" loading="lazy" title="${esc(v.ad)} konumu"></iframe>
          <p class="addr">${v.adres}</p>
          ${v.calismaSaatleri ? `<p class="addr"><b style="color:var(--ink);">Çalışma Saatleri:</b> ${v.calismaSaatleri}</p>` : ""}
          ${v.rezervasyon ? `<p class="addr"><b style="color:var(--ink);">Rezervasyon:</b> ${v.rezervasyon}</p>` : ""}
          <a class="btn btn-secondary" target="_blank" rel="noopener" href="${mapsLink}">Google Maps'te Aç</a>
          <button class="btn btn-accent" id="favBtn" data-fav="${v.id}">♡ Favorilere Ekle</button>
          <a class="btn btn-ghost" href="sehir.html?il=${il ? il.slug : v.il}">${il ? il.ad : v.il} Mekanlarına Dön</a>
        </div>
      </div>
    </div>
  </div>
</main>

<footer class="footer">
  <div class="foot-links">
    <a href="index.html">Ana Sayfa</a>
    <a href="michelin.html">Michelin</a>
    <a href="favoriler.html">Favorilerim</a>
    <a href="hakkinda.html">Hakkında</a>
    <a href="sss.html">SSS</a>
    <a href="gizlilik.html">Gizlilik Politikası</a>
  </div>
  <p>&copy; 2026 neredenyiyelim. Tüm hakları saklıdır.</p>
  <p class="credit">Bu site <a href="https://canwebco.com" target="_blank" rel="noopener">canwebco</a> tarafından tasarlanmıştır.</p>
  <p class="disclaimer">Bu platformdaki mekan, puan ve yorum bilgileri tanıtım/başlangıç amaçlı örnek içeriklerdir; güncel fiyat ve puanlar için işletmenin kendi Google profilini kontrol edin.</p>
</footer>

<script src="data.js"></script>
<script src="script.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("favBtn");
    if (!btn) return;
    if (typeof isFavori === "function" && isFavori(btn.dataset.fav)) {
      btn.textContent = "♥ Favorilerde";
    }
    btn.addEventListener("click", function () {
      var active = toggleFavori(btn.dataset.fav);
      btn.textContent = active ? "♥ Favorilerde" : "♡ Favorilere Ekle";
    });
  });
</script>
</body>
</html>
`;
}

(async () => {
  const iller = loadIller();
  const rows = await sql`SELECT id, il, ad, kategori, puan, yorum_sayisi, fiyat, trend, michelin,
    yildiz, bib_gourmand, michelin_mention, adres, lat, lng, calisma_saatleri, rezervasyon,
    gorsel, galeri, ozellikler, alinti, neden, menu, yorumlar FROM venues ORDER BY id`;

  let written = 0;
  const urls = [];
  for (const row of rows) {
    const v = {
      id: row.id,
      il: row.il,
      ad: row.ad,
      kategori: row.kategori,
      puan: row.puan === null ? null : Number(row.puan),
      yorumSayisi: row.yorum_sayisi,
      fiyat: row.fiyat,
      trend: row.trend,
      michelin: row.michelin,
      yildiz: row.yildiz,
      adres: row.adres,
      lat: row.lat === null ? null : Number(row.lat),
      lng: row.lng === null ? null : Number(row.lng),
      calismaSaatleri: row.calisma_saatleri,
      rezervasyon: row.rezervasyon,
      gorsel: row.gorsel,
      galeri: row.galeri ?? [],
      ozellikler: row.ozellikler ?? [],
      alinti: row.alinti,
      neden: row.neden,
      menu: row.menu ?? [],
      yorumlar: row.yorumlar ?? [],
    };
    const il = iller.find((i) => i.slug === v.il);
    const filename = `${v.id}-mekan.html`;
    fs.writeFileSync(path.join(ROOT, filename), pageHtml(v, il), "utf8");
    urls.push(filename);
    written++;
  }

  fs.writeFileSync(path.join(ROOT, "scripts", "venue-urls.json"), JSON.stringify(urls, null, 2));
  console.log(`${written} venue sayfası üretildi.`);

  // sitemap.xml: statik sayfalar + mekan bulunan iller + tüm mekan sayfaları
  const ilRows = await sql`SELECT DISTINCT il FROM venues`;
  const ilSlugs = ilRows.map((r) => r.il).sort();

  const staticPages = [
    "index.html",
    "michelin.html",
    "favoriler.html",
    "hakkinda.html",
    "sss.html",
    "gizlilik.html",
  ];

  const loc = (u) => `  <url><loc>https://neredenyiyelim.com/${u}</loc></url>`;
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticPages.map(loc),
    ...ilSlugs.map((slug) => loc(`sehir.html?il=${slug}`)),
    ...urls.map(loc),
    "</urlset>",
    "",
  ];
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), lines.join("\n"), "utf8");
  console.log(`sitemap.xml güncellendi: ${staticPages.length} statik + ${ilSlugs.length} il + ${urls.length} mekan sayfası.`);
})();
