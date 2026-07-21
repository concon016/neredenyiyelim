// One-off: create the venues table and load MEKANLAR from data.js into Postgres.
// Usage: node scripts/migrate.js
require("dotenv").config({ path: ".env.local", quiet: true });
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { neon } = require("@neondatabase/serverless");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing — run `vercel env pull --yes` first.");
  process.exit(1);
}

// data.js is a browser script (no module.exports), so run it in a sandbox
// to pull out the MEKANLAR array it declares at the top level.
const dataSource = fs.readFileSync(path.join(__dirname, "..", "data.js"), "utf8");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(dataSource + "\nthis.MEKANLAR = MEKANLAR; this.ILLER = ILLER;", sandbox);
const MEKANLAR = sandbox.MEKANLAR;

if (!Array.isArray(MEKANLAR) || MEKANLAR.length === 0) {
  console.error("Could not extract MEKANLAR from data.js");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log("Schema ready.");

  let inserted = 0;
  for (const v of MEKANLAR) {
    await sql`
      INSERT INTO venues (
        id, il, ad, kategori, puan, yorum_sayisi, fiyat, trend,
        michelin, yildiz, bib_gourmand, michelin_mention,
        adres, gorsel, galeri, ozellikler, alinti, neden, menu, yorumlar
      ) VALUES (
        ${v.id}, ${v.il}, ${v.ad}, ${v.kategori ?? null}, ${v.puan ?? null},
        ${v.yorumSayisi ?? null}, ${v.fiyat ?? null}, ${!!v.trend},
        ${!!v.michelin}, ${v.yildiz ?? null}, ${!!v.bibGourmand}, ${!!v.michelinMention},
        ${v.adres ?? null}, ${v.gorsel ?? null},
        ${JSON.stringify(v.galeri ?? [])}, ${JSON.stringify(v.ozellikler ?? [])},
        ${v.alinti ?? null}, ${v.neden ?? null},
        ${JSON.stringify(v.menu ?? [])}, ${JSON.stringify(v.yorumlar ?? [])}
      )
      ON CONFLICT (id) DO UPDATE SET
        il = EXCLUDED.il, ad = EXCLUDED.ad, kategori = EXCLUDED.kategori,
        puan = EXCLUDED.puan, yorum_sayisi = EXCLUDED.yorum_sayisi, fiyat = EXCLUDED.fiyat,
        trend = EXCLUDED.trend, michelin = EXCLUDED.michelin, yildiz = EXCLUDED.yildiz,
        bib_gourmand = EXCLUDED.bib_gourmand, michelin_mention = EXCLUDED.michelin_mention,
        adres = EXCLUDED.adres, gorsel = EXCLUDED.gorsel, galeri = EXCLUDED.galeri,
        ozellikler = EXCLUDED.ozellikler, alinti = EXCLUDED.alinti, neden = EXCLUDED.neden,
        menu = EXCLUDED.menu, yorumlar = EXCLUDED.yorumlar, updated_at = now()
    `;
    inserted++;
  }
  console.log(`Migrated ${inserted} venues.`);

  const [{ count }] = await sql`SELECT count(*)::int FROM venues`;
  console.log(`Row count in DB: ${count}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
