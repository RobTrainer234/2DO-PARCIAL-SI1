import { useEffect, useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'


type Gestion = {
  id_gestion: number
  anio: number
  periodo: string
  fecha_inicio: string
  fecha_fin: string
}

export default function Gestiones() {
  const [gestiones, setGestiones] = useState<Gestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    anio: new Date().getFullYear().toString(),
    periodo: '',
    fecha_inicio: '',
    fecha_fin: ''
  })
  const navigate = useNavigate()
  const [logoutLoading, setLogoutLoading] = useState(false)

  const fetchGestiones = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/gestiones')
      setGestiones(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      setError('Error al cargar gestiones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGestiones()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.anio || !formData.periodo || !formData.fecha_inicio || !formData.fecha_fin) {
      setError('Todos los campos son requeridos')
      return
    }

    if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
      setError('La fecha fin debe ser posterior a la fecha inicio')
      return
    }

    const payload = {
      anio: parseInt(formData.anio),
      periodo: formData.periodo,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin
    }

    try {
      if (editingId) {
        await API.put(`/gestiones/${editingId}`, payload)
        setEditingId(null)
      } else {
        await API.post('/gestiones', payload)
      }
      setFormData({ anio: new Date().getFullYear().toString(), periodo: '', fecha_inicio: '', fecha_fin: '' })
      setShowForm(false)
      fetchGestiones()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar gestión')
    }
  }

  const handleEdit = (gestion: Gestion) => {
    setEditingId(gestion.id_gestion)
    setFormData({
      anio: gestion.anio.toString(),
      periodo: gestion.periodo,
      fecha_inicio: gestion.fecha_inicio,
      fecha_fin: gestion.fecha_fin
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta gestión?')) {
      try {
        await API.delete(`/gestiones/${id}`)
        fetchGestiones()
      } catch (e: any) {
        setError('Error al eliminar gestión')
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

  const filteredGestiones = gestiones.filter(g =>
    g.anio.toString().includes(searchTerm) ||
    g.periodo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Gestionar Gestiones (Períodos Académicos)</h1>
          <div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingId(null)
                setFormData({ anio: new Date().getFullYear().toString(), periodo: '', fecha_inicio: '', fecha_fin: '' })
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
              {showForm ? 'Cancelar' : 'Nueva Gestión'}
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
            placeholder="Buscar por año o período..."
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
            <h3>{editingId ? 'Editar Gestión' : 'Nueva Gestión'}</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Año *</label>
              <input
                type="number"
                value={formData.anio}
                onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                min="2000"
                max="2100"
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Período *</label>
              <input
                type="text"
                value={formData.periodo}
                onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                placeholder="Ej: 1er Semestre, 2do Semestre"
                maxLength={20}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Fecha Inicio *</label>
              <input
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Fecha Fin *</label>
              <input
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
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
              {editingId ? 'Actualizar' : 'Crear'} Gestión
            </button>
          </form>
        )}

        {loading ? (
          <p>Cargando gestiones...</p>
        ) : filteredGestiones.length === 0 ? (
          <p>No hay gestiones disponibles</p>
        ) : (
          <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Año</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Período</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Fecha Inicio</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Fecha Fin</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGestiones.map((gestion) => (
                  <tr key={gestion.id_gestion} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{gestion.anio}</td>
                    <td style={{ padding: '12px' }}>{gestion.periodo}</td>
                    <td style={{ padding: '12px' }}>{gestion.fecha_inicio}</td>
                    <td style={{ padding: '12px' }}>{gestion.fecha_fin}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(gestion)}
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
                        onClick={() => handleDelete(gestion.id_gestion)}
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
