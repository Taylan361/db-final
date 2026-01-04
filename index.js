const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors()); 
app.use(express.json());


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});


app.get("/", (req, res) => {
  res.send("GTS Backend Çalışıyor! 🚀");
});


app.get("/api/theses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Theses");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
});

// --- YENİ EKLENECEK KISIMLAR ---

// 1. YENİ TEZ EKLEME (POST)
app.post("/api/theses", async (req, res) => {
  try {
    // Frontend'den gelen verileri al
    const { thesisNo, title, abstract, year, pageNum, typeId, instituteId, authorId, supervisorId, languageId } = req.body;

    const query = `
      INSERT INTO Theses (ThesisNo, Title, Abstract, Year, PageNum, TypeID, InstituteID, AuthorID, SupervisorID, LanguageID)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [thesisNo, title, abstract, year, pageNum, typeId, instituteId, authorId, supervisorId, languageId];
    
    const newThesis = await pool.query(query, values);
    res.json(newThesis.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Tez eklenirken hata oluştu: " + err.message);
  }
});

// 2. TEZ SİLME (DELETE)
app.delete("/api/theses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Önce ilişkili tablolardan sil (CASCADE ayarlı ama garanti olsun)
    // Sonra ana tablodan sil
    await pool.query("DELETE FROM Theses WHERE ThesisNo = $1", [id]);
    res.json("Tez başarıyla silindi!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Silme işlemi başarısız.");
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});

// --- YARDIMCI LİSTELERİ GETİRME (DROPDOWN İÇİN) ---

// Yazarları ve Danışmanları Getir
app.get("/api/people", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM People ORDER BY FirstName ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json(err); }
});

// ==========================================
// --- INSTITUTES (ENSTİTÜLER) ---
// ==========================================

// 1. Tüm Enstitüleri Getir
app.get("/api/institutes", async (req, res) => {
  try {
    const allInstitutes = await pool.query("SELECT * FROM Institutes ORDER BY InstituteID ASC");
    res.json(allInstitutes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. Yeni Enstitü Ekle
app.post("/api/institutes", async (req, res) => {
  try {
    const { InstituteName, UniversityID } = req.body;
    const newInstitute = await pool.query(
      "INSERT INTO Institutes (InstituteName, UniversityID) VALUES($1, $2) RETURNING *",
      [InstituteName, UniversityID]
    );
    res.json(newInstitute.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. Enstitü Güncelle
app.put("/api/institutes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { InstituteName, UniversityID } = req.body;
    await pool.query(
      "UPDATE Institutes SET InstituteName = $1, UniversityID = $2 WHERE InstituteID = $3",
      [InstituteName, UniversityID, id]
    );
    res.json("Institute was updated!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. Enstitü Sil
app.delete("/api/institutes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Institutes WHERE InstituteID = $1", [id]);
    res.json("Institute was deleted!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// ==========================================
// --- LANGUAGES (DİLLER) ---
// ==========================================

// 1. Getir
app.get("/api/languages", async (req, res) => {
  try {
    const allLanguages = await pool.query("SELECT * FROM Languages ORDER BY LanguageID ASC");
    res.json(allLanguages.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// 2. Ekle
app.post("/api/languages", async (req, res) => {
  try {
    const { LanguageName } = req.body;
    const newLang = await pool.query("INSERT INTO Languages (LanguageName) VALUES($1) RETURNING *", [LanguageName]);
    res.json(newLang.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// 3. Güncelle
app.put("/api/languages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { LanguageName } = req.body;
    await pool.query("UPDATE Languages SET LanguageName = $1 WHERE LanguageID = $2", [LanguageName, id]);
    res.json("Language updated");
  } catch (err) {
    console.error(err.message);
  }
});

// 4. Sil
app.delete("/api/languages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Languages WHERE LanguageID = $1", [id]);
    res.json("Language deleted");
  } catch (err) {
    console.error(err.message);
  }
});


// ==========================================
// --- THESIS TYPES (TEZ TÜRLERİ) ---
// ==========================================

// 1. Getir
app.get("/api/types", async (req, res) => {
  try {
    // Tablo adı SQL şemasında "ThesisTypes" olarak geçiyorsa dikkat et.
    const allTypes = await pool.query("SELECT * FROM ThesisTypes ORDER BY TypeID ASC");
    res.json(allTypes.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// 2. Ekle
app.post("/api/types", async (req, res) => {
  try {
    const { TypeName } = req.body;
    const newType = await pool.query("INSERT INTO ThesisTypes (TypeName) VALUES($1) RETURNING *", [TypeName]);
    res.json(newType.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// 3. Güncelle
app.put("/api/types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { TypeName } = req.body;
    await pool.query("UPDATE ThesisTypes SET TypeName = $1 WHERE TypeID = $2", [TypeName, id]);
    res.json("Type updated");
  } catch (err) {
    console.error(err.message);
  }
});

// 4. Sil
app.delete("/api/types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM ThesisTypes WHERE TypeID = $1", [id]);
    res.json("Type deleted");
  } catch (err) {
    console.error(err.message);
  }
});


// ==========================================
// --- SUBJECT TOPICS (KONULAR) ---
// ==========================================

// 1. Getir
app.get("/api/topics", async (req, res) => {
  try {
    const allTopics = await pool.query("SELECT * FROM SubjectTopics ORDER BY TopicID ASC");
    res.json(allTopics.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// 2. Ekle
app.post("/api/topics", async (req, res) => {
  try {
    const { TopicName } = req.body;
    const newTopic = await pool.query("INSERT INTO SubjectTopics (TopicName) VALUES($1) RETURNING *", [TopicName]);
    res.json(newTopic.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// 3. Güncelle
app.put("/api/topics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { TopicName } = req.body;
    await pool.query("UPDATE SubjectTopics SET TopicName = $1 WHERE TopicID = $2", [TopicName, id]);
    res.json("Topic updated");
  } catch (err) {
    console.error(err.message);
  }
});

// 4. Sil
app.delete("/api/topics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM SubjectTopics WHERE TopicID = $1", [id]);
    res.json("Topic deleted");
  } catch (err) {
    console.error(err.message);
  }
});


// ==========================================
// --- KEYWORDS (ANAHTAR KELİMELER) ---
// ==========================================

// 1. Getir
app.get("/api/keywords", async (req, res) => {
  try {
    const allKeywords = await pool.query("SELECT * FROM Keywords ORDER BY KeywordID ASC");
    res.json(allKeywords.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// 2. Ekle
app.post("/api/keywords", async (req, res) => {
  try {
    const { KeywordName } = req.body;
    const newKeyword = await pool.query("INSERT INTO Keywords (KeywordName) VALUES($1) RETURNING *", [KeywordName]);
    res.json(newKeyword.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// 3. Güncelle
app.put("/api/keywords/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { KeywordName } = req.body;
    await pool.query("UPDATE Keywords SET KeywordName = $1 WHERE KeywordID = $2", [KeywordName, id]);
    res.json("Keyword updated");
  } catch (err) {
    console.error(err.message);
  }
});

// 4. Sil
app.delete("/api/keywords/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Keywords WHERE KeywordID = $1", [id]);
    res.json("Keyword deleted");
  } catch (err) {
    console.error(err.message);
  }
});

// ==========================================
// --- UNIVERSITIES (ÜNİVERSİTELER) ---
// ==========================================

// 1. Tüm Üniversiteleri Getir
app.get("/api/universities", async (req, res) => {
  try {
    const allUniversities = await pool.query("SELECT * FROM Universities ORDER BY UniversityID ASC");
    res.json(allUniversities.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. Yeni Üniversite Ekle
app.post("/api/universities", async (req, res) => {
  try {
    const { UniversityName } = req.body;
    const newUniversity = await pool.query(
      "INSERT INTO Universities (UniversityName) VALUES($1) RETURNING *",
      [UniversityName]
    );
    res.json(newUniversity.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. Üniversite Güncelle
app.put("/api/universities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { UniversityName } = req.body;
    await pool.query(
      "UPDATE Universities SET UniversityName = $1 WHERE UniversityID = $2",
      [UniversityName, id]
    );
    res.json("University was updated!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. Üniversite Sil
app.delete("/api/universities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Önce bu üniversiteye bağlı enstitü var mı kontrol edilebilir ama şimdilik direkt siliyoruz.
    // Eğer Foreign Key hatası alırsan önce bağlı enstitüleri silmelisin.
    await pool.query("DELETE FROM Universities WHERE UniversityID = $1", [id]);
    res.json("University was deleted!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Enstitüleri Getir
app.get("/api/institutes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Institutes ORDER BY InstituteName ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json(err); }
});

// Dilleri Getir
app.get("/api/languages", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Languages");
    res.json(result.rows);
  } catch (err) { res.status(500).json(err); }
});

// Tez Türlerini Getir
app.get("/api/types", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ThesisTypes");
    res.json(result.rows);
  } catch (err) { res.status(500).json(err); }
});

// --- DETAYLI ARAMA ENDPOINT'İ (Filtreleme) ---
app.get("/api/search", async (req, res) => {
  try {
    // URL'den gelen filtreleri al (Örn: ?title=sql&year=2024)
    const { title, authorId, typeId, instituteId, year } = req.query;

    // Temel sorgumuz (Her zaman doğru olan 1=1 taktiği ile başlarız)
    let sqlQuery = `SELECT * FROM Theses WHERE 1=1`;
    const values = [];
    let paramCounter = 1; // $1, $2 sırasını takip etmek için

    // 1. Başlık Arıyor mu? (ILIKE ile büyük/küçük harf duyarsız arama)
    if (title) {
      sqlQuery += ` AND Title ILIKE $${paramCounter}`;
      values.push(`%${title}%`); // İçinde geçen kelimeyi bulur
      paramCounter++;
    }

    // 2. Yazar Seçmiş mi?
    if (authorId) {
      sqlQuery += ` AND AuthorID = $${paramCounter}`;
      values.push(authorId);
      paramCounter++;
    }

    // 3. Tür Seçmiş mi?
    if (typeId) {
      sqlQuery += ` AND TypeID = $${paramCounter}`;
      values.push(typeId);
      paramCounter++;
    }

    // 4. Enstitü Seçmiş mi?
    if (instituteId) {
      sqlQuery += ` AND InstituteID = $${paramCounter}`;
      values.push(instituteId);
      paramCounter++;
    }

    // 5. Yıl Girmiş mi?
    if (year) {
      sqlQuery += ` AND Year = $${paramCounter}`;
      values.push(year);
      paramCounter++;
    }

    // Sorguyu çalıştır
    const result = await pool.query(sqlQuery, values);
    res.json(result.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Arama hatası");
  }
});