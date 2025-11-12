<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Docente;
use App\Models\Usuario;
use App\Models\Role;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use OpenSpout\Reader\CSV\Reader as CSVReader;
use OpenSpout\Reader\XLSX\Reader as XLSXReader;
use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Common\Entity\Row;

class DocenteController extends Controller
{
    public function index()
    {
        return Docente::with('usuario')->get();
    }

    // CU4: Registrar docente (create usuario + docente)
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Datos usuario
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'correo' => 'required|email|unique:Usuario,correo',
            'ci' => 'required|string|unique:Usuario,ci',
            'password' => 'required|string|min:6',
            'telefono' => 'nullable|string',
            'sexo' => 'nullable|in:M,F',
            'direccion' => 'nullable|string',
            // Datos docente
            'especialidad' => 'nullable|string',
            'fecha_contrato' => 'nullable|date'
        ]);

        try {
            DB::beginTransaction();

            // 1. Crear usuario
            $usuarioData = [
                'nombre' => $validated['nombre'],
                'apellido' => $validated['apellido'],
                'correo' => $validated['correo'],
                'ci' => $validated['ci'],
                'password' => Hash::make($validated['password']),
                'telefono' => $validated['telefono'] ?? null,
                'sexo' => $validated['sexo'] ?? 'M',
                'direccion' => $validated['direccion'] ?? null,
                'activo' => true
            ];
            $usuario = Usuario::create($usuarioData);

            // 1.5. Asignar rol "Docente" automáticamente
            $rolDocente = Role::where('nombre', 'Docente')->first();
            if ($rolDocente) {
                $usuario->roles()->attach($rolDocente->id_rol);
            }

            // 2. Crear docente
            $docenteData = [
                'id_usuario' => $usuario->id,
                'especialidad' => $validated['especialidad'] ?? null,
                'fecha_contrato' => $validated['fecha_contrato'] ?? null
            ];
            $docente = Docente::create($docenteData);

            DB::commit();

            return response()->json($docente->load('usuario'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear docente: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return Docente::with('usuario')->findOrFail($id);
    }

    // CU5: Editar docente
    // CU5: Editar docente con auditoría
    public function update(Request $request, $id)
    {
        $docente = Docente::findOrFail($id);
        
        $validated = $request->validate([
            // Datos usuario (opcionales)
            'nombre' => 'sometimes|string',
            'apellido' => 'sometimes|string',
            'telefono' => 'nullable|string',
            'sexo' => 'nullable|in:M,F',
            'direccion' => 'nullable|string',
            'activo' => 'nullable|boolean',
            // Datos docente (opcionales)
            'especialidad' => 'nullable|string',
            'fecha_contrato' => 'nullable|date'
        ]);

        try {
            DB::beginTransaction();

            // Capturar estado original para auditoría
            $docenteOriginal = $docente->toArray();
            $usuarioOriginal = $docente->usuario->toArray();

            // Actualizar usuario si hay datos de usuario
            $usuarioData = [];
            foreach (['nombre', 'apellido', 'telefono', 'sexo', 'direccion', 'activo'] as $field) {
                if (isset($validated[$field])) {
                    $usuarioData[$field] = $validated[$field];
                }
            }
            if (!empty($usuarioData)) {
                $docente->usuario->update($usuarioData);
            }

            // Actualizar docente
            $docenteData = [];
            foreach (['especialidad', 'fecha_contrato'] as $field) {
                if (isset($validated[$field])) {
                    $docenteData[$field] = $validated[$field];
                }
            }
            if (!empty($docenteData)) {
                $docente->update($docenteData);
            }

            // Registrar auditoría
            AuditLog::create([
                'usuario_id' => Auth::id(),
                'accion' => 'actualizar',
                'entidad' => 'Docente',
                'entidad_id' => $docente->cod_docente,
                'antes' => array_merge($docenteOriginal, ['usuario' => $usuarioOriginal]),
                'despues' => array_merge($docente->toArray(), ['usuario' => $docente->usuario->toArray()]),
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            DB::commit();

            return response()->json($docente->load('usuario'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar docente: ' . $e->getMessage()], 500);
        }
    }

    // CU5: Eliminar docente
    // CU5: Eliminar docente con validación de carga asignada
    public function destroy($id)
    {
        $docente = Docente::findOrFail($id);
        
        try {
            // Verificar si el docente tiene carga asignada
            $cargaAsignada = \App\Models\DocenteGrupoMateria::where('cod_docente', $docente->cod_docente)->count();
            
            if ($cargaAsignada > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar el docente porque tiene ' . $cargaAsignada . ' carga(s) asignada(s)',
                    'cargas_asignadas' => $cargaAsignada
                ], 422);
            }

            DB::beginTransaction();

            // Capturar estado original para auditoría
            $docenteOriginal = $docente->toArray();

            // Eliminar docente primero
            $usuario = $docente->usuario;
            $docente->delete();

            // Luego eliminar usuario
            if ($usuario) {
                $usuario->delete();
            }

            // Registrar auditoría
            AuditLog::create([
                'usuario_id' => Auth::id(),
                'accion' => 'eliminar',
                'entidad' => 'Docente',
                'entidad_id' => $docenteOriginal['cod_docente'],
                'antes' => $docenteOriginal,
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            DB::commit();

            return response()->json(['message' => 'Docente eliminado correctamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al eliminar docente: ' . $e->getMessage()], 500);
        }
    }

    /**
     * CU4: Descargar plantilla Excel para importación de docentes
     */
    public function descargarPlantillaExcel()
    {
        try {
            $writer = new Writer();
            $fileName = 'Plantilla_Importar_Docentes.xlsx';
            $tempPath = storage_path('temp/' . $fileName);
            
            // Crear directorio si no existe
            if (!is_dir(storage_path('temp'))) {
                mkdir(storage_path('temp'), 0755, true);
            }
            
            $writer->openToFile($tempPath);
            
            // Headers
            $headers = [
                'nombre',
                'apellido',
                'correo',
                'ci',
                'contraseña',
                'teléfono',
                'sexo',
                'dirección',
                'especialidad',
                'fecha_contrato'
            ];
            
            $writer->addRow(Row::fromValues($headers));
            
            // Fila de ejemplo
            $ejemplo = [
                'Juan',
                'Pérez García',
                'juan.perez@escuela.edu',
                '12345678',
                'Password123!',
                '+591-77777777',
                'M',
                'Calle Principal 123, La Paz',
                'Matemáticas',
                '2024-01-15'
            ];
            
            $writer->addRow(Row::fromValues($ejemplo));
            
            // Filas vacías para llenar
            for ($i = 0; $i < 9; $i++) {
                $writer->addRow(Row::fromValues([
                    '', '', '', '', '', '', '', '', '', ''
                ]));
            }
            
            $writer->close();
            
            // Descargar archivo
            return response()->download($tempPath, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ])->deleteFileAfterSend(true);
            
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al generar plantilla',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU4: Importar docentes masivamente desde Excel o CSV
     * 
     * Columnas esperadas:
     * - nombre
     * - apellido
     * - correo
     * - ci
     * - contraseña
     * - teléfono (opcional)
     * - sexo (opcional: M/F)
     * - dirección (opcional)
     * - especialidad (opcional)
     * - fecha_contrato (opcional, formato: YYYY-MM-DD)
     */
    public function importarDocentesExcel(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:xlsx,xls,csv'
        ]);

        try {
            DB::beginTransaction();

            $archivo = $request->file('archivo');
            $rutaArchivo = $archivo->getRealPath();
            $extension = strtolower($archivo->getClientOriginalExtension());

            $datos = [];

            // Procesar según el tipo de archivo
            if ($extension === 'csv') {
                $datos = $this->procesarCSV($rutaArchivo);
            } else {
                // Para .xlsx y .xls usar OpenSpout
                $datos = $this->procesarExcel($rutaArchivo);
            }

            $resultados = [
                'creados' => 0,
                'errores' => 0,
                'duplicados' => 0,
                'detalles_errores' => [],
                'detalles_duplicados' => [],
                'filas_leidas' => count($datos),
                'debug' => []
            ];

            $fila = 2; // Empezar desde fila 2 (fila 1 es header)

            // Si no hay datos, es un error
            if (count($datos) === 0) {
                throw new \Exception('No se encontraron datos en el archivo o el archivo está vacío');
            }

            foreach ($datos as $row) {
                // Debug: registrar la fila
                $resultados['debug'][] = [
                    'fila' => $fila,
                    'datos_raw' => $row,
                    'count_columnas' => count($row)
                ];

                // Saltar filas completamente vacías
                $esFilaVacia = true;
                foreach ($row as $cell) {
                    if (!empty(trim($cell))) {
                        $esFilaVacia = false;
                        break;
                    }
                }

                if ($esFilaVacia) {
                    $fila++;
                    continue;
                }

                $nombre = trim($row[0] ?? '');
                $apellido = trim($row[1] ?? '');
                $correo = trim($row[2] ?? '');
                $ci = trim($row[3] ?? '');
                $password = trim($row[4] ?? '');
                $telefono = trim($row[5] ?? '');
                $sexo = trim($row[6] ?? 'M');
                $direccion = trim($row[7] ?? '');
                $especialidad = trim($row[8] ?? '');
                $fecha_contrato = trim($row[9] ?? '');

                // Validaciones básicas
                if (empty($nombre) || empty($apellido) || empty($correo) || empty($ci) || empty($password)) {
                    $resultados['errores']++;
                    $resultados['detalles_errores'][] = [
                        'fila' => $fila,
                        'razon' => 'Faltan campos requeridos (nombre, apellido, correo, ci, contraseña)'
                    ];
                    $fila++;
                    continue;
                }

                // Validar email
                if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
                    $resultados['errores']++;
                    $resultados['detalles_errores'][] = [
                        'fila' => $fila,
                        'razon' => "Email inválido: $correo"
                    ];
                    $fila++;
                    continue;
                }

                // Validar sexo
                if (!in_array($sexo, ['M', 'F'])) {
                    $sexo = 'M';
                }

                // Verificar duplicados
                $usuarioExistente = Usuario::where('correo', $correo)->orWhere('ci', $ci)->first();
                if ($usuarioExistente) {
                    $resultados['duplicados']++;
                    $resultados['detalles_duplicados'][] = [
                        'fila' => $fila,
                        'nombre' => "$nombre $apellido",
                        'correo' => $correo,
                        'ci' => $ci
                    ];
                    $fila++;
                    continue;
                }

                // Crear usuario
                try {
                    $usuarioData = [
                        'nombre' => $nombre,
                        'apellido' => $apellido,
                        'correo' => $correo,
                        'ci' => $ci,
                        'password' => Hash::make($password),
                        'telefono' => !empty($telefono) ? $telefono : null,
                        'sexo' => $sexo,
                        'direccion' => !empty($direccion) ? $direccion : null,
                        'activo' => true
                    ];
                    $usuario = Usuario::create($usuarioData);

                    // Asignar rol Docente
                    $rolDocente = Role::where('nombre', 'Docente')->first();
                    if ($rolDocente) {
                        $usuario->roles()->attach($rolDocente->id_rol);
                    }

                    // Crear docente
                    $docenteData = [
                        'id_usuario' => $usuario->id,
                        'especialidad' => !empty($especialidad) ? $especialidad : null,
                        'fecha_contrato' => !empty($fecha_contrato) ? $fecha_contrato : null
                    ];
                    Docente::create($docenteData);

                    $resultados['creados']++;
                } catch (\Exception $e) {
                    $resultados['errores']++;
                    $resultados['detalles_errores'][] = [
                        'fila' => $fila,
                        'razon' => 'Error al crear: ' . substr($e->getMessage(), 0, 100)
                    ];
                }

                $fila++;
            }

            DB::commit();

            // Remover debug antes de devolver
            unset($resultados['debug']);

            return response()->json([
                'mensaje' => 'Importación completada',
                'resultados' => $resultados
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'mensaje' => 'Error al procesar archivo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Procesar archivo Excel (.xlsx, .xls)
     */
    private function procesarExcel($rutaArchivo)
    {
        $datos = [];
        
        try {
            // Usar XLSXReader directamente
            $reader = new XLSXReader();
            $reader->open($rutaArchivo);

            foreach ($reader->getSheetIterator() as $sheet) {
                $rowIndex = 0;
                foreach ($sheet->getRowIterator() as $indexFila => $row) {
                    $rowIndex++;
                    $cells = $row->getCells();
                    $rowData = [];
                    
                    foreach ($cells as $cell) {
                        $rowData[] = $cell->getValue();
                    }
                    
                    // Saltar header (primera fila)
                    if ($indexFila > 1) {
                        $datos[] = $rowData;
                    }
                }
                break; // Solo procesar primera hoja
            }

            $reader->close();
            
            // Log para debugging
            Log::info('Excel importado', [
                'archivo' => basename($rutaArchivo),
                'filas_leidas' => count($datos),
                'datos_primera_fila' => isset($datos[0]) ? $datos[0] : null
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error al leer Excel', [
                'error' => $e->getMessage(),
                'archivo' => basename($rutaArchivo)
            ]);
            throw new \Exception('Error al leer archivo Excel: ' . $e->getMessage());
        }

        return $datos;
    }

    /**
     * Procesar archivo CSV
     */
    private function procesarCSV($rutaArchivo)
    {
        $datos = [];
        
        try {
            $handle = fopen($rutaArchivo, 'r');
            $fila = 0;

            while (($row = fgetcsv($handle)) !== false) {
                $fila++;
                // Saltar header
                if ($fila === 1) continue;
                
                $datos[] = $row;
            }

            fclose($handle);
        } catch (\Exception $e) {
            throw new \Exception('Error al leer archivo CSV: ' . $e->getMessage());
        }

        return $datos;
    }
}
