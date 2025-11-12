# 🗂️ MAPEO DE RUTAS → COMPONENTES

## Referencia Rápida

| Menú | Ruta | Componente | Estado | Notas |
|------|------|-----------|--------|-------|
| **Dashboard** | `/dashboard` | DashboardIndicadores.tsx | ✅ Activo | Panel principal |
| | | | | |
| **Gestión de Usuarios** | | | | |
| Usuarios | `/admin/usuarios` | Users.tsx | ✅ Activo | CRUD usuarios |
| Roles | `/admin/roles` | Roles.tsx | ✅ Activo | Gestión de roles |
| Permisos | `/admin/permisos` | Permisos.tsx | ✅ Activo | Gestión permisos |
| | | | | |
| **Gestión Académica** | | | | |
| Docentes | `/admin/docentes` | Docentes.tsx | ✅ Activo | Importar/CRUD docentes |
| Materias | `/admin/materias` | Materias.tsx | ✅ Activo | Importar/CRUD materias |
| Grupos | `/admin/grupos` | Grupos.tsx | ✅ Activo | Gestión grupos |
| Aulas | `/admin/aulas` | Aulas.tsx | ✅ Activo | Gestión aulas |
| Horarios | `/admin/horarios` | Horarios.tsx | ✅ Activo | Gestión horarios |
| | | | | |
| **Docencia** | | | | |
| Mis Asignaciones | `/docencia/asignaciones` | Asignaciones.tsx | ✅ Activo | Ver asignaciones docente |
| Mi Carga Horaria | `/docencia/mi-carga-horaria` | QRScan.tsx | ⚠️ Temporal | Debe ser MiCargaHoraria.tsx |
| Asistencias | `/docencia/asistencias` | Asistencias.tsx | ✅ Activo | Registrar asistencia |
| Calificaciones | `/docencia/calificaciones` | ValidacionAsistencia.tsx | ⚠️ Temporal | Debe ser Calificaciones.tsx |
| | | | | |
| **Reportes** | | | | |
| Reportes de Asistencia | `/reportes/asistencia` | ReporteAsistencia.tsx | ✅ Activo | Reportes de asistencia |
| Reportes Carga Horaria | `/reportes/carga-horaria` | ReporteCargaHoraria.tsx | ✅ Activo | Reportes carga horaria |
| Reportes de Aulas | `/reportes/aulas` | ReporteUsoAulas.tsx | ✅ Activo | Reportes de aulas |
| Dashboard Indicadores | `/reportes/dashboard` | ExportarReportes.tsx | ⚠️ Temporal | Debe ser DashboardReportes.tsx |
| | | | | |
| **Administración** | | | | |
| Auditoría | `/admin/auditoria` | AuditoriaPage.tsx | ✅ Activo | Bitácora de cambios |
| Configuración | `/admin/configuracion` | Gestiones.tsx | ⚠️ Temporal | Debe ser Configuracion.tsx |
| Respaldo de Datos | `/admin/respaldo` | Gestiones.tsx | ⚠️ Temporal | Debe ser RespaldoDatos.tsx |

---

## 📊 Leyenda de Estado

- ✅ **Activo**: Componente existe y funciona correctamente
- ⚠️ **Temporal**: Componente asignado temporalmente, necesita mejora o reemplazo
- ❌ **Falta**: Componente aún no existe
- 🔄 **En Desarrollo**: Componente en construcción

---

## 🔄 Rutas Legadas (Compatibilidad hacia atrás)

Estas rutas siguen funcionando para compatibilidad:

| Ruta Anterior | Nueva Ruta | Componente |
|---|---|---|
| `/usuarios` | `/admin/usuarios` | Users.tsx |
| `/roles` | `/admin/roles` | Roles.tsx |
| `/permisos` | `/admin/permisos` | Permisos.tsx |
| `/docentes` | `/admin/docentes` | Docentes.tsx |
| `/materias` | `/admin/materias` | Materias.tsx |
| `/grupos` | `/admin/grupos` | Grupos.tsx |
| `/aulas` | `/admin/aulas` | Aulas.tsx |
| `/asignaciones` | `/docencia/asignaciones` | Asignaciones.tsx |
| `/horarios` | `/admin/horarios` | Horarios.tsx |
| `/asistencias` | `/docencia/asistencias` | Asistencias.tsx |
| `/qr` | `/docencia/mi-carga-horaria` | QRScan.tsx |
| `/validacion-asistencia` | `/docencia/calificaciones` | ValidacionAsistencia.tsx |
| `/consulta-horario` | `/docencia/mi-carga-horaria` | ConsultaHorario.tsx |
| `/reporte-asistencia` | `/reportes/asistencia` | ReporteAsistencia.tsx |
| `/reporte-carga-horaria` | `/reportes/carga-horaria` | ReporteCargaHoraria.tsx |
| `/reporte-uso-aulas` | `/reportes/aulas` | ReporteUsoAulas.tsx |
| `/exportar-reportes` | `/reportes/dashboard` | ExportarReportes.tsx |
| `/auditoria` | `/admin/auditoria` | AuditoriaPage.tsx |
| `/gestiones` | `/admin/configuracion` | Gestiones.tsx |
| `/dashboard` | `/dashboard` | DashboardIndicadores.tsx |

---

## ⚠️ Componentes que Necesitan Mejora

### 1. Mi Carga Horaria
```
Ruta Actual: /docencia/mi-carga-horaria
Componente Actual: QRScan.tsx (❌ Incorrecto)
Componente Esperado: MiCargaHoraria.tsx (✅ Ya existe en Backend)

Estado: ⚠️ NECESITA MAPEO CORRECTO
```

### 2. Calificaciones
```
Ruta Actual: /docencia/calificaciones
Componente Actual: ValidacionAsistencia.tsx (❌ Incorrecto)
Componente Esperado: Calificaciones.tsx (❌ NO EXISTE)

Estado: ⚠️ NECESITA COMPONENTE NUEVO
```

### 3. Dashboard de Reportes
```
Ruta Actual: /reportes/dashboard
Componente Actual: ExportarReportes.tsx (❌ Incorrecto)
Componente Esperado: DashboardReportes.tsx (❌ NO EXISTE)

Estado: ⚠️ NECESITA COMPONENTE NUEVO
```

### 4. Configuración
```
Ruta Actual: /admin/configuracion
Componente Actual: Gestiones.tsx (❌ Genérico)
Componente Esperado: Configuracion.tsx (❌ NO EXISTE)

Estado: ⚠️ NECESITA COMPONENTE NUEVO
```

### 5. Respaldo de Datos
```
Ruta Actual: /admin/respaldo
Componente Actual: Gestiones.tsx (❌ Genérico)
Componente Esperado: RespaldoDatos.tsx (❌ NO EXISTE)

Estado: ⚠️ NECESITA COMPONENTE NUEVO
```

---

## 📝 Próximos Pasos

### Corto Plazo (Inmediato)
```
1. ✅ Actualizar App.tsx con nuevas rutas → COMPLETADO
2. ✅ Crear menuConfig.ts con estructura jerárquica → COMPLETADO
3. ✅ Actualizar Sidebar.tsx para jerarquía → COMPLETADO
4. ⏳ Mapear correctamente MiCargaHoraria.tsx
5. ⏳ Crear Calificaciones.tsx
6. ⏳ Crear DashboardReportes.tsx
```

### Mediano Plazo
```
1. Crear Configuracion.tsx
2. Crear RespaldoDatos.tsx
3. Mejorar componentes existentes
4. Agregar validación de roles en cada componente
5. Testing completo del sistema
```

### Largo Plazo
```
1. Agregar autenticación por endpoint
2. Mejorar UX/UI
3. Agregar más funcionalidades
4. Performance optimization
5. Documentación completa
```

---

## 🔧 Cómo Actualizar un Mapeo

### Ejemplo: Cambiar MiCargaHoraria de QRScan a componente correcto

**1. Verificar que existe el componente**
```bash
# Verificar que MiCargaHoraria.tsx existe en Frontend/src/pages/
ls Frontend/src/pages/MiCargaHoraria.tsx
```

**2. Actualizar App.tsx**
```typescript
// ANTES
<Route 
  path="/docencia/mi-carga-horaria" 
  element={<ProtectedRoute><QRScan /></ProtectedRoute>} 
/>

// DESPUÉS
<Route 
  path="/docencia/mi-carga-horaria" 
  element={<ProtectedRoute><MiCargaHoraria /></ProtectedRoute>} 
/>
```

**3. Asegurarse que el componente esté importado**
```typescript
import MiCargaHoraria from './pages/MiCargaHoraria'
```

**4. Probar en el navegador**
```
1. Navegar a /docencia/mi-carga-horaria
2. Verificar que carga el componente correcto
3. Verificar que funciona correctamente
```

---

## 📋 Checklist de Componentes Existentes

- [x] DashboardIndicadores.tsx
- [x] Users.tsx
- [x] Roles.tsx
- [x] Permisos.tsx
- [x] Docentes.tsx
- [x] Materias.tsx
- [x] Grupos.tsx
- [x] Aulas.tsx
- [x] Horarios.tsx
- [x] Asignaciones.tsx
- [x] QRScan.tsx
- [x] Asistencias.tsx
- [x] ValidacionAsistencia.tsx
- [x] ConsultaHorario.tsx
- [x] ReporteAsistencia.tsx
- [x] ReporteCargaHoraria.tsx
- [x] ReporteUsoAulas.tsx
- [x] ExportarReportes.tsx
- [x] AuditoriaPage.tsx
- [x] Gestiones.tsx
- [x] Login.tsx
- [ ] MiCargaHoraria.tsx (❌ Falta mapeo, pero existe en Backend)
- [ ] Calificaciones.tsx (❌ FALTA)
- [ ] DashboardReportes.tsx (❌ FALTA)
- [ ] Configuracion.tsx (❌ FALTA)
- [ ] RespaldoDatos.tsx (❌ FALTA)

---

**Última actualización**: 11 Noviembre 2025  
**Versión**: 1.0  
**Estado**: ✅ ACTUALIZADO CON NUEVAS RUTAS
