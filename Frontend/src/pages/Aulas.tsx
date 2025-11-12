import { useEffect, useState } from 'react'
import API from '../services/api'

type Aula = {
  id_infraestructura: number
  nro: string
  piso?: number
  capacidad?: number
  id_tipo?: number
  tipo?: { id_tipo: number; nombre: string }
}

type Tipo = {
  id_tipo: number
  nombre: string
}

export default function Aulas() {
  const [aulas, setAulas] = useState<Aula[]>([])
  const [tipos, setTipos] = useState<Tipo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nro: '',
    piso: '',
    capacidad: '',
    id_tipo: ''
  })
  
  

  const fetchAulas = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/aulas')
      setAulas(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      setError('Error al cargar aulas')
    } finally {
      setLoading(false)
    }
  }

  const fetchTipos = async () => {
    try {
      const res = await API.get('/tipos')
      setTipos(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      console.error('Error cargando tipos:', e)
    }
  }

  useEffect(() => {
    fetchAulas()
    fetchTipos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nro.trim()) {
      setError('Por favor ingresa el número del aula')
      return
    }

    try {
      const submitData: any = {
        nro: formData.nro,
        piso: formData.piso ? parseInt(formData.piso) : null,
        capacidad: formData.capacidad ? parseInt(formData.capacidad) : null,
        id_tipo: formData.id_tipo ? parseInt(formData.id_tipo) : null
      }

      if (editingId) {
        // Editar aula
        await API.put(`/aulas/${editingId}`, submitData)
      } else {
        // CU9: Registrar nueva aula
        await API.post('/aulas', submitData)
      }
      fetchAulas()
      resetForm()
      setError(null)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar aula')
    }
  }

  const handleEdit = (aula: Aula) => {
    setEditingId(aula.id_infraestructura)
    setFormData({
      nro: aula.nro,
      piso: aula.piso?.toString() || '',
      capacidad: aula.capacidad?.toString() || '',
      id_tipo: aula.id_tipo?.toString() || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta aula?')) return

    try {
      await API.delete(`/aulas/${id}`)
      fetchAulas()
    } catch (e: any) {
      setError('Error al eliminar aula')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      nro: '',
      piso: '',
      capacidad: '',
      id_tipo: ''
    })
  }



  const filteredAulas = aulas.filter(a =>
    a.nro.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>Gestión de Aulas</h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Registra y administra todas las aulas e infraestructura</p>

        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '500',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '24px'
            }}
          >
            + Registrar Aula
          </button>
        )}

        {showForm && (
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111', marginBottom: '16px' }}>
              {editingId ? 'Editar Aula' : 'Registrar Nueva Aula'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={formData.nro}
                  onChange={(e) => setFormData({ ...formData, nro: e.target.value })}
                  placeholder="Número del aula (ej: 101, 202) *"
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit'
                  }}
                />
                <input
                  type="number"
                  value={formData.piso}
                  onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
                  placeholder="Piso"
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <input
                  type="number"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                  placeholder="Capacidad (cantidad de personas)"
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit'
                  }}
                />
                <select
                  value={formData.id_tipo}
                  onChange={(e) => setFormData({ ...formData, id_tipo: e.target.value })}
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="">Selecciona tipo de aula</option>
                  {tipos.map(t => (
                    <option key={t.id_tipo} value={t.id_tipo}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  marginBottom: '16px'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {editingId ? 'Actualizar' : 'Registrar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    background: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Buscar por número de aula..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '13px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '13px', color: '#666' }}>⏳ Cargando aulas...</p>
          </div>
        )}

        {!loading && aulas.length === 0 && (
          <div style={{
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#666' }}>No hay aulas registradas en el sistema</p>
          </div>
        )}

        {!loading && filteredAulas.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Número</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Piso</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Capacidad</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Tipo</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600', color: '#374151' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAulas.map((aula, idx) => (
                  <tr key={aula.id_infraestructura} style={{ borderBottom: idx < filteredAulas.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '12px', color: '#111', fontWeight: '500' }}>
                      {aula.nro}
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '11px' }}>
                      {aula.piso || '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '11px' }}>
                      {aula.capacidad || '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '11px' }}>
                      {aula.tipo?.nombre || '—'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(aula)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          marginRight: '4px'
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(aula.id_infraestructura)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
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
