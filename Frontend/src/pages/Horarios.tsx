import { useEffect, useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'


type Asignacion = {
  id_asignacion: number
  docente?: { usuario: { nombre: string } }
  grupo?: { nombre: string }
  materia?: { sigla: string; nombre: string }
}

type Infraestructura = {
  id_infraestructura: number
  nro: string
  piso?: number
  tipo?: { nombre: string }
}

type Horario = {
  id_horario: number
  dia: string
  hora_inicio: string
  hora_final: string
  id_asignacion: number
  id_infraestructura?: number
  asignacion?: Asignacion
  infraestructura?: Infraestructura
}

export default function Horarios() {
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [infraestructuras, setInfraestructuras] = useState<Infraestructura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    dia: 'Lunes',
    hora_inicio: '08:00',
    hora_final: '09:00',
    id_asignacion: '',
    id_infraestructura: ''
  })
  const navigate = useNavigate()
  const [logoutLoading, setLogoutLoading] = useState(false)

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

  const fetchHorarios = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/horarios')
      setHorarios(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      setError('Error al cargar horarios')
    } finally {
      setLoading(false)
    }
  }

  const fetchDropdownData = async () => {
    try {
      const [asignacionesRes, infraestructurasRes] = await Promise.all([
        API.get('/asignaciones'),
        API.get('/aulas')
      ])
      setAsignaciones(Array.isArray(asignacionesRes.data) ? asignacionesRes.data : asignacionesRes.data.data || [])
      setInfraestructuras(Array.isArray(infraestructurasRes.data) ? infraestructurasRes.data : infraestructurasRes.data.data || [])
    } catch (e: any) {
      console.error('Error cargando datos del formulario:', e)
    }
  }

  useEffect(() => {
    fetchHorarios()
    fetchDropdownData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.dia || !formData.hora_inicio || !formData.hora_final || !formData.id_asignacion) {
      setError('Día, hora inicio, hora final e id_asignacion son requeridos')
      return
    }

    if (formData.hora_final <= formData.hora_inicio) {
      setError('La hora final debe ser mayor que la hora inicio')
      return
    }

    const payload = {
      dia: formData.dia,
      hora_inicio: formData.hora_inicio,
      hora_final: formData.hora_final,
      id_asignacion: parseInt(formData.id_asignacion),
      id_infraestructura: formData.id_infraestructura ? parseInt(formData.id_infraestructura) : null
    }

    try {
      if (editingId) {
        await API.put(`/horarios/${editingId}`, payload)
        setEditingId(null)
      } else {
        await API.post('/horarios', payload)
      }
      setFormData({ dia: 'Lunes', hora_inicio: '08:00', hora_final: '09:00', id_asignacion: '', id_infraestructura: '' })
      setShowForm(false)
      fetchHorarios()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar horario')
    }
  }

  const handleEdit = (horario: Horario) => {
    setEditingId(horario.id_horario)
    setFormData({
      dia: horario.dia,
      hora_inicio: horario.hora_inicio,
      hora_final: horario.hora_final,
      id_asignacion: horario.id_asignacion.toString(),
      id_infraestructura: horario.id_infraestructura?.toString() || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      try {
        await API.delete(`/horarios/${id}`)
        fetchHorarios()
      } catch (e: any) {
        setError('Error al eliminar horario')
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

  const filteredHorarios = horarios.filter(h =>
    (h.dia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.asignacion?.docente?.usuario?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.asignacion?.grupo?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Gestionar Horarios</h1>
          <div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingId(null)
                setFormData({ dia: 'Lunes', hora_inicio: '08:00', hora_final: '09:00', id_asignacion: '', id_infraestructura: '' })
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
              {showForm ? 'Cancelar' : 'Nuevo Horario'}
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
            placeholder="Buscar por día, docente o grupo..."
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
            <h3>{editingId ? 'Editar Horario' : 'Nuevo Horario'}</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Día *</label>
              <select
                value={formData.dia}
                onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                {dias.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Hora Inicio *</label>
              <input
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Hora Final *</label>
              <input
                type="time"
                value={formData.hora_final}
                onChange={(e) => setFormData({ ...formData, hora_final: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

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
              <label>Aula (opcional)</label>
              <select
                value={formData.id_infraestructura}
                onChange={(e) => setFormData({ ...formData, id_infraestructura: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Sin asignar aula</option>
                {infraestructuras.map(i => (
                  <option key={i.id_infraestructura} value={i.id_infraestructura}>
                    {i.nro} (Piso {i.piso || 'N/A'}) - {i.tipo?.nombre || 'Aula'}
                  </option>
                ))}
              </select>
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
              {editingId ? 'Actualizar' : 'Crear'} Horario
            </button>
          </form>
        )}

        {loading ? (
          <p>Cargando horarios...</p>
        ) : filteredHorarios.length === 0 ? (
          <p>No hay horarios disponibles</p>
        ) : (
          <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Día</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Hora Inicio</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Hora Final</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Docente</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Grupo</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Materia</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Aula</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredHorarios.map((horario) => (
                  <tr key={horario.id_horario} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{horario.dia}</td>
                    <td style={{ padding: '12px' }}>{horario.hora_inicio}</td>
                    <td style={{ padding: '12px' }}>{horario.hora_final}</td>
                    <td style={{ padding: '12px' }}>{horario.asignacion?.docente?.usuario?.nombre || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{horario.asignacion?.grupo?.nombre || 'N/A'}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#0066cc' }}>
                      {horario.asignacion?.materia?.sigla}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {horario.infraestructura?.nro || 'Sin asignar'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(horario)}
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
                        onClick={() => handleDelete(horario.id_horario)}
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
