import { useEffect, useState } from 'react'
import API from '../services/api'

type Grupo = {
  id_grupo: number
  nombre: string
}

export default function Grupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nombre: ''
  })
  
  

  const fetchGrupos = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/grupos')
      setGrupos(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      setError('Error al cargar grupos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrupos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      setError('Por favor ingresa el nombre del grupo')
      return
    }

    try {
      if (editingId) {
        // CU8: Editar grupo
        await API.put(`/grupos/${editingId}`, formData)
      } else {
        // CU7: Registrar nuevo grupo
        await API.post('/grupos', formData)
      }
      fetchGrupos()
      resetForm()
      setError(null)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar grupo')
    }
  }

  const handleEdit = (grupo: Grupo) => {
    setEditingId(grupo.id_grupo)
    setFormData({
      nombre: grupo.nombre
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este grupo?')) return

    try {
      await API.delete(`/grupos/${id}`)
      fetchGrupos()
    } catch (e: any) {
      setError('Error al eliminar grupo')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      nombre: ''
    })
  }



  const filteredGrupos = grupos.filter(g =>
    g.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>Gestión de Grupos</h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Registra y administra los grupos de estudiantes</p>

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
            + Registrar Grupo
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
              {editingId ? 'Editar Grupo' : 'Registrar Nuevo Grupo'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del grupo (ej: 1-A, 2-B, 3-C) *"
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
            placeholder="Buscar por nombre..."
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
            <p style={{ fontSize: '13px', color: '#666' }}>⏳ Cargando grupos...</p>
          </div>
        )}

        {!loading && grupos.length === 0 && (
          <div style={{
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#666' }}>No hay grupos registrados en el sistema</p>
          </div>
        )}

        {!loading && filteredGrupos.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Nombre</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600', color: '#374151' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrupos.map((grupo, idx) => (
                  <tr key={grupo.id_grupo} style={{ borderBottom: idx < filteredGrupos.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '12px', color: '#2563eb', fontWeight: '500' }}>
                      #{grupo.id_grupo}
                    </td>
                    <td style={{ padding: '12px', color: '#111', fontWeight: '500' }}>
                      {grupo.nombre}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(grupo)}
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
                        onClick={() => handleDelete(grupo.id_grupo)}
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
