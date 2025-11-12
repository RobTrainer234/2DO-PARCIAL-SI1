# Guía: Importación Masiva de Docentes desde Excel

## Descripción
Esta funcionalidad permite importar múltiples docentes desde un archivo Excel (.xlsx, .xls) o CSV. Cada fila del archivo representa un docente que será creado con su usuario asociado y rol automático de "Docente".

## Requisitos del Archivo

### Formato Aceptado
- **Excel**: .xlsx, .xls
- **CSV**: .csv

### Estructura del Archivo

El archivo debe contener las siguientes columnas en esta estructura (sin headers personalizados):

| Columna | Nombre del Campo | Tipo | Obligatorio | Ejemplo |
|---------|-----------------|------|-------------|---------|
| A | nombre | Texto | ✓ Sí | Juan |
| B | apellido | Texto | ✓ Sí | Pérez García |
| C | correo | Email | ✓ Sí | juan.perez@example.com |
| D | ci | Texto | ✓ Sí | 12345678 |
| E | contraseña | Texto | ✓ Sí | MiContraseña2024 |
| F | teléfono | Texto | ✗ No | +591-77777777 |
| G | sexo | Letra | ✗ No (default: M) | M o F |
| H | dirección | Texto | ✗ No | Calle Principal 123 |
| I | especialidad | Texto | ✗ No | Ingeniería de Sistemas |
| J | fecha_contrato | Fecha | ✗ No (formato: YYYY-MM-DD) | 2024-01-15 |

### Notas Importantes

1. **Primer Fila**: DEBE contener headers (aunque el sistema los ignora, es buena práctica)
2. **Campos Obligatorios**: Si alguno falta, la fila será rechazada con mensaje de error
3. **Email**: Debe ser un correo válido, de lo contrario la fila será rechazada
4. **CI**: Debe ser único en el sistema (no puede haber duplicados)
5. **Correo**: Debe ser único en el sistema (no puede haber duplicados)
6. **Sexo**: Solo acepta "M" (Masculino) o "F" (Femenino). Si está vacío o tiene otro valor, se asigna por defecto "M"
7. **Fecha Contrato**: Debe estar en formato YYYY-MM-DD (ejemplo: 2024-01-15)

## Proceso de Importación

### Pasos:

1. **Preparar el archivo Excel** con los datos de los docentes
2. **Navegar** a la sección "Docentes" en la aplicación
3. **Hacer clic** en botón "Importar desde Excel"
4. **Seleccionar** el archivo Excel de tu computadora
5. **Hacer clic** en botón "Importar"
6. **Esperar** a que se procese el archivo
7. **Revisar** los resultados: docentes creados, duplicados y errores

### Validaciones Realizadas:

Durante la importación, el sistema valida:

✓ **Campos Requeridos**: Verifica que nombre, apellido, correo, CI y contraseña no estén vacíos
✓ **Email Válido**: Confirma que el correo tenga formato de email válido
✓ **Sin Duplicados**: Verifica que el correo y CI no existan en la base de datos
✓ **Rol Automático**: Asigna automáticamente el rol "Docente" a cada usuario creado
✓ **Transacciones**: Usa transacciones BD para garantizar consistencia

## Resultado de la Importación

Después de importar, verás un resumen con:

### Métricas:
- **Docentes Creados**: Cantidad de docentes nuevos agregados exitosamente
- **Duplicados**: Cantidad de filas rechazadas por correo o CI duplicado
- **Errores**: Cantidad de filas rechazadas por validación u otros errores

### Detalles Disponibles:
Puedes hacer clic en "Mostrar detalles" para ver:

**Errores**: Lista detallada de filas con error y la razón específica
```
Fila 5: Email inválido: juan@
Fila 8: Faltan campos requeridos (nombre, apellido, correo, ci, contraseña)
```

**Duplicados**: Lista de docentes que no se importaron porque ya existen
```
Fila 3: Juan Pérez (juan.perez@example.com) - CI: 12345678
```

## Ejemplo de Archivo Excel Correcto

```
nombre          | apellido        | correo                  | ci       | contraseña    | teléfono      | sexo | dirección          | especialidad          | fecha_contrato
Juan            | Pérez García    | juan.perez@ficct.test   | 12345678 | Pass123!      | +591-77777777 | M    | Calle Principal 123| Ingeniería Sistemas  | 2024-01-15
María           | López Martínez  | maria.lopez@ficct.test  | 87654321 | Pass456!      | +591-77777776 | F    | Av. Secundaria 456 | Administración       | 2024-02-20
Carlos          | Rodríguez       | carlos.rod@ficct.test   | 11223344 | Pass789!      |               | M    |                    | Contabilidad         | 2024-03-10
```

## Casos de Error Comunes

### ❌ Error: "Faltan campos requeridos"
**Causa**: Alguno de los campos obligatorios está vacío
**Solución**: Verifica que nombre, apellido, correo, CI y contraseña estén completados

### ❌ Error: "Email inválido"
**Causa**: El correo no tiene formato válido
**Solución**: Revisa que el email tenga formato correcto (ejemplo@dominio.com)

### ❌ Error: "Duplicado"
**Causa**: El correo o CI ya existe en la base de datos
**Solución**: Verifica que no haya docentes con ese correo/CI, o usa valores diferentes

### ❌ Error: "Error al procesar archivo"
**Causa**: El archivo no es un Excel válido o está corrupto
**Solución**: Intenta guardando el archivo nuevamente en Excel

## Después de Importar

### Lo que se crea automáticamente:
1. **Usuario**: Con los datos proporcionados (nombre, apellido, correo, etc.)
2. **Docente**: Asociado al usuario, con especialidad y fecha de contrato
3. **Rol**: Se asigna automáticamente el rol "Docente"
4. **Permiso**: El usuario heredará los permisos del rol "Docente"

### Qué pueden hacer los docentes:
- Ver su perfil
- Registrar asistencia
- Ver sus horarios y materias asignadas
- Consultar reportes de asistencia

## Recomendaciones

✓ **Prueba con pocos registros** antes de importar muchos
✓ **Guarda un backup** del archivo Excel
✓ **Verifica los datos** antes de importar (especialmente correos y CI)
✓ **Usa contraseñas seguras** con letras, números y símbolos
✓ **Comunica las contraseñas** a los docentes de forma segura
✓ **Solicita cambio de contraseña** en primer login

## Soporte

Si encuentras problemas:
1. Revisa este documento
2. Verifica que el archivo Excel sea válido
3. Intenta con un número menor de registros
4. Contacta al administrador del sistema
