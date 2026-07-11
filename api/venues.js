const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

function toClient(row) {
  return {
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
    bibGourmand: row.bib_gourmand,
    michelinMention: row.michelin_mention,
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
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function requireAdmin(req, res) {
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    res.status(401).json({ error: "Yetkisiz. Admin şifresi hatalı." });
    return false;
  }
  return true;
}

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM venues ORDER BY il, ad`;
      return res.status(200).json(rows.map(toClient));
    }

    if (req.method === "POST") {
      if (!requireAdmin(req, res)) return;
      const v = req.body || {};
      if (!v.il || !v.ad) {
        return res.status(400).json({ error: "il ve ad zorunlu." });
      }
      const id = v.id || `${slugify(v.il)}-${slugify(v.ad)}-${Math.random().toString(16).slice(2, 6)}`;
      const rows = await sql`
        INSERT INTO venues (
          id, il, ad, kategori, puan, yorum_sayisi, fiyat, trend,
          michelin, yildiz, bib_gourmand, michelin_mention,
          adres, lat, lng, calisma_saatleri, rezervasyon,
          gorsel, galeri, ozellikler, alinti, neden, menu, yorumlar
        ) VALUES (
          ${id}, ${v.il}, ${v.ad}, ${v.kategori ?? null}, ${v.puan ?? null},
          ${v.yorumSayisi ?? null}, ${v.fiyat ?? null}, ${!!v.trend},
          ${!!v.michelin}, ${v.yildiz ?? null}, ${!!v.bibGourmand}, ${!!v.michelinMention},
          ${v.adres ?? null}, ${v.lat ?? null}, ${v.lng ?? null},
          ${v.calismaSaatleri ?? null}, ${v.rezervasyon ?? null}, ${v.gorsel ?? null},
          ${JSON.stringify(v.galeri ?? [])}, ${JSON.stringify(v.ozellikler ?? [])},
          ${v.alinti ?? null}, ${v.neden ?? null},
          ${JSON.stringify(v.menu ?? [])}, ${JSON.stringify(v.yorumlar ?? [])}
        )
        RETURNING *
      `;
      return res.status(201).json(toClient(rows[0]));
    }

    if (req.method === "PUT") {
      if (!requireAdmin(req, res)) return;
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: "id gerekli." });
      const v = req.body || {};
      const rows = await sql`
        UPDATE venues SET
          il = ${v.il}, ad = ${v.ad}, kategori = ${v.kategori ?? null},
          puan = ${v.puan ?? null}, yorum_sayisi = ${v.yorumSayisi ?? null}, fiyat = ${v.fiyat ?? null},
          trend = ${!!v.trend}, michelin = ${!!v.michelin}, yildiz = ${v.yildiz ?? null},
          bib_gourmand = ${!!v.bibGourmand}, michelin_mention = ${!!v.michelinMention},
          adres = ${v.adres ?? null}, lat = ${v.lat ?? null}, lng = ${v.lng ?? null},
          calisma_saatleri = ${v.calismaSaatleri ?? null}, rezervasyon = ${v.rezervasyon ?? null},
          gorsel = ${v.gorsel ?? null},
          galeri = ${JSON.stringify(v.galeri ?? [])}, ozellikler = ${JSON.stringify(v.ozellikler ?? [])},
          alinti = ${v.alinti ?? null}, neden = ${v.neden ?? null},
          menu = ${JSON.stringify(v.menu ?? [])}, yorumlar = ${JSON.stringify(v.yorumlar ?? [])},
          updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `;
      if (rows.length === 0) return res.status(404).json({ error: "Mekan bulunamadı." });
      return res.status(200).json(toClient(rows[0]));
    }

    if (req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: "id gerekli." });
      const rows = await sql`DELETE FROM venues WHERE id = ${id} RETURNING id`;
      if (rows.length === 0) return res.status(404).json({ error: "Mekan bulunamadı." });
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Desteklenmeyen method." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
};
