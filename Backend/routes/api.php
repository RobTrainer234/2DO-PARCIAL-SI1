<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermisoController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\DocenteController;
use App\Http\Controllers\Api\MateriaController;
use App\Http\Controllers\Api\GrupoController;
use App\Http\Controllers\Api\InfraestructuraController;
use App\Http\Controllers\Api\TipoController;
use App\Http\Controllers\Api\DocenteGrupoMateriaController;
use App\Http\Controllers\Api\HorarioController;
use App\Http\Controllers\Api\AsistenciaController;
use App\Http\Controllers\Api\GestionController;
use App\Http\Controllers\Api\ValidacionAsistenciaController;
use App\Http\Controllers\Api\ConsultaHorarioController;
use App\Http\Controllers\Api\ReporteAsistenciaController;
use App\Http\Controllers\Api\ReporteCargaHorariaController;
use App\Http\Controllers\Api\ReporteUsoAulasController;
use App\Http\Controllers\Api\ExportarReportesController;
use App\Http\Controllers\Api\DashboardIndicadoresController;
use App\Http\Controllers\Api\AuditoriaController;
use App\Http\Controllers\Api\CargaHorariaController;
use App\Http\Controllers\Api\RegistroAsistenciaController;

// Test endpoint
Route::get('/test', function () {
    return ['message' => 'API funciona'];
});

// Auth endpoints
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Usuarios (CU3)
Route::get('/usuarios', [UsuarioController::class, 'index'])->middleware('auth:sanctum');
Route::post('/usuarios', [UsuarioController::class, 'store'])->middleware('auth:sanctum');
Route::post('/usuarios/importar-csv', [UsuarioController::class, 'importarCSV'])->middleware('auth:sanctum');
Route::post('/usuarios/importar-json', [UsuarioController::class, 'importarJSON'])->middleware('auth:sanctum');
Route::get('/usuarios/{id}', [UsuarioController::class, 'show'])->middleware('auth:sanctum');
Route::put('/usuarios/{id}', [UsuarioController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy'])->middleware('auth:sanctum');
Route::post('/usuarios/{id}/roles', [UsuarioController::class, 'asignarRoles'])->middleware('auth:sanctum');

// Roles (CU2)
Route::get('/roles', [RoleController::class, 'index'])->middleware('auth:sanctum');
Route::post('/roles', [RoleController::class, 'store'])->middleware('auth:sanctum');
Route::get('/roles/{id}', [RoleController::class, 'show'])->middleware('auth:sanctum');
Route::put('/roles/{id}', [RoleController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->middleware('auth:sanctum');
Route::post('/roles/{id}/permisos', [RoleController::class, 'asignarPermisos'])->middleware('auth:sanctum');

// Permisos (CU2)
Route::get('/permisos', [PermisoController::class, 'index'])->middleware('auth:sanctum');
Route::post('/permisos', [PermisoController::class, 'store'])->middleware('auth:sanctum');
Route::get('/permisos/{id}', [PermisoController::class, 'show'])->middleware('auth:sanctum');
Route::put('/permisos/{id}', [PermisoController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/permisos/{id}', [PermisoController::class, 'destroy'])->middleware('auth:sanctum');

// Docentes (CU4 y CU5)
Route::get('/docentes', [DocenteController::class, 'index'])->middleware('auth:sanctum');
Route::post('/docentes', [DocenteController::class, 'store'])->middleware('auth:sanctum');  // CU4: Registrar docente
Route::get('/docentes/plantilla/descargar', [DocenteController::class, 'descargarPlantillaExcel'])->middleware('auth:sanctum');  // CU4: Descargar plantilla Excel
Route::post('/docentes/importar-excel', [DocenteController::class, 'importarDocentesExcel'])->middleware('auth:sanctum');  // CU4: Importación masiva desde Excel
Route::get('/docentes/{id}', [DocenteController::class, 'show'])->middleware('auth:sanctum');
Route::put('/docentes/{id}', [DocenteController::class, 'update'])->middleware('auth:sanctum');  // CU5: Editar docente
Route::delete('/docentes/{id}', [DocenteController::class, 'destroy'])->middleware('auth:sanctum');  // CU5: Eliminar docente

// Materias (CU6)
Route::get('/materias', [MateriaController::class, 'index'])->middleware('auth:sanctum');
Route::post('/materias', [MateriaController::class, 'store'])->middleware('auth:sanctum');  // CU6: Registrar materia
Route::get('/materias/plantilla/descargar', [MateriaController::class, 'descargarPlantilla'])->middleware('auth:sanctum');  // CU6: Descargar plantilla
Route::post('/materias/importar-excel', [MateriaController::class, 'importar'])->middleware('auth:sanctum');  // CU6: Importar materias
Route::get('/materias/por-semestre/{semestre}', [MateriaController::class, 'porSemestre'])->middleware('auth:sanctum');  // CU6: Materias por semestre
Route::get('/materias/electivas', [MateriaController::class, 'electivas'])->middleware('auth:sanctum');  // CU6: Materias electivas
Route::get('/materias/semestre/{sigla}', [MateriaController::class, 'obtenerSemestre'])->middleware('auth:sanctum');  // CU6: Obtener semestre de materia (auto-llenar)
Route::get('/materias/{sigla}', [MateriaController::class, 'show'])->middleware('auth:sanctum');
Route::put('/materias/{sigla}', [MateriaController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/materias/{sigla}', [MateriaController::class, 'destroy'])->middleware('auth:sanctum');

// Grupos (CU7 y CU8)
Route::get('/grupos', [GrupoController::class, 'index'])->middleware('auth:sanctum');
Route::post('/grupos', [GrupoController::class, 'store'])->middleware('auth:sanctum');  // CU7: Registrar grupo
Route::get('/grupos/{id}', [GrupoController::class, 'show'])->middleware('auth:sanctum');
Route::put('/grupos/{id}', [GrupoController::class, 'update'])->middleware('auth:sanctum');  // CU8: Editar grupo
Route::delete('/grupos/{id}', [GrupoController::class, 'destroy'])->middleware('auth:sanctum');  // CU8: Eliminar grupo

// Infraestructura/Aulas (CU9)
Route::get('/aulas', [InfraestructuraController::class, 'index'])->middleware('auth:sanctum');
Route::post('/aulas', [InfraestructuraController::class, 'store'])->middleware('auth:sanctum');  // CU9: Registrar aula
Route::get('/aulas/{id}', [InfraestructuraController::class, 'show'])->middleware('auth:sanctum');
Route::put('/aulas/{id}', [InfraestructuraController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/aulas/{id}', [InfraestructuraController::class, 'destroy'])->middleware('auth:sanctum');

// Tipos (para el dropdown de aulas)
Route::get('/tipos', [TipoController::class, 'index'])->middleware('auth:sanctum');
Route::post('/tipos', [TipoController::class, 'store'])->middleware('auth:sanctum');
Route::get('/tipos/{id}', [TipoController::class, 'show'])->middleware('auth:sanctum');
Route::put('/tipos/{id}', [TipoController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/tipos/{id}', [TipoController::class, 'destroy'])->middleware('auth:sanctum');

// DocenteGrupoMateria (CU10: Asignación de docentes, grupos y materias)
Route::get('/asignaciones', [DocenteGrupoMateriaController::class, 'index'])->middleware('auth:sanctum');
Route::post('/asignaciones', [DocenteGrupoMateriaController::class, 'store'])->middleware('auth:sanctum');
Route::get('/asignaciones/{id}', [DocenteGrupoMateriaController::class, 'show'])->middleware('auth:sanctum');
Route::put('/asignaciones/{id}', [DocenteGrupoMateriaController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/asignaciones/{id}', [DocenteGrupoMateriaController::class, 'destroy'])->middleware('auth:sanctum');

// Horarios (CU11 y CU12: Registrar y editar horarios)
Route::get('/horarios', [HorarioController::class, 'index'])->middleware('auth:sanctum');
Route::post('/horarios', [HorarioController::class, 'store'])->middleware('auth:sanctum');  // CU11: Registrar horario
Route::get('/horarios/{id}', [HorarioController::class, 'show'])->middleware('auth:sanctum');
Route::put('/horarios/{id}', [HorarioController::class, 'update'])->middleware('auth:sanctum');  // CU12: Editar horario
Route::delete('/horarios/{id}', [HorarioController::class, 'destroy'])->middleware('auth:sanctum');  // CU12: Eliminar horario

// Asistencia (CU13: Registrar asistencia)
Route::get('/asistencias', [AsistenciaController::class, 'index'])->middleware('auth:sanctum');
Route::post('/asistencias', [AsistenciaController::class, 'store'])->middleware('auth:sanctum');  // CU13: Registrar asistencia
Route::post('/asistencias/scan', [AsistenciaController::class, 'scan'])->middleware('auth:sanctum');  // QR Scanner
Route::get('/asistencias/{id}', [AsistenciaController::class, 'show'])->middleware('auth:sanctum');
Route::put('/asistencias/{id}', [AsistenciaController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/asistencias/{id}', [AsistenciaController::class, 'destroy'])->middleware('auth:sanctum');

// Gestiones (período académico)
Route::get('/gestiones', [GestionController::class, 'index'])->middleware('auth:sanctum');
Route::post('/gestiones', [GestionController::class, 'store'])->middleware('auth:sanctum');
Route::get('/gestiones/{id}', [GestionController::class, 'show'])->middleware('auth:sanctum');
Route::put('/gestiones/{id}', [GestionController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/gestiones/{id}', [GestionController::class, 'destroy'])->middleware('auth:sanctum');

// CU14: Validación de Asistencias
Route::post('/validaciones/asistencias', [ValidacionAsistenciaController::class, 'validarAsistencias'])->middleware('auth:sanctum');
Route::post('/validaciones/asistencias-docente', [ValidacionAsistenciaController::class, 'validarAsistenciasPorDocente'])->middleware('auth:sanctum');

// CU15: Consulta de Horarios
Route::get('/consultas/horario/asignacion/{id_asignacion}', [ConsultaHorarioController::class, 'consultarHorarioAsignacion'])->middleware('auth:sanctum');
Route::get('/consultas/horario/docente/{cod_docente}', [ConsultaHorarioController::class, 'consultarHorarioDocente'])->middleware('auth:sanctum');
Route::get('/consultas/horario/grupo/{id_grupo}', [ConsultaHorarioController::class, 'consultarHorarioGrupo'])->middleware('auth:sanctum');

// CU16: Reportes de Asistencia
Route::post('/reportes/asistencia/asignacion', [ReporteAsistenciaController::class, 'reporteAsistenciaAsignacion'])->middleware('auth:sanctum');
Route::post('/reportes/asistencia/docente', [ReporteAsistenciaController::class, 'reporteAsistenciaDocente'])->middleware('auth:sanctum');
Route::get('/reportes/asistencia/gestion/{id_gestion}', [ReporteAsistenciaController::class, 'reporteAsistenciaGestion'])->middleware('auth:sanctum');

// CU17: Reportes de Carga Horaria
Route::get('/reportes/carga-horaria/docente/{cod_docente}', [ReporteCargaHorariaController::class, 'reporteCargaHorariaDocente'])->middleware('auth:sanctum');
Route::get('/reportes/carga-horaria/grupo/{id_grupo}', [ReporteCargaHorariaController::class, 'reporteCargaHorariaGrupo'])->middleware('auth:sanctum');
Route::get('/reportes/carga-horaria/gestion/{id_gestion}', [ReporteCargaHorariaController::class, 'reporteCargaHorariaGestion'])->middleware('auth:sanctum');

// CU18: Reportes de Uso de Aulas
Route::get('/reportes/uso-aulas', [ReporteUsoAulasController::class, 'reporteUsoAulas'])->middleware('auth:sanctum');
Route::get('/reportes/uso-aulas/por-tipo', [ReporteUsoAulasController::class, 'reporteUsoAulasPorTipo'])->middleware('auth:sanctum');
Route::get('/reportes/uso-aulas/por-docente', [ReporteUsoAulasController::class, 'reporteUsoAulasPorDocente'])->middleware('auth:sanctum');

// CU19: Exportar Reportes
Route::post('/exportar/asistencia/pdf', [ExportarReportesController::class, 'exportarAsistenciaPDF'])->middleware('auth:sanctum');
Route::post('/exportar/asistencia/excel', [ExportarReportesController::class, 'exportarAsistenciaExcel'])->middleware('auth:sanctum');
Route::post('/exportar/carga-horaria/pdf', [ExportarReportesController::class, 'exportarCargaHorariaPDF'])->middleware('auth:sanctum');
Route::post('/exportar/carga-horaria/excel', [ExportarReportesController::class, 'exportarCargaHorariaExcel'])->middleware('auth:sanctum');

// CU20: Dashboard de Indicadores
Route::get('/dashboard/indicadores', [DashboardIndicadoresController::class, 'obtenerIndicadores'])->middleware('auth:sanctum');
Route::get('/dashboard/asistencia', [DashboardIndicadoresController::class, 'indicadoresAsistencia'])->middleware('auth:sanctum');
Route::get('/dashboard/ocupacion-aulas', [DashboardIndicadoresController::class, 'indicadoresOcupacionAulas'])->middleware('auth:sanctum');
Route::get('/dashboard/carga-docente', [DashboardIndicadoresController::class, 'indicadoresCargaDocente'])->middleware('auth:sanctum');

// CU21: Auditoría (Bitácora)
Route::get('/auditoria/bitacora', [AuditoriaController::class, 'obtenerBitacora'])->middleware('auth:sanctum');
Route::get('/auditoria/estadisticas', [AuditoriaController::class, 'estadisticasAuditoria'])->middleware('auth:sanctum');
Route::get('/auditoria/detalle/{id}', [AuditoriaController::class, 'obtenerDetalleAuditoria'])->middleware('auth:sanctum');
Route::get('/auditoria/exportar', [AuditoriaController::class, 'exportarBitacoraCSV'])->middleware('auth:sanctum');

// Carga Horaria Docente (CU10)
Route::prefix('carga-horaria')->middleware('auth:sanctum')->group(function () {
    // CRUD básico de cargas horarias
    Route::get('/', [CargaHorariaController::class, 'index']);  // Listar todas
    Route::post('/', [CargaHorariaController::class, 'store']);  // Crear
    Route::get('/{id}', [CargaHorariaController::class, 'show']);  // Obtener uno
    Route::put('/{id}', [CargaHorariaController::class, 'update']);  // Actualizar
    Route::delete('/{id}', [CargaHorariaController::class, 'destroy']);  // Eliminar
    
    // Consultas especializadas
    Route::get('/docente/{cod_docente}', [CargaHorariaController::class, 'obtenerCargaDocente']);  // Carga de un docente
    Route::post('/validar-horas', [CargaHorariaController::class, 'validarHoras']);  // Validar horas disponibles
    Route::get('/horarios/{cod_docente}', [CargaHorariaController::class, 'obtenerHorariosDocente']);  // Todos los horarios del docente
    
    // Gestión de horarios disponibles
    Route::post('/{id}/horarios', [CargaHorariaController::class, 'agregarHorario']);  // Agregar horario
    Route::post('/{id}/horarios/{idHorario}', [CargaHorariaController::class, 'actualizarHorario']);  // Actualizar horario
    Route::delete('/{id}/horarios/{idHorario}', [CargaHorariaController::class, 'eliminarHorario']);  // Eliminar horario
});

// CU13: Registro de Asistencia Docente
Route::prefix('asistencia')->middleware('auth:sanctum')->group(function () {
    // Registro manual
    Route::post('/registrar-manual', [RegistroAsistenciaController::class, 'registrarManual']);
    
    // QR
    Route::post('/generar-qr', [RegistroAsistenciaController::class, 'generarCodigoQR']);
    Route::post('/registrar-qr', [RegistroAsistenciaController::class, 'registrarPorQR']);
    
    // Enlace único
    Route::post('/generar-enlace', [RegistroAsistenciaController::class, 'generarEnlaceUnico']);
    Route::post('/registrar-enlace/{enlace}', [RegistroAsistenciaController::class, 'registrarPorEnlace'])->withoutMiddleware('auth:sanctum');
    
    // Gestión de estados
    Route::put('/{id}/cambiar-estado', [RegistroAsistenciaController::class, 'cambiarEstado']);
    
    // Evidencias
    Route::post('/{id}/evidencia', [RegistroAsistenciaController::class, 'guardarEvidencia']);
    
    // Consultas
    Route::get('/docente/{docenteId}', [RegistroAsistenciaController::class, 'obtenerAsistenciasDocente']);
});

// CU14: Validación de Asistencia
Route::prefix('validacion-asistencia')->middleware('auth:sanctum')->group(function () {
    Route::get('/pendientes', [ValidacionAsistenciaController::class, 'obtenerPendientes']);
    Route::post('/{asistenciaId}/validar', [ValidacionAsistenciaController::class, 'validar']);
    Route::post('/{asistenciaId}/rechazar', [ValidacionAsistenciaController::class, 'rechazar']);
    Route::post('/{asistenciaId}/marcar-revisada', [ValidacionAsistenciaController::class, 'marcarRevisada']);
    Route::get('/{asistenciaId}/historico', [ValidacionAsistenciaController::class, 'historicoValidaciones']);
    Route::get('/resumen', [ValidacionAsistenciaController::class, 'resumenValidaciones']);
});
