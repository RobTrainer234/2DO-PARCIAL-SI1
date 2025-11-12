import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Pagination } from 'react-bootstrap';

const ValidacionAsistencia = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAsistencia, setSelectedAsistencia] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para validación
  const [validacionData, setValidacionData] = useState({
    estado_validacion: 'Aprobada',
    observaciones_validacion: '',
    falta_justificada: false
  });

  // Filtros
  const [filtros, setFiltros] = useState({
    fecha: '',
    estado: ''
  });

  useEffect(() => {
    obtenerPendientes();
  }, [currentPage, filtros]);

  const obtenerPendientes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.fecha) params.append('fecha', filtros.fecha);
      if (filtros.estado) params.append('estado', filtros.estado);
      params.append('page', currentPage);

      const response = await fetch(`/api/validacion-asistencia/pendientes?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAsistencias(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
      }
    } catch (error) {
      setMessageType('danger');
      setMessage('Error cargando asistencias');
    }
    setLoading(false);
  };

  const handleValidar = async () => {
    if (!selectedAsistencia) return;

    try {
      const response = await fetch(`/api/validacion-asistencia/${selectedAsistencia.id}/validar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(validacionData)
      });

      const data = await response.json();
      if (response.ok) {
        setMessageType('success');
        setMessage('✅ Asistencia validada exitosamente');
        setShowModal(false);
        obtenerPendientes();
      } else {
        setMessageType('danger');
        setMessage('❌ Error: ' + data.message);
      }
    } catch (error) {
      setMessageType('danger');
      setMessage('❌ Error de conexión');
    }
  };

  const handleRechazar = async () => {
    if (!selectedAsistencia) return;

    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (!motivo) return;

    try {
      const response = await fetch(`/api/validacion-asistencia/${selectedAsistencia.id}/rechazar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ motivo_rechazo: motivo })
      });

      const data = await response.json();
      if (response.ok) {
        setMessageType('success');
        setMessage('✅ Validación rechazada');
        setShowModal(false);
        obtenerPendientes();
      } else {
        setMessageType('danger');
        setMessage('❌ Error: ' + data.message);
      }
    } catch (error) {
      setMessageType('danger');
      setMessage('❌ Error de conexión');
    }
  };

  const handleMarcarRevisada = async (asistenciaId) => {
    try {
      const response = await fetch(`/api/validacion-asistencia/${asistenciaId}/marcar-revisada`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMessageType('success');
        setMessage('✅ Marcada como revisada');
        obtenerPendientes();
      }
    } catch (error) {
      setMessageType('danger');
      setMessage('❌ Error de conexión');
    }
  };

  const obtenerHistorico = async (asistenciaId) => {
    try {
      const response = await fetch(`/api/validacion-asistencia/${asistenciaId}/historico`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Histórico:', data.validaciones);
        alert('Histórico de validaciones:\n' + JSON.stringify(data.validaciones, null, 2));
      }
    } catch (error) {
      setMessageType('danger');
      setMessage('Error cargando histórico');
    }
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      'Presente': 'success',
      'Atraso': 'warning',
      'Falta': 'danger',
      'Falta justificada': 'info'
    };
    return <Badge bg={colors[estado] || 'secondary'}>{estado}</Badge>;
  };

  const getTipoRegistroBadge = (tipo) => {
    const colors = {
      'Manual': 'primary',
      'QR': 'info',
      'Enlace': 'secondary'
    };
    return <Badge bg={colors[tipo] || 'dark'}>{tipo}</Badge>;
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-lg">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">✅ CU14: Validar Registros de Asistencia</h4>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant={messageType} dismissible onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}

          {/* Filtros */}
          <Card className="mb-3 bg-light">
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-bold">Filtrar por Fecha</Form.Label>
                    <Form.Control
                      type="date"
                      value={filtros.fecha}
                      onChange={(e) => {
                        setFiltros({ ...filtros, fecha: e.target.value });
                        setCurrentPage(1);
                      }}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-bold">Filtrar por Estado</Form.Label>
                    <Form.Select
                      value={filtros.estado}
                      onChange={(e) => {
                        setFiltros({ ...filtros, estado: e.target.value });
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">Todos</option>
                      <option value="Presente">Presente</option>
                      <option value="Atraso">Atraso</option>
                      <option value="Falta">Falta</option>
                      <option value="Falta justificada">Falta Justificada</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Tabla */}
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Docente</th>
                  <th>Grupo</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Tipo</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asistencias.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No hay asistencias pendientes
                    </td>
                  </tr>
                ) : (
                  asistencias.map((asistencia) => (
                    <tr key={asistencia.id}>
                      <td>{new Date(asistencia.fecha).toLocaleDateString('es-ES')}</td>
                      <td>{asistencia.docente?.nombre || 'N/A'}</td>
                      <td>{asistencia.grupo?.nombre || 'N/A'}</td>
                      <td>{asistencia.hora_entrada}</td>
                      <td>{getEstadoBadge(asistencia.estado)}</td>
                      <td>{getTipoRegistroBadge(asistencia.tipo_registro)}</td>
                      <td>{asistencia.observaciones || '-'}</td>
                      <td>
                        <Button
                          variant="sm"
                          className="btn-sm"
                          onClick={() => {
                            setSelectedAsistencia(asistencia);
                            setShowModal(true);
                          }}
                        >
                          Validar
                        </Button>
                        <Button
                          variant="secondary btn-sm"
                          size="sm"
                          className="ms-2"
                          onClick={() => obtenerHistorico(asistencia.id)}
                        >
                          Histórico
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-3">
              <Pagination.First
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
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
          )}
        </Card.Body>
      </Card>

      {/* Modal de Validación */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Validar Asistencia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAsistencia && (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Fecha:</strong> {new Date(selectedAsistencia.fecha).toLocaleDateString('es-ES')}
                </div>
                <div className="col-md-6">
                  <strong>Docente:</strong> {selectedAsistencia.docente?.nombre}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Grupo:</strong> {selectedAsistencia.grupo?.nombre}
                </div>
                <div className="col-md-6">
                  <strong>Estado Actual:</strong> {getEstadoBadge(selectedAsistencia.estado)}
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Estado de Validación</Form.Label>
                <Form.Select
                  value={validacionData.estado_validacion}
                  onChange={(e) =>
                    setValidacionData({ ...validacionData, estado_validacion: e.target.value })
                  }
                >
                  <option value="Aprobada">Aprobada</option>
                  <option value="Rechazada">Rechazada</option>
                  <option value="En revisión">En revisión</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Marcar como falta justificada"
                  checked={validacionData.falta_justificada}
                  onChange={(e) =>
                    setValidacionData({ ...validacionData, falta_justificada: e.target.checked })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Observaciones de Validación</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={validacionData.observaciones_validacion}
                  onChange={(e) =>
                    setValidacionData({ ...validacionData, observaciones_validacion: e.target.value })
                  }
                  placeholder="Ingrese observaciones sobre la validación"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleRechazar}>
            Rechazar
          </Button>
          <Button variant="success" onClick={handleValidar}>
            Validar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ValidacionAsistencia;
