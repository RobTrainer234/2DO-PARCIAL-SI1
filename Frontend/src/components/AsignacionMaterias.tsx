import { useEffect, useState } from 'react'
import API from '../services/api'

type Docente = {
  cod_docente: number
  usuario?: { nombre: string; apellido: string }
  especialidad?: string
}

type Materia = {
  sigla: string
  nombre: string
  semestre?: number | null
}

type CargaHoraria = {
  id_carga: number
  cod_docente: number
  sigla_materia: string
  horas_asignadas: number
  orden_preferencia: number
  activo: boolean
  docente?: { usuario: { nombre: string; apellido: string } }
  materia?: Materia
}

export default function AsignacionMaterias() {
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedDocente, setSelectedDocente] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    sigla_materia: '',
    horas_asignadas: '30',
    orden_preferencia: ''
  })

  const [docenteCargas, setDocenteCargas] = useState<CargaHoraria[]>([])
  const [totalHoras, setTotalHoras] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [docentesRes, materiasRes] = await Promise.all([
        API.get('/docentes'),
        API.get('/materias')
      ])

      setDocentes(Array.isArray(docentesRes.data) ? docentesRes.data : docentesRes.data.data || [])
      setMaterias(Array.isArray(materiasRes.data) ? materiasRes.data : Object.values(materiasRes.data) || [])
    } catch (e: any) {
      setError('Error al cargar datos')
      console.error('Error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDocente = async (cod_docente: number) => {
    setSelectedDocente(cod_docente)
    setShowForm(false)
    setEditingId(null)
    setFormData({ sigla_materia: '', horas_asignadas: '30', orden_preferencia: '' })

    try {
      const res = await API.get(`/carga-horaria/docente/${cod_docente}`)
      setDocenteCargas(res.data.cargas || [])
      setTotalHoras(res.data.total_horas || 0)
    } catch (e: any) {
      setError('Error al cargar carga del docente')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDocente || !formData.sigla_materia || !formData.horas_asignadas) {
      setError('Todos los campos son requeridos')
      return
    }

    const payload = {
      cod_docente: selectedDocente,
      sigla_materia: formData.sigla_materia,
      horas_asignadas: parseInt(formData.horas_asignadas),
      orden_preferencia: formData.orden_preferencia ? parseInt(formData.orden_preferencia) : undefined
    }

    try {
      if (editingId) {
        await API.put(`/carga-horaria/${editingId}`, payload)
        setEditingId(null)
      } else {
        await API.post('/carga-horaria', payload)
      }
      
      setFormData({ sigla_materia: '', horas_asignadas: '30', orden_preferencia: '' })
      setShowForm(false)
      
      // Recargar cargas del docente
      if (selectedDocente) {
        handleSelectDocente(selectedDocente)
      }
      fetchData()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar asignación')
    }
  }

  const handleEdit = (carga: CargaHoraria) => {
    setEditingId(carga.id_carga)
    setFormData({
      sigla_materia: carga.sigla_materia,
      horas_asignadas: carga.horas_asignadas.toString(),
      orden_preferencia: carga.orden_preferencia.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta asignación?')) {
      try {
        await API.delete(`/carga-horaria/${id}`)
        if (selectedDocente) {
          handleSelectDocente(selectedDocente)
        }
        fetchData()
      } catch (e: any) {
        setError('Error al eliminar asignación')
      }
    }
  }

  const materiasDisponibles = materias.filter(m => 
    !docenteCargas.some(c => c.sigla_materia === m.sigla)
  )

  const docenteSeleccionado = docentes.find(d => d.cod_docente === selectedDocente)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Asignación de Carga Horaria a Docentes</h1>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
          {/* Panel de Selección de Docente */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Seleccionar Docente</h3>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {loading ? (
                <p>Cargando docentes...</p>
              ) : docentes.length === 0 ? (
                <p>No hay docentes disponibles</p>
              ) : (
                docentes.map(d => (
                  <button
                    key={d.cod_docente}
                    onClick={() => handleSelectDocente(d.cod_docente)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginBottom: '8px',
                      border: selectedDocente === d.cod_docente ? '2px solid #007bff' : '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: selectedDocente === d.cod_docente ? '#e7f3ff' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: selectedDocente === d.cod_docente ? 'bold' : 'normal',
                      color: '#333'
                    }}
                  >
                    {d.usuario?.nombre} {d.usuario?.apellido}
                    <br />
                    <small style={{ color: '#666' }}>
                      {d.especialidad || 'Sin especialidad'}
                    </small>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Panel de Carga Horaria */}
          {selectedDocente && docenteSeleccionado ? (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3>{docenteSeleccionado.usuario?.nombre} {docenteSeleccionado.usuario?.apellido}</h3>
                <p style={{ color: '#666' }}>
                  <strong>Total de horas asignadas:</strong> {totalHoras} horas
                </p>
              </div>

              <button
                onClick={() => {
                  setShowForm(!showForm)
                  setEditingId(null)
                  setFormData({ sigla_materia: '', horas_asignadas: '30', orden_preferencia: '' })
                }}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  fontWeight: 'bold'
                }}
              >
                {showForm ? 'Cancelar' : '+ Agregar Materia'}
              </button>

              {showForm && (
                <form onSubmit={handleSubmit} style={{
                  backgroundColor: '#f9f9f9',
                  padding: '15px',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label><strong>Materia *</strong></label>
                    <select
                      value={formData.sigla_materia}
                      onChange={(e) => setFormData({ ...formData, sigla_materia: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="">Selecciona una materia</option>
                      {materiasDisponibles.map(m => (
                        <option key={m.sigla} value={m.sigla}>
                          {m.sigla} - {m.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label><strong>Horas Asignadas *</strong></label>
                    <input
                      type="number"
                      value={formData.horas_asignadas}
                      onChange={(e) => setFormData({ ...formData, horas_asignadas: e.target.value })}
                      required
                      min="1"
                      max="100"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label><strong>Orden de Preferencia</strong></label>
                    <input
                      type="number"
                      value={formData.orden_preferencia}
                      onChange={(e) => setFormData({ ...formData, orden_preferencia: e.target.value })}
                      min="1"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      placeholder="Ej: 1 (primera prioridad)"
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {editingId ? 'Actualizar' : 'Agregar'}
                  </button>
                </form>
              )}

              <div>
                <h4>Materias Asignadas</h4>
                {docenteCargas.length === 0 ? (
                  <p style={{ color: '#666' }}>No hay materias asignadas</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Materia</th>
                          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Horas</th>
                          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Orden</th>
                          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {docenteCargas.map(carga => (
                          <tr key={carga.id_carga} style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '10px' }}>
                              <strong>{carga.materia?.sigla}</strong>
                              <br />
                              <small style={{ color: '#666' }}>{carga.materia?.nombre}</small>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{carga.horas_asignadas}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{carga.orden_preferencia}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleEdit(carga)}
                                style={{
                                  backgroundColor: '#ffc107',
                                  color: 'white',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  marginRight: '5px',
                                  fontSize: '12px'
                                }}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(carga.id_carga)}
                                style={{
                                  backgroundColor: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
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
          ) : (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
              Selecciona un docente para ver y gestionar su carga horaria
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
