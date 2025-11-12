import { useEffect, useState } from 'react'
import API from '../services/api'

type Usuario = {
  id: number
  nombre: string
  apellido: string
  correo: string
  ci: string
  telefono?: string
  sexo?: string
  direccion?: string
  activo?: boolean
  roles?: { id_rol: number; nombre: string }[]
}

type Role = {
  id_rol: number
  nombre: string
}

export default function Users() {
  const [users, setUsers] = useState<Usuario[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    ci: '',
    password: '',
    telefono: '',
    sexo: 'M',
    direccion: ''
  })
  
  

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/usuarios')
      setUsers(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      setError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await API.get('/roles')
      setRoles(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      console.error('Error cargando roles:', e)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.correo.trim() || !formData.ci.trim()) {
      setError('Por favor completa los campos requeridos')
      return
    }

    try {
      if (editingId) {
        await API.put(`/usuarios/${editingId}`, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          sexo: formData.sexo,
          direccion: formData.direccion
        })
        if (selectedRoles.length > 0) {
          await API.post(`/usuarios/${editingId}/roles`, { roles: selectedRoles })
        }
      } else {
        const newUser = await API.post('/usuarios', formData)
        if (selectedRoles.length > 0) {
          await API.post(`/usuarios/${newUser.data.id}/roles`, { roles: selectedRoles })
        }
      }
      fetchUsers()
      resetForm()
      setError(null)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar usuario')
    }
  }

  const handleEdit = (user: Usuario) => {
    setEditingId(user.id)
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      ci: user.ci,
      password: '',
      telefono: user.telefono || '',
      sexo: user.sexo || 'M',
      direccion: user.direccion || ''
    })
    setSelectedRoles(user.roles?.map(r => r.id_rol) || [])
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return

    try {
      await API.delete(`/usuarios/${id}`)
      fetchUsers()
    } catch (e: any) {
      setError('Error al eliminar usuario')
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
      direccion: ''
    })
    setSelectedRoles([])
  }

  const filteredUsers = users.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.correo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>Gestión de Usuarios</h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Administra todos los usuarios del sistema</p>

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
            + Crear Usuario
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
              {editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h3>

            <form onSubmit={handleSubmit}>
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Roles
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                  {roles.map(r => (
                    <label key={r.id_rol} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(r.id_rol)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoles([...selectedRoles, r.id_rol])
                          } else {
                            setSelectedRoles(selectedRoles.filter(id => id !== r.id_rol))
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '13px', color: '#374151' }}>{r.nombre}</span>
                    </label>
                  ))}
                </div>
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
                  {editingId ? 'Actualizar' : 'Crear'}
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
            placeholder="Buscar por nombre, apellido o correo..."
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
            <p style={{ fontSize: '13px', color: '#666' }}>⏳ Cargando usuarios...</p>
          </div>
        )}

        {!loading && users.length === 0 && (
          <div style={{
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#666' }}>No hay usuarios en el sistema</p>
          </div>
        )}

        {!loading && filteredUsers.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Correo</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>CI</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Roles</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600', color: '#374151' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} style={{ borderBottom: idx < filteredUsers.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '12px', color: '#111', fontWeight: '500' }}>{user.nombre} {user.apellido}</td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '11px' }}>{user.correo}</td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '11px' }}>{user.ci}</td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '11px' }}>
                      {user.roles?.length ? user.roles.map(r => r.nombre).join(', ') : 'Sin roles'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(user)}
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
                        onClick={() => handleDelete(user.id)}
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
