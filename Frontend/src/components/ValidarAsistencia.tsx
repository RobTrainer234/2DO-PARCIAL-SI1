import React, { useState, useEffect } from 'react';
import { Alert, Badge, Button, Card, Form, Modal, Pagination, Spinner, Table } from 'react-bootstrap';
import { FiCheckCircle, FiXCircle, FiEye, FiFilter } from 'react-icons/fi';

interface Asistencia {
  id: number;
  estudiante: { nombre: string; apellido: string };
  docente: { nombre: string; apellido: string };
  fecha: string;
  asistio: boolean;
  estado: string;
  observaciones?: string;
  validado: boolean;
  validado_por?: string;
  horario: { materia: { sigla: string; nombre: string }; grupo: { sigla: string } };
}

export const ValidarAsistenciaComponent: React.FC = () => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({ estado: 'pendiente', docente_id: '', fecha_desde: '' });
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [asistenciaSeleccionada, setAsistenciaSeleccionada] = useState<Asistencia | null>(null);
  const [validando, setValidando] = useState(false);
  const [formValidacion, setFormValidacion] = useState({
    validado: true,
    observaciones: '',
    justificacion_falta: '',
  });
  const [historicoVisible, setHistoricoVisible] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    cargarAsistencias();
  }, [paginaActual, filtros]);

  const cargarAsistencias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filtros,
        page: paginaActual.toString(),
      });

      const response = await fetch(`/api/asistencias?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al cargar asistencias');

      const data = await response.json();
      setAsistencias(data.data.data);
      setTotalPaginas(data.data.last_page);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalValidacion = (asistencia: Asistencia) => {
    setAsistenciaSeleccionada(asistencia);
    setFormValidacion({
      validado: true,
      observaciones: asistencia.observaciones || '',
      justificacion_falta: '',
    });
    setModalVisible(true);
  };

  const validarAsistencia = async () => {
    if (!asistenciaSeleccionada) return;

    try {
      setValidando(true);
      const response = await fetch(`/api/asistencias/${asistenciaSeleccionada.id}/validar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formValidacion),
      });

      if (!response.ok) throw new Error('Error al validar asistencia');

      setModalVisible(false);
      cargarAsistencias();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setValidando(false);
    }
  };

  const obtenerHistorico = async (asistenciaId: number) => {
    try {
      const response = await fetch(`/api/asistencias/${asistenciaId}/historico-validaciones`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al obtener histórico');

      const data = await response.json();
      setHistorico(data.data.historico);
      setHistoricoVisible(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">
        <FiCheckCircle className="me-2" />
        CU14: Validar Registros de Asistencia
      </h2>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <FiFilter className="me-2" /> Filtros
        </Card.Header>
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={filtros.estado}
                onChange={(e) => {
                  setFiltros({ ...filtros, estado: e.target.value });
                  setPaginaActual(1);
                }}
              >
                <option value="pendiente">Pendiente</option>
                <option value="validado">Validado</option>
                <option value="rechazado">Rechazado</option>
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Label>Docente ID</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ej: 1"
                value={filtros.docente_id}
                onChange={(e) => {
                  setFiltros({ ...filtros, docente_id: e.target.value });
                  setPaginaActual(1);
                }}
              />
            </div>
            <div className="col-md-3">
              <Form.Label>Desde</Form.Label>
              <Form.Control
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) => {
                  setFiltros({ ...filtros, fecha_desde: e.target.value });
                  setPaginaActual(1);
                }}
              />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <Button
                variant="secondary"
                className="w-100"
                onClick={() => {
                  setFiltros({ estado: 'pendiente', docente_id: '', fecha_desde: '' });
                  setPaginaActual(1);
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Tabla de Asistencias */}
      {loading ? (
        <div className="text-center p-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      ) : (
        <Card>
          <Card.Header className="bg-light">
            <strong>Asistencias pendientes de validación: {asistencias.length}</strong>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table striped hover bordered>
                <thead className="table-dark">
                  <tr>
                    <th>Fecha</th>
                    <th>Estudiante</th>
                    <th>Docente</th>
                    <th>Materia</th>
                    <th>¿Asistió?</th>
                    <th>Estado</th>
                    <th>Validado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencias.length > 0 ? (
                    asistencias.map((a) => (
                      <tr key={a.id}>
                        <td>{new Date(a.fecha).toLocaleDateString('es-ES')}</td>
                        <td>{a.estudiante?.nombre} {a.estudiante?.apellido}</td>
                        <td>{a.docente?.nombre}</td>
                        <td>
                          <small>{a.horario.materia.sigla}</small>
                        </td>
                        <td>
                          {a.asistio ? (
                            <Badge bg="success">Presente</Badge>
                          ) : (
                            <Badge bg="danger">Ausente</Badge>
                          )}
                        </td>
                        <td>
                          <Badge
                            bg={
                              a.estado === 'validado'
                                ? 'success'
                                : a.estado === 'rechazado'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {a.estado}
                          </Badge>
                        </td>
                        <td>
                          {a.validado ? (
                            <FiCheckCircle className="text-success" size={18} />
                          ) : (
                            <FiXCircle className="text-danger" size={18} />
                          )}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="primary"
                            className="me-2"
                            onClick={() => abrirModalValidacion(a)}
                          >
                            Validar
                          </Button>
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => obtenerHistorico(a.id)}
                          >
                            <FiEye /> Histórico
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center text-muted">
                        No hay asistencias para validar
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Paginación */}
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => setPaginaActual(1)}
                  disabled={paginaActual === 1}
                />
                <Pagination.Prev
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                />
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={paginaActual === i + 1}
                    onClick={() => setPaginaActual(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                />
                <Pagination.Last
                  onClick={() => setPaginaActual(totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                />
              </Pagination>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal de Validación */}
      <Modal show={modalVisible} onHide={() => setModalVisible(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Validar Asistencia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {asistenciaSeleccionada && (
            <div className="mb-4">
              <h6>Detalles del Registro</h6>
              <p>
                <strong>Estudiante:</strong> {asistenciaSeleccionada.estudiante?.nombre}{' '}
                {asistenciaSeleccionada.estudiante?.apellido}
              </p>
              <p>
                <strong>Fecha:</strong>{' '}
                {new Date(asistenciaSeleccionada.fecha).toLocaleDateString('es-ES')}
              </p>
              <p>
                <strong>Materia:</strong> {asistenciaSeleccionada.horario.materia.nombre}
              </p>
              <p>
                <strong>¿Asistió?:</strong>{' '}
                {asistenciaSeleccionada.asistio ? (
                  <Badge bg="success">Sí</Badge>
                ) : (
                  <Badge bg="danger">No</Badge>
                )}
              </p>
            </div>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>¿Validar asistencia?</Form.Label>
              <Form.Check
                type="radio"
                label="Validar"
                name="validacion"
                checked={formValidacion.validado === true}
                onChange={() => setFormValidacion({ ...formValidacion, validado: true })}
              />
              <Form.Check
                type="radio"
                label="Rechazar"
                name="validacion"
                checked={formValidacion.validado === false}
                onChange={() => setFormValidacion({ ...formValidacion, validado: false })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formValidacion.observaciones}
                onChange={(e) =>
                  setFormValidacion({ ...formValidacion, observaciones: e.target.value })
                }
                placeholder="Ingresa observaciones sobre la asistencia..."
              />
            </Form.Group>

            {!formValidacion.validado && (
              <Form.Group className="mb-3">
                <Form.Label>Justificación de Falta</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formValidacion.justificacion_falta}
                  onChange={(e) =>
                    setFormValidacion({ ...formValidacion, justificacion_falta: e.target.value })
                  }
                  placeholder="Razón de la falta o rechazo de validación..."
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={validarAsistencia}
            disabled={validando}
          >
            {validando ? <Spinner size="sm" className="me-2" /> : null}
            Guardar Validación
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Histórico */}
      <Modal show={historicoVisible} onHide={() => setHistoricoVisible(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Histórico de Validaciones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historico.length > 0 ? (
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Validado Por</th>
                  <th>Fecha</th>
                  <th>Cambios</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h, idx) => (
                  <tr key={idx}>
                    <td>{h.validado_por}</td>
                    <td>{new Date(h.fecha).toLocaleString('es-ES')}</td>
                    <td>
                      <small>
                        {JSON.stringify(h.cambios, null, 2)}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">No hay histórico disponible</Alert>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ValidarAsistenciaComponent;
