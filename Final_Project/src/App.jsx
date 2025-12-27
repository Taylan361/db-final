import { useEffect, useState } from "react";
// DİKKAT: searchTheses buraya eklendi!
import { getTheses, addThesis, deleteThesis, getPeople, getInstitutes, getLanguages, getTypes, searchTheses , addPerson} from "./api";
import { Container, Table, Button, Form, Row, Col, Alert, Spinner, Card, Modal, Badge } from "react-bootstrap";

function App() {

  // Kişi Ekleme Modalı için State
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [newPerson, setNewPerson] = useState({ firstName: "", lastName: "", title: "Student", email: "" });
  const [theses, setTheses] = useState([]);
  
  // Dropdown listeleri
  const [people, setPeople] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [types, setTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  
  // Arama Sonucu Bildirimi İçin State
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Modal (Detay Penceresi)
  const [showModal, setShowModal] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);

  // Arama Kriterleri
  const [searchParams, setSearchParams] = useState({
    title: "",
    authorId: "",
    typeId: "",
    instituteId: "",
    year: ""
  });

  // Ekleme Formu Verileri
  const [formData, setFormData] = useState({
    thesisNo: "",
    title: "",
    abstract: "",
    year: new Date().getFullYear(),
    pageNum: "",
    typeId: "",      
    instituteId: "",
    authorId: "",
    supervisorId: "",
    languageId: ""
  });

  // Sayfa Açılınca Verileri Yükle
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [thesesRes, peopleRes, instRes, langRes, typeRes] = await Promise.all([
          getTheses(), getPeople(), getInstitutes(), getLanguages(), getTypes()
        ]);

        setTheses(thesesRes.data);
        setPeople(peopleRes.data);
        setInstitutes(instRes.data);
        setLanguages(langRes.data);
        setTypes(typeRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Form Input Yönetimi
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  // --- ARAMA İŞLEMİ ---
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSearchActive(true); // Arama yapıldığını işaretle

    try {
      const res = await searchTheses(searchParams);
      setTheses(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Arama hatası:", err);
      alert("Arama sırasında hata oluştu. Sunucu konsoluna bakınız.");
      setLoading(false);
    }
  };

  // --- ARAMAYI TEMİZLE ---
  const handleClearSearch = async () => {
    setSearchParams({ title: "", authorId: "", typeId: "", instituteId: "", year: "" });
    setIsSearchActive(false); // Bildirimi kapat
    setLoading(true);
    const res = await getTheses();
    setTheses(res.data);
    setLoading(false);
  };

  // --- EKLEME İŞLEMİ ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addThesis(formData);
      alert("Tez Başarıyla Eklendi!");
      // Listeyi yenile
      const res = await getTheses(); 
      setTheses(res.data);
    } catch (err) {
      alert("Ekleme Hatası: " + err.message);
    }
  };

  // --- SİLME İŞLEMİ ---
  const handleDelete = async (id) => {
    if (window.confirm("Silmek istediğinize emin misiniz?")) {
      try {
        await deleteThesis(id);
        const res = await getTheses();
        setTheses(res.data);
      } catch (err) {
        alert("Silme hatası oluştu.");
      }
    }
  };

  // Yeni Kişi Kaydetme
  const handleAddPerson = async () => {
    try {
      await addPerson(newPerson);
      alert("Yeni kişi başarıyla eklendi!");
      setShowPersonModal(false); // Modalı kapat
      setNewPerson({ firstName: "", lastName: "", title: "Student", email: "" }); // Formu temizle
      
      // Listeyi güncelle ki yeni kişiyi dropdown'da görelim
      const peopleRes = await getPeople();
      setPeople(peopleRes.data);
    } catch (err) {
      alert("Kişi eklenemedi: " + err.message);
    }
  };

  // Detay Göster
  const handleShowDetail = (thesis) => {
    setSelectedThesis(thesis);
    setShowModal(true);
  };

  return (
    <Container className="mt-5 mb-5">
      <h2 className="text-center mb-4 text-primary fw-bold">GTS - Lisansüstü Tez Sistemi</h2>

      {/* --- DETAYLI ARAMA PANELİ --- */}
      <Card className="mb-4 p-4 shadow-sm border-primary">
        <h5 className="mb-3 text-primary">🔍 Detaylı Tez Arama</h5>
        <Form onSubmit={handleSearchSubmit}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Control 
                  type="text" 
                  name="title" 
                  placeholder="Kelime Ara (Başlık veya Özet)..." 
                  value={searchParams.title}
                  onChange={handleSearchChange} 
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Select name="authorId" value={searchParams.authorId} onChange={handleSearchChange}>
                <option value="">Tüm Yazarlar</option>
                {people.map(p => (
                  <option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Select name="typeId" value={searchParams.typeId} onChange={handleSearchChange}>
                <option value="">Tüm Türler</option>
                {types.map(t => (
                  <option key={t.typeid} value={t.typeid}>{t.typename}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Control 
                type="number" 
                name="year" 
                placeholder="Yıl" 
                value={searchParams.year}
                onChange={handleSearchChange} 
              />
            </Col>
          </Row>
          
          <div className="d-flex justify-content-end mt-2 gap-2">
            <Button variant="secondary" onClick={handleClearSearch}>Temizle</Button>
            <Button variant="primary" type="submit">🔍 Ara</Button>
          </div>
        </Form>
      </Card>

      {/* --- ARAMA SONUÇ BİLDİRİMİ (YENİ) --- */}
      {isSearchActive && (
        <Alert variant="info" className="d-flex justify-content-between align-items-center shadow-sm mb-4">
          <span>
            <strong>Sonuçlar:</strong> Kriterlerinize uygun <strong>{theses.length}</strong> tez bulundu.
          </span>
          <Button variant="outline-info" size="sm" onClick={handleClearSearch}>Listeyi Sıfırla</Button>
        </Alert>
      )}

      {/* --- YENİ TEZ GİRİŞ FORMU --- */}
      <Card className="mb-4 p-4 shadow border-0 bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-secondary m-0">Yeni Tez Girişi</h5>
            <Button variant="outline-primary" size="sm" onClick={() => setShowPersonModal(true)}>
                + Yeni Kişi/Yazar Ekle
            </Button>
        </div>
        <Form onSubmit={handleSubmit}>
        {/* ... form kodları aynı kalsın ... */}
          <Row>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Tez No</Form.Label>
                <Form.Control type="number" name="thesisNo" onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Başlık</Form.Label>
                <Form.Control type="text" name="title" onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Yıl</Form.Label>
                <Form.Control type="number" name="year" defaultValue={2025} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Özet (Abstract)</Form.Label>
            <Form.Control as="textarea" rows={3} name="abstract" onChange={handleChange} required />
          </Form.Group>
          
          <Row>
             <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Yazar</Form.Label>
                <Form.Select name="authorId" onChange={handleChange} required>
                  <option value="">Seçiniz...</option>
                  {people.map(p => (
                    <option key={p.personid} value={p.personid}>{p.firstname} {p.lastname} ({p.title})</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Danışman</Form.Label>
                <Form.Select name="supervisorId" onChange={handleChange} required>
                  <option value="">Seçiniz...</option>
                  {people.map(p => (
                    <option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Enstitü</Form.Label>
                <Form.Select name="instituteId" onChange={handleChange} required>
                  <option value="">Seçiniz...</option>
                  {institutes.map(i => (
                    <option key={i.instituteid} value={i.instituteid}>{i.institutename}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
                <Form.Group className="mb-3">
                    <Form.Label>Dil</Form.Label>
                    <Form.Select name="languageId" onChange={handleChange} required>
                    <option value="">Seçiniz...</option>
                    {languages.map(l => (
                        <option key={l.languageid} value={l.languageid}>{l.languagename}</option>
                    ))}
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group className="mb-3">
                    <Form.Label>Tür</Form.Label>
                    <Form.Select name="typeId" onChange={handleChange} required>
                    <option value="">Seçiniz...</option>
                    {types.map(t => (
                        <option key={t.typeid} value={t.typeid}>{t.typename}</option>
                    ))}
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={4}>
                 <Form.Group className="mb-3">
                    <Form.Label>Sayfa Sayısı</Form.Label>
                    <Form.Control type="number" name="pageNum" onChange={handleChange} required />
                </Form.Group>
            </Col>
          </Row>
          
          <Button variant="success" type="submit" className="w-100 fw-bold mt-3">
            + Sisteme Kaydet
          </Button>
        </Form>
      </Card>

      {/* --- LİSTELEME TABLOSU --- */}
      {loading ? (
        <div className="text-center"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Card className="shadow-sm">
            <Table hover responsive className="m-0 align-middle">
            <thead className="table-dark">
                <tr>
                <th>No</th>
                <th>Başlık</th>
                <th>Yıl</th>
                <th>İşlemler</th>
                </tr>
            </thead>
            <tbody>
                {theses.map((thesis) => (
                <tr key={thesis.thesisno}>
                    {/* DÜZELTME: Küçük harf kullanımı */}
                    <td><Badge bg="secondary">{thesis.thesisno}</Badge></td>
                    <td className="fw-bold text-dark">{thesis.title}</td>
                    <td>{thesis.year}</td>
                    <td>
                    <Button variant="info" size="sm" className="me-2 text-white" onClick={() => handleShowDetail(thesis)}>
                        Detay
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(thesis.thesisno)}>
                        Sil
                    </Button>
                    </td>
                </tr>
                ))}
            </tbody>
            </Table>
        </Card>
      )}

      {/* --- DETAY MODALI --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Tez Detayları</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedThesis && (
            <div>
              <h4 className="text-primary">{selectedThesis.title}</h4>
              <hr />
              <p><strong>Özet (Abstract):</strong></p>
              <div className="p-3 bg-light border rounded mb-3">
                  {selectedThesis.abstract}
              </div>
              
              <Row>
                  <Col md={6}>
                      <p><strong>Tez No:</strong> {selectedThesis.thesisno}</p>
                      <p><strong>Yıl:</strong> {selectedThesis.year}</p>
                      <p><strong>Sayfa Sayısı:</strong> {selectedThesis.pagenum}</p>
                  </Col>
                  <Col md={6}>
                      <p><strong>Yazar ID:</strong> {selectedThesis.authorid}</p>
                      <p><strong>Danışman ID:</strong> {selectedThesis.supervisorid}</p>
                      <p><strong>Enstitü ID:</strong> {selectedThesis.instituteid}</p>
                  </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- KİŞİ EKLEME MODALI (YENİ) --- */}
      <Modal show={showPersonModal} onHide={() => setShowPersonModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Yeni Kişi Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Ad</Form.Label>
              <Form.Control type="text" placeholder="Örn: Ahmet" 
                value={newPerson.firstName} 
                onChange={(e) => setNewPerson({...newPerson, firstName: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Soyad</Form.Label>
              <Form.Control type="text" placeholder="Örn: Yılmaz" 
                value={newPerson.lastName} 
                onChange={(e) => setNewPerson({...newPerson, lastName: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ünvan (Title)</Form.Label>
              <Form.Select 
                value={newPerson.title} 
                onChange={(e) => setNewPerson({...newPerson, title: e.target.value})}
              >
                <option value="Student">Student</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Assoc. Prof.">Assoc. Prof.</option>
                <option value="Lecturer">Lecturer</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="email@univ.edu" 
                 value={newPerson.email} 
                 onChange={(e) => setNewPerson({...newPerson, email: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPersonModal(false)}>İptal</Button>
          <Button variant="primary" onClick={handleAddPerson}>Kaydet</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default App;