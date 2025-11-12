import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Tab, Tabs, Badge } from 'react-bootstrap';

const RegistroAsistencia = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Estado para registro manual
  const [manualData, setManualData] = useState({
    docente_id: '',
    grupo_id: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_entrada: '07:30:00',
    observaciones: ''
  });

  // Estado para QR
  const [qrData, setQrData] = useState({
    docente_id: '',
    grupo_id: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '07:00:00',
    hora_fin: '14:00:00'
  });

  // Estado para enlace
  const [enlaceData, setEnlaceData] = useState({
    docente_id: '',
    grupo_id: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '07:00:00',
    hora_fin: '14:00:00'
  });

  // Estado para evidencia
  const [evidenciaData, setEvidenciaData] = useState({
    asistencia_id: '',
    tipo_evidencia: 'Observacion',
    descripcion: ''
  });

  const handleRegistroManual = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/asistencia/registrar-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(manualData)
      });

      const data = await response.json();
      if (response.ok) {
        setMessageType('success');
        setMessage('✅ Asistencia registrada exitosamente');
        setManualData({ ...manualData, observaciones: '' });
      } else {
        setMessageType('danger');
        setMessage('❌ Error: ' + data.message);
      }
    } catch (error) {
      setMessageType('danger');
      setMessage('❌ Error de conexión');
    }
    setLoading(false);
  };

  const handleGenerarQR = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/asistencia/generar-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(qrData)
      });

      const data = await response.json();
      if (response.ok) {
        setMessageType('success');
        setMessage('✅ Código QR generado. Código: ' + data.qr_codigo);
      } else {
        setMessageType('danger');
        setMessage('❌ Error: ' + data.message);
      }
    } catch (error) {
      setMessageType('danger');
      setMessage('❌ Error de conexión');
    }
    setLoading(false);
  };

  const handleGenerarEnlace = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/asistencia/generar-enlace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(enlaceData)
      });

      const data = await response.json();
      if (response.ok) {
        setMessageType('success');
        setMessage('✅ Enlace generado: ' + data.enlace);
      } else {
        setMessageType('danger');
        setMessage('❌ Error: ' + data.message);
      }
    } catch (error) {
      setMessageType('danger');
      setMessage('❌ Error de conexión');
    }
    setLoading(false);
  };

  const handleGuardarEvidencia = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('asistencia_id', evidenciaData.asistencia_id);
      formData.append('tipo_evidencia', evidenciaData.tipo_evidencia);
      formData.append('descripcion', evidenciaData.descripcion);

      const response = await fetch(`/api/asistencia/${evidenciaData.asistencia_id}/evidencia`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setMessageType('success');
        setMessage('✅ Evidencia guardada correctamente');
      } else {
        setMessageType('danger');
        setMessage('❌ Error: ' + data.message);
      }
    } catch (error) {
      setMessageType('danger');
      setMessage('❌ Error de conexión');
    }
    setLoading(false);
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-lg">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">📋 CU13: Registro de Asistencia Docente</h4>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant={messageType} dismissible onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}

          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
            {/* TAB 1: Registro Manual */}
            <Tab eventKey="manual" title={<><Badge bg="success">Manual</Badge> Registro Manual</>}>
              <Form onSubmit={handleRegistroManual}>
                <Form.Group className="mb-3">
                  <Form.Label>Docente</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="ID del Docente"
                    value={manualData.docente_id}
                    onChange={(e) => setManualData({ ...manualData, docente_id: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Grupo</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="ID del Grupo"
                    value={manualData.grupo_id}
                    onChange={(e) => setManualData({ ...manualData, grupo_id: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={manualData.fecha}
                    onChange={(e) => setManualData({ ...manualData, fecha: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hora de Entrada</Form.Label>
                  <Form.Control
                    type="time"
                    value={manualData.hora_entrada}
                    onChange={(e) => setManualData({ ...manualData, hora_entrada: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Notas adicionales"
                    value={manualData.observaciones}
                    onChange={(e) => setManualData({ ...manualData, observaciones: e.target.value })}
                  />
                </Form.Group>

                <Button variant="success" type="submit" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrar Asistencia'}
                </Button>
              </Form>
            </Tab>

            {/* TAB 2: Código QR */}
            <Tab eventKey="qr" title={<><Badge bg="info">QR</Badge> Generar QR</>}>
              <Form onSubmit={handleGenerarQR}>
                <Form.Group className="mb-3">
                  <Form.Label>Docente</Form.Label>
                  <Form.Control
                    type="number"
                    value={qrData.docente_id}
                    onChange={(e) => setQrData({ ...qrData, docente_id: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Grupo</Form.Label>
                  <Form.Control
                    type="number"
                    value={qrData.grupo_id}
                    onChange={(e) => setQrData({ ...qrData, grupo_id: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={qrData.fecha}
                    onChange={(e) => setQrData({ ...qrData, fecha: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hora Inicio</Form.Label>
                  <Form.Control
                    type="time"
                    value={qrData.hora_inicio}
                    onChange={(e) => setQrData({ ...qrData, hora_inicio: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hora Fin</Form.Label>
                  <Form.Control
                    type="time"
                    value={qrData.hora_fin}
                    onChange={(e) => setQrData({ ...qrData, hora_fin: e.target.value })}
                  />
                </Form.Group>

                <Button variant="info" type="submit" disabled={loading}>
                  {loading ? 'Generando...' : 'Generar Código QR'}
                </Button>
              </Form>
            </Tab>

            {/* TAB 3: Enlace Único */}
            <Tab eventKey="enlace" title={<><Badge bg="warning">Link</Badge> Enlace Único</>}>
              <Form onSubmit={handleGenerarEnlace}>
                <Form.Group className="mb-3">
                  <Form.Label>Docente</Form.Label>
                  <Form.Control
                    type="number"
                    value={enlaceData.docente_id}
                    onChange={(e) => setEnlaceData({ ...enlaceData, docente_id: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Grupo</Form.Label>
                  <Form.Control
                    type="number"
                    value={enlaceData.grupo_id}
                    onChange={(e) => setEnlaceData({ ...enlaceData, grupo_id: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={enlaceData.fecha}
                    onChange={(e) => setEnlaceData({ ...enlaceData, fecha: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hora Inicio</Form.Label>
                  <Form.Control
                    type="time"
                    value={enlaceData.hora_inicio}
                    onChange={(e) => setEnlaceData({ ...enlaceData, hora_inicio: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hora Fin</Form.Label>
                  <Form.Control
                    type="time"
                    value={enlaceData.hora_fin}
                    onChange={(e) => setEnlaceData({ ...enlaceData, hora_fin: e.target.value })}
                  />
                </Form.Group>

                <Button variant="warning" type="submit" disabled={loading}>
                  {loading ? 'Generando...' : 'Generar Enlace Único'}
                </Button>
              </Form>
            </Tab>

            {/* TAB 4: Evidencias */}
            <Tab eventKey="evidencia" title={<><Badge bg="secondary">📎</Badge> Evidencias</>}>
              <Form onSubmit={handleGuardarEvidencia}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Asistencia</Form.Label>
                  <Form.Control
                    type="number"
                    value={evidenciaData.asistencia_id}
                    onChange={(e) => setEvidenciaData({ ...evidenciaData, asistencia_id: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Evidencia</Form.Label>
                  <Form.Select
                    value={evidenciaData.tipo_evidencia}
                    onChange={(e) => setEvidenciaData({ ...evidenciaData, tipo_evidencia: e.target.value })}
                  >
                    <option value="Foto">Foto</option>
                    <option value="Archivo">Archivo</option>
                    <option value="Observacion">Observación</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={evidenciaData.descripcion}
                    onChange={(e) => setEvidenciaData({ ...evidenciaData, descripcion: e.target.value })}
                  />
                </Form.Group>

                <Button variant="secondary" type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Evidencia'}
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegistroAsistencia;
