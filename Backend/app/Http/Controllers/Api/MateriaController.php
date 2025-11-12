<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Materia;
use Illuminate\Support\Facades\DB;
use OpenSpout\Reader\CSV\Reader as CSVReader;
use OpenSpout\Reader\XLSX\Reader as XLSXReader;
use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Common\Entity\Row;

class MateriaController extends Controller
{
    public function index()
    {
        return Materia::all()->keyBy('sigla');
    }

    /**
     * Listar materias por semestre
     */
    public function porSemestre($semestre)
    {
        return Materia::where('semestre', $semestre)->get();
    }

    /**
     * Listar todas las materias electivas (sin semestre)
     */
    public function electivas()
    {
        return Materia::whereNull('semestre')->orWhere('semestre', '')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sigla' => 'required|string|unique:Materia,sigla',
            'nombre' => 'required|string',
            'semestre' => 'nullable|integer',
            'horas_teoricas' => 'nullable|integer|min:0',
            'horas_practicas' => 'nullable|integer|min:0',
            'creditos' => 'nullable|integer|min:1'
        ]);

        $m = Materia::create($data);
        return response()->json($m, 201);
    }

    public function show($sigla)
    {
        return Materia::findOrFail($sigla);
    }

    /**
     * Obtener el semestre de una materia por su sigla
     * Usado para auto-completar el campo de semestre al seleccionar una materia
     */
    public function obtenerSemestre($sigla)
    {
        $materia = Materia::find($sigla);
        
        if (!$materia) {
            return response()->json(['error' => 'Materia no encontrada'], 404);
        }

        return response()->json([
            'sigla' => $materia->sigla,
            'nombre' => $materia->nombre,
            'semestre' => $materia->semestre ?? null,
            'es_electiva' => is_null($materia->semestre)
        ]);
    }

    public function update(Request $request, $sigla)
    {
        $m = Materia::findOrFail($sigla);
        $data = $request->validate([
            'nombre' => 'sometimes|string',
            'semestre' => 'sometimes|nullable|integer',
            'horas_teoricas' => 'sometimes|nullable|integer|min:0',
            'horas_practicas' => 'sometimes|nullable|integer|min:0',
            'creditos' => 'sometimes|nullable|integer|min:1'
        ]);
        $m->update($data);
        return response()->json($m);
    }

    public function destroy($sigla)
    {
        $m = Materia::findOrFail($sigla);
        $m->delete();
        return response()->json(['message' => 'Materia eliminada']);
    }

    /**
     * Descargar plantilla Excel para importación de materias
     */
    public function descargarPlantilla()
    {
        try {
            $writer = new Writer();
            $fileName = 'Plantilla_Importar_Materias.xlsx';
            $tempPath = storage_path('temp/' . $fileName);
            
            if (!is_dir(storage_path('temp'))) {
                mkdir(storage_path('temp'), 0755, true);
            }
            
            $writer->openToFile($tempPath);
            
            // Headers
            $headers = ['sigla', 'nombre', 'semestre'];
            $writer->addRow(Row::fromValues($headers));
            
            // Ejemplo regular
            $ejemplo = ['MAT101', 'CALCULO 1', '1'];
            $writer->addRow(Row::fromValues($ejemplo));
            
            // Ejemplo de electiva (sin semestre)
            $ejemploElectiva = ['ELC101', 'CRIPTOGRAFIA Y SEGURIDAD', ''];
            $writer->addRow(Row::fromValues($ejemploElectiva));
            
            // Filas vacías
            for ($i = 0; $i < 18; $i++) {
                $writer->addRow(Row::fromValues(['', '', '']));
            }
            
            $writer->close();
            
            return response()->download($tempPath, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ])->deleteFileAfterSend(true);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Importar materias desde Excel o CSV
     */
    public function importar(Request $request)
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

            if ($extension === 'csv') {
                $datos = $this->procesarCSV($rutaArchivo);
            } else {
                $datos = $this->procesarExcel($rutaArchivo);
            }

            $resultados = [
                'creadas' => 0,
                'actualizadas' => 0,
                'errores' => 0,
                'duplicadas' => 0,
                'detalles_errores' => [],
                'filas_leidas' => count($datos)
            ];

            $fila = 2;

            foreach ($datos as $row) {
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

                $sigla = trim($row[0] ?? '');
                $nombre = trim($row[1] ?? '');
                $semestre = trim($row[2] ?? '');

                // Validar campos requeridos
                if (empty($sigla) || empty($nombre)) {
                    $resultados['errores']++;
                    $resultados['detalles_errores'][] = [
                        'fila' => $fila,
                        'razon' => 'Faltan campos requeridos (sigla, nombre)'
                    ];
                    $fila++;
                    continue;
                }

                $sigla = strtoupper($sigla);
                $nombre = strtoupper($nombre);
                $semestreInt = !empty($semestre) ? (int)$semestre : null;

                // Verificar si ya existe
                $materiaExistente = Materia::find($sigla);
                
                if ($materiaExistente) {
                    // Actualizar si existe
                    $materiaExistente->update([
                        'nombre' => $nombre,
                        'semestre' => $semestreInt
                    ]);
                    $resultados['actualizadas']++;
                } else {
                    // Crear nueva
                    try {
                        Materia::create([
                            'sigla' => $sigla,
                            'nombre' => $nombre,
                            'semestre' => $semestreInt
                        ]);
                        $resultados['creadas']++;
                    } catch (\Exception $e) {
                        $resultados['errores']++;
                        $resultados['detalles_errores'][] = [
                            'fila' => $fila,
                            'razon' => 'Error al crear: ' . substr($e->getMessage(), 0, 100)
                        ];
                    }
                }

                $fila++;
            }

            DB::commit();

            return response()->json([
                'mensaje' => 'Importación completada',
                'resultados' => $resultados
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Procesar Excel
     */
    private function procesarExcel($rutaArchivo)
    {
        $datos = [];
        
        try {
            $reader = new XLSXReader();
            $reader->open($rutaArchivo);

            foreach ($reader->getSheetIterator() as $sheet) {
                foreach ($sheet->getRowIterator() as $indexFila => $row) {
                    $cells = $row->getCells();
                    $rowData = [];
                    
                    foreach ($cells as $cell) {
                        $rowData[] = $cell->getValue();
                    }
                    
                    if ($indexFila > 1) {
                        $datos[] = $rowData;
                    }
                }
                break;
            }

            $reader->close();
            
        } catch (\Exception $e) {
            throw new \Exception('Error al leer Excel: ' . $e->getMessage());
        }

        return $datos;
    }

    /**
     * Procesar CSV
     */
    private function procesarCSV($rutaArchivo)
    {
        $datos = [];
        
        try {
            $handle = fopen($rutaArchivo, 'r');
            $fila = 0;

            while (($row = fgetcsv($handle)) !== false) {
                $fila++;
                if ($fila > 1) {
                    $datos[] = $row;
                }
            }
            
            fclose($handle);
            
        } catch (\Exception $e) {
            throw new \Exception('Error al leer CSV: ' . $e->getMessage());
        }

        return $datos;
    }
}
