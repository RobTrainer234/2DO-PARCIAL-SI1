# 🧪 GUÍA RÁPIDA DE PRUEBAS

## ⚡ INICIO RÁPIDO

### 1️⃣ Asegúrate que los servidores estén corriendo:

```bash
# Terminal 1 - Backend
cd c:\xampp\htdocs\ExamenSi1\Backend
php artisan serve --port=8000

# Terminal 2 - Frontend
cd c:\xampp\htdocs\ExamenSi1\Frontend
npm run dev
```

**Verificar**:
- Backend: http://localhost:8000/api/test → `{"message":"API funciona"}`
- Frontend: http://localhost:5173 → Sitio carga correctamente

---

## 🧪 OPCIÓN 1: PRUEBA AUTOMÁTICA (Recomendado)

### Ejecutar Script PowerShell:

```powershell
cd c:\xampp\htdocs\ExamenSi1
powershell -ExecutionPolicy Bypass -File pruebas-rapidas.ps1
```

**Qué hace**:
- ✅ Autentica usuario
- ✅ Crea Materia, Grupo, Aula
- ✅ Crea Asignación (Docente-Grupo-Materia)
- ✅ Registra Horario
- ✅ Intenta crear conflicto (DEBE FALLAR - 422)
- ✅ Edita y elimina horario
- ✅ Registra asistencia

**Resultado esperado**: Todas las pruebas en VERDE ✅

---

## 🧪 OPCIÓN 2: PRUEBAS MANUALES CON CURL

### Login (Obtener Token):

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password"
  }'
```

**Guardar el `token` en una variable**:
```powershell
$TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGc..."  # Tu token aquí
$TOKEN = "tu_token_aqui"
```

### Crear Materia:

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

### Crear Grupo:

```bash
curl -X POST http://localhost:8000/api/grupos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "INF101-A",
    "sigla_materia": "INF101",
    "turno": "Diurno",
    "paralelo": "A",
    "cupo_maximo": 40
  }'
```

### Crear Aula:

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

### Crear Asignación (Docente enseña a Grupo):

```bash
curl -X POST http://localhost:8000/api/asignaciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_docente": "DOC001",
    "id_grupo": 1,
    "sigla_materia": "INF101",
    "id_gestion": 1
  }'
```

### ⭐ PRUEBA CRÍTICA: Crear Horario SIN Conflicto

```bash
curl -X POST http://localhost:8000/api/horarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dia": "Lunes",
    "hora_inicio": "08:00",
    "hora_final": "10:00",
    "id_asignacion": 1,
    "id_infraestructura": 1
  }'
```

**Esperado**: `201 Created` ✅

### ⭐ PRUEBA CRÍTICA: Intentar Crear Conflicto (Mismo Docente)

```bash
curl -X POST http://localhost:8000/api/horarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dia": "Lunes",
    "hora_inicio": "08:30",
    "hora_final": "10:30",
    "id_asignacion": 1,
    "id_infraestructura": 2
  }'
```

**Esperado**: `422 Unprocessable Entity`  
**Mensaje**: `"Conflicto: El docente ... ya tiene clase en este horario"`

### ✅ PRUEBA: Crear Múltiples Horarios

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
        "id_asignacion": 1,
        "id_infraestructura": 1
      },
      {
        "dia": "Miércoles",
        "hora_inicio": "14:00",
        "hora_final": "16:00",
        "id_asignacion": 1,
        "id_infraestructura": 1
      }
    ]
  }'
```

**Esperado**: `201 Created` + `exitosos: 2`

---

## 📋 CHECKLIST DE VALIDACIÓN

### ✅ CU5 - Editar/Eliminar Docente
- [ ] Actualizar docente registra en `audit_logs` 
- [ ] Eliminar docente con carga retorna 422
- [ ] Auditoría muestra antes/después

**Query para validar**:
```sql
SELECT * FROM audit_logs 
WHERE entidad = 'Docente' 
ORDER BY created_at DESC LIMIT 3;
```

### ✅ CU11 - Registrar Horario
- [ ] Horario sin conflicto se crea (201)
- [ ] Conflicto docente detectado (422)
- [ ] Conflicto aula detectado (422)
- [ ] Conflicto grupo detectado (422)
- [ ] Múltiples horarios se crean
- [ ] Auditoría registra creación

**Query para validar**:
```sql
SELECT * FROM Horarios ORDER BY id_horario DESC LIMIT 5;
SELECT * FROM audit_logs 
WHERE entidad = 'Horarios' 
ORDER BY created_at DESC LIMIT 5;
```

### ✅ CU12 - Editar/Eliminar Horario
- [ ] Editar horario sin conflicto funciona
- [ ] Editar a horario conflictivo retorna 422
- [ ] Eliminar horario (soft delete)
- [ ] Soft delete tiene `deleted_at` NOT NULL

**Query para validar**:
```sql
SELECT id_horario, dia, hora_inicio, deleted_at 
FROM Horarios 
ORDER BY id_horario DESC LIMIT 5;
```

### ✅ CU13 - Registrar Asistencia
- [ ] Asistencia manual se registra
- [ ] Asistencia por QR se registra
- [ ] Campos evidencia/fecha_registro/usuario_id se guardan

**Query para validar**:
```sql
SELECT * FROM Asistencia 
ORDER BY id_asistencia DESC LIMIT 3;
```

---

## 🐛 TROUBLESHOOTING

### Error 500 en Horarios:
```
Verificar: 
- Token válido (Bearer $TOKEN)
- IDs existen (asignacion, infraestructura)
- Base de datos conectada
```

### Conflicto no detectado (error esperado):
```
Verificar:
- Horario 1 creado correctamente
- Horario 2 usa MISMO docente
- MISMO día (ej: Lunes vs Lunes)
- Horarios SOLAPAN (08:00-10:00 vs 08:30-10:30)
```

### Error de Token:
```
1. Verificar token no expiró
2. Usar token completo (sin comillas extra)
3. Hacer login nuevo si necesario
```

---

## 📊 RESUMEN RÁPIDO

**Estado**: ✅ LISTO PARA PRUEBAS

| Componente | Status |
|-----------|--------|
| Servidor Backend | ✅ Corriendo |
| Servidor Frontend | ✅ Corriendo |
| HorarioController | ✅ Conflictos implementados |
| DocenteController | ✅ Auditoría mejorada |
| Soft Delete | ✅ Habilitado |
| Auditoría | ✅ Completa |

**Próximo paso**: Ejecutar `pruebas-rapidas.ps1` y verificar que TODO está en VERDE ✅

