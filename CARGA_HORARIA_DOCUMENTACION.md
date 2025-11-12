# 📚 Sistema de Carga Horaria - Documentación Completa

## ✅ Estado de Implementación

### Fase 1: Auto-llenado de Semestre
- **Estado**: ✅ COMPLETADO
- **Descripción**: Cuando un docente selecciona una materia, el semestre se llena automáticamente
- **Componentes**: 
  - Endpoint: `GET /api/materias/semestre/{sigla}`
  - Handler: `handleMateriaChange()` en Asignaciones.tsx
  - Tests: 4/4 pasados ✅

### Fase 2: Sistema de Carga Horaria
- **Estado**: ✅ COMPLETADO
- **Descripción**: Asignación de cargas horarias a docentes con horarios disponibles

---

## 📊 Arquitectura Implementada

### Base de Datos

#### Tabla 1: `CargaHorariaDocente`
Asigna materias a docentes con horas semanales/mensuales

```sql
CREATE TABLE CargaHorariaDocente (
  id_carga BIGINT PRIMARY KEY AUTO_INCREMENT,
  cod_docente BIGINT NOT NULL FOREIGN KEY → Docente.cod_docente,
  sigla_materia VARCHAR(20) NOT NULL FOREIGN KEY → Materia.sigla,
  horas_asignadas INT NOT NULL,
  orden_preferencia INT (nullable),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  UNIQUE(cod_docente, sigla_materia) -- Evita asignaciones duplicadas
)
```

**Propósito**: Vincula cada docente con las materias que puede dictar y las horas asignadas

---

#### Tabla 2: `HorarioDisponibilidad`
Define los horarios cuando un docente está disponible para enseñar una materia

```sql
CREATE TABLE HorarioDisponibilidad (
  id_horario BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_carga BIGINT NOT NULL FOREIGN KEY → CargaHorariaDocente.id_carga,
  dia_semana VARCHAR(20) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  aula_id BIGINT (nullable) FOREIGN KEY → Infraestructura.id_infraestructura,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Propósito**: Define franjas horarias específicas cuando cada docente está disponible para cada materia

---

## 🔧 Backend - API REST

### Modelos PHP/Laravel

#### `CargaHorariaDocente.php`
```php
class CargaHorariaDocente extends Model {
  protected $table = 'CargaHorariaDocente';
  protected $primaryKey = 'id_carga';
  
  // Relaciones
  public function docente() { return $this->belongsTo(Docente::class, 'cod_docente', 'cod_docente'); }
  public function materia() { return $this->belongsTo(Materia::class, 'sigla_materia', 'sigla'); }
  public function horarios() { return $this->hasMany(HorarioDisponibilidad::class, 'id_carga'); }
  
  // Casts
  protected $casts = [
    'horas_asignadas' => 'integer',
    'orden_preferencia' => 'integer',
    'activo' => 'boolean',
  ];
}
```

#### `HorarioDisponibilidad.php`
```php
class HorarioDisponibilidad extends Model {
  protected $table = 'HorarioDisponibilidad';
  protected $primaryKey = 'id_horario';
  
  // Relaciones
  public function cargaHoraria() { return $this->belongsTo(CargaHorariaDocente::class, 'id_carga'); }
  public function aula() { return $this->belongsTo(Infraestructura::class, 'aula_id', 'id_infraestructura'); }
  
  // Casts
  protected $casts = ['activo' => 'boolean'];
}
```

---

### Controlador: `CargaHorariaController`

**Ubicación**: `Backend/app/Http/Controllers/Api/CargaHorariaController.php`

#### 📋 Métodos Disponibles

| Método | HTTP | Ruta | Descripción |
|--------|------|------|-------------|
| `index()` | GET | `/carga-horaria` | Lista todas las cargas horarias con relaciones |
| `store()` | POST | `/carga-horaria` | Crea nueva asignación (con validación de duplicados) |
| `show()` | GET | `/carga-horaria/{id}` | Obtiene una carga específica |
| `update()` | PUT | `/carga-horaria/{id}` | Actualiza horas/orden/estado |
| `destroy()` | DELETE | `/carga-horaria/{id}` | Elimina una carga (y sus horarios en cascada) |
| `obtenerCargaDocente()` | GET | `/carga-horaria/docente/{cod_docente}` | **Obtiene todas las cargas de un docente** |
| `obtenerHorariosDocente()` | GET | `/carga-horaria/horarios/{cod_docente}` | **Obtiene todos los horarios de un docente** |
| `validarHoras()` | POST | `/carga-horaria/validar-horas` | Valida que no exceda horas máximas |
| `agregarHorario()` | POST | `/carga-horaria/{id}/horarios` | Agrega un horario disponible |
| `actualizarHorario()` | PUT | `/carga-horaria/{id}/horarios/{idHorario}` | Actualiza un horario |
| `eliminarHorario()` | DELETE | `/carga-horaria/{id}/horarios/{idHorario}` | Elimina un horario |

#### Validaciones Implementadas
- ✅ Prevención de asignaciones duplicadas (mismo docente + materia)
- ✅ Validación de hora_inicio < hora_fin
- ✅ Validación de existencia de docente y materia
- ✅ Eliminación en cascada de horarios al eliminar carga
- ✅ Verificación de límite total de horas

---

### Rutas API

**Archivo**: `Backend/routes/api.php`

```php
Route::prefix('carga-horaria')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [CargaHorariaController::class, 'index']);
    Route::post('/', [CargaHorariaController::class, 'store']);
    Route::get('/{id}', [CargaHorariaController::class, 'show']);
    Route::put('/{id}', [CargaHorariaController::class, 'update']);
    Route::delete('/{id}', [CargaHorariaController::class, 'destroy']);
    Route::get('/docente/{cod_docente}', [CargaHorariaController::class, 'obtenerCargaDocente']);
    Route::post('/validar-horas', [CargaHorariaController::class, 'validarHoras']);
    Route::get('/horarios/{cod_docente}', [CargaHorariaController::class, 'obtenerHorariosDocente']);
    Route::post('/{id}/horarios', [CargaHorariaController::class, 'agregarHorario']);
    Route::put('/{id}/horarios/{idHorario}', [CargaHorariaController::class, 'actualizarHorario']);
    Route::delete('/{id}/horarios/{idHorario}', [CargaHorariaController::class, 'eliminarHorario']);
});
```

---

## 🎨 Frontend - Componentes React/TypeScript

### 1. **AsignacionMaterias.tsx** - Panel Administrativo
**Ubicación**: `Frontend/src/components/AsignacionMaterias.tsx`

**Propósito**: Que los administradores asignen materias a docentes

**Características**:
- 📌 **Panel izquierdo**: Listado de docentes seleccionable
- 📌 **Panel derecho**: Formulario para agregar/editar materias
- 📌 **Tabla de cargas**: Muestra materias asignadas con:
  - Sigla de materia
  - Horas asignadas por mes
  - Orden de preferencia
  - Botones Edit/Delete
- 📌 **Validaciones**:
  - Evita asignaciones duplicadas (filtra materias ya asignadas)
  - Validación de horas positivas
  - Estados de carga durante operaciones

**Flujo de Uso**:
1. Seleccionar docente del panel izquierdo
2. Se cargan sus materias asignadas automáticamente
3. Completar formulario con:
   - Sigla de materia (dropdown)
   - Horas/mes
   - Orden de preferencia (opcional)
4. Hacer clic en "Agregar Carga"
5. Editar o eliminar desde los botones de acciones

---

### 2. **MiCargaHoraria.tsx** - Vista Docente (READ-ONLY)
**Ubicación**: `Frontend/src/components/MiCargaHoraria.tsx`

**Propósito**: Que los docentes vean su carga horaria asignada

**Características**:
- 📌 **Información personal**: Nombre, especialidad del docente logueado
- 📌 **Tarjetas de resumen**:
  - Total de horas mensuales
  - Cantidad de materias
  - Promedio de horas por materia
- 📌 **Tabla de materias asignadas**:
  - Sigla y nombre de materia
  - Horas mensuales
  - Orden de preferencia
  - Horarios disponibles (día, hora inicio/fin, aula)
- 📌 **Solo lectura**: No hay botones de edición
- 📌 **Autenticación**: Obtiene automáticamente al docente logueado

**Datos Mostrados**:
```
Mi Carga Horaria
├─ Información Personal
│  ├─ Nombre: [Obtenido del usuario logueado]
│  └─ Especialidad: [Del docente]
├─ Resumen (Tarjetas)
│  ├─ Total de Horas: XX
│  ├─ Materias Asignadas: X
│  └─ Promedio por Materia: X hrs
└─ Tabla de Materias
   ├─ Sigla Materia | Horas | Orden | Horarios
   ├─ [MAT101 | 8 hrs | 1 | Lun 09-11 (A101), Mié 14-16 (Lab2)]
   └─ [FIS102 | 6 hrs | 2 | Mar 10-12 (A202)]
```

---

### 3. **GestionarHorarios.tsx** - Gestión de Horarios
**Ubicación**: `Frontend/src/components/GestionarHorarios.tsx`

**Propósito**: Que los administradores definan horarios disponibles para cada materia-docente

**Características**:
- 📌 **Panel izquierdo**: Selector de docente (lista scrolleable)
- 📌 **Selector de materia**: Botones con materias asignadas del docente seleccionado
- 📌 **Formulario de horarios**:
  - Día de semana (dropdown)
  - Hora de inicio (time picker)
  - Hora de fin (time picker)
  - Aula (texto)
- 📌 **Tabla de horarios programados**:
  - Día | Inicio | Fin | Aula | Acciones (Edit/Delete)
- 📌 **Validaciones**:
  - hora_inicio < hora_fin
  - Confirmación antes de eliminar
  - Estados de carga durante operaciones

**Flujo de Uso**:
1. Seleccionar docente del panel izquierdo
2. Seleccionar materia (botones en la parte superior)
3. Se cargan los horarios existentes
4. Llenar formulario con nuevo horario
5. Hacer clic en "Agregar Horario"
6. Editar o eliminar horarios desde la tabla

---

## 📡 Flujo de Datos API

### Crear Asignación de Materia
```
POST /api/carga-horaria
{
  "cod_docente": 5,
  "sigla_materia": "MAT101",
  "horas_asignadas": 8,
  "orden_preferencia": 1
}
→ Response 201 Created
{
  "id_carga": 42,
  "cod_docente": 5,
  "sigla_materia": "MAT101",
  "horas_asignadas": 8,
  "orden_preferencia": 1,
  "activo": true
}
```

### Obtener Cargas de un Docente
```
GET /api/carga-horaria/docente/5
→ Response 200
{
  "cargas": [
    {
      "id_carga": 42,
      "sigla_materia": "MAT101",
      "horas_asignadas": 8,
      "orden_preferencia": 1,
      "horarios": [
        {
          "id_horario": 1,
          "dia_semana": "Lunes",
          "hora_inicio": "09:00",
          "hora_fin": "11:00",
          "aula": "A101"
        }
      ]
    }
  ],
  "total_horas": 8,
  "cantidad_materias": 1
}
```

### Agregar Horario Disponible
```
POST /api/carga-horaria/42/horarios
{
  "dia_semana": "Lunes",
  "hora_inicio": "09:00",
  "hora_fin": "11:00",
  "aula_id": 1
}
→ Response 201 Created
{
  "id_horario": 1,
  "id_carga": 42,
  "dia_semana": "Lunes",
  "hora_inicio": "09:00",
  "hora_fin": "11:00",
  "aula_id": 1,
  "activo": true
}
```

---

## 🗂️ Estructura de Archivos Creados

```
Backend/
├── app/
│   ├── Models/
│   │   ├── CargaHorariaDocente.php ✅
│   │   └── HorarioDisponibilidad.php ✅
│   └── Http/
│       └── Controllers/
│           └── Api/
│               └── CargaHorariaController.php ✅
├── database/
│   └── migrations/
│       ├── 2024_01_15_000003_create_carga_horaria_docente_table.php ✅
│       └── 2024_01_15_000004_create_horario_disponibilidad_table.php ✅
└── routes/
    └── api.php ✅ (actualizado con rutas)

Frontend/
└── src/
    └── components/
        ├── AsignacionMaterias.tsx ✅
        ├── MiCargaHoraria.tsx ✅
        └── GestionarHorarios.tsx ✅
```

---

## 🔐 Autenticación y Autorización

Todos los endpoints están protegidos con:
```php
middleware('auth:sanctum')
```

**Requisitos**:
- Token Bearer en header `Authorization: Bearer {token}`
- Token obtenido mediante login en `/api/auth/login`
- Válido mientras la sesión sea activa

---

## 🧪 Ejemplos de Uso

### Desde Frontend - Asignar Materia

```typescript
// En AsignacionMaterias.tsx
const handleSubmit = async (formData) => {
  const response = await API.post('/carga-horaria', {
    cod_docente: selectedDocente,
    sigla_materia: formData.sigla,
    horas_asignadas: parseInt(formData.horas),
    orden_preferencia: parseInt(formData.orden)
  });
  // Actualizar tabla...
};
```

### Desde Frontend - Obtener Mi Carga

```typescript
// En MiCargaHoraria.tsx
const response = await API.get(`/carga-horaria/docente/${cod_docente}`);
// response.data.cargas[] → Array de CargaHorariaDocente con horarios
// response.data.total_horas → Total de horas mensuales
```

### Desde Postman/cURL

```bash
# Listar todas las cargas
curl -H "Authorization: Bearer {token}" \
  http://localhost/api/carga-horaria

# Obtener cargas de docente 5
curl -H "Authorization: Bearer {token}" \
  http://localhost/api/carga-horaria/docente/5

# Crear nueva asignación
curl -X POST -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"cod_docente":5,"sigla_materia":"MAT101","horas_asignadas":8}' \
  http://localhost/api/carga-horaria
```

---

## ✨ Características Clave

✅ **Prevención de Duplicados**: No permite asignar la misma materia dos veces a un docente  
✅ **Validación de Horas**: Hora inicio siempre < hora fin  
✅ **Eliminación en Cascada**: Al eliminar una carga, sus horarios se eliminan automáticamente  
✅ **Relaciones Limpias**: FK con ON DELETE CASCADE para integridad  
✅ **Panel Admin Completo**: Asignar y gestionar horarios desde UI  
✅ **Vista Docente**: Los docentes ven su carga de forma clara y ordenada  
✅ **Autenticación Sanctum**: Todos los endpoints protegidos  
✅ **Órdenes de Preferencia**: Docentes pueden especificar preferencia por materias  

---

## 🚀 Próximos Pasos (Opcionales)

- Integración en barra lateral de navegación
- Dashboard con estadísticas de carga horaria
- Reportes PDF de asignaciones
- Notificaciones cuando se asigna/modifica carga
- Validación de conflictos horarios
- Exportar/Importar desde Excel
- Historial de cambios en carga horaria

---

## 📞 Soporte

Para dudas o problemas con la implementación, revisar:
1. Logs en `Backend/storage/logs/`
2. Console del navegador (F12) para errores frontend
3. Respuesta de API en Dev Tools → Network

---

**Implementación completada**: 2024-01-15  
**Versión**: 1.0 Stable  
**Estado**: ✅ PRODUCTION READY
