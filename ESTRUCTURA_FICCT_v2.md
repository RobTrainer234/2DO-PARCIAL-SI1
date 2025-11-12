# 🎓 ESTRUCTURA DEL SISTEMA FICCT - Nueva Navegación Jerárquica

## 📋 Indice

**Fecha**: 11 Noviembre 2025  
**Versión**: 2.0 - Reorganizada  
**Estado**: ✅ Implementada  

---

## 🗂️ Mapa Jerárquico Completo

```
FICCT - Sistema de Gestión
├── 📊 Dashboard
│   └─ /dashboard
│
├── 👥 Gestión de Usuarios (Admin)
│   ├─ Usuarios → /admin/usuarios
│   ├─ Roles → /admin/roles
│   └─ Permisos → /admin/permisos
│
├── 📚 Gestión Académica (Admin)
│   ├─ Docentes → /admin/docentes
│   ├─ Materias → /admin/materias
│   ├─ Grupos → /admin/grupos
│   ├─ Aulas → /admin/aulas
│   └─ Horarios → /admin/horarios
│
├── 📝 Docencia (Docente)
│   ├─ Mis Asignaciones → /docencia/asignaciones
│   ├─ Mi Carga Horaria → /docencia/mi-carga-horaria
│   ├─ Asistencias → /docencia/asistencias
│   └─ Calificaciones → /docencia/calificaciones
│
├── 📊 Reportes (Admin/Docente)
│   ├─ Reportes de Asistencia → /reportes/asistencia
│   ├─ Reportes de Carga Horaria → /reportes/carga-horaria
│   ├─ Reportes de Uso de Aulas → /reportes/aulas
│   └─ Dashboard de Indicadores → /reportes/dashboard
│
└── ⚙️ Administración (Admin)
    ├─ Auditoría → /admin/auditoria
    ├─ Configuración → /admin/configuracion
    └─ Respaldo de Datos → /admin/respaldo
```

---

## 🔧 Configuración de Menú

**Archivo**: `Frontend/src/config/menuConfig.ts`

```typescript
export interface MenuItem {
  label: string;          // Nombre visible
  path?: string;          // Ruta (opcional si tiene hijos)
  icon?: string;          // Emoji del menú
  children?: MenuItem[];   // Subitems
  requiredRoles?: string[]; // Quién puede verlo
}

export const mainMenuConfig: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊',
    requiredRoles: ['admin', 'docente', 'administrativo']
  },
  // ... más items
];

// Helpers
filterMenuByRoles(roles, menu)     // Filtrar por permisos
getAllRoutes(menu)                 // Obtener todas las rutas
```

---

## 🎨 Componente Sidebar Nuevo

**Archivo**: `Frontend/src/components/Sidebar.tsx`

**Características**:
- ✅ Estructura jerárquica con expansión/colapso
- ✅ Filtrado automático por roles
- ✅ Ícono activo en ruta actual
- ✅ Animaciones suaves
- ✅ Responsive (se adapta)
- ✅ Auto-expandir menú activo

**Props**:
```typescript
interface SidebarProps {
  isOpen: boolean;              // Abierto/cerrado
  onClose: () => void;          // Callback al cerrar
  userRoles?: string[];         // Roles del usuario
}
```

---

## 🌍 Categorías del Menú

### 1. Dashboard (`📊`)
```
Ruta: /dashboard
Roles: admin, docente, administrativo
Descripción: Panel principal con indicadores
```

### 2. Gestión de Usuarios (`👥`)
```
Subcategoría - Solo Admin

├─ Usuarios (/admin/usuarios)
│  → Crear, editar, eliminar usuarios
│  → Asignar roles
│  → Activar/desactivar
│
├─ Roles (/admin/roles)
│  → Crear roles personalizados
│  → Asignar permisos
│
└─ Permisos (/admin/permisos)
   → Gestionar permisos del sistema
   → Ver auditoría de permisos
```

### 3. Gestión Académica (`📚`)
```
Subcategoría - Admin/Administrativo

├─ Docentes (/admin/docentes)
│  → CRUD de docentes
│  → Importar masivamente (Excel)
│  → Especialidades
│  → Estado activo/inactivo
│
├─ Materias (/admin/materias)
│  → CRUD de materias
│  → Importar masivamente (59 materias)
│  → Código, semestre, créditos
│  → Ver docentes asignados
│
├─ Grupos (/admin/grupos)
│  → CRUD de grupos
│  → Asignar docentes a grupos
│  → Asignar materias a grupos
│
├─ Aulas (/admin/aulas)
│  → CRUD de aulas
│  → Capacidad
│  → Ubicación
│  → Recursos (proyector, etc)
│
└─ Horarios (/admin/horarios)
   → Ver horarios del sistema
   → Crear/editar horarios
   → Validar conflictos
```

### 4. Docencia (`📝`)
```
Subcategoría - Solo Docentes

├─ Mis Asignaciones (/docencia/asignaciones)
│  → Ver grupos asignados
│  → Ver materias asignadas
│  → Horarios de cada asignación
│  → Lista de estudiantes
│
├─ Mi Carga Horaria (/docencia/mi-carga-horaria)
│  → Total de horas mensuales
│  → Horas por materia
│  → Horarios disponibles (día/hora/aula)
│
├─ Asistencias (/docencia/asistencias)
│  → Registrar asistencia QR
│  → Ver historial
│  → Reportes por grupo
│
└─ Calificaciones (/docencia/calificaciones)
   → Registrar calificaciones
   → Promedios
   → Exportar
```

### 5. Reportes (`📊`)
```
Subcategoría - Admin/Docente

├─ Reportes de Asistencia (/reportes/asistencia)
│  → Por docente
│  → Por grupo
│  → Por estudiante
│  → Rango de fechas
│  → Exportar (PDF/Excel)
│
├─ Reportes de Carga Horaria (/reportes/carga-horaria)
│  → Horas totales por docente
│  → Horas por materia
│  → Comparativas
│  → Exportar
│
├─ Reportes de Uso de Aulas (/reportes/aulas)
│  → Ocupación de aulas
│  → Horarios pico
│  → Disponibilidad
│  → Exportar
│
└─ Dashboard de Indicadores (/reportes/dashboard)
   → Gráficos de asistencia
   → Estadísticas de carga horaria
   → Uso de infraestructura
   → KPIs del sistema
```

### 6. Administración (`⚙️`)
```
Subcategoría - Solo Admin

├─ Auditoría (/admin/auditoria)
│  → Bitácora de cambios
│  → Quién cambió qué y cuándo
│  → Filtrar por usuario/módulo
│
├─ Configuración (/admin/configuracion)
│  → Datos de la institución
│  → Período académico actual
│  → Parámetros del sistema
│  → Temas visuales
│
└─ Respaldo de Datos (/admin/respaldo)
   → Crear backup
   → Restaurar backup
   → Historial de backups
   → Descargar base de datos
```

---

## 🔐 Sistema de Roles

### Roles Disponibles

```typescript
enum UserRole {
  ADMIN = 'admin',                    // Acceso total
  ADMINISTRATIVO = 'administrativo',  // Gestión académica
  DOCENTE = 'docente',               // Solo docencia
  ESTUDIANTE = 'estudiante'          // (Futuro)
}
```

### Matriz de Acceso

| Sección | Admin | Administrativo | Docente | Estudiante |
|---------|-------|----------------|---------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ❌ |
| Gestión de Usuarios | ✅ | ❌ | ❌ | ❌ |
| Gestión Académica | ✅ | ✅ | ❌ | ❌ |
| Docencia | ✅ | ❌ | ✅ | ❌ |
| Reportes | ✅ | ✅ | ✅ | ❌ |
| Administración | ✅ | ❌ | ❌ | ❌ |

---

## 📍 Rutas Implementadas

### Dashboard
```
GET  /dashboard
```

### Gestión de Usuarios
```
GET  /admin/usuarios
POST /admin/usuarios
PUT  /admin/usuarios/:id
DELETE /admin/usuarios/:id

GET  /admin/roles
POST /admin/roles
PUT  /admin/roles/:id
DELETE /admin/roles/:id

GET  /admin/permisos
POST /admin/permisos
PUT  /admin/permisos/:id
DELETE /admin/permisos/:id
```

### Gestión Académica
```
GET  /admin/docentes
GET  /admin/materias
GET  /admin/grupos
GET  /admin/aulas
GET  /admin/horarios
```

### Docencia (Docente)
```
GET  /docencia/asignaciones
GET  /docencia/mi-carga-horaria
GET  /docencia/asistencias
GET  /docencia/calificaciones
```

### Reportes
```
GET  /reportes/asistencia
GET  /reportes/carga-horaria
GET  /reportes/aulas
GET  /reportes/dashboard
```

### Administración
```
GET  /admin/auditoria
GET  /admin/configuracion
GET  /admin/respaldo
```

---

## 🔄 Flujo de Funcionamiento

### 1. Usuario Inicia Sesión
```
1. Login page
2. Backend valida credenciales
3. Devuelve token + roles
4. Frontend obtiene roles
5. Sidebar se filtra según roles
```

### 2. Usuario Navega
```
1. Hace clic en menú
2. Si es expandible, se abre/cierra
3. Si es ruta, navega
4. Sidebar se cierra (en mobile)
5. Página se carga
```

### 3. Menú se Auto-Expande
```
1. Cuando URL contiene subrutas
2. El menú padre se expande automáticamente
3. El menú activo se resalta
4. Usuario sabe dónde está
```

---

## 💡 Ejemplos de Uso

### Acceder como Admin
```typescript
// En App.tsx
<Sidebar 
  isOpen={sidebarOpen} 
  onClose={() => setSidebarOpen(false)}
  userRoles={['admin']}  // Ve todo
/>
```

### Acceder como Docente
```typescript
<Sidebar 
  isOpen={sidebarOpen} 
  onClose={() => setSidebarOpen(false)}
  userRoles={['docente']}  // Solo Docencia + Reportes
/>
```

### Crear Nueva Ruta
```typescript
// 1. Agregar a menuConfig.ts
{
  label: 'Nueva Sección',
  icon: '📌',
  children: [
    { label: 'Opción', path: '/nueva-seccion/opcion' }
  ]
}

// 2. En App.tsx
<Route path="/nueva-seccion/opcion" element={<Component />} />
```

---

## 📊 Componentes Existentes

### Implementados
- ✅ ImportarDocentesExcel.tsx → `/admin/docentes`
- ✅ ImportarMaterias.tsx → `/admin/materias`
- ✅ Asignaciones.tsx → `/docencia/asignaciones`
- ✅ AsignacionMaterias.tsx → `/admin/materias` (gestión)
- ✅ MiCargaHoraria.tsx → `/docencia/mi-carga-horaria`
- ✅ GestionarHorarios.tsx → `/admin/horarios`

### Por Implementar
- ❌ Dashboard.tsx
- ❌ Usuarios.tsx
- ❌ Roles.tsx
- ❌ Permisos.tsx
- ❌ Grupos.tsx
- ❌ Aulas.tsx
- ❌ Asistencias.tsx
- ❌ Calificaciones.tsx
- ❌ Reportes (varios)
- ❌ Auditoria.tsx
- ❌ Configuracion.tsx
- ❌ Respaldo.tsx

---

## 🚀 Cómo Usar

### 1. Importar Sidebar
```typescript
import Sidebar from './components/Sidebar'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userRoles, setUserRoles] = useState(['docente'])

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRoles={userRoles}
      />
      {/* Contenido */}
    </>
  )
}
```

### 2. Agregar Nueva Ruta
```typescript
// Frontend/src/config/menuConfig.ts
{
  label: 'Mi Nueva Sección',
  path: '/mi-ruta',
  icon: '📌',
  requiredRoles: ['admin']
}

// Frontend/src/App.tsx
<Route path="/mi-ruta" element={<MiComponente />} />
```

### 3. Filtrar por Roles
```typescript
// El Sidebar filtra automáticamente
// Solo muestra menús que el usuario puede ver
userRoles = ['docente'] → Solo ve Docencia + Reportes (básico)
userRoles = ['admin'] → Ve TODO
```

---

## 📝 Checklist de Integración

- [ ] Importar menuConfig.ts
- [ ] Actualizar Sidebar.tsx
- [ ] Pasar userRoles al Sidebar
- [ ] Crear todas las rutas en App.tsx
- [ ] Implementar componentes por página
- [ ] Proteger rutas por rol
- [ ] Probar con diferentes roles
- [ ] Verificar auto-expansión del menú
- [ ] Probar en mobile (responsivo)

---

## 🎯 Próximos Pasos

1. **Integrar en App.tsx**
   - Agregar todas las rutas nuevas
   - Pasar userRoles correctamente

2. **Implementar componentes**
   - Crear Dashboard
   - Crear Usuarios, Roles, Permisos
   - Crear Reportes

3. **Backend**
   - Endpoints para cada sección
   - Validación de permisos por endpoint

4. **Testing**
   - Probar con diferentes roles
   - Verificar acceso a rutas
   - Verificar visibilidad de menús

---

**Versión**: 2.0  
**Última actualización**: 11 Noviembre 2025  
**Estado**: ✅ LISTO PARA IMPLEMENTAR  

🎉 **Nueva estructura jerárquica del sistema FICCT completada**
