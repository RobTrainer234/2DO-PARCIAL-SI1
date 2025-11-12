# 📋 ANÁLISIS DE CASOS DE USO - ESTADO ACTUAL Y MEJORAS NECESARIAS

**Fecha**: 11 de noviembre de 2025  
**Estado**: Análisis en progreso

---

## 🔍 RESUMEN EJECUTIVO

Existen archivos base para todos los CU, pero necesitan mejoras en:
- ✅ Tablas de base de datos (existen)
- ✅ Modelos Eloquent (existen)
- ⚠️ Validaciones y restricciones (parciales)
- ⚠️ Historial de cambios/Auditoría (parcial)
- ⚠️ Frontend completo (parcial)
- ⚠️ Manejo de conflictos (falta)

---

## 📝 ANÁLISIS DETALLADO POR CU

### CU5: Editar/Eliminar Docente ⚠️

**Estado Actual:**
- ✅ Backend: `DocenteController@update` y `destroy` existen
- ✅ Frontend: `Docentes.tsx` con formulario de edición
- ✅ Tabla de auditoría existe (`audit_logs`)

**Falta Implementar:**
1. ❌ Validación: No permite eliminar si tiene carga asignada (DocenteGrupoMateria)
2. ❌ Auditoría: No registra cambios en `audit_logs` (edición)
3. ❌ Frontend: No muestra historial de cambios
4. ❌ Desactivación: No tiene opción de desactivar en lugar de eliminar

**Archivos Involucrados:**
- Backend: `app/Http/Controllers/Api/DocenteController.php` (líneas 88-138)
- Frontend: `src/pages/Docentes.tsx`
- Modelo: `app/Models/Docente.php`

---

### CU6: Registrar Materia ⚠️

**Estado Actual:**
- ✅ Backend: `MateriaController@store` existe
- ✅ Frontend: `Materias.tsx` con formulario básico
- ✅ Modelo: `app/Models/Materia.php`

**Falta Implementar:**
1. ❌ Base de datos: Falta campo "código", "nivel", "carga_horaria"
2. ❌ Base de datos: Falta asociación con "Carrera" y "PlanEstudios"
3. ❌ Backend: No valida código único por carrera
4. ❌ Frontend: No tiene campos para carrera, plan de estudios, carga horaria, nivel

**Campos Necesarios en Materia:**
- sigla (existe)
- nombre (existe)
- **código** (FALTA)
- **nivel** (FALTA)
- **carga_horaria** (FALTA)
- **carrera_id** (FALTA - FK)
- **plan_estudios_id** (FALTA - FK)

---

### CU7: Registrar Grupo ⚠️

**Estado Actual:**
- ✅ Modelo: `app/Models/Grupo.php` existe
- ✅ Backend: Rutas configuradas
- ✅ Frontend: `Grupos.tsx` existe

**Falta Implementar:**
1. ❌ Base de datos: Falta campos "turno", "paralelo", "cupo_maximo"
2. ❌ Frontend: No tiene interface para crear grupo
3. ❌ Validación: No valida vínculo con materia

**Campos Necesarios en Grupo:**
- materia_sigla (posible que exista)
- **turno** (FALTA)
- **paralelo** (FALTA)
- **cupo_maximo** (FALTA)
- codigo (posible)

---

### CU8: Editar/Eliminar Grupo ⚠️

**Estado Actual:**
- ⚠️ Backend: Métodos update/destroy existen pero sin validaciones
- ⚠️ Frontend: Parcialmente implementado

**Falta Implementar:**
1. ❌ Validación: No verifica si tiene horarios asignados
2. ❌ Backend: No audita cambios
3. ❌ Frontend: No muestra confirmación adecuada

---

### CU9: Registrar Aula ⚠️

**Estado Actual:**
- ✅ Modelo: `app/Models/Aula.php` existe (probablemente)
- ⚠️ Frontend: `Aulas.tsx` existe pero incompleto

**Falta Implementar:**
1. ❌ Base de datos: Revisar campos (capacidad, tipo, ubicación, disponibilidad)
2. ❌ Frontend: Mejorar interface para capturar todos los datos
3. ❌ Validación: Capacidad > 0, tipo válido

---

### CU10: Editar/Eliminar Aula ⚠️

**Estado Actual:**
- ⚠️ Backend: Métodos existen pero sin completa funcionalidad
- ⚠️ Frontend: Parcialmente implementado

**Falta Implementar:**
1. ❌ Lógica: Marcar como inactiva en lugar de eliminar
2. ❌ Backend: Verificar disponibilidad antes de cambios
3. ❌ Frontend: Mostrar estado (activa/inactiva)

---

### CU11: Registrar Horario Manual ⚠️

**Estado Actual:**
- ⚠️ Modelo: `app/Models/Horarios.php` existe
- ⚠️ Frontend: `Horarios.tsx` existe pero básico

**Falta Implementar:**
1. ❌ Backend: No valida conflictos de:
   - Mismo docente en misma hora
   - Misma aula en misma hora
   - Mismo grupo en misma hora
2. ❌ Frontend: No permite asignar múltiples franjas
3. ❌ Backend: No audita en bitácora
4. ❌ Validación: No verifica que docente, materia, grupo y aula existan

---

### CU12: Editar/Eliminar Horario ⚠️

**Estado Actual:**
- ⚠️ Backend: Métodos existen sin validaciones
- ⚠️ Frontend: Básico

**Falta Implementar:**
1. ❌ Validación: No revisa conflictos después de editar
2. ❌ Backend: No audita eliminación (soft delete)
3. ❌ Frontend: No muestra conflictos detectados

---

### CU13: Registrar Asistencia Docente ⚠️

**Estado Actual:**
- ✅ Modelo: `app/Models/Asistencia.php` existe
- ⚠️ Frontend: `Asistencias.tsx` existe pero básico

**Falta Implementar:**
1. ❌ Backend: No soporta múltiples métodos (manual, QR, enlace único)
2. ❌ Backend: No valida fecha/hora dentro de rango permitido
3. ❌ Frontend: No tiene interface para QR o enlace único
4. ❌ Base de datos: Falta campo "evidencia" o similar
5. ❌ Validación: No valida que sea hora de clase

---

## 🛠️ PLAN DE ACCIÓN

### Fase 1: Auditoría y Base de Datos (1-2 días)
1. Verificar estructura exacta de todas las tablas
2. Crear migraciones faltantes para campos
3. Agregar relaciones en modelos

### Fase 2: Backend - Validaciones (2-3 días)
1. Agregar validaciones de conflictos
2. Implementar auditoría en operaciones
3. Soft deletes donde sea necesario

### Fase 3: Backend - Endpoints (2-3 días)
1. Crear endpoints para operaciones faltantes
2. Agregar filtros y búsquedas
3. Documentar API

### Fase 4: Frontend - Interfaces (3-4 días)
1. Mejorar forms para capturar todos los datos
2. Agregar validaciones en cliente
3. Mostrar conflictos y errores

### Fase 5: Testing (1-2 días)
1. Pruebas unitarias
2. Pruebas de integración
3. Pruebas manuales

---

## ✅ ACCIÓN RECOMENDADA

**Comenzar con:**
1. Verificar estructura exacta de tablas (migraciones)
2. Listar todos los controladores y sus métodos
3. Revisar modelos y relaciones
4. Luego implementar mejoras por CU

¿Quieres que comience la auditoría detallada?
