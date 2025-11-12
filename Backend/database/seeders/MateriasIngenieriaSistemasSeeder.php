<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Materia;

class MateriasIngenieriaSistemasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $materias = [
            // SEMESTRE 1
            ['sigla' => 'MAT101', 'nombre' => 'Cálculo 1', 'semestre' => 1, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 5],
            ['sigla' => 'INF119', 'nombre' => 'Estructuras Discretas', 'semestre' => 1, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF110', 'nombre' => 'Introducción a la Informática', 'semestre' => 1, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'FIS100', 'nombre' => 'Física 1', 'semestre' => 1, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'LIN100', 'nombre' => 'Inglés Técnico 1', 'semestre' => 1, 'horas_teoricas' => 3, 'horas_practicas' => 0, 'creditos' => 2],

            // SEMESTRE 2
            ['sigla' => 'MAT102', 'nombre' => 'Cálculo 2', 'semestre' => 2, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 5],
            ['sigla' => 'MAT103', 'nombre' => 'Álgebra Lineal', 'semestre' => 2, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF120', 'nombre' => 'Programación 1', 'semestre' => 2, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'FIS102', 'nombre' => 'Física 2', 'semestre' => 2, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'LIN101', 'nombre' => 'Inglés Técnico 2', 'semestre' => 2, 'horas_teoricas' => 3, 'horas_practicas' => 0, 'creditos' => 2],

            // SEMESTRE 3
            ['sigla' => 'MAT207', 'nombre' => 'Ecuaciones Diferenciales', 'semestre' => 3, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF210', 'nombre' => 'Programación 2', 'semestre' => 3, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'INF211', 'nombre' => 'Arquitectura de Computadoras', 'semestre' => 3, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'FIS200', 'nombre' => 'Física 3', 'semestre' => 3, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'ADM100', 'nombre' => 'Administración', 'semestre' => 3, 'horas_teoricas' => 3, 'horas_practicas' => 0, 'creditos' => 3],

            // SEMESTRE 4
            ['sigla' => 'MAT202', 'nombre' => 'Probabilidades y Estadística I', 'semestre' => 4, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'MAT205', 'nombre' => 'Métodos Numéricos', 'semestre' => 4, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF220', 'nombre' => 'Estructuras de Datos', 'semestre' => 4, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'INF221', 'nombre' => 'Programación Ensamblador', 'semestre' => 4, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'ADM200', 'nombre' => 'Contabilidad', 'semestre' => 4, 'horas_teoricas' => 3, 'horas_practicas' => 0, 'creditos' => 3],

            // SEMESTRE 5
            ['sigla' => 'MAT302', 'nombre' => 'Probabilidades y Estadística II', 'semestre' => 5, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF318', 'nombre' => 'Programación Lógica y Funcional', 'semestre' => 5, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'INF310', 'nombre' => 'Estructura de Datos II', 'semestre' => 5, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'INF312', 'nombre' => 'Base de Datos I', 'semestre' => 5, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF319', 'nombre' => 'Lenguajes Formales', 'semestre' => 5, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],

            // SEMESTRE 6
            ['sigla' => 'MAT329', 'nombre' => 'Investigación Operativa I', 'semestre' => 6, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF342', 'nombre' => 'Sistemas de Información I', 'semestre' => 6, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF323', 'nombre' => 'Sistemas Operativos I', 'semestre' => 6, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'INF322', 'nombre' => 'Base de Datos II', 'semestre' => 6, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'INF329', 'nombre' => 'Compiladores', 'semestre' => 6, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],

            // SEMESTRE 7
            ['sigla' => 'MAT419', 'nombre' => 'Investigación Operativa II', 'semestre' => 7, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF418', 'nombre' => 'Inteligencia Artificial', 'semestre' => 7, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF413', 'nombre' => 'Sistemas Operativos II', 'semestre' => 7, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'INF433', 'nombre' => 'Redes I', 'semestre' => 7, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF412', 'nombre' => 'Sistemas de Información II', 'semestre' => 7, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],

            // SEMESTRE 8
            ['sigla' => 'ECO499', 'nombre' => 'Preparación y Evaluación de Proyectos', 'semestre' => 8, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF428', 'nombre' => 'Sistemas Expertos', 'semestre' => 8, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF442', 'nombre' => 'Sistemas de Información Geográfica', 'semestre' => 8, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'INF423', 'nombre' => 'Redes II', 'semestre' => 8, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'INF422', 'nombre' => 'Ingeniería de Software I', 'semestre' => 8, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],

            // SEMESTRE 9
            ['sigla' => 'INF511', 'nombre' => 'Taller de Grado I', 'semestre' => 9, 'horas_teoricas' => 2, 'horas_practicas' => 4, 'creditos' => 4],
            ['sigla' => 'INF512', 'nombre' => 'Ingeniería de Software II', 'semestre' => 9, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'INF513', 'nombre' => 'Tecnología Web', 'semestre' => 9, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'INF552', 'nombre' => 'Arquitectura del Software', 'semestre' => 9, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],

            // SEMESTRE 10
            ['sigla' => 'GRL001', 'nombre' => 'Modalidad de Titulación Licenciatura', 'semestre' => 10, 'horas_teoricas' => 0, 'horas_practicas' => 6, 'creditos' => 6],

            // ELECTIVAS
            ['sigla' => 'ELC101', 'nombre' => 'Modelación y Simulación de Sistemas', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'ELC102', 'nombre' => 'Programación Gráfica', 'semestre' => null, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'ELC103', 'nombre' => 'Tópicos Avanzados de Programación', 'semestre' => null, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'ELC104', 'nombre' => 'Programación de Aplicaciones de Tiempo Real', 'semestre' => null, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 4],
            ['sigla' => 'ELC105', 'nombre' => 'Sistemas Distribuidos', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'ELC106', 'nombre' => 'Interacción Hombre-Computador', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 1, 'creditos' => 3],
            ['sigla' => 'ELC107', 'nombre' => 'Criptografía y Seguridad', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
            ['sigla' => 'ELC108', 'nombre' => 'Control y Automatización', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 4],
        ];

        foreach ($materias as $materia) {
            Materia::firstOrCreate(
                ['sigla' => $materia['sigla']],
                $materia
            );
        }
    }
}
