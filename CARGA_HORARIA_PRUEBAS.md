# 🧪 Guía de Pruebas - Sistema de Carga Horaria

## ✅ Checklist de Verificación

### 1️⃣ Verificación de Base de Datos

```bash
# Conexión a PostgreSQL
psql -U usuario -d ExamenSi1

# Verificar tablas creadas
\dt CargaHorariaDocente
\dt HorarioDisponibilidad

# Ver estructura
\d CargaHorariaDocente
\d HorarioDisponibilidad
```

**Resultado esperado**: 
```
                 Tabla "public.CargaHorariaDocente"
     Columna       |            Tipo             | Modificadores
-------------------+-----------------------------+------------------
 id_carga          | bigint                      | not null primary key
 cod_docente       | bigint                      | not null foreign key
 sigla_materia     | character varying(20)       | not null foreign key
 horas_asignadas   | integer                     | not null
 orden_preferencia | integer                     | 
 activo            | boolean                     | default true
 created_at        | timestamp without time zone | 
 updated_at        | timestamp without time zone |
```

---

### 2️⃣ Verificación de API Endpoints

#### Test 2.1: Listar todas las cargas
```bash
curl -X GET \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json" \
  http://localhost/api/carga-horaria
```

**Respuesta esperada**: `200 OK`
```json
{
  "data": [
    {
      "id_carga": 1,
      "cod_docente": 5,
      "sigla_materia": "MAT101",
      "horas_asignadas": 8,
      "orden_preferencia": 1,
      "activo": true,
      "docente": { "cod_docente": 5, "nombre": "Juan Pérez" },
      "materia": { "sigla": "MAT101", "nombre": "Cálculo I" },
      "horarios": [...]
    }
  ]
}
```

---

#### Test 2.2: Crear nueva asignación
```bash
curl -X POST \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_docente": 5,
    "sigla_materia": "MAT101",
    "horas_asignadas": 8,
    "orden_preferencia": 1
  }' \
  http://localhost/api/carga-horaria
```

**Respuesta esperada**: `201 Created`
```json
{
  "message": "Carga horaria creada exitosamente",
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

**Error esperado si duplicado**: `422 Unprocessable Entity`
```json
{
  "message": "Este docente ya tiene asignada esta materia"
}
```

---

#### Test 2.3: Obtener cargas de un docente
```bash
curl -X GET \
  -H "Authorization: Bearer {TOKEN}" \
  http://localhost/api/carga-horaria/docente/5
```

**Respuesta esperada**: `200 OK`
```json
{
  "cargas": [
    {
      "id_carga": 42,
      "sigla_materia": "MAT101",
      "horas_asignadas": 8,
      "orden_preferencia": 1,
      "horarios": [
        {
          "id_horario": 1,
          "dia_semana": "Lunes",
          "hora_inicio": "09:00:00",
          "hora_fin": "11:00:00",
          "aula": "A101",
          "activo": true
        }
      ]
    }
  ],
  "total_horas": 8,
  "cantidad_materias": 1
}
```

---

#### Test 2.4: Agregar horario disponible
```bash
curl -X POST \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "dia_semana": "Lunes",
    "hora_inicio": "09:00",
    "hora_fin": "11:00",
    "aula_id": 1
  }' \
  http://localhost/api/carga-horaria/42/horarios
```

**Respuesta esperada**: `201 Created`
```json
{
  "message": "Horario agregado exitosamente",
  "data": {
    "id_horario": 1,
    "id_carga": 42,
    "dia_semana": "Lunes",
    "hora_inicio": "09:00:00",
    "hora_fin": "11:00:00",
    "aula_id": 1,
    "activo": true
  }
}
```

---

#### Test 2.5: Actualizar horario
```bash
curl -X PUT \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "dia_semana": "Martes",
    "hora_inicio": "10:00",
    "hora_fin": "12:00"
  }' \
  http://localhost/api/carga-horaria/42/horarios/1
```

**Respuesta esperada**: `200 OK`

---

#### Test 2.6: Eliminar horario
```bash
curl -X DELETE \
  -H "Authorization: Bearer {TOKEN}" \
  http://localhost/api/carga-horaria/42/horarios/1
```

**Respuesta esperada**: `200 OK`
```json
{
  "message": "Horario eliminado exitosamente"
}
```

---

### 3️⃣ Pruebas del Frontend

#### Test 3.1: Componente AsignacionMaterias

**Pasos**:
1. Navegar a `/admin/carga-horaria` (ruta a definir)
2. Verificar que se carga lista de docentes
3. Hacer clic en un docente
4. Verificar que se cargan sus materias asignadas
5. Llenar formulario:
   - Seleccionar materia
   - Ingresar horas
   - Ingresar orden
6. Hacer clic en "Agregar Carga"
7. Verificar que aparece en tabla
8. Hacer clic en "Editar" → modificar → guardar
9. Hacer clic en "Eliminar" → confirmar

**Resultado esperado**:
- ✅ Lista de docentes carga correctamente
- ✅ Al seleccionar docente, se cargan sus materias
- ✅ Se puede agregar nueva materia
- ✅ La tabla se actualiza automáticamente
- ✅ Se puede editar y eliminar

---

#### Test 3.2: Componente MiCargaHoraria

**Pasos**:
1. Logout y login como docente
2. Navegar a `/mi-carga-horaria`
3. Verificar que muestra:
   - Nombre del docente
   - Total de horas
   - Cantidad de materias
   - Tabla con detalle de cada materia
   - Horarios para cada materia

**Resultado esperado**:
- ✅ Se obtiene automáticamente el docente logueado
- ✅ Se muestran sus cargas asignadas
- ✅ Se muestran los horarios de cada carga
- ✅ No hay botones de edición (solo lectura)
- ✅ Layout es claro y legible

---

#### Test 3.3: Componente GestionarHorarios

**Pasos**:
1. Navegar a `/admin/gestionar-horarios`
2. Seleccionar un docente del panel izquierdo
3. Se cargan las materias del docente
4. Hacer clic en una materia
5. Se cargan los horarios existentes
6. Llenar formulario con nuevo horario:
   - Día: Lunes
   - Hora inicio: 09:00
   - Hora fin: 11:00
   - Aula: A101
7. Hacer clic en "Agregar Horario"
8. Verificar que aparece en tabla
9. Editar un horario
10. Eliminar un horario

**Resultado esperado**:
- ✅ Selector de docente funciona
- ✅ Selector de materia funciona
- ✅ Se cargan horarios existentes
- ✅ Se puede agregar nuevo horario
- ✅ Se valida que inicio < fin
- ✅ Se puede editar y eliminar horarios
- ✅ Tabla se actualiza sin recargar página

---

### 4️⃣ Validaciones

#### Test 4.1: No permitir duplicados
```bash
# Primera asignación
curl -X POST \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_docente": 5,
    "sigla_materia": "MAT101",
    "horas_asignadas": 8
  }' \
  http://localhost/api/carga-horaria

# Segunda asignación (mismo docente + materia)
curl -X POST \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_docente": 5,
    "sigla_materia": "MAT101",
    "horas_asignadas": 6
  }' \
  http://localhost/api/carga-horaria
```

**Resultado esperado**: 
- ✅ Primera asignación: `201 Created`
- ✅ Segunda asignación: `422 Unprocessable Entity` con mensaje de duplicado

---

#### Test 4.2: Validar hora inicio < hora fin
```bash
curl -X POST \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "dia_semana": "Lunes",
    "hora_inicio": "14:00",
    "hora_fin": "11:00"
  }' \
  http://localhost/api/carga-horaria/42/horarios
```

**Resultado esperado**: 
- ✅ `422 Unprocessable Entity` con error de validación

---

### 5️⃣ Prueba de Integridad

#### Test 5.1: Eliminación en cascada

**Pasos**:
1. Crear carga horaria con ID 42
2. Agregar 3 horarios a esa carga
3. Hacer DELETE a `/api/carga-horaria/42`
4. Verificar en BD que los 3 horarios también fueron eliminados

**Query SQL**:
```sql
-- Verificar que existan 3 horarios
SELECT * FROM HorarioDisponibilidad WHERE id_carga = 42;
-- Resultado: 3 filas

-- Eliminar la carga
DELETE FROM CargaHorariaDocente WHERE id_carga = 42;

-- Verificar que horarios fueron eliminados en cascada
SELECT * FROM HorarioDisponibilidad WHERE id_carga = 42;
-- Resultado: 0 filas (vacío) ✅
```

---

### 6️⃣ Prueba de Autenticación

#### Test 6.1: Sin token
```bash
curl -X GET http://localhost/api/carga-horaria
```

**Resultado esperado**: `401 Unauthorized`
```json
{
  "message": "Unauthenticated."
}
```

---

#### Test 6.2: Con token inválido
```bash
curl -X GET \
  -H "Authorization: Bearer INVALID_TOKEN" \
  http://localhost/api/carga-horaria
```

**Resultado esperado**: `401 Unauthorized`

---

## 📊 Pruebas de Rendimiento (Opcional)

### Test de carga: 1000 registros

```bash
# Insertar 1000 cargas horarias
for i in {1..1000}; do
  curl -X POST \
    -H "Authorization: Bearer {TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"cod_docente\": $((i % 50 + 1)),
      \"sigla_materia\": \"MAT$i\",
      \"horas_asignadas\": $((5 + i % 10))
    }" \
    http://localhost/api/carga-horaria
done

# Listar todas (debe ser rápido con índices)
time curl -X GET \
  -H "Authorization: Bearer {TOKEN}" \
  http://localhost/api/carga-horaria
```

**Resultado esperado**: 
- ✅ Respuesta en < 500ms
- ✅ Sin errores de memoria
- ✅ Índices funcionando correctamente

---

## 🔧 Troubleshooting

### Error: Tabla no existe
```
SQLSTATE[42P01]: Undefined table: 7 ERROR: la relación "CargaHorariaDocente" no existe
```
**Solución**:
```bash
cd Backend
php artisan migrate
```

---

### Error: Foreign key constraint fails
```
SQLSTATE[23503]: Foreign key violation
```
**Solución**:
- Verificar que cod_docente existe en tabla Docente
- Verificar que sigla_materia existe en tabla Materia

---

### Error: 422 Unprocessable Entity sin mensaje
**Solución**:
- Revisar que los datos cumplan validaciones
- Verificar formato de fecha/hora
- Consultar logs en `Backend/storage/logs/`

---

## 📋 Resumen de Pruebas Completadas

- [ ] DB: Tablas creadas correctamente
- [ ] API: GET /carga-horaria
- [ ] API: POST /carga-horaria
- [ ] API: GET /carga-horaria/docente/{id}
- [ ] API: POST /carga-horaria/{id}/horarios
- [ ] API: PUT /carga-horaria/{id}/horarios/{id}
- [ ] API: DELETE /carga-horaria/{id}/horarios/{id}
- [ ] Frontend: AsignacionMaterias carga y funciona
- [ ] Frontend: MiCargaHoraria muestra datos del docente
- [ ] Frontend: GestionarHorarios CRUD completo
- [ ] Validación: No duplicados
- [ ] Validación: Hora inicio < fin
- [ ] Validación: Autenticación requerida
- [ ] Integridad: Eliminación en cascada funciona

---

**Documento creado**: 2024-01-15  
**Última actualización**: [Hoy]  
**Estado**: Ready for QA ✅
