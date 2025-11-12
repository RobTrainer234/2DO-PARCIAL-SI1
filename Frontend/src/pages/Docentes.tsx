import { useEffect, useState } from 'react'
import API from '../services/api'
import ImportarDocentesExcel from '../components/ImportarDocentesExcel'

type Docente = {
  id: number
  usuario_id: number
  especialidad: string
  fecha_contrato: string
  usuario?: {
    id: number
    nombre: string
    apellido: string
    correo: string
    ci: string
    telefono?: string
    sexo?: string
    direccion?: string
  }
}

export default function Docentes() {
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showImportarExcel, setShowImportarExcel] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    ci: '',
    password: '',
    telefono: '',
    sexo: 'M',
    direccion: '',
    especialidad: '',
    fecha_contrato: ''
  })

  const fetchDocentes = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/docentes')
      setDocentes(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      setError('Error al cargar docentes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocentes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.correo.trim() || 
        !formData.ci.trim() || !formData.especialidad.trim() || !formData.fecha_contrato) {
      setError('Por favor completa todos los campos requeridos')
      return
    }

    try {
      if (editingId) {
        // CU5: Editar docente - solo los campos del docente
        await API.put(`/docentes/${editingId}`, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          sexo: formData.sexo,
          direccion: formData.direccion,
          especialidad: formData.especialidad,
          fecha_contrato: formData.fecha_contrato
        })
      } else {
        // CU4: Registrar nuevo docente - crea usuario + docente
        await API.post('/docentes', {
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          ci: formData.ci,
          password: formData.password,
          telefono: formData.telefono,
          sexo: formData.sexo,
          direccion: formData.direccion,
          especialidad: formData.especialidad,
          fecha_contrato: formData.fecha_contrato
        })
      }
      fetchDocentes()
      resetForm()
      setError(null)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar docente')
    }
  }

  const handleEdit = (docente: Docente) => {
    setEditingId(docente.id)
    setFormData({
      nombre: docente.usuario?.nombre || '',
      apellido: docente.usuario?.apellido || '',
      correo: docente.usuario?.correo || '',
      ci: docente.usuario?.ci || '',
      password: '',
      telefono: docente.usuario?.telefono || '',
      sexo: docente.usuario?.sexo || 'M',
      direccion: docente.usuario?.direccion || '',
      especialidad: docente.especialidad,
      fecha_contrato: docente.fecha_contrato
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este docente? También se eliminará su usuario.')) return

    try {
      await API.delete(`/docentes/${id}`)
      fetchDocentes()
    } catch (e: any) {
      setError('Error al eliminar docente')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      ci: '',
      password: '',
      telefono: '',
      sexo: 'M',
      direccion: '',
      especialidad: '',
      fecha_contrato: ''
    })
  }

  const filteredDocentes = docentes.filter(d =>
    (d.usuario?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.usuario?.apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.usuario?.correo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>Gestión de Docentes</h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Registra y administra docentes del sistema</p>

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
              marginBottom: '24px',
              marginRight: '12px'
            }}
          >
            + Registrar Docente
          </button>
        )}

        {!showForm && (
          <button
            onClick={() => setShowImportarExcel(!showImportarExcel)}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '500',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '24px'
            }}
          >
            📥 Importar desde Excel
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
              {editingId ? 'Editar Docente' : 'Registrar Nuevo Docente'}
            </h3>

            <form onSubmit={handleSubmit}>
              <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginTop: '16px', marginBottom: '12px' }}>
                Datos Personales
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre *"
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit'
                  }}
                />
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  placeholder="Apellido *"
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
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  placeholder="Correo *"
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
                  value={formData.ci}
                  onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                  placeholder="CI *"
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
              </div>

              {!editingId && (
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Contraseña *"
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
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Teléfono"
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit'
                  }}
                />
                <select
                  value={formData.sexo}
                  onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Dirección"
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginTop: '16px', marginBottom: '12px' }}>
                Datos Docentes
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  placeholder="Especialidad *"
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit'
                  }}
                />
                <input
                  type="date"
                  value={formData.fecha_contrato}
                  onChange={(e) => setFormData({ ...formData, fecha_contrato: e.target.value })}
                  placeholder="Fecha de Contrato *"
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

        {showImportarExcel && (
          <div style={{ marginBottom: '24px' }}>
            <ImportarDocentesExcel />
            <button
              onClick={() => { 
                setShowImportarExcel(false)
                fetchDocentes()
              }}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: '500',
                background: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Cerrar Importación
            </button>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o especialidad..."
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
            <p style={{ fontSize: '13px', color: '#666' }}>⏳ Cargando docentes...</p>
          </div>
        )}

        {!loading && docentes.length === 0 && (
          <div style={{
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#666' }}>No hay docentes registrados en el sistema</p>
          </div>
        )}

        {!loading && filteredDocentes.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Correo</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>CI</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Especialidad</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>F. Contrato</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600', color: '#374151' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocentes.map((docente, idx) => (
                  <tr key={docente.id} style={{ borderBottom: idx < filteredDocentes.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '12px', color: '#111', fontWeight: '500' }}>
                      {docente.usuario?.nombre} {docente.usuario?.apellido}
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '11px' }}>
                      {docente.usuario?.correo}
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '11px' }}>
                      {docente.usuario?.ci}
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '11px' }}>
                      {docente.especialidad}
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '11px' }}>
                      {new Date(docente.fecha_contrato).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(docente)}
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
                        onClick={() => handleDelete(docente.id)}
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
