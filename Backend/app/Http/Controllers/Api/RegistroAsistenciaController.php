<?php

namespace App\Http\Controllers\Api;

use App\Models\AsistenciaDocente;
use App\Models\EvidenciaAsistencia;
use App\Models\Docente;
use App\Models\Grupo;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Carbon\Carbon;
use Illuminate\Support\Str;

class RegistroAsistenciaController extends Controller
{
    // CU13: Registrar asistencia manual
    public function registrarManual(Request $request)
    {
        $validated = $request->validate([
            'docente_id' => 'required|exists:docentes,id',
            'grupo_id' => 'required|exists:grupos,id',
            'fecha' => 'required|date',
            'hora_entrada' => 'required|date_format:H:i:s',
            'observaciones' => 'nullable|string'
        ]);

        $asistencia = AsistenciaDocente::updateOrCreate(
            [
                'docente_id' => $validated['docente_id'],
                'grupo_id' => $validated['grupo_id'],
                'fecha' => $validated['fecha']
            ],
            [
                'hora_entrada' => $validated['hora_entrada'],
                'tipo_registro' => 'Manual',
                'observaciones' => $validated['observaciones'],
                'estado' => $this->determinarEstado($validated['hora_entrada']),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Asistencia registrada exitosamente',
            'data' => $asistencia
        ], 201);
    }

    // CU13: Generar código QR
    public function generarCodigoQR(Request $request)
    {
        $validated = $request->validate([
            'docente_id' => 'required|exists:docentes,id',
            'grupo_id' => 'required|exists:grupos,id',
            'fecha' => 'required|date',
            'hora_inicio' => 'required|date_format:H:i:s',
            'hora_fin' => 'required|date_format:H:i:s'
        ]);

        $codigoQR = Str::random(20);
        
        $asistencia = AsistenciaDocente::create([
            'docente_id' => $validated['docente_id'],
            'grupo_id' => $validated['grupo_id'],
            'fecha' => $validated['fecha'],
            'tipo_registro' => 'QR',
            'codigo_qr' => $codigoQR,
            'hora_entrada' => now()->format('H:i:s'),
            'estado' => 'Falta'
        ]);

        // Aquí se generaría el código QR visual (usar librería como endroid/qr-code)
        $qrData = [
            'docente_id' => $validated['docente_id'],
            'grupo_id' => $validated['grupo_id'],
            'fecha' => $validated['fecha'],
            'codigo' => $codigoQR,
            'hora_inicio' => $validated['hora_inicio'],
            'hora_fin' => $validated['hora_fin']
        ];

        return response()->json([
            'success' => true,
            'message' => 'Código QR generado',
            'asistencia_id' => $asistencia->id,
            'qr_data' => $qrData,
            'qr_codigo' => $codigoQR
        ], 201);
    }

    // CU13: Registrar por código QR
    public function registrarPorQR(Request $request)
    {
        $validated = $request->validate([
            'codigo_qr' => 'required|string',
            'docente_id' => 'required|exists:docentes,id'
        ]);

        $asistencia = AsistenciaDocente::where('codigo_qr', $validated['codigo_qr'])->first();

        if (!$asistencia) {
            return response()->json(['error' => 'Código QR no válido'], 404);
        }

        $horaActual = now();
        $estado = $this->determinarEstado($horaActual->format('H:i:s'));

        $asistencia->update([
            'estado' => $estado,
            'hora_entrada' => $horaActual,
            'tipo_registro' => 'QR'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Asistencia registrada por QR',
            'data' => $asistencia
        ]);
    }

    // CU13: Generar enlace único
    public function generarEnlaceUnico(Request $request)
    {
        $validated = $request->validate([
            'docente_id' => 'required|exists:docentes,id',
            'grupo_id' => 'required|exists:grupos,id',
            'fecha' => 'required|date',
            'hora_inicio' => 'required|date_format:H:i:s',
            'hora_fin' => 'required|date_format:H:i:s'
        ]);

        $enlaceUnico = Str::random(32);

        $asistencia = AsistenciaDocente::create([
            'docente_id' => $validated['docente_id'],
            'grupo_id' => $validated['grupo_id'],
            'fecha' => $validated['fecha'],
            'tipo_registro' => 'Enlace',
            'enlace_unico' => $enlaceUnico,
            'hora_entrada' => now()->format('H:i:s'),
            'estado' => 'Falta'
        ]);

        $urlEnlace = route('asistencia.registrar-enlace', ['enlace' => $enlaceUnico]);

        return response()->json([
            'success' => true,
            'message' => 'Enlace único generado',
            'asistencia_id' => $asistencia->id,
            'enlace' => $urlEnlace,
            'enlace_codigo' => $enlaceUnico
        ], 201);
    }

    // CU13: Registrar por enlace
    public function registrarPorEnlace(Request $request, $enlace)
    {
        $asistencia = AsistenciaDocente::where('enlace_unico', $enlace)->first();

        if (!$asistencia) {
            return response()->json(['error' => 'Enlace no válido'], 404);
        }

        $horaActual = now();
        $estado = $this->determinarEstado($horaActual->format('H:i:s'));

        $asistencia->update([
            'estado' => $estado,
            'hora_entrada' => $horaActual,
            'tipo_registro' => 'Enlace'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Asistencia registrada por enlace',
            'data' => $asistencia
        ]);
    }

    // CU13: Cambiar estado de asistencia
    public function cambiarEstado(Request $request, $id)
    {
        $validated = $request->validate([
            'estado' => 'required|in:Presente,Atraso,Falta,Falta justificada'
        ]);

        $asistencia = AsistenciaDocente::find($id);

        if (!$asistencia) {
            return response()->json(['error' => 'Asistencia no encontrada'], 404);
        }

        $asistencia->update(['estado' => $validated['estado']]);

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado',
            'data' => $asistencia
        ]);
    }

    // CU13: Guardar evidencia
    public function guardarEvidencia(Request $request, $asistenciaId)
    {
        $validated = $request->validate([
            'tipo_evidencia' => 'required|in:Foto,Archivo,Observacion',
            'archivo' => 'nullable|file|max:5120',
            'descripcion' => 'nullable|string'
        ]);

        $asistencia = AsistenciaDocente::find($asistenciaId);

        if (!$asistencia) {
            return response()->json(['error' => 'Asistencia no encontrada'], 404);
        }

        $archivo = null;
        if ($request->hasFile('archivo')) {
            $archivo = $request->file('archivo')->store('asistencias/evidencia', 'public');
        }

        $evidencia = EvidenciaAsistencia::create([
            'asistencia_id' => $asistenciaId,
            'tipo_evidencia' => $validated['tipo_evidencia'],
            'archivo' => $archivo,
            'descripcion' => $validated['descripcion']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evidencia guardada',
            'data' => $evidencia
        ], 201);
    }

    // CU13: Obtener asistencias por docente
    public function obtenerAsistenciasDocente($docenteId)
    {
        $asistencias = AsistenciaDocente::where('docente_id', $docenteId)
            ->with(['grupo', 'evidencias', 'validaciones'])
            ->orderBy('fecha', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $asistencias
        ]);
    }

    // Helper: Determinar estado según hora
    private function determinarEstado($horaEntrada): string
    {
        $hora = Carbon::createFromFormat('H:i:s', $horaEntrada);
        $horaLimite = Carbon::createFromTimeString('07:30:00');

        if ($hora <= $horaLimite) {
            return 'Presente';
        } elseif ($hora <= $horaLimite->addMinutes(15)) {
            return 'Atraso';
        }

        return 'Falta';
    }
}
