/**
 * Configuración de estructura de menú y rutas del sistema FICCT
 * Mantiene la jerarquía visual en el sidebar
 */

export interface MenuItem {
  label: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
  requiredRoles?: string[];
}

export const mainMenuConfig: MenuItem[] = [
  // Dashboard
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊',
    requiredRoles: ['admin', 'docente', 'administrativo']
  },

  // ═══════════════════════════════════════
  // GESTIÓN DE USUARIOS
  // ═══════════════════════════════════════
  {
    label: 'Gestión de Usuarios',
    icon: '👥',
    requiredRoles: ['admin'],
    children: [
      {
        label: 'Usuarios',
        path: '/admin/usuarios',
        icon: '👤'
      },
      {
        label: 'Roles',
        path: '/admin/roles',
        icon: '🔐'
      },
      {
        label: 'Permisos',
        path: '/admin/permisos',
        icon: '⚙️'
      }
    ]
  },

  // ═══════════════════════════════════════
  // GESTIÓN ACADÉMICA
  // ═══════════════════════════════════════
  {
    label: 'Gestión Académica',
    icon: '📚',
    requiredRoles: ['admin', 'administrativo'],
    children: [
      {
        label: 'Docentes',
        path: '/admin/docentes',
        icon: '👨‍🏫'
      },
      {
        label: 'Materias',
        path: '/admin/materias',
        icon: '📖'
      },
      {
        label: 'Grupos',
        path: '/admin/grupos',
        icon: '👥'
      },
      {
        label: 'Aulas',
        path: '/admin/aulas',
        icon: '🏫'
      },
      {
        label: 'Horarios',
        path: '/admin/horarios',
        icon: '⏰'
      }
    ]
  },

  // ═══════════════════════════════════════
  // DOCENCIA
  // ═══════════════════════════════════════
  {
    label: 'Docencia',
    icon: '📝',
    requiredRoles: ['docente'],
    children: [
      {
        label: 'Mis Asignaciones',
        path: '/docencia/asignaciones',
        icon: '📋'
      },
      {
        label: 'Mi Carga Horaria',
        path: '/docencia/mi-carga-horaria',
        icon: '⏳'
      },
      {
        label: 'Asistencias',
        path: '/docencia/asistencias',
        icon: '✓'
      },
      {
        label: 'Calificaciones',
        path: '/docencia/calificaciones',
        icon: '⭐'
      }
    ]
  },

  // ═══════════════════════════════════════
  // REPORTES
  // ═══════════════════════════════════════
  {
    label: 'Reportes',
    icon: '📊',
    requiredRoles: ['admin', 'docente', 'administrativo'],
    children: [
      {
        label: 'Reportes de Asistencia',
        path: '/reportes/asistencia',
        icon: '📋'
      },
      {
        label: 'Reportes de Carga Horaria',
        path: '/reportes/carga-horaria',
        icon: '⏳'
      },
      {
        label: 'Reportes de Uso de Aulas',
        path: '/reportes/aulas',
        icon: '🏫'
      },
      {
        label: 'Dashboard de Indicadores',
        path: '/reportes/dashboard',
        icon: '📈'
      }
    ]
  },

  // ═══════════════════════════════════════
  // ADMINISTRACIÓN
  // ═══════════════════════════════════════
  {
    label: 'Administración',
    icon: '⚙️',
    requiredRoles: ['admin'],
    children: [
      {
        label: 'Auditoría',
        path: '/admin/auditoria',
        icon: '📝'
      },
      {
        label: 'Configuración',
        path: '/admin/configuracion',
        icon: '⚙️'
      },
      {
        label: 'Respaldo de Datos',
        path: '/admin/respaldo',
        icon: '💾'
      }
    ]
  }
];

/**
 * Helper: Obtener todas las rutas planas (sin jerarquía)
 */
export function getAllRoutes(menu = mainMenuConfig): string[] {
  const routes: string[] = [];

  const traverse = (items: MenuItem[]) => {
    items.forEach(item => {
      if (item.path) routes.push(item.path);
      if (item.children) traverse(item.children);
    });
  };

  traverse(menu);
  return routes;
}

/**
 * Helper: Filtrar menú por roles del usuario
 */
export function filterMenuByRoles(roles: string[], menu = mainMenuConfig): MenuItem[] {
  return menu
    .filter(item => !item.requiredRoles || item.requiredRoles.some(r => roles.includes(r)))
    .map(item => ({
      ...item,
      children: item.children
        ? item.children.filter(child => !child.requiredRoles || child.requiredRoles.some(r => roles.includes(r)))
        : undefined
    }))
    .filter(item => item.children?.length !== 0 || item.path); // Eliminar grupos vacíos
}
