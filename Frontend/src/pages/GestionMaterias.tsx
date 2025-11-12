import { useState, useEffect } from 'react'
import axios from 'axios'

interface Materia {
  sigla: string
  nombre: string
  semestre: number
  horas_teoria: number
  horas_practica: number
}

export default function GestionMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    sigla: '',
    nombre: '',
    semestre: 1,
    horas_teoria: 0,
    horas_practica: 0
  })
  const [editando, setEditando] = useState<string | null>(null)

  useEffect(() => {
    cargarMaterias()
  }, [])

  const cargarMaterias = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('api_token')
      const response = await axios.get('http://localhost:8000/api/materias', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setMaterias(response.data?.data || [])
    } catch (err) {
      console.error(err)
      setError('Error al cargar materias')
    } finally {
      setLoading(false)
    }
  }

  const guardarMateria = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('api_token')
      
      if (editando) {
        await axios.put(`http://localhost:8000/api/materias/${editando}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      } else {
        await axios.post('http://localhost:8000/api/materias', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }
      
      setFormData({ sigla: '', nombre: '', semestre: 1, horas_teoria: 0, horas_practica: 0 })
      setEditando(null)
      cargarMaterias()
    } catch (err) {
      setError('Error al guardar materia')
      console.error(err)
    }
  }

  const eliminarMateria = async (sigla: string) => {
    if (confirm('¿Eliminar esta materia?')) {
      try {
        const token = localStorage.getItem('api_token')
        await axios.delete(`http://localhost:8000/api/materias/${sigla}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        cargarMaterias()
      } catch (err) {
        setError('Error al eliminar')
        console.error(err)
      }
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#333' }}>📚 Gestión de Materias</h1>

      {error && <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#ffe6e6', borderRadius: '5px', color: '#c41e3a' }}>{error}</div>}

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>
          {editando ? '✏️ Editar Materia' : '➕ Registrar Materia'}
        </h2>
        <form onSubmit={guardarMateria} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input
            type="text"
            placeholder="Sigla"
            value={formData.sigla}
            onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
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
          <select
            value={formData.semestre}
            onChange={(e) => setFormData({ ...formData, semestre: parseInt(e.target.value) })}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={s}>Semestre {s}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Horas Teoría"
            value={formData.horas_teoria}
            onChange={(e) => setFormData({ ...formData, horas_teoria: parseInt(e.target.value) })}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          <input
            type="number"
            placeholder="Horas Práctica"
            value={formData.horas_practica}
            onChange={(e) => setFormData({ ...formData, horas_practica: parseInt(e.target.value) })}
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
                setFormData({ sigla: '', nombre: '', semestre: 1, horas_teoria: 0, horas_practica: 0 })
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
          📋 Materias Registradas ({materias.length})
        </h2>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>
        ) : materias.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay materias</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Sigla</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Semestre</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>T. Teoría</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>T. Práctica</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materias.map((materia) => (
                  <tr key={materia.sigla} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#3498db' }}>{materia.sigla}</td>
                    <td style={{ padding: '12px' }}>{materia.nombre}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>Sem {materia.semestre}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{materia.horas_teoria}h</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{materia.horas_practica}h</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditando(materia.sigla)
                          setFormData(materia)
                        }}
                        style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => eliminarMateria(materia.sigla)}
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
