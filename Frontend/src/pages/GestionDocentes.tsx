import { useState, useEffect } from 'react'
import axios from 'axios'

interface Docente {
  cod_docente: string
  nombre: string
  email: string
  telefono: string
}

export default function GestionDocentes() {
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    cod_docente: '',
    nombre: '',
    email: '',
    telefono: ''
  })
  const [editando, setEditando] = useState<string | null>(null)

  useEffect(() => {
    cargarDocentes()
  }, [])

  const cargarDocentes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('api_token')
      const response = await axios.get('http://localhost:8000/api/docentes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setDocentes(response.data?.data || [])
    } catch (err) {
      console.error(err)
      setError('Error al cargar docentes')
    } finally {
      setLoading(false)
    }
  }

  const guardarDocente = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('api_token')
      
      if (editando) {
        await axios.put(`http://localhost:8000/api/docentes/${editando}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      } else {
        await axios.post('http://localhost:8000/api/docentes', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }
      
      setFormData({ cod_docente: '', nombre: '', email: '', telefono: '' })
      setEditando(null)
      cargarDocentes()
    } catch (err) {
      setError('Error al guardar docente')
      console.error(err)
    }
  }

  const eliminarDocente = async (cod: string) => {
    if (confirm('¿Eliminar este docente?')) {
      try {
        const token = localStorage.getItem('api_token')
        await axios.delete(`http://localhost:8000/api/docentes/${cod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        cargarDocentes()
      } catch (err) {
        setError('Error al eliminar')
        console.error(err)
      }
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#333' }}>👨‍🏫 Gestión de Docentes</h1>

      {error && <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#ffe6e6', borderRadius: '5px', color: '#c41e3a' }}>{error}</div>}

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>
          {editando ? '✏️ Editar Docente' : '➕ Registrar Docente'}
        </h2>
        <form onSubmit={guardarDocente} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input
            type="text"
            placeholder="Código Docente"
            value={formData.cod_docente}
            onChange={(e) => setFormData({ ...formData, cod_docente: e.target.value })}
            disabled={!!editando}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          <input
            type="text"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            ✅ Guardar
          </button>
          {editando && (
            <button
              type="button"
              onClick={() => {
                setEditando(null)
                setFormData({ cod_docente: '', nombre: '', email: '', telefono: '' })
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
          📋 Docentes Registrados ({docentes.length})
        </h2>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>
        ) : docentes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay docentes</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Código</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Teléfono</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docentes.map((docente) => (
                  <tr key={docente.cod_docente} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{docente.cod_docente}</td>
                    <td style={{ padding: '12px' }}>{docente.nombre}</td>
                    <td style={{ padding: '12px' }}>{docente.email}</td>
                    <td style={{ padding: '12px' }}>{docente.telefono}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditando(docente.cod_docente)
                          setFormData(docente)
                        }}
                        style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => eliminarDocente(docente.cod_docente)}
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
