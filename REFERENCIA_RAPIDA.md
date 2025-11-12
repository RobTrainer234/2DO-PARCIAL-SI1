# 📋 REFERENCIA RÁPIDA - Carga Horaria

## ⚡ Cheatsheet del Sistema

---

## 🎯 Endpoints API

```bash
# Listar todas las cargas
GET /api/carga-horaria

# Crear nueva asignación
POST /api/carga-horaria
{
  "cod_docente": 5,
  "sigla_materia": "MAT101",
  "horas_asignadas": 8,
  "orden_preferencia": 1
}

# Obtener cargas de un docente
GET /api/carga-horaria/docente/5

# Actualizar carga
PUT /api/carga-horaria/42
{
  "horas_asignadas": 10,
  "orden_preferencia": 2
}

# Eliminar carga
DELETE /api/carga-horaria/42

# Agregar horario
POST /api/carga-horaria/42/horarios
{
  "dia_semana": "Lunes",
  "hora_inicio": "09:00",
  "hora_fin": "11:00",
  "aula_id": 1
}

# Actualizar horario
PUT /api/carga-horaria/42/horarios/1
{
  "dia_semana": "Martes",
  "hora_inicio": "10:00",
  "hora_fin": "12:00"
}

# Eliminar horario
DELETE /api/carga-horaria/42/horarios/1

# Obtener horarios de docente
GET /api/carga-horaria/horarios/5

# Validar horas
POST /api/carga-horaria/validar-horas
{
  "cod_docente": 5,
  "total_horas": 20
}
```

---

## 🧩 Componentes React

### AsignacionMaterias
```typescript
<AsignacionMaterias />

// Ubicación: /admin/carga-horaria
// Funciones:
// - Seleccionar docente
// - Agregar materia
// - Editar asignación
// - Eliminar asignación
// - Ver total de horas
```

### MiCargaHoraria
```typescript
<MiCargaHoraria />

// Ubicación: /mi-carga-horaria
// Funciones:
// - Ver cargas del docente logueado
// - Ver horarios de cada carga
// - Ver totales y promedios
// - Solo lectura (no editable)
```

### GestionarHorarios
```typescript
<GestionarHorarios />

// Ubicación: /admin/gestionar-horarios
// Funciones:
// - Seleccionar docente y materia
// - Agregar horario
// - Editar horario
// - Eliminar horario
// - Ver tabla de horarios
```

---

## 🔧 Rutas Frontend

```typescript
// Agregar a tu router

<Route path="/admin/carga-horaria" element={<AsignacionMaterias />} />
<Route path="/admin/gestionar-horarios" element={<GestionarHorarios />} />
<Route path="/mi-carga-horaria" element={<MiCargaHoraria />} />
```

---

## 🗄️ Estructura BD

### CargaHorariaDocente
```sql
id_carga (PK)
cod_docente (FK)
sigla_materia (FK)
horas_asignadas (INT)
orden_preferencia (INT, nullable)
activo (BOOLEAN)
created_at / updated_at
```

### HorarioDisponibilidad
```sql
id_horario (PK)
id_carga (FK)
dia_semana (VARCHAR)
hora_inicio (TIME)
hora_fin (TIME)
aula_id (FK, nullable)
activo (BOOLEAN)
created_at / updated_at
```

---

## 📝 Datos de Ejemplo

### Crear asignación
```json
{
  "cod_docente": 5,
  "sigla_materia": "MAT101",
  "horas_asignadas": 8,
  "orden_preferencia": 1
}
```

### Crear horario
```json
{
  "dia_semana": "Lunes",
  "hora_inicio": "09:00",
  "hora_fin": "11:00",
  "aula_id": 1
}
```

### Respuesta exitosa
```json
{
  "message": "Operación exitosa",
  "data": {
    "id_carga": 42,
    "cod_docente": 5,
    "sigla_materia": "MAT101",
    "horas_asignadas": 8,
    "orden_preferencia": 1,
    "activo": true
  }
}
```

---

## ⚠️ Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| 401 Unauthorized | Sin token o inválido | Hacer login |
| 422 Unprocessable | Duplicado | Usar otra materia |
| 404 Not Found | Recurso no existe | Verificar IDs |
| 500 Server Error | Error en servidor | Revisar logs |

---

## 🚀 Inicio Rápido

1. **Backend corriendo**
   ```bash
   cd Backend && php artisan serve
   ```

2. **Frontend corriendo**
   ```bash
   cd Frontend && npm run dev
   ```

3. **Integrar rutas**
   ```typescript
   // En tu App.tsx
   import AsignacionMaterias from './components/AsignacionMaterias'
   import MiCargaHoraria from './components/MiCargaHoraria'
   import GestionarHorarios from './components/GestionarHorarios'
   
   <Route path="/admin/carga-horaria" element={<AsignacionMaterias />} />
   <Route path="/mi-carga-horaria" element={<MiCargaHoraria />} />
   <Route path="/admin/gestionar-horarios" element={<GestionarHorarios />} />
   ```

4. **Actualizar sidebar**
   ```typescript
   // Agregar menú "Gestión Académica" con subitems
   ```

5. **Probar**
   ```
   http://localhost:5173/admin/carga-horaria
   ```

---

## 📊 Comandos Útiles

```bash
# Migrations
php artisan migrate                    # Ejecutar migraciones
php artisan migrate:rollback          # Revertir última migración
php artisan migrate:refresh           # Rollback + Up

# Rutas
php artisan route:list                # Ver todas las rutas

# Modelos
php artisan make:model NombreModelo

# Controller
php artisan make:controller NombreController

# Tests
php artisan test                      # Ejecutar tests
```

---

## 🎨 Iconos Sugeridos para Sidebar

```
Gestión Académica:     📚 book / 📖 book-open
Carga Horaria:         ⏰ clock / 📅 calendar
Asignación Materias:   ✏️ edit / 📝 clipboard
Gestionar Horarios:    🕐 history / 📊 bar-chart
Mi Carga Horaria:      👤 user / 📋 list
```

---

## 💾 Archivos Claves

| Archivo | Ubicación |
|---------|-----------|
| Modelos | `Backend/app/Models/` |
| Controlador | `Backend/app/Http/Controllers/Api/` |
| Rutas | `Backend/routes/api.php` |
| Componentes | `Frontend/src/components/` |
| Migraciones | `Backend/database/migrations/` |

---

## 🔐 Autenticación

```bash
# Header requerido en todas las requests
Authorization: Bearer {token_aqui}

# Token obtenido de:
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

---

## 📱 Responsivo

- ✅ Desktop: 100% funcional
- ✅ Tablet: 100% funcional
- ✅ Mobile: Componentes adaptativos

---

## ✅ Checklist

- [ ] Backend corriendo
- [ ] Frontend corriendo
- [ ] Componentes importados
- [ ] Rutas creadas
- [ ] Sidebar actualizado
- [ ] Login funciona
- [ ] Puedo acceder a /admin/carga-horaria
- [ ] Puedo acceder a /mi-carga-horaria
- [ ] Puedo crear asignación
- [ ] Puedo crear horario

---

## 🎓 Documentación

- `QUICK_START.md` - Comenzar rápido
- `CARGA_HORARIA_DOCUMENTACION.md` - Documentación técnica
- `CARGA_HORARIA_PRUEBAS.md` - Guía de testing
- `GUIA_INTEGRACION_SIDEBAR.md` - Integración

---

## 💡 Tips

💡 Todas las validaciones están en el controlador  
💡 BD usa ON DELETE CASCADE automáticamente  
💡 Los componentes manejan errores automáticamente  
💡 Responsive sin CSS framework extra  
💡 Preparado para > 1000 docentes  

---

## 🚨 Importante

⚠️ Ejecutar migraciones: `php artisan migrate`  
⚠️ Token Bearer obligatorio en API  
⚠️ Validar que horas_inicio < horas_fin  
⚠️ No duplicar asignaciones (validado en backend)  
⚠️ Usar IDs correctos (cod_docente, sigla_materia)  

---

## 📞 Soporte

- Revisar logs: `Backend/storage/logs/`
- Console navegador: F12 → Console
- Endpoint inválido: Ver documentación API
- Token expirado: Hacer login de nuevo

---

**Última actualización**: 15 Enero 2024  
**Versión**: 1.0  
**Estado**: ✅ Producción Ready  

🎉 **¡Listo para usar!**
