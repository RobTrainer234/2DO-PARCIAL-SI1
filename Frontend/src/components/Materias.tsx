import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Pagination, Container, Row, Col, Card } from 'react-bootstrap';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Materia {
  sigla: string;
  nombre: string;
  semestre?: number | null;
  horas_teoricas?: number;
  horas_practicas?: number;
  creditos?: number;
}

const Materias: React.FC = () => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [filteredMaterias, setFilteredMaterias] = useState<Materia[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [semestreFilter, setSemestreFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingMateria, setEditingMateria] = useState<Materia | null>(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    cargarMaterias();
  }, []);

  const cargarMaterias = async () => {
    try {
      setLoading(true);
      const response = await fetch('/materias.json');
      const data = await response.json();
      setMaterias(data);
      setFilteredMaterias(data);
    } catch (error) {
      console.error('Error cargando materias:', error);
      alert('Error cargando materias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = materias;

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (semestreFilter !== 'all') {
      if (semestreFilter === 'electivas') {
        filtered = filtered.filter(m => !m.semestre);
      } else {
        filtered = filtered.filter(m => m.semestre === parseInt(semestreFilter));
      }
    }

    setFilteredMaterias(filtered);
    setCurrentPage(1);
  }, [searchTerm, semestreFilter, materias]);

  const paginatedMaterias = filteredMaterias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMaterias.length / itemsPerPage);

  const handleShowModal = (materia?: Materia) => {
    if (materia) {
      setEditingMateria({ ...materia });
    } else {
      setEditingMateria(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMateria(null);
  };

  const handleSave = () => {
    if (!editingMateria) return;

    if (editingMateria.sigla && editingMateria.nombre) {
      if (editingMateria.sigla.length > 0 && editingMateria.nombre.length > 0) {
        // Si está editando, reemplaza; si es nuevo, agrega
        if (materias.some(m => m.sigla === editingMateria.sigla)) {
          setMaterias(materias.map(m => m.sigla === editingMateria.sigla ? editingMateria : m));
        } else {
          setMaterias([...materias, editingMateria]);
        }
        handleCloseModal();
      }
    }
  };

  const handleDelete = (sigla: string) => {
    if (window.confirm('¿Deseas eliminar esta materia?')) {
      setMaterias(materias.filter(m => m.sigla !== sigla));
    }
  };

  const handleExportCSV = () => {
    const headers = ['Sigla', 'Nombre', 'Semestre', 'Horas Teóricas', 'Horas Prácticas', 'Créditos'];
    const rows = filteredMaterias.map(m => [
      m.sigla,
      m.nombre,
      m.semestre || 'Electiva',
      m.horas_teoricas || 0,
      m.horas_practicas || 0,
      m.creditos || 0
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'materias.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return <Container className="mt-5"><p>Cargando materias...</p></Container>;
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Gestión de Materias</h2>
          <p className="text-muted">Registra y administra todas las materias del sistema.</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Control
              placeholder="Buscar por sigla o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Select
              value={semestreFilter}
              onChange={(e) => setSemestreFilter(e.target.value)}
            >
              <option value="all">Todos los semestres</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                <option key={s} value={s}>Semestre {s}</option>
              ))}
              <option value="electivas">Electivas</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Button variant="primary" onClick={() => handleShowModal()} className="w-100">
            <FiPlus /> Registrador Materia
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Button variant="success" size="sm" onClick={handleExportCSV}>
            📥 Descargar CSV
          </Button>
          <span className="ms-3 text-muted">Total: {filteredMaterias.length} materias</span>
        </Col>
      </Row>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <Table striped bordered hover>
            <thead className="table-dark">
              <tr>
                <th>Sigla</th>
                <th>Nombre</th>
                <th>Semestre</th>
                <th>H. Teóricas</th>
                <th>H. Prácticas</th>
                <th>Créditos</th>
                <th style={{ width: '120px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMaterias.length > 0 ? (
                paginatedMaterias.map((materia) => (
                  <tr key={materia.sigla}>
                    <td><strong>{materia.sigla}</strong></td>
                    <td>{materia.nombre}</td>
                    <td>
                      {materia.semestre ? (
                        <Badge bg="info">S{materia.semestre}</Badge>
                      ) : (
                        <Badge bg="warning">Electiva</Badge>
                      )}
                    </td>
                    <td>{materia.horas_teoricas || 0}</td>
                    <td>{materia.horas_practicas || 0}</td>
                    <td><Badge bg="success">{materia.creditos || 0}</Badge></td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleShowModal(materia)}
                        className="me-2"
                      >
                        <FiEdit2 />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(materia.sigla)}
                      >
                        <FiTrash2 />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    No hay materias registradas en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {totalPages > 1 && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Pagination>
              <Pagination.First
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Col>
        </Row>
      )}

      {/* Modal para crear/editar */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingMateria?.sigla ? 'Editar Materia' : 'Nueva Materia'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Sigla</Form.Label>
              <Form.Control
                disabled={editingMateria?.sigla ? true : false}
                value={editingMateria?.sigla || ''}
                onChange={(e) => setEditingMateria({ ...editingMateria, sigla: e.target.value } as Materia)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={editingMateria?.nombre || ''}
                onChange={(e) => setEditingMateria({ ...editingMateria, nombre: e.target.value } as Materia)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Semestre</Form.Label>
              <Form.Select
                value={editingMateria?.semestre || ''}
                onChange={(e) => setEditingMateria({
                  ...editingMateria,
                  semestre: e.target.value === '' ? null : parseInt(e.target.value)
                } as Materia)}
              >
                <option value="">Electiva</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                  <option key={s} value={s}>Semestre {s}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Horas Teóricas</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={editingMateria?.horas_teoricas || 0}
                onChange={(e) => setEditingMateria({ ...editingMateria, horas_teoricas: parseInt(e.target.value) } as Materia)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Horas Prácticas</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={editingMateria?.horas_practicas || 0}
                onChange={(e) => setEditingMateria({ ...editingMateria, horas_practicas: parseInt(e.target.value) } as Materia)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Créditos</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={editingMateria?.creditos || 0}
                onChange={(e) => setEditingMateria({ ...editingMateria, creditos: parseInt(e.target.value) } as Materia)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Materias;
