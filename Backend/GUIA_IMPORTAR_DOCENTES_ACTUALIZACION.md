# CU4: Importación Masiva de Docentes - Soporte de Formatos

## Resumen de Capacidades

El sistema **ahora soporta importación de docentes desde archivos CSV y Excel** (.xlsx, .xls) sin necesidad de conversión previa.

### Formatos Soportados
- ✅ **CSV** (texto separado por comas)
- ✅ **XLSX** (Excel 2007+)
- ✅ **XLS** (Excel 97-2003)

## Arquitectura de Procesamiento

### Backend (DocenteController.php)

El método `importarDocentesExcel()` implementa detección inteligente de formato:

```php
// Detección automática basada en extensión
if ($extension === 'csv') {
    $datos = $this->procesarCSV($rutaArchivo);
} else {
    // .xlsx y .xls
    $datos = $this->procesarExcel($rutaArchivo);
}
```

#### Procesamiento CSV
- Utiliza función nativa PHP: `fgetcsv()`
- Ligero y eficiente
- Compatible con todos los sistemas

#### Procesamiento Excel
- Utiliza librería: `openspout/openspout` v4.28.5
- Soporta XLSX y XLS
- Procesa primera hoja del libro
- Itera filas con `getRowIterator()`
- Extrae valores con `getCells()` y `getValue()`

### Validación Común
Ambos formatos pasan por **6 niveles de validación idénticos**:

1. **Validación de campos**: Verifica campos requeridos
2. **Validación de email**: Utiliza `filter_var()` con FILTER_VALIDATE_EMAIL
3. **Validación de sexo**: Solo acepta 'M' o 'F'
4. **Verificación de duplicados**: Busca por correo y CI
5. **Gestión de transacciones**: Rollback automático en caso de error
6. **Asignación de roles**: Asigna automáticamente rol "Docente"

## Uso del Sistema

### 1. Generar Archivo de Prueba (CSV)

```bash
cd Backend
php generar_docentes_ejemplo.php
```

Genera: `docentes_ejemplo.csv` con 5 docentes de ejemplo

**Puedes convertir el CSV a Excel en tu sistema operativo:**
- Windows: Abre con Excel → Guardar como → Formato Excel
- Linux/Mac: LibreOffice Calc → Guardar como → XLSX
- O usar herramientas online de conversión CSV → XLSX

### 2. Importar Archivo

En la aplicación web:

1. Ve a: **Gestión de Docentes** → **Importar Docentes**
2. Selecciona archivo (CSV, XLSX o XLS)
3. Haz clic en **Importar**
4. El sistema:
   - Detecta formato automáticamente
   - Procesa el archivo
   - Valida cada fila
   - Crea usuarios y docentes
   - Asigna roles
   - Retorna reporte detallado

### 3. Interpretar Resultados

```json
{
  "mensaje": "Importación completada",
  "resultados": {
    "creados": 5,
    "errores": 0,
    "duplicados": 0,
    "detalles_errores": [],
    "detalles_duplicados": []
  }
}
```

### Estructura del Archivo

**Columnas requeridas:**
1. `nombre` - Requerido
2. `apellido` - Requerido
3. `correo` - Requerido, debe ser válido
4. `ci` - Requerido, debe ser único
5. `contraseña` - Requerido, mínimo 6 caracteres

**Columnas opcionales:**
6. `teléfono`
7. `sexo` - Solo 'M' o 'F' (default: 'M')
8. `dirección`
9. `especialidad`
10. `fecha_contrato` - Formato: YYYY-MM-DD

### Ejemplo de Estructura CSV

```csv
nombre,apellido,correo,ci,contraseña,teléfono,sexo,dirección,especialidad,fecha_contrato
Juan,Pérez García,juan@escuela.edu,12345678,Pass123!,+591-7777,M,Calle 1,Matemáticas,2024-01-15
María,López Martínez,maria@escuela.edu,87654321,Pass456!,+591-7777,F,Calle 2,Historia,2024-02-20
```

### Ejemplo de Estructura XLSX

| nombre | apellido | correo | ci | contraseña | teléfono | sexo | dirección | especialidad | fecha_contrato |
|--------|----------|--------|----|-----------:|----------|------|-----------|--------------|----------------|
| Juan | Pérez García | juan@escuela.edu | 12345678 | Pass123! | +591-7777 | M | Calle 1 | Matemáticas | 2024-01-15 |
| María | López Martínez | maria@escuela.edu | 87654321 | Pass456! | +591-7777 | F | Calle 2 | Historia | 2024-02-20 |

## Detalles Técnicos

### Dependencias Instaladas

- `openspout/openspout` (v4.28.5) - Lectura de archivos Excel
- PHP 8.2.12 (compatible)

### Rutas API

```
POST /api/docentes/importar-excel
- Autenticación: Sanctum token
- Body: multipart/form-data
- Campo: archivo (file)
- Mimes: .xlsx, .xls, .csv
```

### Características del Sistema

✅ Detección automática de formato
✅ Procesamiento transaccional (todo o nada)
✅ Validación en 6 niveles
✅ Asignación automática de roles
✅ Reporte detallado de errores
✅ Gestión de duplicados
✅ Manejo de excepciones robusto
✅ Frontend React integrado

## Casos de Uso

### Caso 1: Importar desde CSV local
1. Tienes un CSV con docentes
2. Lo importas directamente
3. Sistema lo procesa

### Caso 2: Importar desde Excel
1. Tienes un XLSX con datos de docentes
2. Lo cargas en la web
3. Sistema detecta formato y lo procesa

### Caso 3: Generar desde datos existentes
1. Ejecutas script generador
2. Obtienes CSV de prueba
3. Lo abres en Excel
4. Lo conviertes a XLSX (opcional)
5. Lo importas a través de la web

## Resolución de Problemas

### Error: "No tienes permiso"
**Causa**: Middleware de permisos activo
**Solución**: Verificar rol y permisos en base de datos

### Error: "Archivo inválido"
**Causa**: Formato no soportado o archivo corrupto
**Solución**: Usar solo CSV, XLSX o XLS válidos

### Error: "Email duplicado" o "CI duplicado"
**Causa**: Registro ya existe en base de datos
**Solución**: Verificar tabla usuarios, actualizar o eliminar duplicados

### Error: "Faltan campos requeridos"
**Causa**: Falta una columna requerida o está vacía
**Solución**: Verificar estructura del archivo

## Próximas Mejoras (Opcionales)

- [ ] Importación desde URL
- [ ] Procesamiento en batch para archivos muy grandes
- [ ] Exportación de reportes de importación
- [ ] Plantilla de descarga para usuarios
- [ ] Validación de duplicados antes de importar
- [ ] Preview de datos antes de confirmar importación

---

**Última actualización**: 2024  
**Estado**: ✅ Implementado y funcionando  
**Formatos soportados**: CSV, XLSX, XLS  
**Requisitos mínimos**: PHP 8.2+, Laravel 12+
