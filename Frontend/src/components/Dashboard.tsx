import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Badge, ProgressBar, Alert } from 'react-bootstrap';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiUsers, FiMapPin, FiBarChart3 } from 'react-icons/fi';

interface IndicadorAsistencia {
  docente: string;
  porcentaje: number;
  presentes: number;
  ausentes: number;
}

interface IndicadorCarga {
  carrera: string;
  horas_totales: number;
  docentes: number;
}

interface IndicadorAula {
  aula: string;
  capacidad: number;
  ocupacion: number;
  porcentaje_uso: number;
}

interface Indicadores {
  asistencia: IndicadorAsistencia[];
  carga_horaria: IndicadorCarga[];
  ocupacion_aulas: IndicadorAula[];
  resumen: {
    promedio_asistencia: number;
    total_horas: number;
    aulas_activas: number;
  };
}

export const DashboardIndicadores: React.FC = () => {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarIndicadores();
    const intervalo = setInterval(cargarIndicadores, 30000); // Actualizar cada 30s
    return () => clearInterval(intervalo);
  }, []);

  const cargarIndicadores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/indicadores', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al cargar indicadores');

      const data = await response.json();
      setIndicadores(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!indicadores) {
    return <Alert variant="warning">No hay datos disponibles</Alert>;
  }

  const datos_asistencia = indicadores.asistencia.map(a => ({
    nombre: a.docente.substring(0, 15),
    porcentaje: a.porcentaje
  }));

  const datos_carga = indicadores.carga_horaria.map(c => ({
    carrera: c.carrera,
    horas: c.horas_totales,
    docentes: c.docentes
  }));

  const datos_ocupacion = indicadores.ocupacion_aulas.map(o => ({
    nombre: o.aula,
    uso: o.porcentaje_uso
  }));

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4">
        <FiBarChart3 className="me-2" />
        CU20: Dashboard de Indicadores en Tiempo Real
      </h1>

      {/* Resumen Ejecutivo */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FiTrendingUp size={32} className="text-primary" />
              </div>
              <div>
                <h6 className="text-muted">Promedio Asistencia</h6>
                <h2 className="mb-0">{indicadores.resumen.promedio_asistencia}%</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FiUsers size={32} className="text-success" />
              </div>
              <div>
                <h6 className="text-muted">Total de Horas Dictadas</h6>
                <h2 className="mb-0">{indicadores.resumen.total_horas}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FiMapPin size={32} className="text-info" />
              </div>
              <div>
                <h6 className="text-muted">Aulas Activas</h6>
                <h2 className="mb-0">{indicadores.resumen.aulas_activas}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row className="mb-4">
        {/* Gráfico de Asistencia */}
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <Card.Title className="mb-0">Asistencia por Docente</Card.Title>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datos_asistencia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="porcentaje" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Gráfico de Carga Horaria */}
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-success text-white">
              <Card.Title className="mb-0">Carga Horaria por Carrera</Card.Title>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datos_carga}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="carrera" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="horas" stroke="#198754" name="Horas Totales" />
                  <Line type="monotone" dataKey="docentes" stroke="#ffc107" name="Docentes" />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ocupación de Aulas */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <Card.Title className="mb-0">Ocupación de Aulas</Card.Title>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datos_ocupacion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="uso" fill="#0dcaf0" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla Detallada de Asistencia */}
      <Row>
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-secondary text-white">
              <Card.Title className="mb-0">Detalle de Asistencia por Docente</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Docente</th>
                      <th>Porcentaje Asistencia</th>
                      <th>Presentes</th>
                      <th>Ausentes</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicadores.asistencia.map((doc, idx) => (
                      <tr key={idx}>
                        <td>{doc.docente}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <ProgressBar
                              now={doc.porcentaje}
                              variant={doc.porcentaje >= 85 ? 'success' : doc.porcentaje >= 70 ? 'warning' : 'danger'}
                              style={{ flex: 1, marginRight: '10px' }}
                            />
                            <span>{doc.porcentaje}%</span>
                          </div>
                        </td>
                        <td>
                          <Badge bg="success">{doc.presentes}</Badge>
                        </td>
                        <td>
                          <Badge bg="danger">{doc.ausentes}</Badge>
                        </td>
                        <td>
                          {doc.porcentaje >= 85 ? (
                            <Badge bg="success">Excelente</Badge>
                          ) : doc.porcentaje >= 70 ? (
                            <Badge bg="warning">Aceptable</Badge>
                          ) : (
                            <Badge bg="danger">Bajo</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Ocupación de Aulas */}
      <Row className="mt-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-secondary text-white">
              <Card.Title className="mb-0">Detalle de Ocupación de Aulas</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Aula</th>
                      <th>Capacidad</th>
                      <th>Ocupación Actual</th>
                      <th>% Uso</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicadores.ocupacion_aulas.map((aula, idx) => (
                      <tr key={idx}>
                        <td>{aula.aula}</td>
                        <td>{aula.capacidad} estudiantes</td>
                        <td>{aula.ocupacion} estudiantes</td>
                        <td>
                          <ProgressBar
                            now={aula.porcentaje_uso}
                            variant={
                              aula.porcentaje_uso >= 80
                                ? 'success'
                                : aula.porcentaje_uso >= 50
                                ? 'warning'
                                : 'info'
                            }
                          />
                        </td>
                        <td>
                          {aula.porcentaje_uso >= 80 ? (
                            <Badge bg="success">Bien Utilizada</Badge>
                          ) : aula.porcentaje_uso >= 50 ? (
                            <Badge bg="warning">Parcialmente Utilizada</Badge>
                          ) : (
                            <Badge bg="info">Subutilizada</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Botón de Actualizar */}
      <div className="mt-4 text-center">
        <button className="btn btn-primary" onClick={cargarIndicadores}>
          Actualizar Indicadores
        </button>
      </div>
    </div>
  );
};

export default DashboardIndicadores;
