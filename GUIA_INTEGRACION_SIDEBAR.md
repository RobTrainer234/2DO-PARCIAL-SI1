# 🔗 GUÍA DE INTEGRACIÓN - Carga Horaria en Sidebar

## 📍 Ubicación de Archivos a Actualizar

Busca estos archivos en tu proyecto Frontend:

```
Frontend/
├── src/
│   ├── App.tsx (o AppRouter.tsx, index router)
│   ├── components/
│   │   └── Sidebar.tsx (o Navigation, Layout)
│   └── pages/ (si usa estructura de páginas)
```

---

## 🔧 Paso 1: Importar Componentes

En tu archivo principal de rutas (`App.tsx` o `Router.tsx`):

```typescript
// Agregar imports
import AsignacionMaterias from './components/AsignacionMaterias'
import MiCargaHoraria from './components/MiCargaHoraria'
import GestionarHorarios from './components/GestionarHorarios'
```

---

## 🛣️ Paso 2: Agregar Rutas

Busca donde defines tus rutas. Agregar:

```typescript
// Para administrador
{
  path: '/admin/carga-horaria',
  element: <AsignacionMaterias />,
  name: 'Asignación de Materias'
}

{
  path: '/admin/gestionar-horarios',
  element: <GestionarHorarios />,
  name: 'Gestionar Horarios'
}

// Para docentes
{
  path: '/mi-carga-horaria',
  element: <MiCargaHoraria />,
  name: 'Mi Carga Horaria'
}
```

---

## 🎨 Paso 3: Actualizar Sidebar

### Opción A: Si Sidebar es un componente React

**Encontrar**: `Frontend/src/components/Sidebar.tsx`

**Buscar la sección** que tenga algo como:
```typescript
const menuItems = [
  { title: 'Dashboard', icon: 'home', path: '/' },
  { title: 'Usuarios', icon: 'users', path: '/usuarios' },
  ...
]
```

**Agregar nueva sección**:
```typescript
const menuItems = [
  // ... items existentes ...
  
  // Nueva sección: Gestión Académica
  {
    title: 'Gestión Académica',
    icon: 'book', // o 'acbook-open', 'folder'
    children: [
      {
        title: 'Carga Horaria',
        icon: 'clock',
        children: [
          {
            title: 'Asignación de Materias',
            path: '/admin/carga-horaria',
            icon: 'arrow-right'
          },
          {
            title: 'Gestionar Horarios',
            path: '/admin/gestionar-horarios',
            icon: 'arrow-right'
          }
        ]
      }
    ]
  },
  
  // Si es sección para docentes, agregar en otro lugar:
  {
    title: 'Docencia',
    icon: 'teacher', // o 'chalkboard'
    children: [
      {
        title: 'Mi Carga Horaria',
        path: '/mi-carga-horaria',
        icon: 'calendar'
      }
    ]
  }
]
```

---

### Opción B: Si Sidebar es un archivo de configuración JSON

**Encontrar**: `Frontend/src/config/sidebar.json` o similar

**Contenido actual** (ejemplo):
```json
{
  "menu": [
    { "title": "Dashboard", "path": "/" },
    { "title": "Usuarios", "path": "/usuarios" }
  ]
}
```

**Agregar**:
```json
{
  "menu": [
    // ... items existentes ...
    {
      "title": "Gestión Académica",
      "submenu": [
        {
          "title": "Carga Horaria",
          "submenu": [
            {
              "title": "Asignación de Materias",
              "path": "/admin/carga-horaria"
            },
            {
              "title": "Gestionar Horarios",
              "path": "/admin/gestionar-horarios"
            }
          ]
        }
      ]
    },
    {
      "title": "Docencia",
      "submenu": [
        {
          "title": "Mi Carga Horaria",
          "path": "/mi-carga-horaria"
        }
      ]
    }
  ]
}
```

---

## 👤 Paso 4: Permisos/Roles (Si aplica)

Si tienes sistema de permisos, agregar:

```typescript
// Para admin
{
  path: '/admin/carga-horaria',
  element: <AsignacionMaterias />,
  roles: ['admin', 'academic_admin'] // Solo estos roles ven
}

// Para docentes
{
  path: '/mi-carga-horaria',
  element: <MiCargaHoraria />,
  roles: ['teacher', 'docente'] // Solo estos roles ven
}
```

---

## 🎯 Paso 5: Verificar Funcionamiento

1. **Guardar todos los cambios**
2. **Recargar navegador** (Ctrl+R)
3. **Verificar que aparezcan nuevas opciones en sidebar**
4. **Hacer clic en cada opción**
5. **Verificar que los componentes cargan correctamente**

---

## 🐛 Troubleshooting

### Error: "Componente no encontrado"
```
Cannot find module './components/AsignacionMaterias'
```
**Solución**: Verificar que los archivos `.tsx` están en la carpeta correcta:
```
Frontend/src/components/
├── AsignacionMaterias.tsx
├── MiCargaHoraria.tsx
└── GestionarHorarios.tsx
```

---

### Error: "Ruta no definida"
```
The page you requested does not exist
```
**Solución**: Asegurarse que la ruta está en la configuración de rutas:
```typescript
<Route path="/admin/carga-horaria" element={<AsignacionMaterias />} />
```

---

### Error: "API no responde"
```
Error al cargar docentes
```
**Solución**: 
1. Verificar que el backend está corriendo: `php artisan serve`
2. Verificar que la variable API en `services/api.ts` apunta al URL correcto
3. Ver console (F12) para más detalles

---

### Error: "Token no válido"
```
401 Unauthorized
```
**Solución**: El usuario no tiene sesión activa. Hacer logout y login nuevamente.

---

## 📱 Estructura Recomendada

```
Frontend/
├── src/
│   ├── App.tsx (o index router)
│   ├── pages/
│   │   ├── AdminPanel/
│   │   │   └── CargaHoraria/
│   │   │       ├── AsignacionMaterias.tsx (o redirigir a component)
│   │   │       └── GestionarHorarios.tsx
│   │   └── Docente/
│   │       └── MiCargaHoraria.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── AsignacionMaterias.tsx
│   │   ├── MiCargaHoraria.tsx
│   │   └── GestionarHorarios.tsx
│   └── services/
│       └── api.ts
```

---

## ✅ Checklist de Integración

- [ ] Importes agregados en App.tsx
- [ ] Rutas registradas
- [ ] Sidebar actualizado
- [ ] Permisos/roles configurados (si aplica)
- [ ] Navegador recargado
- [ ] Opciones aparecen en sidebar
- [ ] Componentes cargan sin errores
- [ ] API responde correctamente
- [ ] Funcionalidad CRUD funciona

---

## 🚀 Verificación Final

**Como Administrador**:
1. Navegar a "Gestión Académica → Carga Horaria → Asignación de Materias"
2. Seleccionar un docente
3. Agregar una materia
4. Guardar

**Como Docente**:
1. Logout como admin
2. Login como docente
3. Navegar a "Docencia → Mi Carga Horaria"
4. Verificar que se ve la materia que agregó el admin

---

## 📞 Soporte

Si hay problemas durante la integración:
1. Verificar que todos los archivos están en lugar correcto
2. Revisar console del navegador (F12 → Console)
3. Revisar logs del backend: `Backend/storage/logs/`
4. Verificar que el API está corriendo

---

**Integración lista para ejecutar** ✅
