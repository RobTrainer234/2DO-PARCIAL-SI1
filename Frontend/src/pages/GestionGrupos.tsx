import { useState, useEffect } from 'react'
import axios from 'axios'

interface Grupo {
  id: number
  nombre: string
  semestre: number
  estado: string
}

export default function GestionGrupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    semestre: 1
  })
  const [editando, setEditando] = useState<number | null>(null)

  useEffect(() => {
    cargarGrupos()
  }, [])

  const cargarGrupos = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('api_token')
      const response = await axios.get('http://localhost:8000/api/grupos', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setGrupos(response.data?.data || [])
    } catch (err) {
      console.error(err)
      setError('Error al cargar grupos')
    } finally {
      setLoading(false)
    }
  }

  const guardarGrupo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('api_token')
      
      if (editando) {
        await axios.put(`http://localhost:8000/api/grupos/${editando}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      } else {
        await axios.post('http://localhost:8000/api/grupos', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }
      
      setFormData({ nombre: '', semestre: 1 })
      setEditando(null)
      cargarGrupos()
    } catch (err) {
      setError('Error al guardar grupo')
      console.error(err)
    }
  }

  const eliminarGrupo = async (id: number) => {
    if (confirm('¿Eliminar este grupo?')) {
      try {
        const token = localStorage.getItem('api_token')
        await axios.delete(`http://localhost:8000/api/grupos/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        cargarGrupos()
      } catch (err) {
        setError('Error al eliminar')
        console.error(err)
      }
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#333' }}>👥 Gestión de Grupos</h1>

      {error && <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#ffe6e6', borderRadius: '5px', color: '#c41e3a' }}>{error}</div>}

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>
          {editando ? '✏️ Editar Grupo' : '➕ Crear Grupo'}
        </h2>
        <form onSubmit={guardarGrupo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input
            type="text"
            placeholder="Nombre del Grupo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          <select
            value={formData.semestre}
            onChange={(e) => setFormData({ ...formData, semestre: parseInt(e.target.value) })}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={s}>Semestre {s}</option>
            ))}
          </select>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            ✅ Guardar
          </button>
          {editando && (
            <button
              type="button"
              onClick={() => {
                setEditando(null)
                setFormData({ nombre: '', semestre: 1 })
              }}
              style={{ padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              ❌ Cancelar
            </button>
          )}
        </form>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '18px', padding: '20px', margin: 0, borderBottom: '1px solid #eee' }}>
          📋 Grupos Registrados ({grupos.length})
        </h2>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>
        ) : grupos.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay grupos</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Semestre</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Estado</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {grupos.map((grupo) => (
                  <tr key={grupo.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{grupo.id}</td>
                    <td style={{ padding: '12px' }}>{grupo.nombre}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>Sem {grupo.semestre}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#d4edda', color: '#155724', fontSize: '12px' }}>
                        Activo
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditando(grupo.id)
                          setFormData({ nombre: grupo.nombre, semestre: grupo.semestre })
                        }}
                        style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => eliminarGrupo(grupo.id)}
                        style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        🗑️
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
