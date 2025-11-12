import { useEffect, useState } from 'react'
import API from '../services/api'

type Materia = {
  sigla: string
  nombre: string
}

export default function Materias() {
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    sigla: '',
    nombre: ''
  })

  const fetchMaterias = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/materias')
      setMaterias(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      setError('Error al cargar materias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterias()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.sigla.trim() || !formData.nombre.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    try {
      if (editingId) {
        // CU6: Editar materia - solo el nombre
        await API.put(`/materias/${editingId}`, {
          nombre: formData.nombre
        })
      } else {
        // CU6: Registrar nueva materia
        await API.post('/materias', formData)
      }
      fetchMaterias()
      resetForm()
      setError(null)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar materia')
    }
  }

  const handleEdit = (materia: Materia) => {
    setEditingId(materia.sigla)
    setFormData({
      sigla: materia.sigla,
      nombre: materia.nombre
    })
    setShowForm(true)
  }

  const handleDelete = async (sigla: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta materia?')) return

    try {
      await API.delete(`/materias/${sigla}`)
      fetchMaterias()
    } catch (e: any) {
      setError('Error al eliminar materia')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      sigla: '',
      nombre: ''
    })
  }

  const filteredMaterias = materias.filter(m =>
    m.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>Gestión de Materias</h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Registra y administra todas las materias del sistema</p>

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
            + Registrar Materia
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
              {editingId ? 'Editar Materia' : 'Registrar Nueva Materia'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                  placeholder="Sigla (ej: MAT101) *"
                  disabled={!!editingId}
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                    background: editingId ? '#f3f4f6' : '#fff'
                  }}
                />
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre de la materia *"
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
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
            placeholder="Buscar por sigla o nombre..."
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
            <p style={{ fontSize: '13px', color: '#666' }}>⏳ Cargando materias...</p>
          </div>
        )}

        {!loading && materias.length === 0 && (
          <div style={{
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#666' }}>No hay materias registradas en el sistema</p>
          </div>
        )}

        {!loading && filteredMaterias.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Sigla</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Nombre</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600', color: '#374151' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterias.map((materia, idx) => (
                  <tr key={materia.sigla} style={{ borderBottom: idx < filteredMaterias.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '12px', color: '#2563eb', fontWeight: '500', fontFamily: 'monospace' }}>
                      {materia.sigla}
                    </td>
                    <td style={{ padding: '12px', color: '#111', fontWeight: '500' }}>
                      {materia.nombre}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(materia)}
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
                        onClick={() => handleDelete(materia.sigla)}
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
