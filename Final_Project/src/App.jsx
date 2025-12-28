import { useEffect, useState } from "react";
// react-bootstrap importlarına Navbar ve Nav eklendi
import { Container, Table, Button, Form, Row, Col, Alert, Spinner, Card, Modal, Badge, Navbar, Nav } from "react-bootstrap";
import { getTheses, addThesis, deleteThesis, getPeople, getInstitutes, getLanguages, getTypes, searchTheses, addPerson } from "./api";
import "./App.css";

function App() {

  // --- STATE'LER ---
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  // YENİ: Sayfa Geçiş State'i (Ana Sayfa / Mantık Sayfası)
  const [showLogicPage, setShowLogicPage] = useState(false);

  // Modallar için State'ler
  const [showAddThesisModal, setShowAddThesisModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Veri State'leri
  const [newPerson, setNewPerson] = useState({ firstName: "", lastName: "", title: "Student", email: "" });
  const [theses, setTheses] = useState([]);
  const [people, setPeople] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [types, setTypes] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);
  
  const [searchParams, setSearchParams] = useState({
    title: "", authorId: "", typeId: "", instituteId: "", year: ""
  });

  const [formData, setFormData] = useState({
    thesisNo: "", title: "", abstract: "", year: new Date().getFullYear(),
    pageNum: "", typeId: "", instituteId: "", authorId: "", supervisorId: "", languageId: ""
  });

  // --- BİLDİRİM GÖSTERME ---
  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3500);
  };

  // --- VERİLERİ YÜKLE ---
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

  // --- INPUT HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  // --- ARAMA ---
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSearchActive(true);
    try {
      const res = await searchTheses(searchParams);
      setTheses(res.data);
      setLoading(false);
      if(res.data.length > 0) showToast(`${res.data.length} adet tez bulundu.`);
    } catch (err) {
      console.error("Arama hatası:", err);
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchParams({ title: "", authorId: "", typeId: "", instituteId: "", year: "" });
    setIsSearchActive(false);
    setLoading(true);
    const res = await getTheses();
    setTheses(res.data);
    setLoading(false);
  };

  // --- TEZ EKLEME ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addThesis(formData);
      showToast("✅ Tez Başarıyla Eklendi!");
      
      const res = await getTheses(); 
      setTheses(res.data);
      
      e.target.reset();
      setFormData({
        thesisNo: "", title: "", abstract: "", year: new Date().getFullYear(),
        pageNum: "", typeId: "", instituteId: "", authorId: "", supervisorId: "", languageId: ""
      });
      setShowAddThesisModal(false);
      
    } catch (err) {
      alert("Ekleme Hatası: " + err.message);
    }
  };

  // --- SİLME ---
  const handleDelete = async (id) => {
    if (window.confirm("Bu tezi silmek istediğinize emin misiniz?")) {
      try {
        await deleteThesis(id);
        const res = await getTheses();
        setTheses(res.data);
        showToast("🗑️ Tez silindi.");
      } catch (err) {
        alert("Silme hatası oluştu.");
      }
    }
  };

  // --- KİŞİ EKLEME ---
  const handleAddPerson = async () => {
    try {
      await addPerson(newPerson);
      showToast(`👤 ${newPerson.firstName} başarıyla eklendi!`);
      setShowPersonModal(false);
      setNewPerson({ firstName: "", lastName: "", title: "Student", email: "" });
      
      const peopleRes = await getPeople();
      setPeople(peopleRes.data);
    } catch (err) {
      alert("Kişi eklenemedi: " + err.message);
    }
  };

  const handleShowDetail = (thesis) => {
    setSelectedThesis(thesis);
    setShowDetailModal(true);
  };

  return (
    <div style={{
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.95))", // Okunabilirlik için biraz daha beyaz
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      minHeight: "100vh",
      width: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      paddingTop: "20px"
    }}>

      <Container className="mb-5">
        
        {/* --- YENİ HEADER (NAVBAR) --- */}
        <Navbar bg="white" expand="lg" className="shadow-sm rounded mb-4 px-3">
          <Container fluid>
            <Navbar.Brand 
              href="#" 
              onClick={() => setShowLogicPage(false)} 
              className="fw-bold text-primary d-flex align-items-center"
            >
              <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>🎓</span> 
              GTS Sistemi
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link 
                  onClick={() => setShowLogicPage(false)} 
                  className={`fw-bold ${!showLogicPage ? 'text-primary' : 'text-secondary'}`}
                >
                  Ana Sayfa
                </Nav.Link>
                <Nav.Link 
                  onClick={() => setShowLogicPage(true)} 
                  className={`fw-bold ${showLogicPage ? 'text-primary' : 'text-secondary'}`}
                >
                  Proje Mantığı (Nasıl Çalışır?)
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* --- BİLDİRİM --- */}
        {showNotification && (
          <div className="custom-toast-container">
            <div className="custom-toast">
              <div className="toast-icon">✔</div>
              <div className="toast-message">{notificationMessage}</div>
            </div>
          </div>
        )}

        {/* --- İÇERİK DEĞİŞİMİ --- */}
        {showLogicPage ? (
          
          /* --- PROJE MANTIĞI SAYFASI --- */
          <div className="animate-fade-in">
             <div className="text-center mb-5">
                <h2 className="fw-bold text-dark">Sistem Mimarisi ve İşleyişi</h2>
                <p className="text-muted">Bu proje modern web teknolojileri kullanılarak 3 katmanlı mimari ile geliştirilmiştir.</p>
             </div>

             <Row className="g-4">
                {/* Kart 1: Frontend */}
                <Col md={4}>
                  <Card className="h-100 shadow border-0 text-center p-3" style={{borderTop: "5px solid #0d6efd"}}>
                    <Card.Body>
                      <div className="display-4 text-primary mb-3">🖥️</div>
                      <Card.Title className="fw-bold">1. Frontend (Arayüz)</Card.Title>
                      <Card.Text className="text-muted">
                        Kullanıcı etkileşimi <strong>React.js</strong> ve <strong>React Bootstrap</strong> ile sağlanır. 
                        Veri giriş formları, dinamik tablolar ve modal pencereler bu katmanda yönetilir.
                        Kullanıcı bir işlem yaptığında API'ye istek gönderilir.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Kart 2: Backend */}
                <Col md={4}>
                  <Card className="h-100 shadow border-0 text-center p-3" style={{borderTop: "5px solid #6610f2"}}>
                    <Card.Body>
                      <div className="display-4 text-primary mb-3">⚙️</div>
                      <Card.Title className="fw-bold">2. API & Backend</Card.Title>
                      <Card.Text className="text-muted">
                        React'tan gelen istekler (GET, POST, DELETE) sunucuda karşılanır. 
                        İş mantığı (Business Logic) burada çalışır. Gelen verilerin doğruluğu kontrol edilir 
                        ve veritabanı sorguları hazırlanır.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Kart 3: Database */}
                <Col md={4}>
                  <Card className="h-100 shadow border-0 text-center p-3" style={{borderTop: "5px solid #198754"}}>
                    <Card.Body>
                      <div className="display-4 text-primary mb-3">🗄️</div>
                      <Card.Title className="fw-bold">3. Veritabanı</Card.Title>
                      <Card.Text className="text-muted">
                        İlişkisel veritabanı yapısı kullanılmıştır.
                        <strong>Tezler (Theses)</strong>, <strong>Yazarlar (People)</strong> ve 
                        <strong>Enstitüler</strong> birbirine foreign key yapılarıyla bağlıdır. 
                        Veri bütünlüğü bu katmanda korunur.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
             </Row>

             <Card className="mt-5 shadow-sm border-0">
               <Card.Body className="bg-dark text-white rounded p-4">
                 <h5 className="fw-bold text-warning mb-3">⚡ Kullanılan Teknolojiler</h5>
                 <ul className="list-unstyled row">
                   <Col md={6}>
                      <li>✅ <strong>React Hooks:</strong> useState, useEffect ile durum yönetimi.</li>
                      <li>✅ <strong>Axios/Fetch:</strong> Asenkron veri iletişimi.</li>
                   </Col>
                   <Col md={6}>
                      <li>✅ <strong>Bootstrap:</strong> Responsive tasarım sistemi.</li>
                      <li>✅ <strong>RESTful API:</strong> Standartlara uygun veri servisleri.</li>
                   </Col>
                 </ul>
               </Card.Body>
             </Card>
          </div>

        ) : (
          
          /* --- ANA UYGULAMA (MEVCUT KODLARIN) --- */
          <>
            <h2 className="text-center mb-4 fw-bold text-dark" style={{ textShadow: "1px 1px 2px white" }}>
              YÖK Lisansüstü Tez Yönetim Paneli
            </h2>

            {/* ARAMA PANELİ */}
            <Card className="mb-4 p-4 shadow border-0" style={{ borderTop: "4px solid var(--yok-blue)", backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
              <h5 className="mb-3">🔍 Detaylı Tez Arama</h5>
              <Form onSubmit={handleSearchSubmit}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Control type="text" name="title" placeholder="Kelime Ara (Başlık veya Özet)..." value={searchParams.title} onChange={handleSearchChange} />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Select name="authorId" value={searchParams.authorId} onChange={handleSearchChange}>
                      <option value="">Tüm Yazarlar</option>
                      {people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select name="typeId" value={searchParams.typeId} onChange={handleSearchChange}>
                      <option value="">Tüm Türler</option>
                      {types.map(t => (<option key={t.typeid} value={t.typeid}>{t.typename}</option>))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Control type="number" name="year" placeholder="Yıl" value={searchParams.year} onChange={handleSearchChange} />
                  </Col>
                </Row>
                <div className="d-flex justify-content-end mt-2 gap-2">
                  <Button variant="secondary" onClick={handleClearSearch}>Temizle</Button>
                  <Button variant="primary" type="submit">🔍 Ara</Button>
                </div>
              </Form>
            </Card>

            {/* SONUÇ UYARISI */}
            {isSearchActive && (
              <Alert variant="info" className="d-flex justify-content-between align-items-center shadow-sm mb-4 bg-white">
                <span><strong>Sonuçlar:</strong> {theses.length} tez bulundu.</span>
                <Button variant="outline-info" size="sm" onClick={handleClearSearch}>Listeyi Sıfırla</Button>
              </Alert>
            )}

            {/* LİSTE */}
            <Card className="shadow border-0" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
              <Card.Header className="bg-white p-3 border-bottom-0 d-flex justify-content-between align-items-center">
                <h5 className="m-0 fw-bold text-secondary">📚 Tez Listesi</h5>
                <Button variant="success" size="lg" className="shadow-sm" onClick={() => setShowAddThesisModal(true)}>
                  <span style={{ marginRight: "8px", fontSize: "1.2rem" }}>+</span> Yeni Tez Ekle
                </Button>
              </Card.Header>

              {loading ? (
                <div className="text-center p-5 mt-5" style={{ maxWidth: '500px', margin: '0 auto' }}>
                  <Spinner animation="grow" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                  <h4 className="mt-4 text-primary fw-bold">Tezler Getiriliyor</h4>
                  <p className="text-muted">Lütfen bekleyiniz...</p>
                </div>
              ) : (
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
                          <Button variant="info" size="sm" className="me-2 text-white" onClick={() => handleShowDetail(thesis)}>Detay</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(thesis.thesisno)}>Sil</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
          </>
        )}

        {/* --- MODALLAR (HER İKİ EKRANDA DA ERİŞİLEBİLİR OLMASI İÇİN DIŞARIDA) --- */}
        {/* Modal 1: Yeni Tez Ekleme */}
        <Modal show={showAddThesisModal} onHide={() => setShowAddThesisModal(false)} size="xl" centered>
           <Modal.Header closeButton className="bg-light">
            <Modal.Title className="text-success fw-bold">📝 Yeni Tez Girişi</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex justify-content-end mb-3">
              <Button variant="outline-primary" size="sm" onClick={() => setShowPersonModal(true)}>
                + Listede Yoksa Yeni Kişi Ekle
              </Button>
            </div>
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
                <Form.Control as="textarea" rows={4} name="abstract" onChange={handleChange} required />
              </Form.Group>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Yazar</Form.Label>
                    <Form.Select name="authorId" onChange={handleChange} required>
                      <option value="">Seçiniz...</option>
                      {people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                   <Form.Group className="mb-3">
                    <Form.Label>Danışman</Form.Label>
                    <Form.Select name="supervisorId" onChange={handleChange} required>
                      <option value="">Seçiniz...</option>
                      {people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                   <Form.Group className="mb-3">
                    <Form.Label>Enstitü</Form.Label>
                    <Form.Select name="instituteId" onChange={handleChange} required>
                      <option value="">Seçiniz...</option>
                      {institutes.map(i => (<option key={i.instituteid} value={i.instituteid}>{i.institutename}</option>))}
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
                      {languages.map(l => (<option key={l.languageid} value={l.languageid}>{l.languagename}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                   <Form.Group className="mb-3">
                    <Form.Label>Tür</Form.Label>
                    <Form.Select name="typeId" onChange={handleChange} required>
                      <option value="">Seçiniz...</option>
                      {types.map(t => (<option key={t.typeid} value={t.typeid}>{t.typename}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                   <Form.Group className="mb-3">
                    <Form.Label>Sayfa</Form.Label>
                     <Form.Control type="number" name="pageNum" onChange={handleChange} required />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="secondary" onClick={() => setShowAddThesisModal(false)}>İptal</Button>
                <Button variant="success" type="submit" className="fw-bold px-4">+ Kaydet</Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modal 2: Detay */}
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="text-primary">📄 Tez Detayları</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedThesis && (
              <div>
                <h4 className="text-dark mb-3">{selectedThesis.title}</h4>
                <div className="p-3 bg-light border rounded mb-3">
                  <p className="mb-1"><strong>Özet:</strong></p>
                  <p className="text-muted fst-italic">{selectedThesis.abstract}</p>
                </div>
                <Row>
                  <Col md={6}>
                    <p><strong>Tez No:</strong> <Badge bg="primary">{selectedThesis.thesisno}</Badge></p>
                    <p><strong>Yıl:</strong> {selectedThesis.year}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Sayfa:</strong> {selectedThesis.pagenum}</p>
                  </Col>
                </Row>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Kapat</Button>
          </Modal.Footer>
        </Modal>

        {/* Modal 3: Kişi Ekleme */}
        <Modal show={showPersonModal} onHide={() => setShowPersonModal(false)} centered style={{ zIndex: 1060 }}>
          <Modal.Header closeButton>
            <Modal.Title>Yeni Kişi Ekle</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Ad</Form.Label>
                <Form.Control type="text" value={newPerson.firstName} onChange={(e) => setNewPerson({ ...newPerson, firstName: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Soyad</Form.Label>
                <Form.Control type="text" value={newPerson.lastName} onChange={(e) => setNewPerson({ ...newPerson, lastName: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ünvan</Form.Label>
                <Form.Select value={newPerson.title} onChange={(e) => setNewPerson({ ...newPerson, title: e.target.value })}>
                  <option value="Student">Student</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Assoc. Prof.">Assoc. Prof.</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={newPerson.email} onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPersonModal(false)}>İptal</Button>
            <Button variant="primary" onClick={handleAddPerson}>Kaydet</Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
}

export default App;