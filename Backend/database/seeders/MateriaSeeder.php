<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MateriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $materias = [
            ['MAT101', 'CALCULO 1', 1],
            ['INF119', 'ESTRUCTURAS DISCRETAS', 1],
            ['INF110', 'INTRODUCCION A LA INFORMATICA', 1],
            ['FIS100', 'FISICA 1', 1],
            ['LIN100', 'INGLES TECNICO 1', 1],
            ['MAT102', 'CALCULO 2', 2],
            ['MAT103', 'ALGEBRA LINEAL', 2],
            ['INF120', 'PROGRAMACION 1', 2],
            ['FIS102', 'FISICA 2', 2],
            ['LIN101', 'INGLES TECNICO 2', 2],
            ['MAT207', 'ECUACIONES DIFERENCIALES', 3],
            ['INF210', 'PROGRAMACION 2', 3],
            ['INF211', 'ARQUITECTURA DE COMPUTADORAS', 3],
            ['FIS200', 'FISICA3', 3],
            ['ADM100', 'ADMINISTRACION', 3],
            ['MAT202', 'PROBABILIDADES Y ESTADISTICA I', 4],
            ['MAT205', 'METODOS NUMERICOS', 4],
            ['INF220', 'ESTRUCTURAS DE DATOS', 4],
            ['INF221', 'PROGRAMACION ENSAMBLADOR', 4],
            ['ADM200', 'CONTABILIDAD', 4],
            ['MAT302', 'PROBABILIDADES Y ESTADISTICA II', 5],
            ['INF318', 'PROGRAMACION LOGICA Y FUNCIONAL', 5],
            ['INF310', 'ESTRUCTURA DE DATOS II', 5],
            ['INF312', 'BASE DE DATOS I', 5],
            ['INF319', 'LENGUAJES FORMALES', 5],
            ['MAT329', 'INVESTIGACION OPERATIVA I', 6],
            ['INF342', 'SISTEMAS DE INFORMACION I', 6],
            ['INF323', 'SISTEMAS OPERATIVOS I', 6],
            ['INF322', 'BASE DE DATOS II', 6],
            ['INF329', 'COMPILADORES', 6],
            ['MAT419', 'INVESTIGACION OPERATIVA II', 7],
            ['INF418', 'INTELIGENCIA ARTIFICIAL', 7],
            ['INF413', 'SISTEMAS OPERATIVOS II', 7],
            ['INF433', 'REDES I', 7],
            ['INF412', 'SISTEMAS DE INFORMACION II', 7],
            ['ECO499', 'PREPARACION Y EVALUACION DE PROYECTOS', 8],
            ['INF428', 'SISTEMAS EXPERTOS', 8],
            ['INF442', 'SISTEMAS DE INFORMACION GEOGRAFICA', 8],
            ['INF423', 'REDES II', 8],
            ['INF422', 'INGENIERIA DE SOFTWARE I', 8],
            ['INF511', 'TALLER DE GRADO I', 9],
            ['INF512', 'INGENIERIA DE SOFTWARE II', 9],
            ['INF513', 'TECNOLOGIA WEB', 9],
            ['INF552', 'ARQUITECTURA DEL SOFTWARE', 9],
            ['GRL001', 'MODALIDAD DE TITULACION LICENCIATURA', 10],
            ['ELC101', 'MODELACION Y SIMULACION DE SISTEMAS', null],
            ['ELC102', 'PROGRAMACION GRAFICA', null],
            ['ELC103', 'TOPICOS AVANZADOS DE PROGRAMACION', null],
            ['ELC104', 'PROGRAMACION DE APLICACIONES DE TIEMPO REAL', null],
            ['ELC105', 'SISTEMAS DISTRIBUIDOS', null],
            ['ELC106', 'INTERACCION HOMBRE-COMPUTADOR', null],
            ['ELC107', 'CRIPTOGRAFIA Y SEGURIDAD', null],
            ['ELC108', 'CONTROL Y AUTOMATIZACION', null],
        ];

        foreach ($materias as $materia) {
            DB::table('Materia')->updateOrInsert(
                ['sigla' => $materia[0]],
                [
                    'sigla' => $materia[0],
                    'nombre' => $materia[1],
                    'semestre' => $materia[2],
                    'codigo' => substr($materia[0], 0, 3) . '000',
                    'nivel' => $materia[2] ?? 0,
                    'carga_horaria' => 4,
                ]
            );
        }

        echo "✅ {" . count($materias) . "} materias insertadas/actualizadas\n";
    }
}
