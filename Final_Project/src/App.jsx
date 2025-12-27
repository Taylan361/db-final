import { useEffect, useState } from 'react';
import { getTheses } from './api';
import { Container, Table, Alert, Spinner } from 'react-bootstrap';

function App() {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Backend'den verileri çek
    getTheses()
      .then((response) => {
        setTheses(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Veriler çekilemedi! Backend uyanmamış olabilir, sayfayı yenile.");
        setLoading(false);
      });
  }, []);

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">GTS - Lisansüstü Tez Sistemi</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center"><Spinner animation="border" /> Yükleniyor...</div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>No</th>
              <th>Başlık</th>
              <th>Yıl</th>
              <th>Tür</th>
            </tr>
          </thead>
          <tbody>
            {theses.map((thesis) => (
              <tr key={thesis.thesisno}>
                <td>{thesis.thesisno}</td>
                <td>{thesis.title}</td>
                <td>{thesis.year}</td>
                <td>{thesis.typeid}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default App;