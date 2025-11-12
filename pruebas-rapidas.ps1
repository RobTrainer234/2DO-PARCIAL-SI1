#!/usr/bin/env pwsh

# Script de Pruebas Rápidas - Todos los CU
# Ejecutar con: powershell -ExecutionPolicy Bypass -File pruebas-rapidas.ps1

$BaseURL = "http://localhost:8000/api"
$PASSED = 0
$FAILED = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$URL,
        [hashtable]$Headers,
        [string]$Body,
        [int]$ExpectedStatus
    )
    
    try {
        $params = @{
            Uri = $URL
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params['Body'] = $Body
        }
        
        $response = Invoke-WebRequest @params -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ $Name" -ForegroundColor Green
            $global:PASSED++
            return $response
        } else {
            Write-Host "❌ $Name (Status: $($response.StatusCode), Esperado: $ExpectedStatus)" -ForegroundColor Red
            $global:FAILED++
            return $null
        }
    } catch {
        Write-Host "❌ $Name (Error: $_)" -ForegroundColor Red
        $global:FAILED++
        return $null
    }
}

Write-Host "
╔════════════════════════════════════════════════╗
║  PRUEBAS DE CASOS DE USO CU1 - CU13            ║
║  Base URL: $BaseURL                ║
╚════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# CU1: AUTENTICACIÓN
Write-Host "`n[CU1] AUTENTICACIÓN" -ForegroundColor Yellow
$login = Test-Endpoint `
    -Name "CU1.1: Login" `
    -Method "POST" `
    -URL "$BaseURL/auth/login" `
    -Headers @{} `
    -Body '{"email":"admin@test.com","password":"password"}' `
    -ExpectedStatus 200

if ($login) {
    $loginData = $login.Content | ConvertFrom-Json
    $TOKEN = $loginData.token
    Write-Host "   Token: $($TOKEN.Substring(0,20))..."
} else {
    Write-Host "⚠️  No se pudo obtener token. Abortando pruebas." -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# CU2: ROLES Y PERMISOS
Write-Host "`n[CU2] ROLES Y PERMISOS" -ForegroundColor Yellow
Test-Endpoint "CU2.1: Listar Roles" "GET" "$BaseURL/roles" $headers "" 200 | Out-Null
Test-Endpoint "CU2.2: Listar Permisos" "GET" "$BaseURL/permisos" $headers "" 200 | Out-Null

# CU3: USUARIOS
Write-Host "`n[CU3] GESTIÓN DE USUARIOS" -ForegroundColor Yellow
Test-Endpoint "CU3.1: Listar Usuarios" "GET" "$BaseURL/usuarios" $headers "" 200 | Out-Null
Test-Endpoint "CU3.2: Ver Perfil" "GET" "$BaseURL/auth/me" $headers "" 200 | Out-Null

# CU4: DOCENTES
Write-Host "`n[CU4] REGISTRAR DOCENTE" -ForegroundColor Yellow
Test-Endpoint "CU4.1: Listar Docentes" "GET" "$BaseURL/docentes" $headers "" 200 | Out-Null

# CU5: EDITAR/ELIMINAR DOCENTE
Write-Host "`n[CU5] EDITAR/ELIMINAR DOCENTE" -ForegroundColor Yellow
Write-Host "   (Requiere docente existente con carga asignada)"

# CU6: MATERIAS
Write-Host "`n[CU6] REGISTRAR MATERIA" -ForegroundColor Yellow
$materia = Test-Endpoint "CU6.1: Crear Materia" "POST" "$BaseURL/materias" $headers `
    @'
{
  "sigla": "TEST'$(Get-Random)',
  "nombre": "Materia Test",
  "codigo": "T'$(Get-Random)',
  "nivel": 1,
  "carga_horaria": 4
}
'@ 201

if ($materia) {
    $materiaData = $materia.Content | ConvertFrom-Json
    $MATERIA_SIGLA = $materiaData.sigla
    Write-Host "   Sigla: $MATERIA_SIGLA"
    
    Test-Endpoint "CU6.2: Listar Materias" "GET" "$BaseURL/materias" $headers "" 200 | Out-Null
}

# CU7: GRUPOS
Write-Host "`n[CU7] REGISTRAR GRUPO" -ForegroundColor Yellow
$grupo = Test-Endpoint "CU7.1: Crear Grupo" "POST" "$BaseURL/grupos" $headers `
    @'
{
  "nombre": "GRUPO'$(Get-Random)',
  "sigla_materia": "'$MATERIA_SIGLA'",
  "turno": "Diurno",
  "paralelo": "A",
  "cupo_maximo": 40
}
'@ 201

if ($grupo) {
    $grupoData = $grupo.Content | ConvertFrom-Json
    $GRUPO_ID = $grupoData.id_grupo
    Write-Host "   Grupo ID: $GRUPO_ID"
    
    Test-Endpoint "CU7.2: Listar Grupos" "GET" "$BaseURL/grupos" $headers "" 200 | Out-Null
}

# CU9: AULAS
Write-Host "`n[CU9] REGISTRAR AULA" -ForegroundColor Yellow
$aula = Test-Endpoint "CU9.1: Crear Aula" "POST" "$BaseURL/aulas" $headers `
    @'
{
  "nro": "'$(Get-Random)',
  "piso": 1,
  "capacidad": 50,
  "id_tipo": 1,
  "activo": true
}
'@ 201

if ($aula) {
    $aulaData = $aula.Content | ConvertFrom-Json
    $AULA_ID = $aulaData.id_infraestructura
    Write-Host "   Aula ID: $AULA_ID"
    
    Test-Endpoint "CU9.2: Listar Aulas" "GET" "$BaseURL/aulas" $headers "" 200 | Out-Null
}

# CU10b: ASIGNACIONES
Write-Host "`n[CU10b] CREAR ASIGNACIÓN (Docente-Grupo-Materia)" -ForegroundColor Yellow
$asignacion = Test-Endpoint "CU10b.1: Crear Asignación" "POST" "$BaseURL/asignaciones" $headers `
    @'
{
  "cod_docente": "DOC001",
  "id_grupo": '$GRUPO_ID',
  "sigla_materia": "'$MATERIA_SIGLA'",
  "id_gestion": 1
}
'@ 201

if ($asignacion) {
    $asignacionData = $asignacion.Content | ConvertFrom-Json
    $ASIGNACION_ID = $asignacionData.id_asignacion
    Write-Host "   Asignación ID: $ASIGNACION_ID"
    
    # CU11: HORARIOS (MÁS CRÍTICO)
    Write-Host "`n[CU11] REGISTRAR HORARIO (CON VALIDACIÓN DE CONFLICTOS) ⭐" -ForegroundColor Yellow
    
    $horario1 = Test-Endpoint "CU11.1: Crear Horario Válido" "POST" "$BaseURL/horarios" $headers `
        @'
{
  "dia": "Lunes",
  "hora_inicio": "08:00",
  "hora_final": "10:00",
  "id_asignacion": '$ASIGNACION_ID',
  "id_infraestructura": '$AULA_ID'
}
'@ 201
    
    if ($horario1) {
        $horarioData = $horario1.Content | ConvertFrom-Json
        $HORARIO_ID = $horarioData.id_horario
        Write-Host "   Horario ID: $HORARIO_ID"
        
        # Test de Conflicto
        Write-Host "   Probando detección de conflictos..."
        Test-Endpoint "CU11.2: Detectar Conflicto (Mismo Docente)" "POST" "$BaseURL/horarios" $headers `
            @'
{
  "dia": "Lunes",
  "hora_inicio": "08:30",
  "hora_final": "10:30",
  "id_asignacion": '$ASIGNACION_ID',
  "id_infraestructura": 2
}
'@ 422 | Out-Null
        
        # CU12: EDITAR/ELIMINAR HORARIO
        Write-Host "`n[CU12] EDITAR/ELIMINAR HORARIO" -ForegroundColor Yellow
        
        Test-Endpoint "CU12.1: Actualizar Horario" "PUT" "$BaseURL/horarios/$HORARIO_ID" $headers `
            @'
{
  "hora_inicio": "09:00",
  "hora_final": "11:00"
}
'@ 200 | Out-Null
        
        Test-Endpoint "CU12.2: Eliminar Horario (Soft Delete)" "DELETE" "$BaseURL/horarios/$HORARIO_ID" $headers "" 200 | Out-Null
    }
    
    # CU13: ASISTENCIAS
    Write-Host "`n[CU13] REGISTRAR ASISTENCIA" -ForegroundColor Yellow
    Test-Endpoint "CU13.1: Crear Asistencia" "POST" "$BaseURL/asistencias" $headers `
        @'
{
  "id_asignacion": '$ASIGNACION_ID',
  "fecha": "2024-11-11",
  "hora": "08:15",
  "estado": "presente",
  "metodo": "manual",
  "observacion": "Test"
}
'@ 201 | Out-Null
    
    Test-Endpoint "CU13.2: Listar Asistencias" "GET" "$BaseURL/asistencias" $headers "" 200 | Out-Null
}

# AUDITORÍA
Write-Host "`n[CU21] AUDITORÍA" -ForegroundColor Yellow
Test-Endpoint "CU21.1: Ver Bitácora" "GET" "$BaseURL/auditoria/bitacora" $headers "" 200 | Out-Null

# RESUMEN
Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RESUMEN DE PRUEBAS                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "✅ Pasadas: $PASSED" -ForegroundColor Green
Write-Host "❌ Fallidas: $FAILED" -ForegroundColor Red
Write-Host "📊 Total: $($PASSED + $FAILED)" -ForegroundColor Cyan

if ($FAILED -eq 0) {
    Write-Host "`n🎉 TODAS LAS PRUEBAS PASARON!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Algunas pruebas fallaron. Revisa los errores arriba." -ForegroundColor Yellow
}

