import { useEffect, useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'


type Asignacion = {
  id_asignacion: number
  docente?: { usuario: { nombre: string } }
  grupo?: { nombre: string }
  materia?: { sigla: string; nombre: string }
}

type Asistencia = {
  id_asistencia: number
  fecha: string
  hora: string
  estado: string
  metodo?: string
  observacion?: string
  id_asignacion: number
  asignacion?: Asignacion
}

export default function Asistencias() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    estado: 'PRESENTE',
    metodo: 'Manual',
    observacion: '',
    id_asignacion: ''
  })
  const navigate = useNavigate()
  const [logoutLoading, setLogoutLoading] = useState(false)

  const estados = ['PRESENTE', 'AUSENTE', 'ATRASO', 'JUSTIFICADO']

  const fetchAsistencias = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/asistencias')
      setAsistencias(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      setError('Error al cargar asistencias')
    } finally {
      setLoading(false)
    }
  }

  const fetchAsignaciones = async () => {
    try {
      const res = await API.get('/asignaciones')
      setAsignaciones(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      console.error('Error cargando asignaciones:', e)
    }
  }

  useEffect(() => {
    fetchAsistencias()
    fetchAsignaciones()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fecha || !formData.hora || !formData.estado || !formData.id_asignacion) {
      setError('Fecha, hora, estado e id_asignacion son requeridos')
      return
    }

    const payload = {
      fecha: formData.fecha,
      hora: formData.hora,
      estado: formData.estado,
      metodo: formData.metodo || null,
      observacion: formData.observacion || null,
      id_asignacion: parseInt(formData.id_asignacion)
    }

    try {
      if (editingId) {
        await API.put(`/asistencias/${editingId}`, payload)
        setEditingId(null)
      } else {
        await API.post('/asistencias', payload)
      }
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().slice(0, 5),
        estado: 'PRESENTE',
        metodo: 'Manual',
        observacion: '',
        id_asignacion: ''
      })
      setShowForm(false)
      fetchAsistencias()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar asistencia')
    }
  }

  const handleEdit = (asistencia: Asistencia) => {
    setEditingId(asistencia.id_asistencia)
    setFormData({
      fecha: asistencia.fecha,
      hora: asistencia.hora,
      estado: asistencia.estado,
      metodo: asistencia.metodo || 'Manual',
      observacion: asistencia.observacion || '',
      id_asignacion: asistencia.id_asignacion.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de asistencia?')) {
      try {
        await API.delete(`/asistencias/${id}`)
        fetchAsistencias()
      } catch (e: any) {
        setError('Error al eliminar asistencia')
      }
    }
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await API.post('/auth/logout', {})
      localStorage.removeItem('api_token')
      navigate('/login')
    } catch (e: any) {
      console.error('Error al cerrar sesión')
    } finally {
      setLogoutLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PRESENTE':
        return '#28a745'
      case 'AUSENTE':
        return '#dc3545'
      case 'ATRASO':
        return '#ffc107'
      case 'JUSTIFICADO':
        return '#17a2b8'
      default:
        return '#6c757d'
    }
  }

  const filteredAsistencias = asistencias.filter(a =>
    (a.asignacion?.docente?.usuario?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.asignacion?.grupo?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.fecha.includes(searchTerm)
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Registrar Asistencia Docente</h1>
          <div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingId(null)
                setFormData({
                  fecha: new Date().toISOString().split('T')[0],
                  hora: new Date().toTimeString().slice(0, 5),
                  estado: 'PRESENTE',
                  metodo: 'Manual',
                  observacion: '',
                  id_asignacion: ''
                })
              }}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              {showForm ? 'Cancelar' : 'Nueva Asistencia'}
            </button>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {logoutLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>

        {error && <div style={{ color: '#dc3545', marginBottom: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>{error}</div>}

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar por docente, grupo o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>{editingId ? 'Editar Asistencia' : 'Nueva Asistencia'}</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Asignación (Docente-Grupo-Materia) *</label>
              <select
                value={formData.id_asignacion}
                onChange={(e) => setFormData({ ...formData, id_asignacion: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Selecciona una asignación</option>
                {asignaciones.map(a => (
                  <option key={a.id_asignacion} value={a.id_asignacion}>
                    {a.docente?.usuario?.nombre} - {a.grupo?.nombre} - {a.materia?.sigla}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Fecha *</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Hora *</label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Estado *</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                {estados.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Método</label>
              <input
                type="text"
                value={formData.metodo}
                onChange={(e) => setFormData({ ...formData, metodo: e.target.value })}
                placeholder="Ej: Manual, QR, Aplicación"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Observación</label>
              <textarea
                value={formData.observacion}
                onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                placeholder="Notas adicionales..."
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {editingId ? 'Actualizar' : 'Registrar'} Asistencia
            </button>
          </form>
        )}

        {loading ? (
          <p>Cargando asistencias...</p>
        ) : filteredAsistencias.length === 0 ? (
          <p>No hay registros de asistencia disponibles</p>
        ) : (
          <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Docente</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Grupo</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Materia</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Fecha</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Hora</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Estado</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Método</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Observación</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAsistencias.map((asistencia) => (
                  <tr key={asistencia.id_asistencia} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{asistencia.asignacion?.docente?.usuario?.nombre || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{asistencia.asignacion?.grupo?.nombre || 'N/A'}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#0066cc' }}>
                      {asistencia.asignacion?.materia?.sigla}
                    </td>
                    <td style={{ padding: '12px' }}>{asistencia.fecha}</td>
                    <td style={{ padding: '12px' }}>{asistencia.hora}</td>
                    <td style={{
                      padding: '12px',
                      backgroundColor: getEstadoColor(asistencia.estado),
                      color: 'white',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      {asistencia.estado}
                    </td>
                    <td style={{ padding: '12px' }}>{asistencia.metodo || '-'}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>{asistencia.observacion || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(asistencia)}
                        style={{
                          backgroundColor: '#ffc107',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(asistencia.id_asistencia)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
