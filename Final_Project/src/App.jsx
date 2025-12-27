import { useEffect, useState } from "react";
import { getTheses, addThesis, deleteThesis, getPeople, getInstitutes, getLanguages, getTypes } from "./api";
import { Container, Table, Button, Form, Row, Col, Alert, Spinner, Card, Modal, Badge } from "react-bootstrap";

function App() {

  // Arama Kriterleri State'i
  const [searchParams, setSearchParams] = useState({
    title: "",
    authorId: "",
    typeId: "",
    instituteId: "",
    year: ""
  });

  const [theses, setTheses] = useState([]);
  
  // Dropdownlar için tutacağımız listeler
  const [people, setPeople] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [types, setTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  
  // Modal (Detay Penceresi) için State
  const [showModal, setShowModal] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);

  // Form Verileri
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

  // Sayfa açılınca tüm verileri çek
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addThesis(formData);
      alert("Tez Başarıyla Eklendi!");
      const res = await getTheses(); // Listeyi yenile
      setTheses(res.data);
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Silmek istediğinize emin misiniz?")) {
      await deleteThesis(id);
      const res = await getTheses();
      setTheses(res.data);
    }
  };

  // Detay Butonuna Tıklanınca
  const handleShowDetail = (thesis) => {
    setSelectedThesis(thesis);
    setShowModal(true);
  };

  // Arama inputları değişince
  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  // Arama Butonuna Basınca
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend'deki search rotasına istek at
      const res = await searchTheses(searchParams);
      setTheses(res.data); // Tabloyu gelen sonuçlarla güncelle
      setLoading(false);
    } catch (err) {
      alert("Arama yapılamadı!");
      setLoading(false);
    }
  };

  // Filtreleri Temizle
  const handleClearSearch = async () => {
    setSearchParams({ title: "", authorId: "", typeId: "", instituteId: "", year: "" });
    const res = await getTheses(); // Tüm listeyi geri getir
    setTheses(res.data);
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
    {/* Kullanıcıya hem başlık hem özet aradığımızı söyleyelim */}
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

      {/* --- EKLEME FORMU --- */}
      <Card className="mb-4 p-4 shadow border-0 bg-light">
        <h5 className="mb-3 text-secondary">Yeni Tez Girişi</h5>
        <Form onSubmit={handleSubmit}>
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
          
          {/* --- DROPDOWN SEÇİMLERİ --- */}
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
          
          <Button variant="success" type="submit" className="w-100 fw-bold">
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

      {/* --- DETAY MODALI (POPUP) --- */}
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
                  {/* Burası şu an ID gösterir. İstersen bunları da eşleştirebiliriz ama detay aramada çözülecek */}
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

    </Container>
  );
}

export default App;