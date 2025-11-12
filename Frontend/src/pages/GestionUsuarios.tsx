import { useState, useEffect } from 'react'
import axios from 'axios'

interface Usuario {
  id: number
  nombre: string
  email: string
  estado: 'activo' | 'inactivo'
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' })
  const [editando, setEditando] = useState<number | null>(null)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('api_token')
      const response = await axios.get('http://localhost:8000/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      const datos = response.data?.data || response.data || []
      setUsuarios(Array.isArray(datos) ? datos : [])
    } catch (err) {
      console.error('Error:', err)
      setError('No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('api_token')
      
      if (editando) {
        await axios.put(`http://localhost:8000/api/usuarios/${editando}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        setEditando(null)
      } else {
        await axios.post('http://localhost:8000/api/usuarios', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }
      
      setFormData({ nombre: '', email: '', password: '' })
      cargarUsuarios()
    } catch (err) {
      setError('Error al guardar usuario')
      console.error(err)
    }
  }

  const eliminarUsuario = async (id: number) => {
    if (confirm('¿Eliminar este usuario?')) {
      try {
        const token = localStorage.getItem('api_token')
        await axios.delete(`http://localhost:8000/api/usuarios/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        cargarUsuarios()
      } catch (err) {
        setError('Error al eliminar usuario')
        console.error(err)
      }
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#333' }}>👤 Gestión de Usuarios</h1>

      {error && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ffcccc',
          borderRadius: '5px',
          color: '#c41e3a'
        }}>
          {error}
        </div>
      )}

      {/* Formulario */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '15px' }}>
          {editando ? '✏️ Editar Usuario' : '➕ Crear Usuario'}
        </h2>
        <form onSubmit={crearUsuario} style={{ display: 'grid', gap: '15px' }}>
          <input
            type="text"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editando}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {editando ? '💾 Actualizar' : '✅ Crear'}
            </button>
            {editando && (
              <button
                type="button"
                onClick={() => {
                  setEditando(null)
                  setFormData({ nombre: '', email: '', password: '' })
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ❌ Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de usuarios */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '18px', color: '#333', padding: '20px', margin: 0, borderBottom: '1px solid #eee' }}>
          📋 Lista de Usuarios ({usuarios.length})
        </h2>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            Cargando usuarios...
          </div>
        ) : usuarios.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            No hay usuarios registrados
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Nombre</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    style={{
                      borderBottom: '1px solid #eee',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={{ padding: '12px', fontSize: '14px' }}>{usuario.id}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{usuario.nombre}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{usuario.email}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        backgroundColor: usuario.estado === 'activo' ? '#d4edda' : '#f8d7da',
                        color: usuario.estado === 'activo' ? '#155724' : '#856404',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                      <button
                        onClick={() => {
                          setEditando(usuario.id)
                          setFormData({ nombre: usuario.nombre, email: usuario.email, password: '' })
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '5px',
                          fontSize: '12px'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => eliminarUsuario(usuario.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Eliminar
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
