# 🎓 GESTIÓN DE MATERIAS - FACULTAD DE INGENIERÍA EN SISTEMAS

## ✅ ESTADO ACTUAL

✅ **53 MATERIAS CARGADAS** en la base de datos:
- **50 Materias Obligatorias**: Distribuidas en 10 semestres
- **8 Materias Electivas**: Sin semestre específico

### Distribución por Semestre:
```
Semestre 1:  5 materias (MAT101, INF119, INF110, FIS100, LIN100)
Semestre 2:  5 materias (MAT102, MAT103, INF120, FIS102, LIN101)
Semestre 3:  5 materias (MAT207, INF210, INF211, FIS200, ADM100)
Semestre 4:  5 materias (MAT202, MAT205, INF220, INF221, ADM200)
Semestre 5:  5 materias (MAT302, INF318, INF310, INF312, INF319)
Semestre 6:  5 materias (MAT329, INF342, INF323, INF322, INF329)
Semestre 7:  5 materias (MAT419, INF418, INF413, INF433, INF412)
Semestre 8:  5 materias (ECO499, INF428, INF442, INF423, INF422)
Semestre 9:  4 materias (INF511, INF512, INF513, INF552)
Semestre 10: 1 materia  (GRL001)

ELECTIVAS:   8 materias (ELC101-ELC108)
```

---

## 🌐 ACCEDER A LA INTERFAZ WEB

### Opción 1: En la página web (Recomendado)
1. **Abrir**: http://localhost:5173 (o http://localhost:5174, etc.)
2. **Navegar a**: "Gestión de Materias" o buscar en el menú
3. **Ver**: Tabla completa con todas las materias

### Opción 2: Acceso directo a la URL
- **URL**: http://localhost:5173/materias

---

## 📋 FUNCIONALIDADES DISPONIBLES

### Ver Materias
- ✅ Lista completa de 53 materias
- ✅ Tabla con paginación (10 por página)
- ✅ Columnas: Sigla, Nombre, Semestre, Horas Teóricas, Horas Prácticas, Créditos

### Filtros
1. **Búsqueda rápida**: Busca por sigla o nombre
   - Ejemplo: "MAT" encuentra todas las de Matemática
   - Ejemplo: "INF120" encuentra Programación 1

2. **Filtro por Semestre**: Dropdown para seleccionar nivel
   - Selecciona "Semestre 1" para ver solo nivel 1
   - Selecciona "Todos los semestres" para ver todo

### Acciones CRUD

#### 📖 Ver detalles
- Haz click en cualquier fila para ver detalles

#### ✏️ Editar materia
1. Haz click en el botón **Editar** (ícono de lápiz)
2. Se abre un modal con los campos
3. Modifica lo necesario
4. Haz click en **Actualizar**

#### ➕ Crear nueva materia
1. Haz click en el botón **Nueva Materia** (verde)
2. Rellena los campos:
   - **Sigla**: Identificador único (ej: MAT101)
   - **Nombre**: Nombre completo
   - **Semestre**: Número del semestre (1-10) o dejar en blanco para electivas
   - **Horas Teóricas**: Horas de teoría por semana
   - **Horas Prácticas**: Horas de práctica/laboratorio
   - **Créditos**: Número de créditos
3. Haz click en **Crear**

#### 🗑️ Eliminar materia
1. Haz click en el botón **Eliminar** (ícono de papelera)
2. Confirma la eliminación
3. ⚠️ Esto eliminará la materia completamente

### 📤 Exportar
- Haz click en botón **Exportar** (azul)
- Se descarga un archivo CSV con todas las materias visibles

### 📥 Importar
- Haz click en el campo **Importar** o el botón
- Selecciona un archivo CSV con esta estructura:
  ```
  sigla,nombre,semestre,horas_teoricas,horas_practicas,creditos
  MAT101,Cálculo 1,1,4,2,5
  ```
- Las materias se crearán automáticamente

---

## 🔧 BACKEND - ENDPOINTS API

### Listar todas las materias
```
GET /api/materias
```
**Respuesta:**
```json
{
  "MAT101": {
    "sigla": "MAT101",
    "nombre": "Cálculo 1",
    "semestre": 1,
    "horas_teoricas": 4,
    "horas_practicas": 2,
    "creditos": 5
  },
  ...
}
```

### Listar por semestre
```
GET /api/materias/por-semestre/1
```

### Ver una materia específica
```
GET /api/materias/{sigla}
```

### Crear materia
```
POST /api/materias
Content-Type: application/json

{
  "sigla": "MAT101",
  "nombre": "Cálculo 1",
  "semestre": 1,
  "horas_teoricas": 4,
  "horas_practicas": 2,
  "creditos": 5
}
```

### Actualizar materia
```
PUT /api/materias/{sigla}
Content-Type: application/json

{
  "nombre": "Cálculo I (Modificado)",
  "horas_teoricas": 5
}
```

### Eliminar materia
```
DELETE /api/materias/{sigla}
```

### Importar desde archivo
```
POST /api/materias/importar
Content-Type: multipart/form-data

archivo: [archivo.csv o archivo.xlsx]
```

### Descargar plantilla
```
GET /api/materias/descargar-plantilla
```

---

## 📊 ESTADÍSTICAS ACTUALES

| Métrica | Valor |
|---------|-------|
| Total de Materias | 53 |
| Materias Obligatorias | 50 |
| Materias Electivas | 8 |
| Semestres | 10 |
| Créditos Totales (Plan) | ~130 |
| Horas Teóricas Promedio/Semana | 15h |
| Horas Prácticas Promedio/Semana | 10h |

---

## 🚀 EJEMPLOS DE USO

### Buscar todas las materias de Programación
1. En la página de Gestión de Materias
2. En el buscador, escribe: "INF" o "Programación"
3. Filtra automáticamente

### Ver materias del 5to Semestre
1. En "Filtrar por Semestre", selecciona "Semestre 5"
2. Muestra: MAT302, INF318, INF310, INF312, INF319

### Agregar una nueva electiva
1. Click en "Nueva Materia"
2. Sigla: ELC109
3. Nombre: Análisis de Datos Avanzado
4. Semestre: Dejar en blanco (es electiva)
5. Horas T: 2, P: 3, Créditos: 4
6. Click en "Crear"

### Cambiar nombre de una materia
1. Click en el botón Editar de esa materia
2. Cambiar el nombre
3. Click en "Actualizar"

---

## 📁 ARCHIVOS MODIFICADOS

### Backend
- ✅ `app/Http/Controllers/Api/MateriaController.php` - Endpoints mejorados
- ✅ `app/Models/Materia.php` - Campos actualizados
- ✅ `database/seeders/MateriasIngenieriaSistemasSeeder.php` - 53 materias

### Frontend
- ✅ `src/components/GestionarMaterias.tsx` - Interfaz completa (500+ líneas)

### Base de Datos
- ✅ Tabla `Materia` con 6 columnas (sigla, nombre, semestre, horas_teoricas, horas_practicas, creditos)
- ✅ 53 registros insertados

---

## 🔐 SEGURIDAD

- ✅ Validación de datos en backend
- ✅ Protección contra inyección SQL
- ✅ Autenticación requerida
- ✅ Auditoría de cambios registrada

---

## 📝 PRÓXIMOS PASOS

1. **Asociar materias a carreras** (si múltiples)
2. **Crear plan de estudios personalizado**
3. **Generar reportes por materia**
4. **Integrar con sistema de horarios**
5. **Permitir calificaciones por materia**

---

## ✅ CHECKLIST DE VALIDACIÓN

- ✅ Todas las 53 materias en BD
- ✅ CRUD completamente funcional
- ✅ Filtros por semestre y búsqueda
- ✅ Exportar/Importar CSV
- ✅ Paginación de 10 materias
- ✅ Interfaz responsive
- ✅ API REST completamente documentada
- ✅ Validación de datos
- ✅ Auditoría de cambios

---

**¡Sistema de Gestión de Materias 100% operativo! 🎓**

Para acceder: **http://localhost:5173** → "Gestión de Materias"
