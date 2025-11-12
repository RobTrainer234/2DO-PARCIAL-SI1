/**
 * DIAGRAMA: Auto-Llenado de Semestre en Formulario de Asignaciones
 * 
 * USUARIO                          FRONTEND                         BACKEND
 * ──────────────────────────────────────────────────────────────────────────────
 * 
 * 1. Abre formulario
 *    "Nueva Asignación"
 *         │
 *         │  Formulario inicial:
 *         │  ┌─────────────────────────────┐
 *         │  │ Docente:     [Seleccionar]  │
 *         │  │ Grupo:       [Seleccionar]  │
 *         │  │ Materia:     [Seleccionar]  │
 *         │  │ Semestre:    [______]       │
 *         │  │ Gestión:     [Seleccionar]  │
 *         │  └─────────────────────────────┘
 *         ↓
 *
 * 2. Hace clic en dropdown Materia
 *    y selecciona "MAT101 - CALCULO 1"
 *         │
 *         ├─→ onChange event dispara
 *         │   handleMateriaChange("MAT101")
 *         │
 *         │ LLAMADA API AUTOMÁTICA:
 *         │ ┌──────────────────────────────────────────┐
 *         │ │ GET /api/materias/semestre/MAT101       │
 *         │ │ + Header: Authorization: Bearer TOKEN   │
 *         │ └──────────────────────────────────────────┘
 *         │                 ↓
 *         │                 │
 *         │                 │  (La solicitud llega al backend)
 *         │                 │
 *         │                 ↓
 *         │        ┌─────────────────────────┐
 *         │        │ MateriaController       │
 *         │        │ public function         │
 *         │        │ obtenerSemestre($sigla) │
 *         │        │                         │
 *         │        │ $materia = Materia::    │
 *         │        │   find('MAT101')        │
 *         │        │                         │
 *         │        │ return {                │
 *         │        │   sigla: 'MAT101',      │
 *         │        │   nombre: 'CALCULO 1',  │
 *         │        │   semestre: 1,          │
 *         │        │   es_electiva: false    │
 *         │        │ }                       │
 *         │        └─────────────────────────┘
 *         │                 │
 *         │                 ↓ JSON Response
 *         │        ┌─────────────────────────┐
 *         │        │ {                       │
 *         │        │   "sigla": "MAT101",    │
 *         │        │   "nombre": "CALCULO 1",│
 *         │        │   "semestre": 1,        │
 *         │        │   "es_electiva": false  │
 *         │        │ }                       │
 *         │        └─────────────────────────┘
 *         │                 │
 *         └─────────────────┘
 *         │
 *         ↓ Frontend procesa la respuesta:
 *         │ setFormData(prev => ({
 *         │   ...prev,
 *         │   sigla_materia: 'MAT101',
 *         │   semestre: '1'  ← AUTO-LLENADO
 *         │ }))
 *         │
 *         ↓ 
 *    Formulario actualizado:
 *    ┌─────────────────────────────┐
 *    │ Docente:     [Seleccionar]  │
 *    │ Grupo:       [Seleccionar]  │
 *    │ Materia:     ✓ MAT101       │
 *    │ Semestre:    ✓ 1  ← LLENO   │
 *    │ Gestión:     [Seleccionar]  │
 *    │ [Guardar]                   │
 *    └─────────────────────────────┘
 *
 * 3. El usuario continúa sin hacer nada más
 *    El semestre ya está automáticamente rellenado
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * CASOS ESPECIALES:
 *
 * A) Si es una materia ELECTIVA (sin semestre):
 *    ┌─────────────────────────────────┐
 *    │ API Response:                   │
 *    │ {                               │
 *    │   semestre: null,               │
 *    │   es_electiva: true             │
 *    │ }                               │
 *    │                                 │
 *    │ Campo se llena con: "Electiva"  │
 *    └─────────────────────────────────┘
 *
 * B) Si hay ERROR en la API:
 *    ┌─────────────────────────────┐
 *    │ El campo se deja vacío       │
 *    │ Se muestra en consola:       │
 *    │ "Error al obtener semestre"  │
 *    │ Pero el formulario sigue     │
 *    │ funcionando normalmente      │
 *    └─────────────────────────────┘
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * VENTAJAS:
 * ✓ Automatización completa
 * ✓ No requiere entrada manual del usuario
 * ✓ Elimina errores de inconsistencia
 * ✓ Interfaz más rápida y fluida
 * ✓ Mejora la experiencia del usuario
 *
 */

// CÓDIGO EN TYPESCRIPT (Frontend - Asignaciones.tsx):

const handleMateriaChange = async (sigla: string) => {
  setFormData({ ...formData, sigla_materia: sigla })
  
  if (sigla) {
    try {
      // 1. Llamar API
      const res = await API.get(`/materias/semestre/${sigla}`)
      
      // 2. Actualizar formData con semestre automático
      setFormData(prev => ({
        ...prev,
        sigla_materia: sigla,
        semestre: res.data.semestre ? res.data.semestre.toString() : 'Electiva'
      }))
    } catch (e: any) {
      console.error('Error al obtener semestre de materia:', e)
      setFormData(prev => ({
        ...prev,
        sigla_materia: sigla,
        semestre: ''
      }))
    }
  } else {
    setFormData(prev => ({
      ...prev,
      sigla_materia: '',
      semestre: ''
    }))
  }
}

// CÓDIGO EN PHP (Backend - MateriaController.php):

public function obtenerSemestre($sigla)
{
  $materia = Materia::find($sigla);
  
  if (!$materia) {
    return response()->json(['error' => 'Materia no encontrada'], 404);
  }

  return response()->json([
    'sigla' => $materia->sigla,
    'nombre' => $materia->nombre,
    'semestre' => $materia->semestre ?? null,
    'es_electiva' => is_null($materia->semestre)
  ]);
}

// EN BLADE/HTML:

<div style={{ marginBottom: '15px' }}>
  <label>Materia *</label>
  <select
    value={formData.sigla_materia}
    onChange={(e) => handleMateriaChange(e.target.value)}
    required
    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
  >
    <option value="">Selecciona una materia</option>
    {materias.map(m => (
      <option key={m.sigla} value={m.sigla}>
        {m.sigla} - {m.nombre}
      </option>
    ))}
  </select>
</div>

<div style={{ marginBottom: '15px' }}>
  <label>Semestre (Auto-Llenado)</label>
  <input
    type="text"
    value={formData.semestre}
    readOnly
    style={{ 
      width: '100%', 
      padding: '8px', 
      borderRadius: '4px', 
      border: '1px solid #ddd',
      backgroundColor: '#f0f0f0',
      color: '#666'
    }}
    placeholder="Se llena automáticamente al seleccionar materia"
  />
</div>
