import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Card, Row, Col, Badge, Alert, Pagination, Spinner } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiUpload, FiSearch } from 'react-icons/fi';
import axios from 'axios';

interface Materia {
  sigla: string;
  nombre: string;
  semestre?: number;
  horas_teoricas?: number;
  horas_practicas?: number;
  creditos?: number;
  carreras?: string[];
}

interface MateriaConCarreras extends Materia {
  carrerasFormateadas: string;
}

const GestionarMaterias: React.FC = () => {
  const [materias, setMaterias] = useState<MateriaConCarreras[]>([]);
  const [filteredMaterias, setFilteredMaterias] = useState<MateriaConCarreras[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<Materia>({
    sigla: '',
    nombre: '',
    semestre: 1,
    horas_teoricas: 3,
    horas_practicas: 2,
    creditos: 3,
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [semestreFilter, setSemestreFilter] = useState<number | ''>('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [materiaAEliminar, setMateriaAEliminar] = useState<string | null>(null);
  
  const materiasPerPage = 10;

  // Load materias
  useEffect(() => {
    cargarMaterias();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...materias];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        m =>
          m.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Semestre filter
    if (semestreFilter !== '') {
      filtered = filtered.filter(m => m.semestre === semestreFilter);
    }

    setFilteredMaterias(filtered);
    setPaginaActual(1);
  }, [searchTerm, semestreFilter, materias]);

  // Pagination
  const indexOfLastMateria = paginaActual * materiasPerPage;
  const indexOfFirstMateria = indexOfLastMateria - materiasPerPage;
  const materiasActuales = filteredMaterias.slice(indexOfFirstMateria, indexOfLastMateria);
  const totalPages = Math.ceil(filteredMaterias.length / materiasPerPage);

  const cargarMaterias = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/materias');
      const materiasFormateadas = response.data.map((m: Materia) => ({
        ...m,
        carrerasFormateadas: m.carreras?.join(', ') || 'N/A'
      }));
      setMaterias(materiasFormateadas);
      setError('');
    } catch (err: any) {
      setError('Error al cargar materias: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (materia?: MateriaConCarreras) => {
    if (materia) {
      setIsEditing(true);
      setFormData({
        sigla: materia.sigla,
        nombre: materia.nombre,
        semestre: materia.semestre || 1,
        horas_teoricas: materia.horas_teoricas || 3,
        horas_practicas: materia.horas_practicas || 2,
        creditos: materia.creditos || 3,
      });
    } else {
      setIsEditing(false);
      setFormData({
        sigla: '',
        nombre: '',
        semestre: 1,
        horas_teoricas: 3,
        horas_practicas: 2,
        creditos: 3,
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setFormData({
      sigla: '',
      nombre: '',
      semestre: 1,
      horas_teoricas: 3,
      horas_practicas: 2,
      creditos: 3,
    });
  };

  const guardarMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación
    if (!formData.sigla.trim() || !formData.nombre.trim()) {
      setError('Sigla y nombre son requeridos');
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing) {
        await axios.put(`/api/materias/${formData.sigla}`, formData);
        setSuccess('Materia actualizada correctamente');
      } else {
        await axios.post('/api/materias', formData);
        setSuccess('Materia creada correctamente');
      }

      cerrarModal();
      cargarMaterias();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar materia');
    } finally {
      setLoading(false);
    }
  };

  const abrirDeleteModal = (sigla: string) => {
    setMateriaAEliminar(sigla);
    setShowDeleteModal(true);
  };

  const confirmarEliminar = async () => {
    if (!materiaAEliminar) return;

    try {
      setLoading(true);
      await axios.delete(`/api/materias/${materiaAEliminar}`);
      setSuccess('Materia eliminada correctamente');
      cargarMaterias();
      setShowDeleteModal(false);
      setMateriaAEliminar(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar materia');
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    const headers = ['Sigla', 'Nombre', 'Semestre', 'Horas Teóricas', 'Horas Prácticas', 'Créditos'];
    const rows = filteredMaterias.map(m => [
      m.sigla,
      m.nombre,
      m.semestre || '',
      m.horas_teoricas || '',
      m.horas_practicas || '',
      m.creditos || ''
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'materias.csv';
    a.click();
  };

  const importarCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').slice(1).filter(line => line.trim());
        
        let importados = 0;
        for (const line of lines) {
          const [sigla, nombre, semestre, horas_teoricas, horas_practicas, creditos] = line.split(',').map(s => s.replace(/"/g, '').trim());
          
          if (sigla && nombre) {
            try {
              await axios.post('/api/materias', {
                sigla,
                nombre,
                semestre: parseInt(semestre) || 1,
                horas_teoricas: parseInt(horas_teoricas) || 3,
                horas_practicas: parseInt(horas_practicas) || 2,
                creditos: parseInt(creditos) || 3
              });
              importados++;
            } catch (err) {
              // Ignorar duplicados
            }
          }
        }
        
        setSuccess(`Se importaron ${importados} materias correctamente`);
        cargarMaterias();
      } catch (err: any) {
        setError('Error al importar CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Container fluid className="mt-5 mb-5">
      <Row className="mb-4">
        <Col md={8}>
          <h1>
            <FiDownload className="me-2" />
            Gestión de Materias
          </h1>
          <p className="text-muted">Administra el catálogo de materias disponibles en tu facultad</p>
        </Col>
        <Col md={4} className="text-end">
          <Button
            variant="success"
            onClick={() => abrirModal()}
            className="me-2"
          >
            <FiPlus className="me-2" />
            Nueva Materia
          </Button>
          <Button
            variant="info"
            onClick={exportarCSV}
            className="me-2"
          >
            <FiDownload className="me-2" />
            Exportar
          </Button>
          <Form.Group className="d-inline-block" style={{ width: '150px' }}>
            <Form.Control
              type="file"
              accept=".csv"
              onChange={importarCSV}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Alertas */}
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <FiSearch className="me-2" />
                  Buscar Materia
                </Form.Label>
                <Form.Control
                  placeholder="Buscar por sigla o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filtrar por Semestre</Form.Label>
                <Form.Select
                  value={semestreFilter}
                  onChange={(e) => setSemestreFilter(e.target.value ? parseInt(e.target.value) : '')}
                >
                  <option value="">Todos los semestres</option>
                  <option value="1">Semestre 1</option>
                  <option value="2">Semestre 2</option>
                  <option value="3">Semestre 3</option>
                  <option value="4">Semestre 4</option>
                  <option value="5">Semestre 5</option>
                  <option value="6">Semestre 6</option>
                  <option value="7">Semestre 7</option>
                  <option value="8">Semestre 8</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <p className="text-muted mb-0 mt-3">
            Total de materias: <strong>{filteredMaterias.length}</strong>
          </p>
        </Card.Body>
      </Card>

      {/* Tabla de Materias */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Cargando materias...</p>
        </div>
      ) : (
        <>
          <Card>
            <Card.Body className="p-0">
              {materiasActuales.length > 0 ? (
                <Table striped bordered hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '12%' }}>Sigla</th>
                      <th style={{ width: '30%' }}>Nombre</th>
                      <th style={{ width: '10%' }} className="text-center">Semestre</th>
                      <th style={{ width: '10%' }} className="text-center">Teoría (h)</th>
                      <th style={{ width: '10%' }} className="text-center">Práctica (h)</th>
                      <th style={{ width: '8%' }} className="text-center">Créditos</th>
                      <th style={{ width: '20%' }} className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materiasActuales.map((materia) => (
                      <tr key={materia.sigla}>
                        <td>
                          <Badge bg="primary">{materia.sigla}</Badge>
                        </td>
                        <td>{materia.nombre}</td>
                        <td className="text-center">
                          <Badge bg="info">{materia.semestre || 'N/A'}</Badge>
                        </td>
                        <td className="text-center">{materia.horas_teoricas || '-'}</td>
                        <td className="text-center">{materia.horas_practicas || '-'}</td>
                        <td className="text-center">
                          <Badge bg="secondary">{materia.creditos || '-'}</Badge>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => abrirModal(materia)}
                            className="me-2"
                            title="Editar"
                          >
                            <FiEdit2 />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => abrirDeleteModal(materia.sigla)}
                            title="Eliminar"
                          >
                            <FiTrash2 />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">No hay materias para mostrar</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-4 d-flex justify-content-center">
              <Pagination>
                <Pagination.First
                  onClick={() => setPaginaActual(1)}
                  disabled={paginaActual === 1}
                />
                <Pagination.Prev
                  onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                />

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (paginaActual <= 3) {
                    page = i + 1;
                  } else if (paginaActual >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = paginaActual - 2 + i;
                  }

                  return (
                    <Pagination.Item
                      key={page}
                      active={page === paginaActual}
                      onClick={() => setPaginaActual(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  onClick={() => setPaginaActual(Math.min(totalPages, paginaActual + 1))}
                  disabled={paginaActual === totalPages}
                />
                <Pagination.Last
                  onClick={() => setPaginaActual(totalPages)}
                  disabled={paginaActual === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modal Crear/Editar */}
      <Modal show={showModal} onHide={cerrarModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Editar Materia' : 'Nueva Materia'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Sigla *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: MAT101"
                value={formData.sigla}
                onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                disabled={isEditing}
                maxLength={20}
              />
              <Form.Text className="text-muted">Identificador único de la materia</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Matemática I"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                maxLength={100}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Semestre (Nivel)</Form.Label>
                  <Form.Select
                    value={formData.semestre || 1}
                    onChange={(e) => setFormData({ ...formData, semestre: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semestre {s}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Créditos</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Ej: 3"
                    value={formData.creditos || 3}
                    onChange={(e) => setFormData({ ...formData, creditos: parseInt(e.target.value) })}
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Horas Teóricas</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Ej: 3"
                    value={formData.horas_teoricas || 3}
                    onChange={(e) => setFormData({ ...formData, horas_teoricas: parseInt(e.target.value) })}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Horas Prácticas</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Ej: 2"
                    value={formData.horas_practicas || 2}
                    onChange={(e) => setFormData({ ...formData, horas_practicas: parseInt(e.target.value) })}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarMateria} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditing ? 'Actualizar' : 'Crear'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Confirmar Eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar la materia <strong>{materiaAEliminar}</strong>?
          <br />
          <span className="text-danger">Esta acción no se puede deshacer.</span>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarEliminar} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GestionarMaterias;
