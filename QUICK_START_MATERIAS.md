# 🚀 QUICK START - GESTIÓN DE MATERIAS

## ⚡ En 3 pasos rápidos:

### 1. Inicia el Backend
```bash
cd c:\xampp\htdocs\ExamenSi1\Backend
php artisan serve --port=8000
```

### 2. Inicia el Frontend
```bash
cd c:\xampp\htdocs\ExamenSi1\Frontend
npm run dev
```

### 3. Abre en el navegador
```
http://localhost:5173
```

---

## 🎯 ¿Qué hacer ahora?

### Opción A: Ver las materias (Recomendado primero)
1. En la navegación, busca **"Gestión de Materias"**
2. Verás tabla con 53 materias cargadas
3. Prueba los filtros de búsqueda y semestre

### Opción B: Crear una nueva materia
1. Click en botón **"Nueva Materia"** (verde)
2. Rellena los campos
3. Click en **"Crear"**

### Opción C: Editar una existente
1. Click en ícono **lápiz** en cualquier materia
2. Modifica los campos
3. Click en **"Actualizar"**

### Opción D: Eliminar una materia
1. Click en ícono **papelera**
2. Confirma
3. Listo

---

## 📊 Datos que ya están cargados:

✅ **53 Materias**
- 50 materias obligatorias (semestres 1-10)
- 8 materias electivas (sin semestre)

✅ **Información por materia:**
- Sigla (MAT101, INF210, etc.)
- Nombre completo
- Semestre/Nivel (1-10)
- Horas teóricas
- Horas prácticas
- Créditos

---

## 🔍 Búsqueda rápida de materias

| Busca | Encuentra |
|-------|-----------|
| MAT | Todas las de Matemática |
| INF | Todas de Informática |
| PRO | Todas de Programación |
| 120 | INF120 - Programación 1 |

---

## 📱 Funcionalidades principales

| Feature | Descripción |
|---------|-------------|
| 🔎 Búsqueda | Encuentra materias por sigla o nombre |
| 🏷️ Filtro | Filtra por semestre |
| ➕ Crear | Agrega nuevas materias |
| ✏️ Editar | Modifica materias existentes |
| 🗑️ Eliminar | Borra materias |
| 📥 Importar | Carga desde CSV/Excel |
| 📤 Exportar | Descarga como CSV |
| 📄 Paginación | 10 materias por página |

---

## 🛠️ Troubleshooting rápido

### Si no ves las materias:
1. Recarga la página (F5)
2. Verifica que Backend esté corriendo
3. Verifica que Frontend esté corriendo

### Si hay error al crear:
1. Verifica que sigla sea única
2. Verifica que nombre no esté vacío
3. Verifica que backend responda

### Si no puedes importar:
1. Usa archivo CSV con estructura correcta
2. Headers: sigla, nombre, semestre, horas_teoricas, horas_practicas, creditos

---

## 💾 Para guardar un respaldo

### Exportar todas las materias a CSV:
1. En "Gestión de Materias"
2. Click en botón "Exportar"
3. Se descarga `materias.csv`

### Para importar después:
1. Click en campo "Importar"
2. Selecciona el CSV
3. Listo!

---

## 🎓 Información de tu carrera

- **Facultad**: F.I.C.C.T
- **Carrera**: Ingeniería en Sistemas
- **Duración**: 10 semestres
- **Total Créditos**: 209
- **Total Horas**: 260 horas/semana aprox.

---

## 📞 URLs de interés

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/materias
- **Phpmyadmin** (si aplica): http://localhost/phpmyadmin

---

## ✅ Verificación rápida

### Verifica que todo funciona:
```bash
# Ver total de materias en BD
cd Backend
php verify_materias.php

# Ver reporte completo
php generar_reporte_materias.php
```

---

**¡Listo para empezar! 🎉**

Cualquier duda, revisa:
- `GESTIONAR_MATERIAS_GUIA.md` → Guía completa
- `CARGAR_MIS_MATERIAS.md` → Instrucciones importación
- Backend logs: `storage/logs/laravel.log`
