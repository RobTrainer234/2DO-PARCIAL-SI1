-- ============================================
-- CREAR PERMISOS PARA TODOS LOS MÓDULOS
-- ============================================
-- Fecha: 11 de noviembre de 2025
-- Descripción: Inserta permisos iniciales en la tabla Permisos
-- y los asigna al rol Admin (id_rol = 1)
-- ============================================

-- 1. PERMISOS PARA USUARIOS (CU3)
-- Estos permisos ya estaban siendo validados en las rutas
INSERT INTO "Permisos" (nombre, descripcion) VALUES 
('crear_usuarios', 'Permiso para crear nuevos usuarios'),
('editar_usuarios', 'Permiso para editar usuarios existentes'),
('eliminar_usuarios', 'Permiso para eliminar usuarios'),
('importar_usuarios', 'Permiso para importar usuarios masivamente (CSV/JSON)'),
('asignar_roles', 'Permiso para asignar roles a usuarios');

-- 2. PERMISOS PARA ROLES Y PERMISOS (CU2)
INSERT INTO "Permisos" (nombre, descripcion) VALUES 
('crear_roles', 'Permiso para crear nuevos roles'),
('editar_roles', 'Permiso para editar roles existentes'),
('eliminar_roles', 'Permiso para eliminar roles'),
('asignar_permisos', 'Permiso para asignar permisos a roles');

-- 3. PERMISOS PARA DOCENTES (CU4 y CU5)
-- Actualmente sin middleware, pero lo agregamos para seguridad
INSERT INTO "Permisos" (nombre, descripcion) VALUES 
('crear_docentes', 'Permiso para crear nuevos docentes'),
('editar_docentes', 'Permiso para editar docentes existentes'),
('eliminar_docentes', 'Permiso para eliminar docentes');

-- 4. PERMISOS PARA MATERIAS (CU6)
INSERT INTO "Permisos" (nombre, descripcion) VALUES 
('crear_materias', 'Permiso para crear nuevas materias'),
('editar_materias', 'Permiso para editar materias existentes'),
('eliminar_materias', 'Permiso para eliminar materias');

-- 5. PERMISOS PARA GRUPOS (CU7 y CU8)
INSERT INTO "Permisos" (nombre, descripcion) VALUES 
('crear_grupos', 'Permiso para crear nuevos grupos'),
('editar_grupos', 'Permiso para editar grupos existentes'),
('eliminar_grupos', 'Permiso para eliminar grupos');

-- 6. PERMISOS PARA AULAS (CU9)
INSERT INTO "Permisos" (nombre, descripcion) VALUES 
('crear_aulas', 'Permiso para crear nuevas aulas'),
('editar_aulas', 'Permiso para editar aulas existentes'),
('eliminar_aulas', 'Permiso para eliminar aulas');

-- 7. PERMISOS PARA ASIGNACIONES (CU10)
INSERT INTO "Permisos" (nombre, descripcion) VALUES 
('crear_asignaciones', 'Permiso para crear nuevas asignaciones'),
('editar_asignaciones', 'Permiso para editar asignaciones existentes'),
('eliminar_asignaciones', 'Permiso para eliminar asignaciones');

-- 8. PERMISOS PARA HORARIOS (CU11 y CU12)
INSERT INTO "Permisos" (nombre, descripcion) VALUES 
('crear_horarios', 'Permiso para crear nuevos horarios'),
('editar_horarios', 'Permiso para editar horarios existentes'),
('eliminar_horarios', 'Permiso para eliminar horarios');

-- 9. PERMISOS PARA ASISTENCIAS (CU13)
INSERT INTO "Permisos" (nombre, descripcion) VALUES 
('registrar_asistencias', 'Permiso para registrar asistencias'),
('editar_asistencias', 'Permiso para editar asistencias existentes'),
('eliminar_asistencias', 'Permiso para eliminar asistencias');

-- 10. PERMISOS PARA REPORTES Y AUDITORÍA (CU14-CU21)
INSERT INTO "Permisos" (nombre, descripcion) VALUES 
('ver_reportes', 'Permiso para ver reportes'),
('validar_asistencias', 'Permiso para validar asistencias'),
('consultar_horarios', 'Permiso para consultar horarios'),
('exportar_reportes', 'Permiso para exportar reportes a PDF/Excel'),
('ver_dashboard', 'Permiso para ver dashboard de indicadores'),
('ver_auditoria', 'Permiso para acceder a la bitácora de auditoría');

-- ============================================
-- ASIGNAR TODOS LOS PERMISOS AL ROL ADMIN
-- ============================================
-- El rol Admin (id_rol = 1) debe tener acceso a TODOS los permisos

INSERT INTO "RolPermisos" (id_rol, id_permiso)
SELECT 1, id_permiso FROM "Permisos"
WHERE id_permiso NOT IN (
  SELECT id_permiso FROM "RolPermisos" WHERE id_rol = 1
);

-- ============================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================
-- Ejecutar esto para verificar que los permisos fueron creados:
-- SELECT * FROM "Permisos" ORDER BY id_permiso;
-- SELECT * FROM "RolPermisos" WHERE id_rol = 1;
