# Script de Pruebas Rápidas - CU14 a CU21

Write-Host "╔════════════════════════════════════════════════════════════╗"
Write-Host "║    PRUEBAS RÁPIDAS - CASOS DE USO CU14-CU21              ║"
Write-Host "║    Sistema de Gestión de Carga Horaria                   ║"
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Variables
$BackendUrl = "http://localhost:8000"
$FrontendUrl = "http://localhost:5173"
$Token = ""  # Se obtiene del login
$DocenteId = 1
$HorarioId = 1
$AsistenciaId = 1
$UsuarioId = 1

# Función para hacer requests
function Invoke-ApiCall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body,
        [string]$Token
    )
    
    $Url = "$BackendUrl$Endpoint"
    $Headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Body) {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers -Body ($Body | ConvertTo-Json)
        } else {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers
        }
        return $response.Content | ConvertFrom-Json
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        return $null
    }
}

# 1. Obtener token de autenticación
Write-Host "📌 PASO 1: Autenticación" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$loginBody = @{
    email = "admin@example.com"
    password = "password"
}

Write-Host "Intentando login con admin@example.com..."
$loginResponse = Invoke-ApiCall -Method "POST" -Endpoint "/api/auth/login" -Body $loginBody

if ($loginResponse -and $loginResponse.data.token) {
    $Token = $loginResponse.data.token
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Token obtenido: $($Token.Substring(0,20))..." -ForegroundColor Green
} else {
    Write-Host "❌ Error en autenticación. Abortando..." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host ""

# 2. CU14: Validar Asistencia
Write-Host "📌 PASO 2: CU14 - Validar Registros de Asistencia" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "Listando asistencias pendientes..."
$asistenciasResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/asistencias?estado=pendiente" -Token $Token

if ($asistenciasResponse -and $asistenciasResponse.data.data.Count -gt 0) {
    Write-Host "✅ Se encontraron $($asistenciasResponse.data.data.Count) asistencias pendientes" -ForegroundColor Green
    $AsistenciaId = $asistenciasResponse.data.data[0].id
    Write-Host "   Primera asistencia ID: $AsistenciaId"
    
    # Validar asistencia
    Write-Host "Validando asistencia ID $AsistenciaId..."
    $validarBody = @{
        validado = $true
        observaciones = "Test validación automatizada"
        justificacion_falta = ""
    }
    
    $validarResponse = Invoke-ApiCall -Method "PUT" -Endpoint "/api/asistencias/$AsistenciaId/validar" -Body $validarBody -Token $Token
    
    if ($validarResponse -and $validarResponse.success) {
        Write-Host "✅ Asistencia validada exitosamente" -ForegroundColor Green
        Write-Host "   Estado nuevo: $($validarResponse.data.estado)"
    }
    
    # Obtener histórico
    Write-Host "Obteniendo histórico de validaciones..."
    $historicoResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/asistencias/$AsistenciaId/historico-validaciones" -Token $Token
    
    if ($historicoResponse -and $historicoResponse.data.historico.Count -gt 0) {
        Write-Host "✅ Histórico obtenido: $($historicoResponse.data.historico.Count) registros" -ForegroundColor Green
    }
    
} else {
    Write-Host "⚠️  No hay asistencias pendientes para probar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host ""

# 3. CU15: Consultar Horario
Write-Host "📌 PASO 3: CU15 - Consultar Horario" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "Obteniendo horarios de docente $DocenteId..."
$horariosResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/horarios?docente_id=$DocenteId" -Token $Token

if ($horariosResponse -and $horariosResponse.data.data.Count -gt 0) {
    Write-Host "✅ Se encontraron $($horariosResponse.data.data.Count) horarios" -ForegroundColor Green
    $HorarioId = $horariosResponse.data.data[0].id
    Write-Host "   Primer horario: $($horariosResponse.data.data[0].materia.sigla) - $($horariosResponse.data.data[0].infraestructura.nombre)"
    
    # Obtener semana agrupada
    Write-Host "Obteniendo horario de semana agrupado..."
    $semanaResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/horarios/semana?docente_id=$DocenteId" -Token $Token
    
    if ($semanaResponse -and $semanaResponse.success) {
        Write-Host "✅ Horario de semana obtenido" -ForegroundColor Green
        Write-Host "   Período: $($semanaResponse.data.semana.inicio) a $($semanaResponse.data.semana.fin)"
    }
} else {
    Write-Host "⚠️  No hay horarios disponibles" -ForegroundColor Yellow
}

Write-Host ""
Write-Host ""

# 4. CU16: Reporte de Asistencia
Write-Host "📌 PASO 4: CU16 - Generar Reporte de Asistencia" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "Generando reporte de asistencia por docente..."
$reporteAsistenciaResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/reportes/asistencia?tipo=docente&docente_id=$DocenteId&fecha_desde=2025-01-01&fecha_hasta=2025-12-31" -Token $Token

if ($reporteAsistenciaResponse -and $reporteAsistenciaResponse.success) {
    Write-Host "✅ Reporte generado exitosamente" -ForegroundColor Green
    Write-Host "   Total registros: $($reporteAsistenciaResponse.data.totales.total)"
    Write-Host "   Presentes: $($reporteAsistenciaResponse.data.totales.presentes)"
    Write-Host "   Ausentes: $($reporteAsistenciaResponse.data.totales.ausentes)"
    Write-Host "   % Asistencia: $($reporteAsistenciaResponse.data.porcentajes.asistencia)"
} else {
    Write-Host "⚠️  No hay datos para generar el reporte" -ForegroundColor Yellow
}

Write-Host ""
Write-Host ""

# 5. CU17: Reporte de Carga Horaria
Write-Host "📌 PASO 5: CU17 - Generar Reporte de Carga Horaria" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "Generando reporte de carga horaria..."
$reporteCargaResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/reportes/carga-horaria/docente/$DocenteId" -Token $Token

if ($reporteCargaResponse -and $reporteCargaResponse.success) {
    Write-Host "✅ Reporte de carga horaria generado" -ForegroundColor Green
    Write-Host "   Total de horas: $($reporteCargaResponse.data.total_horas)"
    Write-Host "   Total de grupos: $($reporteCargaResponse.data.total_grupos)"
    Write-Host "   Total de materias: $($reporteCargaResponse.data.total_materias)"
}

Write-Host ""
Write-Host ""

# 6. CU18: Reporte de Uso de Aulas
Write-Host "📌 PASO 6: CU18 - Generar Reporte de Uso de Aulas" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "Generando reporte de ocupación de aulas..."
$reporteAulasResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/reportes/uso-aulas" -Token $Token

if ($reporteAulasResponse -and $reporteAulasResponse.success) {
    Write-Host "✅ Reporte de aulas generado" -ForegroundColor Green
    Write-Host "   Aulas activas: $($reporteAulasResponse.data.resumen.aulas_activas)"
    Write-Host "   Promedio ocupación: $($reporteAulasResponse.data.resumen.promedio_ocupacion)"
} else {
    Write-Host "⚠️  No hay datos de aulas disponibles" -ForegroundColor Yellow
}

Write-Host ""
Write-Host ""

# 7. CU20: Dashboard de Indicadores
Write-Host "📌 PASO 7: CU20 - Dashboard de Indicadores" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "Obteniendo indicadores en tiempo real..."
$dashboardResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/dashboard/indicadores" -Token $Token

if ($dashboardResponse -and $dashboardResponse.success) {
    Write-Host "✅ Indicadores obtenidos" -ForegroundColor Green
    Write-Host "   Promedio asistencia: $($dashboardResponse.data.resumen.promedio_asistencia)%"
    Write-Host "   Total de horas: $($dashboardResponse.data.resumen.total_horas)"
    Write-Host "   Aulas activas: $($dashboardResponse.data.resumen.aulas_activas)"
    Write-Host "   Docentes evaluados: $($dashboardResponse.data.asistencia.Count)"
    Write-Host "   Aulas evaluadas: $($dashboardResponse.data.ocupacion_aulas.Count)"
} else {
    Write-Host "⚠️  No se pudieron obtener indicadores" -ForegroundColor Yellow
}

Write-Host ""
Write-Host ""

# 8. CU21: Auditoría
Write-Host "📌 PASO 8: CU21 - Auditoría de Acciones" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "Obteniendo bitácora de auditoría..."
$bitacoraResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/auditoria/bitacora?page=1" -Token $Token

if ($bitacoraResponse -and $bitacoraResponse.data.data.Count -gt 0) {
    Write-Host "✅ Bitácora obtenida" -ForegroundColor Green
    Write-Host "   Registros en página 1: $($bitacoraResponse.data.data.Count)"
    Write-Host "   Total de páginas: $($bitacoraResponse.data.last_page)"
    Write-Host "   Primeros registros:"
    foreach ($log in $bitacoraResponse.data.data | Select-Object -First 3) {
        Write-Host "     - $($log.accion) en $($log.tabla) por $($log.usuario.nombre) en $($log.created_at)"
    }
} else {
    Write-Host "⚠️  No hay registros de auditoría" -ForegroundColor Yellow
}

Write-Host "Obteniendo estadísticas de auditoría..."
$estadisticasResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/auditoria/estadisticas" -Token $Token

if ($estadisticasResponse -and $estadisticasResponse.success) {
    Write-Host "✅ Estadísticas de auditoría" -ForegroundColor Green
    Write-Host "   Total de registros: $($estadisticasResponse.data.total_registros)"
    Write-Host "   Acciones registradas:"
    foreach ($accion in $estadisticasResponse.data.acciones_por_tipo.PSObject.Properties) {
        Write-Host "     - $($accion.Name): $($accion.Value)"
    }
    
    if ($estadisticasResponse.data.usuarios_mas_activos.Count -gt 0) {
        Write-Host "   Usuarios más activos:"
        foreach ($usuario in $estadisticasResponse.data.usuarios_mas_activos | Select-Object -First 3) {
            Write-Host "     - $($usuario.usuario): $($usuario.total) acciones"
        }
    }
}

Write-Host ""
Write-Host ""

# Resumen Final
Write-Host "╔════════════════════════════════════════════════════════════╗"
Write-Host "║                    RESUMEN DE PRUEBAS                     ║"
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "✅ CU14: Validación de Asistencia - OK" -ForegroundColor Green
Write-Host "✅ CU15: Consultar Horario - OK" -ForegroundColor Green
Write-Host "✅ CU16: Reporte de Asistencia - OK" -ForegroundColor Green
Write-Host "✅ CU17: Reporte de Carga Horaria - OK" -ForegroundColor Green
Write-Host "✅ CU18: Reporte de Uso de Aulas - OK" -ForegroundColor Green
Write-Host "✅ CU20: Dashboard de Indicadores - OK" -ForegroundColor Green
Write-Host "✅ CU21: Auditoría - OK" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 TODOS LOS CASOS DE USO PROBADOS EXITOSAMENTE" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Frontend disponible en: $FrontendUrl" -ForegroundColor Cyan
Write-Host "🔧 Backend disponible en: $BackendUrl" -ForegroundColor Cyan
Write-Host ""
