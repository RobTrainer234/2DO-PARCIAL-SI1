import { useState, useEffect } from 'react'
import axios from 'axios'

interface Aula {
  id: number
  nombre: string
  tipo_id: number
  capacidad: number
  piso: number
}

interface Tipo {
  id: number
  nombre: string
}

export default function GestionAulas() {
  const [aulas, setAulas] = useState<Aula[]>([])
  const [tipos, setTipos] = useState<Tipo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    tipo_id: 1,
    capacidad: 30,
    piso: 1
  })
  const [editando, setEditando] = useState<number | null>(null)

  useEffect(() => {
    cargarAulas()
    cargarTipos()
  }, [])

  const cargarAulas = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('api_token')
      const response = await axios.get('http://localhost:8000/api/aulas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setAulas(response.data?.data || [])
    } catch (err) {
      console.error(err)
      setError('Error al cargar aulas')
    } finally {
      setLoading(false)
    }
  }

  const cargarTipos = async () => {
    try {
      const token = localStorage.getItem('api_token')
      const response = await axios.get('http://localhost:8000/api/tipos', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setTipos(response.data?.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const guardarAula = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('api_token')
      
      if (editando) {
        await axios.put(`http://localhost:8000/api/aulas/${editando}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      } else {
        await axios.post('http://localhost:8000/api/aulas', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }
      
      setFormData({ nombre: '', tipo_id: 1, capacidad: 30, piso: 1 })
      setEditando(null)
      cargarAulas()
    } catch (err) {
      setError('Error al guardar aula')
      console.error(err)
    }
  }

  const eliminarAula = async (id: number) => {
    if (confirm('¿Eliminar esta aula?')) {
      try {
        const token = localStorage.getItem('api_token')
        await axios.delete(`http://localhost:8000/api/aulas/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        cargarAulas()
      } catch (err) {
        setError('Error al eliminar')
        console.error(err)
      }
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#333' }}>🏛️ Gestión de Aulas</h1>

      {error && <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#ffe6e6', borderRadius: '5px', color: '#c41e3a' }}>{error}</div>}

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>
          {editando ? '✏️ Editar Aula' : '➕ Registrar Aula'}
        </h2>
        <form onSubmit={guardarAula} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input
            type="text"
            placeholder="Nombre del Aula"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          <select
            value={formData.tipo_id}
            onChange={(e) => setFormData({ ...formData, tipo_id: parseInt(e.target.value) })}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          >
            {tipos.map(tipo => (
              <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Capacidad"
            value={formData.capacidad}
            onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          <input
            type="number"
            placeholder="Piso"
            value={formData.piso}
            onChange={(e) => setFormData({ ...formData, piso: parseInt(e.target.value) })}
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
                setFormData({ nombre: '', tipo_id: 1, capacidad: 30, piso: 1 })
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
          📋 Aulas Registradas ({aulas.length})
        </h2>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>
        ) : aulas.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay aulas</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Tipo</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Capacidad</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Piso</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aulas.map((aula) => (
                  <tr key={aula.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{aula.id}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{aula.nombre}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>Tipo {aula.tipo_id}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{aula.capacidad} personas</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{aula.piso}°</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditando(aula.id)
                          setFormData({
                            nombre: aula.nombre,
                            tipo_id: aula.tipo_id,
                            capacidad: aula.capacidad,
                            piso: aula.piso
                          })
                        }}
                        style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => eliminarAula(aula.id)}
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
