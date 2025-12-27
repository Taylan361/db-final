import { useEffect, useState } from "react";
import { getTheses, addThesis, deleteThesis } from "./api";
import { Container, Table, Button, Form, Row, Col, Alert, Spinner, Card } from "react-bootstrap";

function App() {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Verileri için State (Başlangıçta boş)
  const [formData, setFormData] = useState({
    thesisNo: "",
    title: "",
    abstract: "",
    year: "",
    pageNum: "",
    typeId: 1,      // Varsayılan değerler (ID olmak zorunda)
    instituteId: 1,
    authorId: 1,
    supervisorId: 2,
    languageId: 1
  });

  // Verileri Çekme Fonksiyonu
  const fetchTheses = () => {
    getTheses()
      .then((res) => {
        setTheses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Veriler yüklenemedi.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTheses();
  }, []);

  // Form Değişince Çalışır
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ekleme İşlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addThesis(formData);
      alert("Tez Başarıyla Eklendi!");
      fetchTheses(); // Listeyi yenile
      // Formu temizle (İstersen)
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  // Silme İşlemi
  const handleDelete = async (id) => {
    if (window.confirm("Bu tezi silmek istediğinize emin misiniz?")) {
      try {
        await deleteThesis(id);
        fetchTheses(); // Listeyi yenile
      } catch (err) {
        alert("Silinirken hata oluştu.");
      }
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <h2 className="text-center mb-4">GTS - Tez Yönetim Paneli</h2>

      {/* --- EKLEME FORMU --- */}
      <Card className="mb-4 p-4 shadow-sm">
        <h4>Yeni Tez Ekle</h4>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Tez No</Form.Label>
                <Form.Control type="number" name="thesisNo" placeholder="Örn: 1006" onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Başlık</Form.Label>
                <Form.Control type="text" name="title" placeholder="Tez başlığı..." onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Yıl</Form.Label>
                <Form.Control type="number" name="year" onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Özet (Abstract)</Form.Label>
            <Form.Control as="textarea" rows={3} name="abstract" onChange={handleChange} required />
          </Form.Group>
          
          <Row>
            <Col><Form.Control type="number" name="pageNum" placeholder="Sayfa Sayısı" onChange={handleChange} required /></Col>
            <Col><Form.Control type="number" name="typeId" placeholder="Type ID" onChange={handleChange} required /></Col>
            <Col><Form.Control type="number" name="instituteId" placeholder="Institute ID" onChange={handleChange} required /></Col>
            <Col><Form.Control type="number" name="authorId" placeholder="Author ID" onChange={handleChange} required /></Col>
            <Col><Form.Control type="number" name="supervisorId" placeholder="Sup. ID" onChange={handleChange} required /></Col>
            <Col><Form.Control type="number" name="languageId" placeholder="Lang ID" onChange={handleChange} required /></Col>
          </Row>
          
          <Button variant="primary" type="submit" className="mt-3 w-100">
            Tezi Kaydet
          </Button>
        </Form>
      </Card>

      {/* --- LİSTELEME TABLOSU --- */}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="bg-dark text-white">
            <tr>
              <th>No</th>
              <th>Başlık</th>
              <th>Yıl</th>
              <th>Sayfa</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {theses.map((thesis) => (
              <tr key={thesis.thesisno}>
                <td>{thesis.thesisno}</td>
                <td>{thesis.title}</td>
                <td>{thesis.year}</td>
                <td>{thesis.pagenum}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(thesis.thesisno)}>
                    Sil
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default App;