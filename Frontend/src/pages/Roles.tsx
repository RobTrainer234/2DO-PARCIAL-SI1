import { useEffect, useState } from 'react'
import API from '../services/api'

type Role = {
  id_rol: number
  nombre: string
  permisos?: { id_permiso: number; nombre: string }[]
}

type Permiso = {
  id_permiso: number
  nombre: string
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ nombre: '' })
  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([])
  
  

  const fetchRoles = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/roles')
      setRoles(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      setError('Error al cargar roles')
    } finally {
      setLoading(false)
    }
  }

  const fetchPermisos = async () => {
    try {
      const res = await API.get('/permisos')
      setPermisos(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      console.error('Error cargando permisos:', e)
    }
  }

  useEffect(() => {
    fetchRoles()
    fetchPermisos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      setError('El nombre del rol es requerido')
      return
    }

    try {
      if (editingId) {
        await API.put(`/roles/${editingId}`, {
          nombre: formData.nombre,
          permisos: selectedPermisos
        })
      } else {
        const newRole = await API.post('/roles', { nombre: formData.nombre })
        if (selectedPermisos.length > 0) {
          await API.put(`/roles/${newRole.data.id_rol}`, {
            nombre: formData.nombre,
            permisos: selectedPermisos
          })
        }
      }
      fetchRoles()
      setFormData({ nombre: '' })
      setSelectedPermisos([])
      setEditingId(null)
      setShowForm(false)
      setError(null)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar rol')
    }
  }

  const handleEdit = (role: Role) => {
    setEditingId(role.id_rol)
    setFormData({ nombre: role.nombre })
    setSelectedPermisos(role.permisos?.map(p => p.id_permiso) || [])
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) return

    try {
      await API.delete(`/roles/${id}`)
      fetchRoles()
    } catch (e: any) {
      setError('Error al eliminar rol')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ nombre: '' })
    setSelectedPermisos([])
    setError(null)
  }

  const filteredRoles = roles.filter(r =>
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ background: '#fff' }}>
      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>Gestión de Roles</h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Administra los roles y permisos del sistema</p>
        </div>

        {/* Botón Crear */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
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
            + Crear Rol
          </button>
        )}

        {/* Formulario */}
        {showForm && (
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111', marginBottom: '16px' }}>
              {editingId ? 'Editar Rol' : 'Crear Nuevo Rol'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Nombre */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Nombre del Rol
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Administrador, Docente, Estudiante"
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

              {/* Permisos */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Permisos
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {permisos.map(p => (
                    <label key={p.id_permiso} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedPermisos.includes(p.id_permiso)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermisos([...selectedPermisos, p.id_permiso])
                          } else {
                            setSelectedPermisos(selectedPermisos.filter(id => id !== p.id_permiso))
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '13px', color: '#374151' }}>{p.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Error */}
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

              {/* Botones */}
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
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
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

        {/* Search */}
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

        {/* Error */}
        {error && !showForm && (
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

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '13px', color: '#666' }}>⏳ Cargando roles...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && roles.length === 0 && (
          <div style={{
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#666' }}>No hay roles en el sistema</p>
          </div>
        )}

        {/* Tabla */}
        {!loading && filteredRoles.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Permisos</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role, idx) => (
                  <tr key={role.id_rol} style={{ borderBottom: idx < filteredRoles.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '12px 16px', color: '#2563eb', fontWeight: '500' }}>#{role.id_rol}</td>
                    <td style={{ padding: '12px 16px', color: '#111', fontWeight: '500' }}>{role.nombre}</td>
                    <td style={{ padding: '12px 16px', color: '#666', fontSize: '12px' }}>
                      {role.permisos?.length ? `${role.permisos.length} permiso(s)` : 'Sin permisos'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(role)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '8px'
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(role.id_rol)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
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
            <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '8px 16px', fontSize: '12px', color: '#666' }}>
              Mostrando {filteredRoles.length} de {roles.length} roles
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
