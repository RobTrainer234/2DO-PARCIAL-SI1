<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UsuarioController extends Controller
{
    public function index()
    {
        return Usuario::with('roles')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'correo' => 'required|email|unique:Usuario,correo',
            'ci' => 'required|string|unique:Usuario,ci',
            'password' => 'required|string|min:6',
            'telefono' => 'nullable|string',
            'sexo' => 'nullable|in:M,F',
            'direccion' => 'nullable|string'
        ]);

        $data['password'] = Hash::make($data['password']);
        $data['activo'] = true;
        $user = Usuario::create($data);
        return response()->json($user, 201);
    }

    public function show($id)
    {
        return Usuario::with('roles')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $user = Usuario::findOrFail($id);
        $data = $request->validate([
            'nombre' => 'sometimes|string',
            'apellido' => 'sometimes|string',
            'telefono' => 'nullable|string',
            'sexo' => 'nullable|in:M,F',
            'direccion' => 'nullable|string',
            'activo' => 'nullable|boolean'
        ]);

        $user->update($data);
        return response()->json($user->load('roles'));
    }

    public function destroy($id)
    {
        $user = Usuario::findOrFail($id);
        // Detach roles
        $user->roles()->detach();
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }

    // Asignar roles a usuario
    public function asignarRoles(Request $request, $id)
    {
        $user = Usuario::findOrFail($id);
        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'integer|exists:Roles,id_rol'
        ]);
        
        $user->roles()->sync($validated['roles']);
        return response()->json($user->load('roles'));
    }

    /**
     * CU3: Importar usuarios masivamente desde CSV o Excel
     * 
     * Esperado en archivo CSV:
     * nombre,apellido,correo,ci,password,telefono,sexo,direccion
     * Juan,Pérez,juan@ficct.edu.bo,1234567,password123,70123456,M,La Paz
     * 
     * O JSON:
     * [
     *   {
     *     "nombre": "Juan",
     *     "apellido": "Pérez",
     *     "correo": "juan@ficct.edu.bo",
     *     "ci": "1234567",
     *     "password": "password123",
     *     "telefono": "70123456",
     *     "sexo": "M",
     *     "direccion": "La Paz"
     *   }
     * ]
     */
    public function importarCSV(Request $request)
    {
        try {
            $request->validate([
                'archivo' => 'required|file|mimes:csv,txt'
            ]);

            $file = $request->file('archivo');
            $stream = fopen($file->getRealPath(), 'r');
            
            $header = fgetcsv($stream); // Primera línea = header
            $registrosCreados = 0;
            $registrosError = [];
            $registrosDuplicados = [];
            $fila = 2; // Contador de filas (comenzamos en 2 porque la 1 es header)

            while (($datos = fgetcsv($stream)) !== false) {
                try {
                    // Mapear datos del CSV
                    $usuarioData = [
                        'nombre' => trim($datos[0] ?? ''),
                        'apellido' => trim($datos[1] ?? ''),
                        'correo' => trim($datos[2] ?? ''),
                        'ci' => trim($datos[3] ?? ''),
                        'password' => trim($datos[4] ?? ''),
                        'telefono' => trim($datos[5] ?? null),
                        'sexo' => trim($datos[6] ?? null),
                        'direccion' => trim($datos[7] ?? null),
                    ];

                    // Validar datos requeridos
                    if (!$usuarioData['nombre'] || !$usuarioData['apellido'] || !$usuarioData['correo'] || !$usuarioData['ci'] || !$usuarioData['password']) {
                        $registrosError[] = [
                            'fila' => $fila,
                            'error' => 'Faltan campos obligatorios (nombre, apellido, correo, ci, password)',
                            'datos' => $usuarioData
                        ];
                        $fila++;
                        continue;
                    }

                    // Validar email
                    if (!filter_var($usuarioData['correo'], FILTER_VALIDATE_EMAIL)) {
                        $registrosError[] = [
                            'fila' => $fila,
                            'error' => 'Correo inválido: ' . $usuarioData['correo'],
                            'datos' => $usuarioData
                        ];
                        $fila++;
                        continue;
                    }

                    // Verificar duplicados
                    $existeCorreo = Usuario::where('correo', $usuarioData['correo'])->exists();
                    $existeCI = Usuario::where('ci', $usuarioData['ci'])->exists();

                    if ($existeCorreo || $existeCI) {
                        $registrosDuplicados[] = [
                            'fila' => $fila,
                            'correo' => $usuarioData['correo'],
                            'ci' => $usuarioData['ci'],
                            'motivo' => $existeCorreo ? 'Correo duplicado' : 'CI duplicado'
                        ];
                        $fila++;
                        continue;
                    }

                    // Crear usuario
                    $usuarioData['password'] = Hash::make($usuarioData['password']);
                    $usuarioData['activo'] = true;
                    Usuario::create($usuarioData);
                    $registrosCreados++;

                } catch (\Exception $e) {
                    $registrosError[] = [
                        'fila' => $fila,
                        'error' => 'Error: ' . $e->getMessage(),
                        'datos' => $usuarioData ?? []
                    ];
                }

                $fila++;
            }

            fclose($stream);

            return response()->json([
                'success' => true,
                'resumen' => [
                    'total_procesados' => $fila - 2,
                    'creados' => $registrosCreados,
                    'errores' => count($registrosError),
                    'duplicados' => count($registrosDuplicados)
                ],
                'detalles_errores' => $registrosError,
                'detalles_duplicados' => $registrosDuplicados,
                'mensaje' => "Se crearon $registrosCreados usuarios. " .
                            (count($registrosError) > 0 ? count($registrosError) . " registros con error. " : "") .
                            (count($registrosDuplicados) > 0 ? count($registrosDuplicados) . " registros duplicados." : "")
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar archivo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU3: Importar usuarios masivamente desde JSON
     * 
     * POST /usuarios/importar-json
     * Body: [
     *   {
     *     "nombre": "Juan",
     *     "apellido": "Pérez",
     *     "correo": "juan@ficct.edu.bo",
     *     "ci": "1234567",
     *     "password": "password123",
     *     "telefono": "70123456",
     *     "sexo": "M",
     *     "direccion": "La Paz"
     *   }
     * ]
     */
    public function importarJSON(Request $request)
    {
        try {
            $request->validate([
                'usuarios' => 'required|array',
                'usuarios.*.nombre' => 'required|string',
                'usuarios.*.apellido' => 'required|string',
                'usuarios.*.correo' => 'required|email',
                'usuarios.*.ci' => 'required|string',
                'usuarios.*.password' => 'required|string|min:6',
            ]);

            $registrosCreados = 0;
            $registrosError = [];
            $registrosDuplicados = [];

            foreach ($request->usuarios as $index => $usuarioData) {
                try {
                    // Validar email
                    if (!filter_var($usuarioData['correo'], FILTER_VALIDATE_EMAIL)) {
                        $registrosError[] = [
                            'indice' => $index,
                            'error' => 'Correo inválido',
                            'correo' => $usuarioData['correo']
                        ];
                        continue;
                    }

                    // Verificar duplicados
                    $existeCorreo = Usuario::where('correo', $usuarioData['correo'])->exists();
                    $existeCI = Usuario::where('ci', $usuarioData['ci'])->exists();

                    if ($existeCorreo || $existeCI) {
                        $registrosDuplicados[] = [
                            'indice' => $index,
                            'correo' => $usuarioData['correo'],
                            'ci' => $usuarioData['ci'],
                            'motivo' => $existeCorreo ? 'Correo duplicado' : 'CI duplicado'
                        ];
                        continue;
                    }

                    // Crear usuario
                    $usuarioData['password'] = Hash::make($usuarioData['password']);
                    $usuarioData['activo'] = true;
                    Usuario::create($usuarioData);
                    $registrosCreados++;

                } catch (\Exception $e) {
                    $registrosError[] = [
                        'indice' => $index,
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'resumen' => [
                    'total_procesados' => count($request->usuarios),
                    'creados' => $registrosCreados,
                    'errores' => count($registrosError),
                    'duplicados' => count($registrosDuplicados)
                ],
                'detalles_errores' => $registrosError,
                'detalles_duplicados' => $registrosDuplicados,
                'mensaje' => "Se crearon $registrosCreados usuarios. " .
                            (count($registrosError) > 0 ? count($registrosError) . " registros con error. " : "") .
                            (count($registrosDuplicados) > 0 ? count($registrosDuplicados) . " registros duplicados." : "")
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar datos: ' . $e->getMessage()
            ], 500);
        }
    }
}