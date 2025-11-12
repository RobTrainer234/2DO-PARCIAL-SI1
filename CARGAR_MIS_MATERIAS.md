# 📚 GUÍA: CARGAR MIS MATERIAS AL SISTEMA

## OPCIÓN 1: Importar desde Excel (Recomendado)

### Paso 1: Descargar plantilla
```bash
cd Backend
php artisan tinker
>>> \App\Models\Materia::all()  # Ver materias actuales
```

### Paso 2: Preparar tu archivo Excel/CSV
El archivo debe tener esta estructura:

| Sigla | Nombre | Semestre |
|-------|--------|----------|
| MAT101 | MATEMATICA I | 1 |
| FIS101 | FISICA I | 1 |
| QUI101 | QUIMICA I | 1 |
| MAT201 | MATEMATICA II | 2 |
| ... | ... | ... |

**Campos:**
- **Sigla**: Identificador único (ej: MAT101)
- **Nombre**: Nombre completo (ej: MATEMATICA I)
- **Semestre**: Número del semestre/nivel (1-8) o dejar en blanco para electivas

### Paso 3: Usar la interface web
1. Ir a: http://localhost:5173 → Gestión de Materias
2. Hacer click en "Importar" (esquina superior derecha)
3. Seleccionar tu archivo Excel/CSV
4. Listo! Las materias se cargarán automáticamente

---

## OPCIÓN 2: Crear un Seeder personalizado

### Paso 1: Crear seeder con tus materias
```bash
php artisan make:seeder MateriasSeeder
```

### Paso 2: Editar el seeder (archivo generado en `database/seeders/MateriasSeeder.php`)
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Materia;

class MateriasSeeder extends Seeder
{
    public function run(): void
    {
        $materias = [
            // SEMESTRE 1
            ['sigla' => 'MAT101', 'nombre' => 'MATEMATICA I', 'semestre' => 1, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'FIS101', 'nombre' => 'FISICA I', 'semestre' => 1, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            
            // SEMESTRE 2
            ['sigla' => 'MAT201', 'nombre' => 'MATEMATICA II', 'semestre' => 2, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'FIS201', 'nombre' => 'FISICA II', 'semestre' => 2, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            
            // ... agregar todas tus materias
        ];

        foreach ($materias as $materia) {
            Materia::firstOrCreate(
                ['sigla' => $materia['sigla']],
                $materia
            );
        }
    }
}
```

### Paso 3: Ejecutar el seeder
```bash
php artisan db:seed --class=MateriasSeeder
```

---

## OPCIÓN 3: Ingreso manual desde la web

1. Ir a: http://localhost:5173 → Gestión de Materias
2. Hacer click en "Nueva Materia" (botón verde)
3. Llenar los campos:
   - Sigla: MAT101
   - Nombre: MATEMATICA I
   - Semestre: 1
   - Horas Teóricas: 4
   - Horas Prácticas: 2
   - Créditos: 4
4. Hacer click en "Crear"
5. Repetir para cada materia

---

## CONSULTAS EN LA WEB

### Ver todas las materias
URL: `http://localhost:5173/materias`

### Filtrar por semestre
- Seleccionar semestre en el dropdown
- El sistema filtra automáticamente

### Buscar materia
- Usar la barra de búsqueda
- Busca por sigla o nombre

### Exportar a CSV
- Hacer click en "Exportar" (botón azul)
- Descarga un archivo CSV con todas las materias

### Editar materia
- Hacer click en el ícono de editar (lápiz)
- Modal se abre para editar
- Hacer click en "Actualizar"

### Eliminar materia
- Hacer click en el ícono de borrar (papelera)
- Confirmar eliminación
- La materia se elimina completamente

---

## FORMATO PARA TUS MATERIAS

Cuando me proporciones tus materias, usa este formato:

```
FACULTAD: [Tu facultad]
CARRERA: [Tu carrera]
SEMESTRE 1:
MAT101 | MATEMATICA I
FIS101 | FISICA I
QUI101 | QUIMICA I | 4h teoría, 2h práctica

SEMESTRE 2:
MAT201 | MATEMATICA II
...
```

---

## RUTAS API DISPONIBLES

```
GET    /api/materias                  # Listar todas
GET    /api/materias/{sigla}          # Ver una materia
GET    /api/materias/por-semestre/{s} # Listar por semestre
POST   /api/materias                  # Crear
PUT    /api/materias/{sigla}          # Actualizar
DELETE /api/materias/{sigla}          # Eliminar
POST   /api/materias/importar         # Importar desde archivo
GET    /api/materias/descargar-plantilla # Descargar template Excel
```

---

## EJEMPLO COMPLETO

### Mi facultad tiene esta estructura:

```
FACULTAD: Facultad de Ingeniería
CARRERA: Ingeniería en Sistemas

SEMESTRE 1:
MAT101 | CALCULO I | 4h teoría, 2h práctica, 4 créditos
FIS101 | FISICA I | 3h teoría, 2h práctica, 3 créditos
QUI101 | QUIMICA I | 3h teoría, 2h práctica, 3 créditos
INF101 | PROGRAMACION I | 2h teoría, 3h práctica, 3 créditos

SEMESTRE 2:
MAT201 | CALCULO II | 4h teoría, 2h práctica, 4 créditos
FIS201 | FISICA II | 3h teoría, 2h práctica, 3 créditos
INF201 | PROGRAMACION II | 2h teoría, 3h práctica, 3 créditos
...
```

Envía esto y te lo cargo inmediatamente al sistema! ✅
