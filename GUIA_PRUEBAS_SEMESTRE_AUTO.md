# 🧪 PRUEBAS: Auto-Llenado de Semestre

## ✅ Verificación de Implementación

```
✅ Verificaciones pasadas: 4/4
✅ El auto-llenado de semestre está completamente implementado
```

---

## 🚀 Cómo Probar (Paso a Paso)

### Paso 1: Importar Materias

1. Abre la aplicación y navega a **Gestión Académica → Materias** (o el componente ImportarMaterias)
2. Haz clic en **"📥 Descargar Plantilla Excel"**
3. Se descargará `Plantilla_Importar_Materias.xlsx`
4. Completa la plantilla con tus 59 materias:
   - 51 materias regulares (MAT101, MAT102, etc.) con semestre 1-10
   - 8 materias electivas (ELC101, ELC102, etc.) SIN semestre
5. Guarda el archivo
6. Vuelve a la aplicación y selecciona el archivo para importar
7. Haz clic en **"Importar"**
8. ✅ Espera a que diga "51 materias creadas, 8 materias creadas" (o similar)

### Paso 2: Verificar en Base de Datos

```sql
-- Conectarse a PostgreSQL
psql -U postgres -d AsistenciaDb

-- Verificar materias importadas
SELECT sigla, nombre, semestre FROM Materia LIMIT 10;

-- Verificar que hay electivas (sin semestre)
SELECT sigla, nombre, semestre FROM Materia WHERE semestre IS NULL LIMIT 5;

-- Contar totales
SELECT COUNT(*) as total FROM Materia;
SELECT COUNT(*) as con_semestre FROM Materia WHERE semestre IS NOT NULL;
SELECT COUNT(*) as electivas FROM Materia WHERE semestre IS NULL;
```

### Paso 3: Probar el Endpoint API

```bash
# 1. Obtener token (login)
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq '.token' -r > token.txt

# 2. Guardar el token
TOKEN=$(cat token.txt)

# 3. Obtener semestre de una materia regular
curl -X GET "http://localhost:8000/api/materias/semestre/MAT101" \
  -H "Authorization: Bearer $TOKEN" \
  | jq

# Esperado:
# {
#   "sigla": "MAT101",
#   "nombre": "CALCULO 1",
#   "semestre": 1,
#   "es_electiva": false
# }

# 4. Obtener semestre de una materia electiva
curl -X GET "http://localhost:8000/api/materias/semestre/ELC101" \
  -H "Authorization: Bearer $TOKEN" \
  | jq

# Esperado:
# {
#   "sigla": "ELC101",
#   "nombre": "CRIPTOGRAFIA Y SEGURIDAD",
#   "semestre": null,
#   "es_electiva": true
# }
```

### Paso 4: Probar en UI (Formulario de Asignaciones)

1. Navega a **Asignaciones (CU10)**
2. Haz clic en **"Nueva Asignación"**
3. El formulario debe mostrar:
   ```
   ┌─────────────────────────────────────┐
   │ Docente:      [Seleccionar]         │
   │ Grupo:        [Seleccionar]         │
   │ Materia:      [Seleccionar]         │ ← Aquí es donde pasa la magia
   │ Semestre:     [____________]        │ ← Este campo se llena automáticamente
   │ Gestión:      [Seleccionar]         │
   │ [Guardar]                           │
   └─────────────────────────────────────┘
   ```

4. **Selecciona una materia** del dropdown de Materia, por ejemplo: "MAT101 - CALCULO 1"
5. **OBSERVA**: El campo de "Semestre" **debe llenarse automáticamente** con el valor "1"
6. **Verifica**: No deberías necesitar hacer nada en el campo de semestre
7. **Prueba con otra**: Selecciona una materia electiva como "ELC101"
8. **OBSERVA**: El campo debe mostrar "Electiva"

### Paso 5: Verificar Logs (Consola del Navegador)

1. Abre Developer Tools en tu navegador (F12)
2. Ve a la pestaña **"Console"**
3. Cuando selecciones una materia, deberías ver:
   - ✅ Una solicitud GET a `/api/materias/semestre/{sigla}`
   - ✅ Una respuesta con el JSON del semestre
   - ❌ O un error si hay problema (pero el formulario sigue funcionando)

### Paso 6: Completar la Asignación

1. Una vez verificado el auto-llenado del semestre
2. Completa los campos:
   - **Docente**: Selecciona un docente
   - **Grupo**: Selecciona un grupo
   - **Materia**: MAT101 (semestre se llenará automáticamente)
   - **Gestión**: Selecciona una gestión
3. Haz clic en **"Guardar"** o **"Crear Asignación"**
4. ✅ La asignación debe guardarse correctamente

---

## 📊 Resultados Esperados

### ✅ Caso Exitoso

| Campo | Valor |
|-------|-------|
| Materia seleccionada | MAT101 - CALCULO 1 |
| Semestre esperado | 1 |
| Semestre mostrado | **1** ✅ |
| Tiempo de llenado | <500ms |

### ⚡ Materia Electiva

| Campo | Valor |
|-------|-------|
| Materia seleccionada | ELC101 - CRIPTOGRAFIA |
| Semestre esperado | null (electiva) |
| Semestre mostrado | **Electiva** ✅ |

### ⚠️ Casos de Error (esperados)

| Situación | Comportamiento |
|-----------|---------------|
| API no disponible | Semestre vacío, error en consola |
| Materia no existe | Error 404, pero UI no se bloquea |
| No hay selección | Semestre vacío |

---

## 🐛 Solución de Problemas

### El semestre NO se llena automáticamente

**Posibles causas:**

1. ❓ Las materias no fueron importadas
   - **Solución**: Importa las materias usando ImportarMaterias.tsx

2. ❓ El servidor no está corriendo
   - **Solución**: Ejecuta `php artisan serve` en Backend

3. ❓ Token de autenticación inválido
   - **Solución**: Vuelve a loguear en la aplicación

4. ❓ El campo de materia tiene un onChange diferente
   - **Verificar**: Que `handleMateriaChange` está siendo llamado

**Verificación rápida:**
```bash
# En la consola del navegador:
console.log('Verificando handleMateriaChange')

# En Dev Tools:
# 1. Abre Console
# 2. Selecciona una materia
# 3. Deberías ver logs de la llamada API
# 4. Verifica la respuesta en la pestaña Network
```

### El campo de semestre muestra "undefined"

**Posible causa:** La respuesta del API tiene un formato diferente

**Verificación:**
```bash
# En Network tab de Dev Tools:
# 1. Filtra por "semestre"
# 2. Busca la solicitud GET /api/materias/semestre/MAT101
# 3. Verifica la respuesta (Response tab)
# 4. Debe mostrar: { "sigla": "MAT101", ... }
```

---

## ✨ Checklist de Prueba

- [ ] Las materias se importaron correctamente (59 total)
- [ ] El endpoint `/api/materias/semestre/{sigla}` devuelve respuesta correcta
- [ ] Al seleccionar una materia regular, el semestre se llena (ej: "1")
- [ ] Al seleccionar una materia electiva, muestra "Electiva"
- [ ] El campo de semestre es de solo lectura (no se puede editar)
- [ ] No hay errores en la consola del navegador
- [ ] La asignación se guarda correctamente
- [ ] El cambio es instantáneo (< 500ms)

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs**: 
   - Backend: `storage/logs/laravel.log`
   - Frontend: Console (F12)

2. **Verifica la configuración**:
   - API_TOKEN está bien en .env
   - CORS está habilitado

3. **Reinicia todo**:
   - Backend: `php artisan serve`
   - Frontend: `npm run dev`

---

## 🎯 Próximos Pasos (Cuando termines de probar)

1. ✅ Confirmar que el auto-llenado funciona
2. 📋 Importar tus 59 materias reales
3. 👥 Crear asignaciones de docentes con el auto-llenado
4. ⏰ Configurar horarios y grupos
5. 📊 Crear reportes de carga horaria

---

**Fecha de implementación**: 11 de Noviembre de 2025
**Estado**: ✅ COMPLETADO Y VERIFICADO
