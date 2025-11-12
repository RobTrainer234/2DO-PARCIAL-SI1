# 🔍 AUDITORÍA DETALLADA DE BASE DE DATOS - ESTADO ACTUAL

**Fecha**: 11 de noviembre de 2025

---

## 📊 ESTRUCTURA DE TABLAS VERIFICADA

### ✅ Tablas Existentes

| Tabla | Campos | Estado | Notas |
|-------|--------|--------|-------|
| **Usuario** | id, nombre, apellido, correo, ci, contraseña, teléfono, sexo, dirección | ✅ Completa | FK en Docente, Administrador |
| **Roles** | id_rol, nombre | ✅ Completa | RelacionaR usuarios |
| **RolUsuario** | id_rol, id_usuario | ✅ Completa | Muchos a muchos |
| **RolPermisos** | id_rol, id_permiso | ✅ Completa | Muchos a muchos |
| **Permisos** | id_permiso, nombre | ✅ Completa | Definir accesos |
| **Docente** | cod_docente, id_usuario, especialidad, fecha_contrato | ✅ Completa | FK a Usuario |
| **Administrador** | cod_administrador, id_usuario, fecha_contrato | ✅ Completa | FK a Usuario |
| **Gestion** | id_gestion, anio, periodo, fecha_inicio, fecha_fin | ✅ Completa | Períodos académicos |
| **Carrera** | id_carrera, nombre | ✅ Completa | Listado de carreras |
| **Materia** | sigla (PK), nombre | ⚠️ **INCOMPLETA** | FALTA: código, nivel, carga_horaria |
| **CarreraMateria** | id_carrera, sigla_materia | ✅ Completa | Relación entre Carrera y Materia |
| **Grupo** | id_grupo, nombre | ⚠️ **INCOMPLETA** | FALTA: turno, paralelo, cupo_maximo, sigla_materia (FK) |
| **Tipo** | id_tipo, nombre | ✅ Completa | Tipos de infraestructura |
| **Infraestructura** | id_infraestructura, nro, piso, capacidad, id_tipo | ✅ Completa | Aulas/Laboratorios |
| **DocenteGrupoMateria** | id_asignacion, cod_docente, id_grupo, sigla_materia, id_gestion | ✅ Completa | Carga asignada |
| **Horarios** | id_horario, dia, hora_inicio, hora_final, id_asignacion, id_infraestructura | ✅ Completa | Schedule de clases |
| **Asistencia** | id_asistencia, fecha, hora, estado, metodo, observacion, id_asignacion | ⚠️ **INCOMPLETA** | FALTA: evidencia, método QR/enlace |
| **audit_logs** | id, usuario_id, accion, entidad, entidad_id, antes, despues, ip, user_agent, creado_en | ✅ Completa | Bitácora de cambios |
| **Reportes** | id_reporte, formato, fecha_generacion, cod_administrador | ✅ Completa | Reportes generados |

---

## ⚠️ ANÁLISIS POR CASO DE USO

### CU5: Editar/Eliminar Docente

**Base de Datos**: ✅ COMPLETA

**Backend**:
```
DocenteController@update   → EXISTE pero SIN auditoría
DocenteController@destroy  → EXISTE pero SIN validación (permite eliminar con carga)
```

**Falta**:
- [ ] Validar que Docente NO tenga registros en DocenteGrupoMateria antes de eliminar
- [ ] Registrar cambios en audit_logs (update)
- [ ] Opción de desactivar en lugar de eliminar

**Archivos a Modificar**:
- `Backend/app/Http/Controllers/Api/DocenteController.php` (líneas 88-165)

---

### CU6: Registrar Materia

**Base de Datos**: ⚠️ **INCOMPLETA**

**Tabla Materia Actual**:
```sql
sigla (PK, string, 20)
nombre (string, 100)
```

**Falta Agregar**:
```sql
codigo (string, 50) - Código único por carrera
nivel (integer) - 1,2,3,4,5,6,7,8,9,10 semestres
carga_horaria (integer) - Horas por semana
```

**Backend**:
```
MateriaController@store    → EXISTE pero SIN validación de código único
```

**Falta**:
- [ ] Migración para agregar campos a Materia
- [ ] Validación de código único por carrera
- [ ] Asociación con plan de estudios

**Archivos a Modificar**:
- Backend: Crear migración nueva
- `Backend/app/Http/Controllers/Api/MateriaController.php`
- `Frontend/src/pages/Materias.tsx`

---

### CU7: Registrar Grupo

**Base de Datos**: ⚠️ **INCOMPLETA**

**Tabla Grupo Actual**:
```sql
id_grupo (PK, bigint)
nombre (string, 10)
```

**Falta Agregar**:
```sql
sigla_materia (string, 20) - FK a Materia
turno (string, 50) - "Diurno", "Nocturno", "Mixto"
paralelo (string, 10) - "A", "B", "C", etc.
cupo_maximo (integer) - Máximo de estudiantes
```

**Backend**:
```
GrupoController@store      → EXISTE pero INCOMPLETO
```

**Falta**:
- [ ] Migración para agregar campos a Grupo
- [ ] Validación de vínculo con Materia
- [ ] Crear interface en Frontend

**Archivos a Modificar**:
- Backend: Crear migración nueva
- `Backend/app/Http/Controllers/Api/GrupoController.php`
- `Frontend/src/pages/Grupos.tsx`

---

### CU8: Editar/Eliminar Grupo

**Base de Datos**: ⚠️ (depende de CU7)

**Backend**:
```
GrupoController@update     → EXISTE pero SIN validaciones
GrupoController@destroy    → EXISTE pero SIN validación
```

**Falta**:
- [ ] Validar que Grupo NO tenga Horarios asignados antes de eliminar
- [ ] Auditar cambios
- [ ] Validar integridad de datos

---

### CU9: Registrar Aula

**Base de Datos**: ✅ COMPLETA (tabla Infraestructura)

**Tabla Infraestructura**:
```sql
id_infraestructura (PK)
nro (string, 10)
piso (integer)
capacidad (integer)
id_tipo (FK a Tipo)
```

**Backend**: ⚠️ Controller falta crear

**Falta**:
- [ ] Crear `InfraestructuraController` con métodos completos
- [ ] Crear rutas para Aulas
- [ ] Validar capacidad > 0
- [ ] Implementar Frontend completo

---

### CU10: Editar/Eliminar Aula

**Base de Datos**: ✅ COMPLETA (agregar campo de estado)

**Falta Agregar**:
```sql
activo (boolean, default true) - Para marcar como inactiva
```

**Backend**:
- [ ] Implementar soft delete (marcar como inactiva)
- [ ] Validar disponibilidad

---

### CU11: Registrar Horario Manual

**Base de Datos**: ✅ COMPLETA

**Tabla Horarios**:
```sql
id_horario (PK)
dia (string, 20) - "Lunes", "Martes", etc.
hora_inicio (time)
hora_final (time)
id_asignacion (FK a DocenteGrupoMateria)
id_infraestructura (FK a Infraestructura)
```

**Backend**: ⚠️ Controller falta

**Falta**:
- [ ] Crear `HorariosController` con validaciones
- [ ] **Validar conflictos**:
  - ❌ Mismo docente en misma hora
  - ❌ Misma aula en misma hora
  - ❌ Mismo grupo en misma hora
- [ ] Auditar en bitácora
- [ ] Permitir múltiples franjas

---

### CU12: Editar/Eliminar Horario

**Base de Datos**: ✅ COMPLETA (agregar soft delete)

**Falta Agregar**:
```sql
deleted_at (timestamp, nullable) - Soft delete
```

**Backend**:
- [ ] Validar conflictos después de editar
- [ ] Soft delete (no eliminar físicamente)
- [ ] Auditar

---

### CU13: Registrar Asistencia Docente

**Base de Datos**: ⚠️ **INCOMPLETA**

**Tabla Asistencia Actual**:
```sql
id_asistencia (PK)
fecha (date)
hora (time)
estado (string, 20) - "Presente", "Atraso", "Falta", etc.
metodo (string, 50)  - "manual", "qr", "enlace"
observacion (text)
id_asignacion (FK)
```

**Falta Agregar**:
```sql
evidencia (text o path) - URL/path a foto, archivo
fecha_registro (timestamp) - Cuándo se registró
usuario_id (FK) - Quién registró
```

**Backend**:
- [ ] Crear `AsistenciaController` con validaciones
- [ ] Validar fecha/hora dentro de rango permitido
- [ ] Soportar 3 métodos: manual, QR, enlace único
- [ ] Guardar evidencia

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### Fase 1: Migraciones Nuevas (30 min)
1. Agregar campos a Materia
2. Agregar campos a Grupo
3. Agregar estado a Infraestructura
4. Agregar soft delete a Horarios
5. Agregar campos a Asistencia

### Fase 2: Backend - Controllers (2-3 horas)
1. Mejorar DocenteController (validación, auditoría)
2. Mejorar MateriaController (validación)
3. Crear GrupoController
4. Crear/Mejorar HorariosController (CRÍTICO - conflictos)
5. Crear AsistenciaController

### Fase 3: Backend - Validaciones (2-3 horas)
1. Validar conflictos de horarios
2. Validar integridad de relaciones
3. Implementar auditoría
4. Soft deletes

### Fase 4: Frontend (3-4 horas)
1. Mejorar forms para nuevos campos
2. Mostrar conflictos detectados
3. Agregar interface para QR/enlace
4. Mostrar historial

### Fase 5: Testing (1-2 horas)
1. Pruebas de conflictos
2. Pruebas de auditoría
3. Pruebas end-to-end

---

## ✅ RECOMENDACIÓN

**Comenzar inmediatamente con:**

1. **Migraciones nuevas** (30 min)
2. **Validación de conflictos de horarios** (CU11) - MÁS CRÍTICO
3. **Auditoría en editar/eliminar** (CU5)
4. **Validación de eliminación segura** (CU5, CU8)

¿Deseas que comience con algún CU específico?

