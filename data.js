/* neredenyiyelim — 81 il verisi + öne çıkan mekan verisi
   Not: Mekan verileri şu an için örnek/başlangıç (taban) veridir.
   Gerçek, güncel Google verileriyle şehir şehir zenginleştirilecektir. */

const BOLGE_ADI = {
  marmara: "Marmara",
  ege: "Ege",
  akdeniz: "Akdeniz",
  icanadolu: "İç Anadolu",
  karadeniz: "Karadeniz",
  doguanadolu: "Doğu Anadolu",
  guneydogu: "Güneydoğu Anadolu",
};

const ILLER = [
  { ad: "Adana", slug: "adana", bolge: "akdeniz" },
  { ad: "Adıyaman", slug: "adiyaman", bolge: "guneydogu" },
  { ad: "Afyonkarahisar", slug: "afyonkarahisar", bolge: "ege" },
  { ad: "Ağrı", slug: "agri", bolge: "doguanadolu" },
  { ad: "Amasya", slug: "amasya", bolge: "karadeniz" },
  { ad: "Ankara", slug: "ankara", bolge: "icanadolu" },
  { ad: "Antalya", slug: "antalya", bolge: "akdeniz" },
  { ad: "Artvin", slug: "artvin", bolge: "karadeniz" },
  { ad: "Aydın", slug: "aydin", bolge: "ege" },
  { ad: "Balıkesir", slug: "balikesir", bolge: "marmara" },
  { ad: "Bilecik", slug: "bilecik", bolge: "marmara" },
  { ad: "Bingöl", slug: "bingol", bolge: "doguanadolu" },
  { ad: "Bitlis", slug: "bitlis", bolge: "doguanadolu" },
  { ad: "Bolu", slug: "bolu", bolge: "karadeniz" },
  { ad: "Burdur", slug: "burdur", bolge: "akdeniz" },
  { ad: "Bursa", slug: "bursa", bolge: "marmara" },
  { ad: "Çanakkale", slug: "canakkale", bolge: "marmara" },
  { ad: "Çankırı", slug: "cankiri", bolge: "icanadolu" },
  { ad: "Çorum", slug: "corum", bolge: "karadeniz" },
  { ad: "Denizli", slug: "denizli", bolge: "ege" },
  { ad: "Diyarbakır", slug: "diyarbakir", bolge: "guneydogu" },
  { ad: "Edirne", slug: "edirne", bolge: "marmara" },
  { ad: "Elazığ", slug: "elazig", bolge: "doguanadolu" },
  { ad: "Erzincan", slug: "erzincan", bolge: "doguanadolu" },
  { ad: "Erzurum", slug: "erzurum", bolge: "doguanadolu" },
  { ad: "Eskişehir", slug: "eskisehir", bolge: "icanadolu" },
  { ad: "Gaziantep", slug: "gaziantep", bolge: "guneydogu" },
  { ad: "Giresun", slug: "giresun", bolge: "karadeniz" },
  { ad: "Gümüşhane", slug: "gumushane", bolge: "karadeniz" },
  { ad: "Hakkari", slug: "hakkari", bolge: "doguanadolu" },
  { ad: "Hatay", slug: "hatay", bolge: "akdeniz" },
  { ad: "Isparta", slug: "isparta", bolge: "akdeniz" },
  { ad: "Mersin", slug: "mersin", bolge: "akdeniz" },
  { ad: "İstanbul", slug: "istanbul", bolge: "marmara" },
  { ad: "İzmir", slug: "izmir", bolge: "ege" },
  { ad: "Kars", slug: "kars", bolge: "doguanadolu" },
  { ad: "Kastamonu", slug: "kastamonu", bolge: "karadeniz" },
  { ad: "Kayseri", slug: "kayseri", bolge: "icanadolu" },
  { ad: "Kırklareli", slug: "kirklareli", bolge: "marmara" },
  { ad: "Kırşehir", slug: "kirsehir", bolge: "icanadolu" },
  { ad: "Kocaeli", slug: "kocaeli", bolge: "marmara" },
  { ad: "Konya", slug: "konya", bolge: "icanadolu" },
  { ad: "Kütahya", slug: "kutahya", bolge: "ege" },
  { ad: "Malatya", slug: "malatya", bolge: "doguanadolu" },
  { ad: "Manisa", slug: "manisa", bolge: "ege" },
  { ad: "Kahramanmaraş", slug: "kahramanmaras", bolge: "akdeniz" },
  { ad: "Mardin", slug: "mardin", bolge: "guneydogu" },
  { ad: "Muğla", slug: "mugla", bolge: "ege" },
  { ad: "Muş", slug: "mus", bolge: "doguanadolu" },
  { ad: "Nevşehir", slug: "nevsehir", bolge: "icanadolu" },
  { ad: "Niğde", slug: "nigde", bolge: "icanadolu" },
  { ad: "Ordu", slug: "ordu", bolge: "karadeniz" },
  { ad: "Rize", slug: "rize", bolge: "karadeniz" },
  { ad: "Sakarya", slug: "sakarya", bolge: "marmara" },
  { ad: "Samsun", slug: "samsun", bolge: "karadeniz" },
  { ad: "Siirt", slug: "siirt", bolge: "guneydogu" },
  { ad: "Sinop", slug: "sinop", bolge: "karadeniz" },
  { ad: "Sivas", slug: "sivas", bolge: "icanadolu" },
  { ad: "Tekirdağ", slug: "tekirdag", bolge: "marmara" },
  { ad: "Tokat", slug: "tokat", bolge: "karadeniz" },
  { ad: "Trabzon", slug: "trabzon", bolge: "karadeniz" },
  { ad: "Tunceli", slug: "tunceli", bolge: "doguanadolu" },
  { ad: "Şanlıurfa", slug: "sanliurfa", bolge: "guneydogu" },
  { ad: "Uşak", slug: "usak", bolge: "ege" },
  { ad: "Van", slug: "van", bolge: "doguanadolu" },
  { ad: "Yozgat", slug: "yozgat", bolge: "icanadolu" },
  { ad: "Zonguldak", slug: "zonguldak", bolge: "karadeniz" },
  { ad: "Aksaray", slug: "aksaray", bolge: "icanadolu" },
  { ad: "Bayburt", slug: "bayburt", bolge: "karadeniz" },
  { ad: "Karaman", slug: "karaman", bolge: "icanadolu" },
  { ad: "Kırıkkale", slug: "kirikkale", bolge: "icanadolu" },
  { ad: "Batman", slug: "batman", bolge: "guneydogu" },
  { ad: "Şırnak", slug: "sirnak", bolge: "guneydogu" },
  { ad: "Bartın", slug: "bartin", bolge: "karadeniz" },
  { ad: "Ardahan", slug: "ardahan", bolge: "doguanadolu" },
  { ad: "Iğdır", slug: "igdir", bolge: "doguanadolu" },
  { ad: "Yalova", slug: "yalova", bolge: "marmara" },
  { ad: "Karabük", slug: "karabuk", bolge: "karadeniz" },
  { ad: "Kilis", slug: "kilis", bolge: "guneydogu" },
  { ad: "Osmaniye", slug: "osmaniye", bolge: "akdeniz" },
  { ad: "Düzce", slug: "duzce", bolge: "karadeniz" },
];

function img(id, w) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w || 900}`;
}

const GORSEL = {
  meyhane: 1279330, kahve: 302896, osmanli: 1516415, sokak: 262978, tatli: 291528,
  et: 106343, geleneksel: 1516415, zeytinyagli: 1435904, pide: 1146760, kahvalti: 376464,
  deniz: 725991, meze: 725991, ege: 1435904, boza: 302896, sahil: 1058277,
};


let MEKANLAR = [];

async function loadMekanlar() {
  const res = await fetch("/api/venues");
  if (!res.ok) throw new Error("Mekanlar yüklenemedi");
  MEKANLAR = await res.json();
}

function mekanlariGetir(ilSlug) {
  return MEKANLAR.filter((m) => m.il === ilSlug);
}

function mekanGetir(id) {
  return MEKANLAR.find((m) => m.id === id);
}

function ilGetir(slug) {
  return ILLER.find((i) => i.slug === slug);
}
