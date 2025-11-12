import React, { useState, useEffect } from 'react';
import { Alert, Badge, Button, Card, Form, Pagination, Spinner, Table } from 'react-bootstrap';
import { FiActivity, FiFilter, FiDownload } from 'react-icons/fi';

interface AuditoriaLog {
  id: number;
  usuario: { nombre: string; apellido: string; email: string };
  accion: string;
  tabla: string;
  registro_id: number;
  cambios: any;
  ip_address: string;
  created_at: string;
}

interface EstadisticasAuditoria {
  total_registros: number;
  acciones_por_tipo: { [key: string]: number };
  usuarios_mas_activos: Array<{ usuario: string; total: number }>;
  periodo: { desde: string; hasta: string };
}

export const AuditoriaComponent: React.FC = () => {
  const [bitacora, setBitacora] = useState<AuditoriaLog[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAuditoria | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtros, setFiltros] = useState({
    usuario_id: '',
    accion: '',
    tabla: '',
    fecha_desde: '',
    fecha_hasta: '',
  });

  useEffect(() => {
    cargarBitacora();
    cargarEstadisticas();
  }, [paginaActual, filtros]);

  const cargarBitacora = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filtros,
        page: paginaActual.toString(),
      });

      const response = await fetch(`/api/auditoria/bitacora?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al cargar bitácora');

      const data = await response.json();
      setBitacora(data.data.data);
      setTotalPaginas(data.data.last_page);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('/api/auditoria/estadisticas', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al cargar estadísticas');

      const data = await response.json();
      setEstadisticas(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const exportarBitacora = async () => {
    try {
      const response = await fetch('/api/auditoria/exportar', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bitacora_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const obtenerColorBadge = (accion: string): string => {
    switch (accion) {
      case 'crear':
        return 'success';
      case 'actualizar':
        return 'info';
      case 'eliminar':
        return 'danger';
      case 'validar_asistencia':
        return 'primary';
      case 'login':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">
        <FiActivity className="me-2" />
        CU21: Auditoría de Acciones del Sistema (Bitácora)
      </h2>

      {/* Estadísticas Generales */}
      {estadisticas && (
        <Card className="mb-4 bg-light">
          <Card.Header className="bg-primary text-white">
            <Card.Title className="mb-0">Estadísticas Generales</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-3">
                <h6 className="text-muted">Total de Registros</h6>
                <h3>{estadisticas.total_registros}</h3>
              </div>
              <div className="col-md-3">
                <h6 className="text-muted">Período</h6>
                <p>
                  {estadisticas.periodo.desde} a {estadisticas.periodo.hasta}
                </p>
              </div>
              <div className="col-md-6">
                <h6 className="text-muted">Tipos de Acciones</h6>
                <div>
                  {Object.entries(estadisticas.acciones_por_tipo).map(([accion, cantidad]) => (
                    <Badge key={accion} bg={obtenerColorBadge(accion)} className="me-2 mb-2">
                      {accion}: {cantidad}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <hr />

            <h6 className="text-muted">Usuarios Más Activos</h6>
            <div className="row">
              {estadisticas.usuarios_mas_activos.map((usuario, idx) => (
                <div key={idx} className="col-md-4">
                  <small>
                    <strong>{usuario.usuario}</strong>: {usuario.total} acciones
                  </small>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Header className="bg-secondary text-white">
          <FiFilter className="me-2" /> Filtros
        </Card.Header>
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-2">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="number"
                placeholder="ID Usuario"
                value={filtros.usuario_id}
                onChange={(e) => {
                  setFiltros({ ...filtros, usuario_id: e.target.value });
                  setPaginaActual(1);
                }}
              />
            </div>
            <div className="col-md-2">
              <Form.Label>Acción</Form.Label>
              <Form.Select
                value={filtros.accion}
                onChange={(e) => {
                  setFiltros({ ...filtros, accion: e.target.value });
                  setPaginaActual(1);
                }}
              >
                <option value="">Todas</option>
                <option value="crear">Crear</option>
                <option value="actualizar">Actualizar</option>
                <option value="eliminar">Eliminar</option>
                <option value="validar_asistencia">Validar Asistencia</option>
                <option value="login">Login</option>
              </Form.Select>
            </div>
            <div className="col-md-2">
              <Form.Label>Tabla</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Usuario, Horarios"
                value={filtros.tabla}
                onChange={(e) => {
                  setFiltros({ ...filtros, tabla: e.target.value });
                  setPaginaActual(1);
                }}
              />
            </div>
            <div className="col-md-2">
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
            <div className="col-md-2">
              <Form.Label>Hasta</Form.Label>
              <Form.Control
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) => {
                  setFiltros({ ...filtros, fecha_hasta: e.target.value });
                  setPaginaActual(1);
                }}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <Button
                variant="secondary"
                className="w-100 me-2"
                onClick={() => {
                  setFiltros({
                    usuario_id: '',
                    accion: '',
                    tabla: '',
                    fecha_desde: '',
                    fecha_hasta: '',
                  });
                  setPaginaActual(1);
                }}
              >
                Limpiar
              </Button>
              <Button
                variant="success"
                className="w-100"
                onClick={exportarBitacora}
              >
                <FiDownload className="me-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Tabla de Bitácora */}
      {loading ? (
        <div className="text-center p-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      ) : (
        <Card>
          <Card.Header className="bg-light">
            <strong>Total de registros: {bitacora.length}</strong>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table striped hover bordered>
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Fecha/Hora</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Tabla</th>
                    <th>Registro ID</th>
                    <th>IP Address</th>
                    <th>Cambios</th>
                  </tr>
                </thead>
                <tbody>
                  {bitacora.length > 0 ? (
                    bitacora.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <small>{log.id}</small>
                        </td>
                        <td>
                          <small>
                            {new Date(log.created_at).toLocaleString('es-ES')}
                          </small>
                        </td>
                        <td>
                          <strong>
                            {log.usuario.nombre} {log.usuario.apellido}
                          </strong>
                          <br />
                          <small className="text-muted">{log.usuario.email}</small>
                        </td>
                        <td>
                          <Badge bg={obtenerColorBadge(log.accion)}>
                            {log.accion}
                          </Badge>
                        </td>
                        <td>
                          <small>{log.tabla}</small>
                        </td>
                        <td>
                          <small>{log.registro_id}</small>
                        </td>
                        <td>
                          <small className="text-muted">{log.ip_address}</small>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => {
                              alert(JSON.stringify(log.cambios, null, 2));
                            }}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center text-muted">
                        No hay registros de auditoría
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
    </div>
  );
};

export default AuditoriaComponent;
