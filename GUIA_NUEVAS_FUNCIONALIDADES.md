# 📚 GUÍA DE USO: Nuevas Funcionalidades Implementadas

**Fecha:** 11 de noviembre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Implementado y listo para usar

---

## 📋 Contenido

1. [Registro de Logins/Logouts en Auditoría (CU1)](#cu1)
2. [Middleware de Permisos Dinámicos (CU2)](#cu2)
3. [Importación Masiva de Usuarios (CU3)](#cu3)

---

## CU1: Registro de Logins/Logouts en Auditoría {#cu1}

### ✅ Funcionalidad Implementada

Ahora cada **login** y **logout** se registra automáticamente en la tabla `audit_logs`.

### 📊 Datos Registrados

Cuando un usuario inicia o cierra sesión, se registra:

```json
{
  "id": 1,
  "usuario_id": 1,
  "accion": "LOGIN",              // ← LOGIN o LOGOUT
  "entidad": "Usuario",
  "entidad_id": 1,
  "antes": null,
  "despues": {
    "usuario_id": 1,
    "correo": "admin@ficct.edu.bo"
  },
  "ip": "192.168.1.100",          // ← IP del cliente
  "user_agent": "Mozilla/5.0...", // ← Navegador
  "creado_en": "2025-11-11 14:30:00"
}
```

### 🔍 Cómo Consultar Logins/Logouts

**Endpoint:** `GET /auditoria/bitacora`

**Parámetros:**
```
?accion=LOGIN           // Filtrar solo logins
?accion=LOGOUT          // Filtrar solo logouts
?usuario_id=1           // Filtrar por usuario
?fecha_desde=2025-11-10 // Filtrar por fecha
?fecha_hasta=2025-11-11
```

**Ejemplo de Request:**
```bash
curl -X GET "http://localhost:8000/api/auditoria/bitacora?accion=LOGIN" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "accion": "LOGIN",
      "entidad": "Usuario",
      "creado_en": "2025-11-11 14:30:00",
      "ip": "192.168.1.100"
    }
  ],
  "paginacion": {
    "total": 1,
    "pagina": 1,
    "por_pagina": 20,
    "total_paginas": 1
  }
}
```

### 🛡️ Información de Seguridad

Se registra automáticamente:
- **IP del usuario** - Para detectar accesos desde ubicaciones sospechosas
- **User-Agent** - Navegador y sistema operativo
- **Timestamp exacto** - Fecha y hora del evento
- **ID de usuario** - Quién realizó la acción

---

## CU2: Middleware de Permisos Dinámicos {#cu2}

### ✅ Funcionalidad Implementada

Ahora se puede controlar el acceso a las rutas basándose en **permisos específicos**, no solo autenticación.

### 🔧 Cómo Funciona

#### Paso 1: Crear Permisos

**Endpoint:** `POST /permisos`

```bash
curl -X POST "http://localhost:8000/api/permisos" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "crear_usuarios"
  }'
```

**Permisos sugeridos para crear:**
```
- crear_usuarios
- editar_usuarios
- eliminar_usuarios
- asignar_roles
- crear_roles
- editar_roles
- eliminar_roles
- asignar_permisos
- importar_usuarios
- ver_reportes
- exportar_reportes
- gestionar_horarios
- ver_auditoría
- etc.
```

#### Paso 2: Asignar Permisos a Roles

**Endpoint:** `POST /roles/{id}/permisos`

```bash
curl -X POST "http://localhost:8000/api/roles/1/permisos" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permisos": [1, 2, 3]  // IDs de permisos
  }'
```

#### Paso 3: Asignar Roles al Usuario

**Endpoint:** `POST /usuarios/{id}/roles`

```bash
curl -X POST "http://localhost:8000/api/usuarios/5/roles" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": [2]  // ID del rol (ej: Docente)
  }'
```

#### Paso 4: Usar la Ruta Protegida

Cuando el usuario intenta acceder a una ruta protegida:

```bash
curl -X POST "http://localhost:8000/api/usuarios" \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@ficct.edu.bo",
    "ci": "1234567",
    "password": "password123"
  }'
```

### ✅ Si el usuario tiene permiso:
```json
{
  "id": 10,
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan@ficct.edu.bo",
  "ci": "1234567",
  "activo": true,
  "roles": []
}
```

### ❌ Si el usuario NO tiene permiso:
```json
{
  "success": false,
  "message": "No tienes permiso para realizar esta acción",
  "required_permissions": ["crear_usuarios"],
  "user_permissions": ["ver_reportes", "editar_asistencias"],
  "status": 403
}
```

### 🎯 Rutas Protegidas por Permisos

| Método | Ruta | Permiso Requerido |
|--------|------|------------------|
| POST | `/usuarios` | `crear_usuarios` |
| PUT | `/usuarios/{id}` | `editar_usuarios` |
| DELETE | `/usuarios/{id}` | `eliminar_usuarios` |
| POST | `/usuarios/{id}/roles` | `asignar_roles` |
| POST | `/roles` | `crear_roles` |
| PUT | `/roles/{id}` | `editar_roles` |
| DELETE | `/roles/{id}` | `eliminar_roles` |
| POST | `/roles/{id}/permisos` | `asignar_permisos` |

### 🧪 Cómo Soportar Múltiples Permisos (OR Logic)

En el código de rutas, puedes usar múltiples permisos separados por comas:

```php
Route::post('/usuarios', [UsuarioController::class, 'store'])
    ->middleware(['auth:sanctum', 'permission:crear_usuarios,es_admin']);
```

Esto significa: el usuario debe tener **al menos uno** de estos permisos:
- `crear_usuarios` O
- `es_admin`

---

## CU3: Importación Masiva de Usuarios {#cu3}

### ✅ Funcionalidad Implementada

Ahora puedes **importar múltiples usuarios** en una sola operación usando CSV o JSON.

### 📁 Importar desde CSV

**Endpoint:** `POST /usuarios/importar-csv`

**Formato esperado en el CSV:**
```csv
nombre,apellido,correo,ci,password,telefono,sexo,direccion
Juan,Pérez,juan@ficct.edu.bo,1234567,pass123,70123456,M,La Paz
María,García,maria@ficct.edu.bo,7654321,pass456,71234567,F,Cochabamba
Carlos,López,carlos@ficct.edu.bo,1357913,pass789,72345678,M,Santa Cruz
```

**CURL Example:**
```bash
curl -X POST "http://localhost:8000/api/usuarios/importar-csv" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "archivo=@usuarios.csv"
```

### 📊 Importar desde JSON

**Endpoint:** `POST /usuarios/importar-json`

**Formato esperado en el JSON:**
```json
{
  "usuarios": [
    {
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@ficct.edu.bo",
      "ci": "1234567",
      "password": "pass123",
      "telefono": "70123456",
      "sexo": "M",
      "direccion": "La Paz"
    },
    {
      "nombre": "María",
      "apellido": "García",
      "correo": "maria@ficct.edu.bo",
      "ci": "7654321",
      "password": "pass456",
      "telefono": "71234567",
      "sexo": "F",
      "direccion": "Cochabamba"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/usuarios/importar-json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @usuarios.json
```

### ✅ Respuesta Exitosa

```json
{
  "success": true,
  "resumen": {
    "total_procesados": 3,
    "creados": 3,
    "errores": 0,
    "duplicados": 0
  },
  "detalles_errores": [],
  "detalles_duplicados": [],
  "mensaje": "Se crearon 3 usuarios."
}
```

### ⚠️ Respuesta con Errores y Duplicados

```json
{
  "success": true,
  "resumen": {
    "total_procesados": 5,
    "creados": 2,
    "errores": 2,
    "duplicados": 1
  },
  "detalles_errores": [
    {
      "fila": 3,
      "error": "Correo inválido: no-es-email",
      "datos": {
        "nombre": "Pedro",
        "apellido": "Díaz",
        "correo": "no-es-email",
        "ci": "9876543"
      }
    },
    {
      "fila": 4,
      "error": "Faltan campos obligatorios (nombre, apellido, correo, ci, password)",
      "datos": {
        "nombre": "Ana",
        "apellido": ""
      }
    }
  ],
  "detalles_duplicados": [
    {
      "fila": 5,
      "correo": "juan@ficct.edu.bo",
      "ci": "1234567",
      "motivo": "Correo duplicado"
    }
  ],
  "mensaje": "Se crearon 2 usuarios. 2 registros con error. 1 registros duplicados."
}
```

### 🔍 Validaciones Automáticas

El sistema valida automáticamente:

✅ **Campos obligatorios:**
- nombre
- apellido
- correo
- ci
- password (mín. 6 caracteres)

✅ **Formato de email:**
- Debe ser un email válido

✅ **Datos únicos:**
- No permite correos duplicados
- No permite CIs duplicados
- Si ya existe en BD, registra como "duplicado"

✅ **Manejo de errores:**
- Si hay error en una fila, continúa con las siguientes
- Retorna detalle de cada error y fila problemática
- Crea los usuarios que SÍ son válidos

### 📝 Ejemplo de Archivo CSV

Crea un archivo `usuarios.csv`:

```csv
nombre,apellido,correo,ci,password,telefono,sexo,direccion
Juan,Pérez,juan@ficct.edu.bo,1234567,password123,70123456,M,La Paz
María,García,maria@ficct.edu.bo,7654321,password456,71234567,F,Cochabamba
Carlos,López,carlos@ficct.edu.bo,1357913,password789,72345678,M,Santa Cruz
Ana,Martínez,ana@ficct.edu.bo,2468135,password000,73456789,F,Oruro
Roberto,Sánchez,roberto@ficct.edu.bo,1928374,password111,74567890,M,Potosí
```

Luego importa:
```bash
curl -X POST "http://localhost:8000/api/usuarios/importar-csv" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "archivo=@usuarios.csv"
```

### 🎯 Casos de Uso

1. **Carga inicial de usuarios** - Importar 100+ docentes/estudiantes al inicio del semestre
2. **Sincronización desde otros sistemas** - Exportar de sistema anterior → Importar aquí
3. **Actualización masiva** - Si se necesita agregar muchos usuarios nuevos rápidamente
4. **Integración con sistemas de registro** - Recibir datos de otra app y cargarlos

---

## 📊 Estado de Implementación

| Funcionalidad | Estado | Rutas | Permisos |
|---------------|--------|-------|----------|
| Registrar logins en auditoría | ✅ | `POST /auth/login` | N/A |
| Registrar logouts en auditoría | ✅ | `POST /auth/logout` | N/A |
| Middleware de permisos | ✅ | Todas las protegidas | `permission:*` |
| Importar usuarios CSV | ✅ | `POST /usuarios/importar-csv` | `importar_usuarios` |
| Importar usuarios JSON | ✅ | `POST /usuarios/importar-json` | `importar_usuarios` |

---

## 🧪 Pruebas Recomendadas

### Test 1: Verificar que se registre LOGIN

```bash
# 1. Hacer login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@ficct.edu.bo",
    "password": "password"
  }'

# 2. Verificar en auditoría
curl -X GET "http://localhost:8000/api/auditoria/bitacora?accion=LOGIN" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Test 2: Verificar que se registre LOGOUT

```bash
# 1. Hacer logout
curl -X POST "http://localhost:8000/api/auth/logout" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 2. Verificar en auditoría
curl -X GET "http://localhost:8000/api/auditoria/bitacora?accion=LOGOUT" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Test 3: Verificar middleware de permisos

```bash
# Crear permiso
curl -X POST "http://localhost:8000/api/permisos" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "crear_usuarios"}'

# Asignar a rol (ej: rol ID 2 = Docente)
curl -X POST "http://localhost:8000/api/roles/2/permisos" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permisos": [1]}'  # ID del permiso recién creado

# Asignar rol al usuario
curl -X POST "http://localhost:8000/api/usuarios/5/roles" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roles": [2]}'

# Intentar crear usuario CON permiso
curl -X POST "http://localhost:8000/api/usuarios" \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
  # ✅ Debería retornar 201 Created
```

### Test 4: Importar usuarios desde CSV

```bash
# 1. Crear archivo usuarios.csv (ver formato arriba)

# 2. Importar
curl -X POST "http://localhost:8000/api/usuarios/importar-csv" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "archivo=@usuarios.csv"

# 3. Verificar resultado
curl -X GET "http://localhost:8000/api/usuarios" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## ❓ Preguntas Frecuentes

### P: ¿Qué pasa si un usuario intenta importar sin permiso?

**R:** Retorna error 403:
```json
{
  "success": false,
  "message": "No tienes permiso para realizar esta acción",
  "required_permissions": ["importar_usuarios"],
  "user_permissions": [],
  "status": 403
}
```

### P: ¿Se puede importar usuarios sin duplicados?

**R:** Sí, el sistema automáticamente detecta y reporta duplicados sin crearlos:
- Correos duplicados
- CIs duplicados
- Los retorna en el campo `detalles_duplicados`

### P: ¿Dónde se ven los logins/logouts?

**R:** En el endpoint `/auditoria/bitacora` con filtro `accion=LOGIN` o `accion=LOGOUT`.

### P: ¿Se pueden tener múltiples permisos en una ruta?

**R:** Sí, con OR logic (usuario necesita tener AL MENOS UNO):
```php
->middleware(['auth:sanctum', 'permission:crear_usuarios,es_admin'])
```

---

## 📝 Notas Importantes

1. **Logins/Logouts** - Se registran SIEMPRE, automáticamente, en cada login/logout exitoso
2. **Permisos** - Deben crearse primero, luego asignarse a roles, luego los usuarios obtienen roles
3. **Importación** - Si hay errores, se importan los válidos y se reportan los inválidos
4. **Auditoría** - Se registra IP y User-Agent para seguridad

---

## 🎉 ¡Listo!

Las tres funcionalidades están completamente implementadas y listas para usar. 

**¿Necesitas probar algo específico? ¡Avísame! 🚀**

