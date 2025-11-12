# 🚀 GUÍA RÁPIDA - Agregar Nuevas Rutas

## ⚡ 3 Pasos para Agregar una Nueva Ruta

### Paso 1️⃣: Actualizar menuConfig.ts

**Archivo**: `Frontend/src/config/menuConfig.ts`

```typescript
// Agregar a la sección correspondiente
{
  label: 'Mi Nueva Sección',
  path: '/nueva-ruta',
  icon: '📌',
  requiredRoles: ['admin']  // Quién la ve
}
```

**Ejemplo - Agregar en Gestión Académica:**
```typescript
export const mainMenuConfig: MenuItem[] = [
  // ... otros items
  {
    label: 'Gestión Académica',
    icon: '📚',
    requiredRoles: ['admin', 'administrativo'],
    children: [
      { label: 'Docentes', path: '/admin/docentes', icon: '👨‍🏫' },
      { label: 'Materias', path: '/admin/materias', icon: '📖' },
      // AQUÍ: Agregar la nueva ruta
      { label: 'Mi Nueva Sección', path: '/nueva-ruta', icon: '📌' },
    ]
  },
  // ... resto de items
]
```

### Paso 2️⃣: Crear el Componente

**Archivo**: `Frontend/src/pages/MiComponente.tsx`

```typescript
export default function MiComponente() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Mi Nueva Sección</h1>
      {/* Contenido aquí */}
    </div>
  )
}
```

### Paso 3️⃣: Agregar la Ruta en App.tsx

**Archivo**: `Frontend/src/App.tsx`

```typescript
import MiComponente from './pages/MiComponente'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Otras rutas */}
        <Route path="/nueva-ruta" element={<MiComponente />} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

## 📋 Rutas Estándar por Sección

### Dashboard
```typescript
{
  label: 'Dashboard',
  path: '/dashboard',
  icon: '📊',
  requiredRoles: ['admin', 'docente', 'administrativo']
}
```

### Gestión de Usuarios ➜ `/admin/usuarios/*`
```typescript
children: [
  { label: 'Usuarios', path: '/admin/usuarios', icon: '👤' },
  { label: 'Roles', path: '/admin/roles', icon: '🔐' },
  { label: 'Permisos', path: '/admin/permisos', icon: '⚙️' }
]
```

### Gestión Académica ➜ `/admin/*`
```typescript
children: [
  { label: 'Docentes', path: '/admin/docentes', icon: '👨‍🏫' },
  { label: 'Materias', path: '/admin/materias', icon: '📖' },
  { label: 'Grupos', path: '/admin/grupos', icon: '👥' },
  { label: 'Aulas', path: '/admin/aulas', icon: '🏫' },
  { label: 'Horarios', path: '/admin/horarios', icon: '⏰' }
]
```

### Docencia ➜ `/docencia/*`
```typescript
children: [
  { label: 'Mis Asignaciones', path: '/docencia/asignaciones', icon: '📋' },
  { label: 'Mi Carga Horaria', path: '/docencia/mi-carga-horaria', icon: '⏳' },
  { label: 'Asistencias', path: '/docencia/asistencias', icon: '✓' },
  { label: 'Calificaciones', path: '/docencia/calificaciones', icon: '⭐' }
]
```

### Reportes ➜ `/reportes/*`
```typescript
children: [
  { label: 'Reportes de Asistencia', path: '/reportes/asistencia', icon: '📋' },
  { label: 'Reportes de Carga Horaria', path: '/reportes/carga-horaria', icon: '⏳' },
  { label: 'Reportes de Uso de Aulas', path: '/reportes/aulas', icon: '🏫' },
  { label: 'Dashboard de Indicadores', path: '/reportes/dashboard', icon: '📈' }
]
```

### Administración ➜ `/admin/*`
```typescript
children: [
  { label: 'Auditoría', path: '/admin/auditoria', icon: '📝' },
  { label: 'Configuración', path: '/admin/configuracion', icon: '⚙️' },
  { label: 'Respaldo de Datos', path: '/admin/respaldo', icon: '💾' }
]
```

---

## 🔐 Sistema de Roles

### Roles Disponibles
- `admin` - Acceso total
- `administrativo` - Gestión académica
- `docente` - Docencia y reportes básicos
- `estudiante` - Acceso limitado (futuro)

### Cómo Especificar Permisos
```typescript
// Solo admins
requiredRoles: ['admin']

// Múltiples roles
requiredRoles: ['admin', 'administrativo']

// Si está vacío o no existe
// → Visible para todos los autenticados
```

---

## 📦 Estructura de Carpetas Recomendada

```
Frontend/src/
├── pages/                    # Páginas principales
│   ├── Dashboard.tsx
│   ├── Usuarios.tsx
│   ├── Docentes.tsx
│   ├── AsignacionMaterias.tsx
│   ├── MiCargaHoraria.tsx
│   ├── GestionarHorarios.tsx
│   └── ...
│
├── components/              # Componentes reutilizables
│   ├── Sidebar.tsx
│   ├── Layout.tsx
│   ├── ...
│
└── config/                  # Configuración
    └── menuConfig.ts
```

---

## 💡 Ejemplos Completos

### Ejemplo 1: Ruta Simple (Sin subremenú)

```typescript
// 1. menuConfig.ts
{
  label: 'Dashboard',
  path: '/dashboard',
  icon: '📊',
  requiredRoles: ['admin', 'docente', 'administrativo']
}

// 2. pages/Dashboard.tsx
export default function Dashboard() {
  return <div>Dashboard Content</div>
}

// 3. App.tsx
<Route path="/dashboard" element={<Dashboard />} />
```

### Ejemplo 2: Ruta con Subremenú

```typescript
// 1. menuConfig.ts
{
  label: 'Gestión de Usuarios',
  icon: '👥',
  requiredRoles: ['admin'],
  children: [
    { label: 'Usuarios', path: '/admin/usuarios', icon: '👤' },
    { label: 'Roles', path: '/admin/roles', icon: '🔐' }
  ]
}

// 2. pages/Usuarios.tsx
export default function Usuarios() {
  return <div>Usuarios Content</div>
}

// 3. pages/Roles.tsx
export default function Roles() {
  return <div>Roles Content</div>
}

// 4. App.tsx
<Route path="/admin/usuarios" element={<Usuarios />} />
<Route path="/admin/roles" element={<Roles />} />
```

### Ejemplo 3: Ruta Protegida por Rol

```typescript
// 1. menuConfig.ts
{
  label: 'Asistencias',
  path: '/docencia/asistencias',
  icon: '✓',
  requiredRoles: ['docente']  // Solo docentes
}

// 2. La ruta se filtrará automáticamente
// Un admin NO verá "Asistencias" en el menú
// Un docente SÍ verá "Asistencias"
```

---

## ✅ Checklist

Antes de agregar una ruta nueva:

- [ ] ¿Qué roles pueden acceder?
- [ ] ¿Qué ícono usará?
- [ ] ¿Pertenece a un subremenú?
- [ ] ¿Cuál es la ruta exacta?
- [ ] ¿Ya existe el componente?
- [ ] ¿Necesita datos del backend?

---

## 🐛 Solución de Problemas

### "La ruta no aparece en el menú"
✅ Verificar:
- Está agregada en menuConfig.ts
- Los roles coinciden con el usuario
- No hay errores de sintaxis

### "Clic en menú no navega"
✅ Verificar:
- La ruta existe en App.tsx
- El path coincide exactamente
- El componente se importó correctamente

### "El subremenú no se expande"
✅ Verificar:
- Tiene `children: []` en menuConfig.ts
- Los items hijos tienen `path` definido
- No hay errores en la consola

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Menú no visible | Verificar `requiredRoles` |
| Ruta 404 | Verificar path en App.tsx |
| Estilos raros | Limpiar cache (Ctrl+Shift+R) |
| Props indefinidas | Verificar Sidebar recibe userRoles |

---

**Última actualización**: 11 Noviembre 2025  
**Versión**: 1.0  
🚀 **¡Listo para agregar nuevas rutas!**
