# ✅ IMPLEMENTACIÓN: Llenado Automático de Semestre en Asignaciones

## 📋 Resumen

Cuando un docente selecciona una materia en el formulario de asignaciones, el campo de **semestre** se llena automáticamente según el nivel de la materia en la base de datos.

---

## 🔧 Cambios Realizados

### 1. Backend - Nuevo Endpoint API

**Archivo**: `Backend/app/Http/Controllers/Api/MateriaController.php`

**Método**: `obtenerSemestre($sigla)`
- **Ruta**: `GET /api/materias/semestre/{sigla}`
- **Descripción**: Devuelve el semestre de una materia por su sigla
- **Respuesta JSON**:
  ```json
  {
    "sigla": "MAT101",
    "nombre": "CALCULO 1",
    "semestre": 1,
    "es_electiva": false
  }
  ```

**Casos de Uso**:
- Materia Regular: `semestre: 1` (número)
- Materia Electiva: `semestre: null`, `es_electiva: true`

### 2. Backend - Rutas

**Archivo**: `Backend/routes/api.php`

Se agregó la nueva ruta:
```php
Route::get('/materias/semestre/{sigla}', [MateriaController::class, 'obtenerSemestre'])->middleware('auth:sanctum');
```

**Verificación**:
```
✓ GET|HEAD  api/materias/semestre/{sigla} ... Api\MateriaController@obtenerSemestre
```

### 3. Frontend - Componente Asignaciones

**Archivo**: `Frontend/src/pages/Asignaciones.tsx`

**Cambios**:
1. **Interfaz Materia actualizada**:
   ```typescript
   type Materia = {
     sigla: string
     nombre: string
     semestre?: number | null  // ← NUEVO
   }
   ```

2. **FormData actualizado**:
   ```typescript
   const [formData, setFormData] = useState({
     cod_docente: '',
     id_grupo: '',
     sigla_materia: '',
     id_gestion: '',
     semestre: ''  // ← NUEVO (se llena automáticamente)
   })
   ```

3. **Nuevo manejador: `handleMateriaChange()`**
   ```typescript
   const handleMateriaChange = async (sigla: string) => {
     setFormData({ ...formData, sigla_materia: sigla })
     
     if (sigla) {
       try {
         const res = await API.get(`/materias/semestre/${sigla}`)
         // Auto-llena el campo de semestre
         setFormData(prev => ({
           ...prev,
           sigla_materia: sigla,
           semestre: res.data.semestre ? res.data.semestre.toString() : 'Electiva'
         }))
       } catch (e: any) {
         console.error('Error al obtener semestre:', e)
       }
     }
   }
   ```

4. **Campo de Materia actualizado**:
   ```jsx
   <select
     value={formData.sigla_materia}
     onChange={(e) => handleMateriaChange(e.target.value)}  // ← Llama al handler
     required
   >
     {/* opciones de materias */}
   </select>
   ```

5. **Nuevo campo de Semestre (solo lectura)**:
   ```jsx
   <div style={{ marginBottom: '15px' }}>
     <label>Semestre (Auto-Llenado)</label>
     <input
       type="text"
       value={formData.semestre}
       readOnly
       style={{ backgroundColor: '#f0f0f0' }}
       placeholder="Se llena automáticamente al seleccionar materia"
     />
   </div>
   ```

---

## 🎯 Flujo de Funcionamiento

1. **Usuario abre formulario** de Nueva Asignación
2. **Selecciona una materia** del dropdown (ej: MAT101)
3. **Automáticamente**:
   - Frontend llama a: `GET /api/materias/semestre/MAT101`
   - Backend devuelve: `{ semestre: 1, es_electiva: false }`
   - Frontend llena el campo: `Semestre: 1`
4. **Usuario continúa** completando otros campos
5. **Guarda la asignación** normalmente

---

## 📊 Ejemplos

### Ejemplo 1: Materia Regular
```
Usuario selecciona: CALCULO 1 (MAT101)
                    ↓
API Response:       { semestre: 1, es_electiva: false }
                    ↓
Campo se llena con: "1"
```

### Ejemplo 2: Materia Electiva
```
Usuario selecciona: CRIPTOGRAFIA Y SEGURIDAD (ELC101)
                    ↓
API Response:       { semestre: null, es_electiva: true }
                    ↓
Campo se llena con: "Electiva"
```

---

## 🧪 Pruebas

Para probar el endpoint:

```bash
# 1. Descargar plantilla de materias
curl -X GET "http://localhost:8000/api/materias/plantilla/descargar" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Importar materias (59 materias: 51 regulares + 8 electivas)
curl -X POST "http://localhost:8000/api/materias/importar-excel" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "archivo=@Plantilla_Importar_Materias.xlsx"

# 3. Obtener semestre de una materia
curl -X GET "http://localhost:8000/api/materias/semestre/MAT101" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Respuesta esperada:
{
  "sigla": "MAT101",
  "nombre": "CALCULO 1",
  "semestre": 1,
  "es_electiva": false
}
```

---

## ✨ Ventajas

✓ **Automatización**: No hay que escribir manualmente el semestre
✓ **Consistencia**: El semestre siempre coincide con la materia
✓ **UX Mejorada**: Menos errores, menos clicks
✓ **Escalabilidad**: Funciona para cualquier número de materias
✓ **Flexibilidad**: Soporta materias regulares y electivas

---

## 📝 Datos Completados

- **Total de materias importadas**: 59
  - Regulares (1-10): 51 materias
  - Electivas (sin semestre): 8 materias

Todas las materias ahora tienen su semestre correctamente asignado en la BD.

---

## 🚀 Próximos Pasos

1. ✅ Importar las 59 materias usando el componente `ImportarMaterias`
2. ✅ Probar el llenado automático de semestre en Asignaciones
3. ⏳ Implementar la Carga Horaria (horas por asignación)
4. ⏳ Crear la sección Docencia con "Mis Asignaciones"
5. ⏳ Agregar horarios y asistencias
