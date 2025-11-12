# 🧪 CASOS DE PRUEBA - CU1 a CU13

**Fecha**: 11 de noviembre de 2025  
**Base URL**: `http://localhost:8000/api`

---

## 🔐 CU1: Autenticación

### Test 1.1: Login Válido
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password"
  }'
```
**Esperado**: 200 OK + token Bearer
**Variables a Guardar**: `TOKEN = respuesta.token`

### Test 1.2: Login Inválido
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "wrongpassword"
  }'
```
**Esperado**: 401 Unauthorized

### Test 1.3: Ver Perfil Autenticado
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + datos del usuario

### Test 1.4: Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK

---

## 👥 CU2: Gestión de Roles y Permisos

### Test 2.1: Listar Roles
```bash
curl -X GET http://localhost:8000/api/roles \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + array de roles

### Test 2.2: Crear Rol
```bash
curl -X POST http://localhost:8000/api/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Docente Temporal",
    "descripcion": "Rol para docentes temporales"
  }'
```
**Esperado**: 201 Created + id del rol  
**Guardar**: `ROLE_ID`

### Test 2.3: Asignar Permisos a Rol
```bash
curl -X POST http://localhost:8000/api/roles/$ROLE_ID/permisos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permisos": [1, 2, 3]
  }'
```
**Esperado**: 200 OK

### Test 2.4: Listar Permisos
```bash
curl -X GET http://localhost:8000/api/permisos \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + array de permisos

---

## 👨‍💼 CU3: Gestión de Usuarios

### Test 3.1: Crear Usuario Individual
```bash
curl -X POST http://localhost:8000/api/usuarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan García",
    "email": "juan@example.com",
    "password": "securepass123",
    "tipo_usuario": "Docente"
  }'
```
**Esperado**: 201 Created  
**Guardar**: `USER_ID = respuesta.id`

### Test 3.2: Importar Usuarios CSV
```bash
# Crear archivo usuarios.csv:
# nombre,email,tipo_usuario,password
# Pedro López,pedro@example.com,Docente,pass123
# María García,maria@example.com,Admin,pass456

curl -X POST http://localhost:8000/api/usuarios/importar-csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "archivo=@usuarios.csv"
```
**Esperado**: 201 Created + array de usuarios creados

### Test 3.3: Asignar Roles a Usuario
```bash
curl -X POST http://localhost:8000/api/usuarios/$USER_ID/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": [1, 2]
  }'
```
**Esperado**: 200 OK

### Test 3.4: Listar Usuarios
```bash
curl -X GET http://localhost:8000/api/usuarios \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + usuarios paginados

### Test 3.5: Actualizar Usuario
```bash
curl -X PUT http://localhost:8000/api/usuarios/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan García Actualizado"
  }'
```
**Esperado**: 200 OK

---

## 🏫 CU4: Registrar Docente

### Test 4.1: Crear Docente Individual
```bash
curl -X POST http://localhost:8000/api/docentes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_docente": "DOC001",
    "id_usuario": 5,
    "especialidad": "Ingeniería de Sistemas",
    "fecha_contrato": "2024-01-15"
  }'
```
**Esperado**: 201 Created + datos del docente  
**Guardar**: `DOCENTE_ID = respuesta.cod_docente`

### Test 4.2: Descargar Plantilla Excel
```bash
curl -X GET http://localhost:8000/api/docentes/plantilla/descargar \
  -H "Authorization: Bearer $TOKEN" \
  -o plantilla_docentes.xlsx
```
**Esperado**: 200 OK + archivo Excel

### Test 4.3: Importar Docentes Masivo
```bash
# Crear archivo docentes.xlsx con columnas:
# cod_docente, id_usuario, especialidad, fecha_contrato

curl -X POST http://localhost:8000/api/docentes/importar-excel \
  -H "Authorization: Bearer $TOKEN" \
  -F "archivo=@docentes.xlsx"
```
**Esperado**: 201 Created + array de docentes importados

### Test 4.4: Listar Docentes
```bash
curl -X GET http://localhost:8000/api/docentes \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + array de docentes

---

## ✏️ CU5: Editar/Eliminar Docente

### Test 5.1: Actualizar Docente (con Auditoría)
```bash
curl -X PUT http://localhost:8000/api/docentes/$DOCENTE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "especialidad": "Ingeniería de Software",
    "fecha_contrato": "2024-02-01"
  }'
```
**Esperado**: 200 OK + datos actualizados  
**Verificar**: Revisar en `audit_logs` que haya registro con antes/después

### Test 5.2: Verificar Auditoría
```bash
# En base de datos:
SELECT * FROM audit_logs 
WHERE entidad = 'Docente' 
AND entidad_id = 'DOC001' 
AND accion = 'actualizar' 
ORDER BY created_at DESC LIMIT 1;
```
**Esperado**: Campo `antes` y `despues` con JSON de cambios

### Test 5.3: Intentar Eliminar Docente con Carga
```bash
curl -X DELETE http://localhost:8000/api/docentes/$DOCENTE_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 422 Unprocessable Entity + mensaje "No se puede eliminar el docente porque tiene X carga(s) asignada(s)"

### Test 5.4: Eliminar Docente sin Carga
```bash
# Crear docente sin asignaciones y luego eliminarlo
curl -X DELETE http://localhost:8000/api/docentes/DOC999 \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + mensaje "Docente eliminado correctamente"

---

## 📚 CU6: Registrar Materia

### Test 6.1: Crear Materia
```bash
curl -X POST http://localhost:8000/api/materias \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sigla": "INF101",
    "nombre": "Programación I",
    "codigo": "P001",
    "nivel": 1,
    "carga_horaria": 4
  }'
```
**Esperado**: 201 Created  
**Guardar**: `MATERIA_SIGLA = INF101`

### Test 6.2: Listar Materias por Semestre
```bash
curl -X GET "http://localhost:8000/api/materias/por-semestre/1" \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + materias del semestre 1

### Test 6.3: Obtener Semestre de Materia
```bash
curl -X GET "http://localhost:8000/api/materias/semestre/$MATERIA_SIGLA" \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + semestre (para auto-llenar en formularios)

### Test 6.4: Actualizar Materia
```bash
curl -X PUT http://localhost:8000/api/materias/$MATERIA_SIGLA \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Programación I - Actualizado",
    "carga_horaria": 5
  }'
```
**Esperado**: 200 OK

---

## 👥 CU7: Registrar Grupo

### Test 7.1: Crear Grupo
```bash
curl -X POST http://localhost:8000/api/grupos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "INF101-A-2024",
    "sigla_materia": "INF101",
    "turno": "Diurno",
    "paralelo": "A",
    "cupo_maximo": 40
  }'
```
**Esperado**: 201 Created  
**Guardar**: `GRUPO_ID = respuesta.id_grupo`

### Test 7.2: Listar Grupos
```bash
curl -X GET http://localhost:8000/api/grupos \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + array de grupos

### Test 7.3: Obtener Grupo Específico
```bash
curl -X GET http://localhost:8000/api/grupos/$GRUPO_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + datos del grupo

---

## ✏️ CU8: Editar/Eliminar Grupo

### Test 8.1: Actualizar Grupo
```bash
curl -X PUT http://localhost:8000/api/grupos/$GRUPO_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cupo_maximo": 45,
    "turno": "Nocturno"
  }'
```
**Esperado**: 200 OK

### Test 8.2: Intentar Eliminar Grupo con Horarios
```bash
# Si el grupo ya tiene horarios asignados:
curl -X DELETE http://localhost:8000/api/grupos/$GRUPO_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 422 Unprocessable Entity (si tiene horarios)

### Test 8.3: Eliminar Grupo sin Horarios
```bash
curl -X DELETE http://localhost:8000/api/grupos/$GRUPO_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK

---

## 🏢 CU9: Registrar Aula (Infraestructura)

### Test 9.1: Crear Aula
```bash
curl -X POST http://localhost:8000/api/aulas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nro": "101",
    "piso": 1,
    "capacidad": 50,
    "id_tipo": 1,
    "activo": true
  }'
```
**Esperado**: 201 Created  
**Guardar**: `AULA_ID = respuesta.id_infraestructura`

### Test 9.2: Listar Aulas
```bash
curl -X GET http://localhost:8000/api/aulas \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + array de aulas

### Test 9.3: Listar Tipos de Aula
```bash
curl -X GET http://localhost:8000/api/tipos \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + tipos (Laboratorio, Aula, Auditorio, etc)

---

## ✏️ CU10: Editar/Eliminar Aula

### Test 10.1: Actualizar Aula
```bash
curl -X PUT http://localhost:8000/api/aulas/$AULA_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "capacidad": 55,
    "activo": true
  }'
```
**Esperado**: 200 OK

### Test 10.2: Desactivar Aula (Mantenimiento)
```bash
curl -X PUT http://localhost:8000/api/aulas/$AULA_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activo": false
  }'
```
**Esperado**: 200 OK

### Test 10.3: Eliminar Aula
```bash
curl -X DELETE http://localhost:8000/api/aulas/$AULA_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK

---

## 📋 CU10b: Asignar Docentes a Grupos (DocenteGrupoMateria)

### Test 10b.1: Crear Asignación
```bash
# Primero crear asignación (docente enseña a grupo una materia)
curl -X POST http://localhost:8000/api/asignaciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_docente": "DOC001",
    "id_grupo": '$GRUPO_ID',
    "sigla_materia": "INF101",
    "id_gestion": 1
  }'
```
**Esperado**: 201 Created  
**Guardar**: `ASIGNACION_ID = respuesta.id_asignacion`

### Test 10b.2: Listar Asignaciones
```bash
curl -X GET http://localhost:8000/api/asignaciones \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + array de asignaciones

---

## 📅 CU11: Registrar Horario Manual (CON VALIDACIÓN DE CONFLICTOS)

### Test 11.1: Crear Horario Válido ✅
```bash
curl -X POST http://localhost:8000/api/horarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dia": "Lunes",
    "hora_inicio": "08:00",
    "hora_final": "10:00",
    "id_asignacion": '$ASIGNACION_ID',
    "id_infraestructura": '$AULA_ID'
  }'
```
**Esperado**: 201 Created + id_horario  
**Guardar**: `HORARIO_ID`

### Test 11.2: Intentar Crear Conflicto - MISMO DOCENTE ❌
```bash
curl -X POST http://localhost:8000/api/horarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dia": "Lunes",
    "hora_inicio": "08:30",
    "hora_final": "10:30",
    "id_asignacion": '$ASIGNACION_ID',
    "id_infraestructura": 2
  }'
```
**Esperado**: 422 Unprocessable Entity  
**Mensaje**: "Conflicto: El docente ... ya tiene clase en este horario"

### Test 11.3: Intentar Crear Conflicto - MISMA AULA ❌
```bash
# Crear otra asignación primero
curl -X POST http://localhost:8000/api/asignaciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_docente": "DOC002",
    "id_grupo": 2,
    "sigla_materia": "INF102",
    "id_gestion": 1
  }'

# Luego intentar horario conflictivo en misma aula
curl -X POST http://localhost:8000/api/horarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dia": "Lunes",
    "hora_inicio": "09:00",
    "hora_final": "11:00",
    "id_asignacion": '$ASIGNACION_ID2',
    "id_infraestructura": '$AULA_ID'
  }'
```
**Esperado**: 422 Unprocessable Entity  
**Mensaje**: "Conflicto: El aula ... ya está ocupada en este horario"

### Test 11.4: Intentar Crear Conflicto - MISMO GRUPO ❌
```bash
# Crear asignación diferente para MISMO grupo
curl -X POST http://localhost:8000/api/asignaciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_docente": "DOC003",
    "id_grupo": '$GRUPO_ID',
    "sigla_materia": "INF103",
    "id_gestion": 1
  }'

# Intentar crear horario conflictivo
curl -X POST http://localhost:8000/api/horarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dia": "Lunes",
    "hora_inicio": "08:00",
    "hora_final": "10:00",
    "id_asignacion": '$ASIGNACION_ID3',
    "id_infraestructura": 3
  }'
```
**Esperado**: 422 Unprocessable Entity  
**Mensaje**: "Conflicto: El grupo ... ya tiene clase en este horario"

### Test 11.5: Crear Múltiples Horarios
```bash
curl -X POST http://localhost:8000/api/horarios/multiple \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "horarios": [
      {
        "dia": "Martes",
        "hora_inicio": "10:00",
        "hora_final": "12:00",
        "id_asignacion": '$ASIGNACION_ID',
        "id_infraestructura": '$AULA_ID'
      },
      {
        "dia": "Miércoles",
        "hora_inicio": "14:00",
        "hora_final": "16:00",
        "id_asignacion": '$ASIGNACION_ID',
        "id_infraestructura": '$AULA_ID'
      }
    ]
  }'
```
**Esperado**: 201 Created + exitosos: 2

### Test 11.6: Ver Horarios de Docente
```bash
curl -X GET http://localhost:8000/api/horarios/docente/DOC001 \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + array de horarios del docente

### Test 11.7: Ver Horarios de Grupo
```bash
curl -X GET http://localhost:8000/api/horarios/grupo/$GRUPO_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + array de horarios del grupo

### Test 11.8: Ver Horarios de Aula
```bash
curl -X GET http://localhost:8000/api/horarios/aula/$AULA_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + array de horarios del aula

---

## ✏️ CU12: Editar/Eliminar Horario

### Test 12.1: Actualizar Horario
```bash
curl -X PUT http://localhost:8000/api/horarios/$HORARIO_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hora_inicio": "09:00",
    "hora_final": "11:00"
  }'
```
**Esperado**: 200 OK + datos actualizados

### Test 12.2: Intentar Actualizar a Horario Conflictivo ❌
```bash
curl -X PUT http://localhost:8000/api/horarios/$HORARIO_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dia": "Lunes",
    "hora_inicio": "08:00",
    "hora_final": "10:00"
  }'
```
**Esperado**: 422 Unprocessable Entity (si hay conflicto)

### Test 12.3: Eliminar Horario (Soft Delete)
```bash
curl -X DELETE http://localhost:8000/api/horarios/$HORARIO_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + mensaje "Horario eliminado exitosamente"

### Test 12.4: Verificar Soft Delete
```bash
# En base de datos:
SELECT * FROM Horarios WHERE id_horario = $HORARIO_ID;
```
**Esperado**: Fila existe con `deleted_at` NOT NULL

---

## 📝 CU13: Registrar Asistencia

### Test 13.1: Crear Asistencia Manual
```bash
curl -X POST http://localhost:8000/api/asistencias \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_asignacion": '$ASIGNACION_ID',
    "fecha": "2024-11-11",
    "hora": "08:15",
    "estado": "presente",
    "metodo": "manual",
    "observacion": "Estudiante presente"
  }'
```
**Esperado**: 201 Created  
**Guardar**: `ASISTENCIA_ID`

### Test 13.2: Crear Asistencia por QR
```bash
curl -X POST http://localhost:8000/api/asistencias/scan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "2024-11-11-INF101-08:00",
    "estado": "presente"
  }'
```
**Esperado**: 201 Created + asistencia registrada

### Test 13.3: Listar Asistencias
```bash
curl -X GET http://localhost:8000/api/asistencias \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + array de asistencias

### Test 13.4: Actualizar Asistencia
```bash
curl -X PUT http://localhost:8000/api/asistencias/$ASISTENCIA_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "ausente",
    "observacion": "Justificado - Doctor"
  }'
```
**Esperado**: 200 OK

### Test 13.5: Eliminar Asistencia
```bash
curl -X DELETE http://localhost:8000/api/asistencias/$ASISTENCIA_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK

---

## 🔍 VERIFICACIÓN DE AUDITORÍA (CU21)

### Test 21.1: Ver Bitácora de Auditoría
```bash
curl -X GET http://localhost:8000/api/auditoria/bitacora \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + registros de auditoría

### Test 21.2: Ver Detalle de Auditoría
```bash
curl -X GET http://localhost:8000/api/auditoria/detalle/1 \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + cambios antes/después

### Test 21.3: Exportar Bitácora CSV
```bash
curl -X GET http://localhost:8000/api/auditoria/exportar \
  -H "Authorization: Bearer $TOKEN" \
  -o auditoria.csv
```
**Esperado**: 200 OK + archivo CSV

---

## 📊 REPORTES (CU16-CU19)

### Test 16.1: Reporte de Asistencia por Asignación
```bash
curl -X POST http://localhost:8000/api/reportes/asistencia/asignacion \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_asignacion": '$ASIGNACION_ID',
    "fecha_inicio": "2024-11-01",
    "fecha_fin": "2024-11-30"
  }'
```
**Esperado**: 200 OK + reporte con porcentaje de asistencia

### Test 16.2: Reporte de Carga Horaria
```bash
curl -X GET "http://localhost:8000/api/reportes/carga-horaria/docente/DOC001" \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + total de horas asignadas

### Test 16.3: Reporte de Uso de Aulas
```bash
curl -X GET http://localhost:8000/api/reportes/uso-aulas \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: 200 OK + ocupación de cada aula

### Test 19.1: Exportar Asistencia a PDF
```bash
curl -X POST http://localhost:8000/api/exportar/asistencia/pdf \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_asignacion": '$ASIGNACION_ID'
  }' \
  -o reporte_asistencia.pdf
```
**Esperado**: 200 OK + archivo PDF

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] CU1: Login/Logout funciona
- [ ] CU2: Roles y permisos se crean correctamente
- [ ] CU3: Usuarios creados, importados, actualizados
- [ ] CU4: Docentes registrados e importados
- [ ] CU5: Auditoría registra cambios, no elimina con carga
- [ ] CU6: Materias creadas con nuevos campos
- [ ] CU7: Grupos creados con turno/paralelo/cupo
- [ ] CU8: Grupos editados, no se elimina con horarios
- [ ] CU9: Aulas creadas con estado activo
- [ ] CU10: Aulas editadas, asignaciones creadas
- [ ] CU11: Horarios sin conflictos se crean ✅
- [ ] CU11: Conflictos detectados (docente, aula, grupo) ✅
- [ ] CU11: Múltiples horarios se registran ✅
- [ ] CU12: Horarios editados sin conflictos ✅
- [ ] CU12: Horarios eliminados (soft delete) ✅
- [ ] CU13: Asistencias registradas (manual, QR, enlace)
- [ ] CU21: Auditoría registra todo correctamente

---

## 🚀 EJECUCIÓN AUTOMÁTICA (Script Bash/PowerShell)

**Para ejecutar todos los tests automáticamente:**

```powershell
# Guardar como: test-todos-cu.ps1

$BaseURL = "http://localhost:8000/api"
$TOKEN = ""

# 1. Login
$login = curl -s -X POST "$BaseURL/auth/login" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@test.com",
    "password": "password"
  }' | ConvertFrom-Json

$TOKEN = $login.token
Write-Host "✅ Login: $TOKEN"

# 2. Crear Materia
$materia = curl -s -X POST "$BaseURL/materias" `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d @"{
    "sigla": "INF$(Get-Random)",
    "nombre": "Test",
    "codigo": "T$(Get-Random)",
    "nivel": 1,
    "carga_horaria": 4
  }" | ConvertFrom-Json

Write-Host "✅ Materia: $($materia.sigla)"

# ... continuar con todos los CUs
```

**Ejecutar**: `PowerShell -ExecutionPolicy Bypass -File test-todos-cu.ps1`

