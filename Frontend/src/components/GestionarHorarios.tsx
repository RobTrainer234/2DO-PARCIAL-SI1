import { useEffect, useState } from 'react'
import API from '../services/api'

type CargaHoraria = {
  id_carga: number
  sigla_materia: string
  horas_asignadas: number
}

type Horario = {
  id_horario: number
  dia_semana: string
  hora_inicio: string
  hora_fin: string
  aula_id?: number
  aula?: string
  activo: boolean
}

type Docente = {
  cod_docente: number
  nombre: string
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function GestionarHorarios() {
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [selectedDocente, setSelectedDocente] = useState<number | null>(null)
  const [cargas, setCargas] = useState<CargaHoraria[]>([])
  const [selectedCarga, setSelectedCarga] = useState<number | null>(null)
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    dia_semana: 'Lunes',
    hora_inicio: '09:00',
    hora_fin: '11:00',
    aula: '',
  })

  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchDocentes()
  }, [])

  useEffect(() => {
    if (selectedDocente) {
      fetchCargasDocente()
      setSelectedCarga(null)
      setHorarios([])
    }
  }, [selectedDocente])

  useEffect(() => {
    if (selectedCarga) {
      fetchHorarios()
    }
  }, [selectedCarga])

  const fetchDocentes = async () => {
    try {
      const res = await API.get('/docentes')
      const docentes = Array.isArray(res.data) ? res.data : res.data.data || []
      setDocentes(docentes)
    } catch (e: any) {
      console.error('Error:', e)
      setError('Error al cargar docentes')
    }
  }

  const fetchCargasDocente = async () => {
    if (!selectedDocente) return
    setLoading(true)
    try {
      const res = await API.get(`/carga-horaria/docente/${selectedDocente}`)
      setCargas(res.data.cargas || [])
      setError(null)
    } catch (e: any) {
      console.error('Error:', e)
      setError('Error al cargar carga horaria')
      setCargas([])
    } finally {
      setLoading(false)
    }
  }

  const fetchHorarios = async () => {
    if (!selectedCarga) return
    setLoading(true)
    try {
      const res = await API.get(`/carga-horaria/${selectedCarga}`)
      setHorarios(res.data.horarios || [])
      setError(null)
    } catch (e: any) {
      console.error('Error:', e)
      setError('Error al cargar horarios')
      setHorarios([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddHorario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCarga) return

    setLoading(true)
    try {
      // Validar que hora_inicio < hora_fin
      if (formData.hora_inicio >= formData.hora_fin) {
        setError('La hora de inicio debe ser anterior a la de fin')
        setLoading(false)
        return
      }

      if (editingId) {
        await API.put(`/carga-horaria/${selectedCarga}/horarios/${editingId}`, {
          dia_semana: formData.dia_semana,
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin,
          aula_id: formData.aula || null,
        })
        setEditingId(null)
      } else {
        await API.post(`/carga-horaria/${selectedCarga}/horarios`, {
          dia_semana: formData.dia_semana,
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin,
          aula_id: formData.aula || null,
        })
      }

      setFormData({
        dia_semana: 'Lunes',
        hora_inicio: '09:00',
        hora_fin: '11:00',
        aula: '',
      })

      fetchHorarios()
      setError(null)
    } catch (e: any) {
      console.error('Error:', e)
      setError(e.response?.data?.message || 'Error al guardar horario')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHorario = async (idHorario: number) => {
    if (!selectedCarga) return
    if (!window.confirm('¿Eliminar este horario?')) return

    setLoading(true)
    try {
      await API.delete(`/carga-horaria/${selectedCarga}/horarios/${idHorario}`)
      fetchHorarios()
      setError(null)
    } catch (e: any) {
      console.error('Error:', e)
      setError('Error al eliminar horario')
    } finally {
      setLoading(false)
    }
  }

  const handleEditHorario = (horario: Horario) => {
    setFormData({
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      aula: horario.aula || '',
    })
    setEditingId(horario.id_horario)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Gestionar Horarios Disponibles</h1>

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

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px' }}>
          {/* Panel Lateral - Docentes */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            height: 'fit-content'
          }}>
            <h3>Docentes</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {docentes.length === 0 ? (
                <p style={{ color: '#666' }}>No hay docentes</p>
              ) : (
                docentes.map(docente => (
                  <button
                    key={docente.cod_docente}
                    onClick={() => setSelectedDocente(docente.cod_docente)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '8px',
                      border: selectedDocente === docente.cod_docente ? '2px solid #007bff' : '1px solid #ddd',
                      backgroundColor: selectedDocente === docente.cod_docente ? '#e7f3ff' : '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {docente.nombre}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Panel Principal */}
          <div>
            {selectedDocente ? (
              <>
                {/* Seleccionar Materia */}
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3>Seleccionar Materia</h3>
                  {loading && <p>Cargando materias...</p>}
                  {cargas.length === 0 ? (
                    <p style={{ color: '#666' }}>Este docente no tiene materias asignadas</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                      {cargas.map(carga => (
                        <button
                          key={carga.id_carga}
                          onClick={() => setSelectedCarga(carga.id_carga)}
                          style={{
                            padding: '15px',
                            border: selectedCarga === carga.id_carga ? '2px solid #28a745' : '1px solid #ddd',
                            backgroundColor: selectedCarga === carga.id_carga ? '#d4edda' : '#fff',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                        >
                          <strong>{carga.sigla_materia}</strong>
                          <br />
                          <small>{carga.horas_asignadas} horas/mes</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Agregar/Editar Horario */}
                {selectedCarga && (
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <h3>{editingId ? 'Editar Horario' : 'Agregar Nuevo Horario'}</h3>
                    <form onSubmit={handleAddHorario}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Día de la Semana
                          </label>
                          <select
                            value={formData.dia_semana}
                            onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          >
                            {DIAS_SEMANA.map(dia => (
                              <option key={dia} value={dia}>{dia}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Aula
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: A101, Lab 2"
                            value={formData.aula}
                            onChange={(e) => setFormData({ ...formData, aula: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Hora Inicio
                          </label>
                          <input
                            type="time"
                            value={formData.hora_inicio}
                            onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Hora Fin
                          </label>
                          <input
                            type="time"
                            value={formData.hora_fin}
                            onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="submit"
                          disabled={loading}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                          }}
                        >
                          {editingId ? 'Actualizar' : 'Agregar'} Horario
                        </button>
                        {editingId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null)
                              setFormData({
                                dia_semana: 'Lunes',
                                hora_inicio: '09:00',
                                hora_fin: '11:00',
                                aula: '',
                              })
                            }}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {/* Tabla de Horarios */}
                {selectedCarga && (
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <h3>Horarios Programados</h3>
                    {loading && <p>Cargando horarios...</p>}
                    {horarios.length === 0 ? (
                      <p style={{ color: '#666' }}>Sin horarios registrados para esta materia</p>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Día</th>
                              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Inicio</th>
                              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Fin</th>
                              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Aula</th>
                              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {horarios.map(horario => (
                              <tr key={horario.id_horario} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={{ padding: '12px' }}>{horario.dia_semana}</td>
                                <td style={{ padding: '12px' }}>{horario.hora_inicio}</td>
                                <td style={{ padding: '12px' }}>{horario.hora_fin}</td>
                                <td style={{ padding: '12px' }}>{horario.aula || '-'}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                  <button
                                    onClick={() => handleEditHorario(horario)}
                                    style={{
                                      padding: '6px 12px',
                                      marginRight: '8px',
                                      backgroundColor: '#ffc107',
                                      color: '#000',
                                      border: 'none',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      fontSize: '13px'
                                    }}
                                  >
                                    ✎ Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteHorario(horario.id_horario)}
                                    disabled={loading}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: '#dc3545',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      cursor: loading ? 'not-allowed' : 'pointer',
                                      fontSize: '13px',
                                      opacity: loading ? 0.6 : 1
                                    }}
                                  >
                                    🗑 Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <p style={{ fontSize: '18px', color: '#666' }}>
                  Selecciona un docente para comenzar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
