import { useEffect, useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'


type Docente = {
  cod_docente: number
  usuario?: { nombre: string }
}

type Grupo = {
  id_grupo: number
  nombre: string
}

type Materia = {
  sigla: string
  nombre: string
  semestre?: number | null
}

type Gestion = {
  id_gestion: number
  anio: number
  periodo: string
}

type Asignacion = {
  id_asignacion: number
  cod_docente: number
  id_grupo: number
  sigla_materia: string
  id_gestion: number
  docente?: { usuario: { nombre: string } }
  grupo?: Grupo
  materia?: Materia
  gestion?: Gestion
}

export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [gestiones, setGestiones] = useState<Gestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    cod_docente: '',
    id_grupo: '',
    sigla_materia: '',
    id_gestion: '',
    semestre: '' // Nuevo: semestre de la materia (se llena automáticamente)
  })
  const navigate = useNavigate()
  const [logoutLoading, setLogoutLoading] = useState(false)

  const fetchAsignaciones = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/asignaciones')
      setAsignaciones(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      setError('Error al cargar asignaciones')
    } finally {
      setLoading(false)
    }
  }

  const fetchDropdownData = async () => {
    try {
      const [docentesRes, gruposRes, materiasRes, gestionsRes] = await Promise.all([
        API.get('/docentes'),
        API.get('/grupos'),
        API.get('/materias'),
        API.get('/gestiones')
      ])
      setDocentes(Array.isArray(docentesRes.data) ? docentesRes.data : docentesRes.data.data || [])
      setGrupos(Array.isArray(gruposRes.data) ? gruposRes.data : gruposRes.data.data || [])
      setMaterias(Array.isArray(materiasRes.data) ? materiasRes.data : materiasRes.data.data || [])
      setGestiones(Array.isArray(gestionsRes.data) ? gestionsRes.data : gestionsRes.data.data || [])
    } catch (e: any) {
      console.error('Error cargando datos del formulario:', e)
    }
  }

  useEffect(() => {
    fetchAsignaciones()
    fetchDropdownData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.cod_docente || !formData.id_grupo || !formData.sigla_materia || !formData.id_gestion) {
      setError('Todos los campos son requeridos')
      return
    }

    const payload = {
      cod_docente: parseInt(formData.cod_docente),
      id_grupo: parseInt(formData.id_grupo),
      sigla_materia: formData.sigla_materia,
      id_gestion: parseInt(formData.id_gestion)
    }

    try {
      if (editingId) {
        await API.put(`/asignaciones/${editingId}`, payload)
        setEditingId(null)
      } else {
        await API.post('/asignaciones', payload)
      }
      setFormData({ cod_docente: '', id_grupo: '', sigla_materia: '', id_gestion: '', semestre: '' })
      setShowForm(false)
      fetchAsignaciones()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar asignación')
    }
  }

  const handleEdit = (asignacion: Asignacion) => {
    setEditingId(asignacion.id_asignacion)
    setFormData({
      cod_docente: asignacion.cod_docente.toString(),
      id_grupo: asignacion.id_grupo.toString(),
      sigla_materia: asignacion.sigla_materia,
      id_gestion: asignacion.id_gestion.toString(),
      semestre: asignacion.materia?.semestre?.toString() || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta asignación?')) {
      try {
        await API.delete(`/asignaciones/${id}`)
        fetchAsignaciones()
      } catch (e: any) {
        setError('Error al eliminar asignación')
      }
    }
  }

  /**
   * Manejador para cuando se selecciona una materia
   * Obtiene automáticamente el semestre de la materia desde el backend
   */
  const handleMateriaChange = async (sigla: string) => {
    setFormData({ ...formData, sigla_materia: sigla })
    
    if (sigla) {
      try {
        const res = await API.get(`/materias/semestre/${sigla}`)
        // Llena automáticamente el campo de semestre
        setFormData(prev => ({
          ...prev,
          sigla_materia: sigla,
          semestre: res.data.semestre ? res.data.semestre.toString() : 'Electiva'
        }))
      } catch (e: any) {
        console.error('Error al obtener semestre de materia:', e)
        setFormData(prev => ({
          ...prev,
          sigla_materia: sigla,
          semestre: ''
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        sigla_materia: '',
        semestre: ''
      }))
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

  const filteredAsignaciones = asignaciones.filter(a =>
    (a.docente?.usuario?.nombre || '').toLowerCase().includes('') ||
    (a.grupo?.nombre || '').toLowerCase().includes('') ||
    (a.materia?.sigla || '').toLowerCase().includes('')
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Asignaciones de Docentes, Grupos y Materias</h1>
          <div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingId(null)
                setFormData({ cod_docente: '', id_grupo: '', sigla_materia: '', id_gestion: '', semestre: '' })
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
              {showForm ? 'Cancelar' : 'Nueva Asignación'}
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

        {showForm && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>{editingId ? 'Editar Asignación' : 'Nueva Asignación'}</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Docente *</label>
              <select
                value={formData.cod_docente}
                onChange={(e) => setFormData({ ...formData, cod_docente: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Selecciona un docente</option>
                {docentes.map(d => (
                  <option key={d.cod_docente} value={d.cod_docente}>
                    {d.usuario?.nombre || `Docente ${d.cod_docente}`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Grupo *</label>
              <select
                value={formData.id_grupo}
                onChange={(e) => setFormData({ ...formData, id_grupo: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Selecciona un grupo</option>
                {grupos.map(g => (
                  <option key={g.id_grupo} value={g.id_grupo}>{g.nombre}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Materia *</label>
              <select
                value={formData.sigla_materia}
                onChange={(e) => handleMateriaChange(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Selecciona una materia</option>
                {materias.map(m => (
                  <option key={m.sigla} value={m.sigla}>{m.sigla} - {m.nombre}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Semestre (Auto-Llenado)</label>
              <input
                type="text"
                value={formData.semestre}
                readOnly
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f0f0f0', color: '#666' }}
                placeholder="Se llena automáticamente al seleccionar materia"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Gestión *</label>
              <select
                value={formData.id_gestion}
                onChange={(e) => setFormData({ ...formData, id_gestion: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Selecciona una gestión</option>
                {gestiones.map(g => (
                  <option key={g.id_gestion} value={g.id_gestion}>{g.anio} - {g.periodo}</option>
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
              {editingId ? 'Actualizar' : 'Crear'} Asignación
            </button>
          </form>
        )}

        {loading ? (
          <p>Cargando asignaciones...</p>
        ) : filteredAsignaciones.length === 0 ? (
          <p>No hay asignaciones disponibles</p>
        ) : (
          <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Docente</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Grupo</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Materia</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Gestión</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAsignaciones.map((asignacion) => (
                  <tr key={asignacion.id_asignacion} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{asignacion.docente?.usuario?.nombre || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{asignacion.grupo?.nombre || 'N/A'}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#0066cc' }}>
                      {asignacion.materia?.sigla} - {asignacion.materia?.nombre}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {asignacion.gestion?.anio} - {asignacion.gestion?.periodo}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(asignacion)}
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
                        onClick={() => handleDelete(asignacion.id_asignacion)}
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
