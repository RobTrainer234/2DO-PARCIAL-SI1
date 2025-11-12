<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Materia;

class CargarMateriasSeeder extends Seeder
{
    public function run(): void
    {
        $materias = [
            // Semestre 1
            ['sigla' => 'MAT101', 'nombre' => 'Cálculo I', 'semestre' => 1, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'ALG101', 'nombre' => 'Álgebra Lineal', 'semestre' => 1, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'PRG101', 'nombre' => 'Programación I', 'semestre' => 1, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'FIS101', 'nombre' => 'Física I', 'semestre' => 1, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'LIN100', 'nombre' => 'Lenguaje de Programación', 'semestre' => 1, 'horas_teoricas' => 2, 'horas_practicas' => 3, 'creditos' => 2],
            
            // Semestre 2
            ['sigla' => 'MAT102', 'nombre' => 'Cálculo II', 'semestre' => 2, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'ALG102', 'nombre' => 'Estructuras Discretas', 'semestre' => 2, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'PRG102', 'nombre' => 'Programación II', 'semestre' => 2, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'FIS102', 'nombre' => 'Física II', 'semestre' => 2, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'INT101', 'nombre' => 'Introducción a BD', 'semestre' => 2, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 2],
            
            // Semestre 3
            ['sigla' => 'MAT103', 'nombre' => 'Cálculo III', 'semestre' => 3, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'ALG103', 'nombre' => 'Estadística I', 'semestre' => 3, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'PRG103', 'nombre' => 'Programación III', 'semestre' => 3, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'ARQ101', 'nombre' => 'Arquitectura de Computadoras', 'semestre' => 3, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'SOF101', 'nombre' => 'Ingeniería de Software I', 'semestre' => 3, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            
            // Semestre 4
            ['sigla' => 'BD101', 'nombre' => 'Bases de Datos I', 'semestre' => 4, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'SIS101', 'nombre' => 'Sistemas Operativos', 'semestre' => 4, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'RED101', 'nombre' => 'Redes de Computadoras I', 'semestre' => 4, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'SOF102', 'nombre' => 'Ingeniería de Software II', 'semestre' => 4, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'EMP101', 'nombre' => 'Empresarialidad', 'semestre' => 4, 'horas_teoricas' => 2, 'horas_practicas' => 1, 'creditos' => 2],
            
            // Semestre 5
            ['sigla' => 'BD102', 'nombre' => 'Bases de Datos II', 'semestre' => 5, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'RED102', 'nombre' => 'Redes de Computadoras II', 'semestre' => 5, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'SEG101', 'nombre' => 'Seguridad Informática', 'semestre' => 5, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'WEB101', 'nombre' => 'Desarrollo Web I', 'semestre' => 5, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'EMP102', 'nombre' => 'Administración de Proyectos', 'semestre' => 5, 'horas_teoricas' => 2, 'horas_practicas' => 2, 'creditos' => 2],
            
            // Semestre 6
            ['sigla' => 'IA101', 'nombre' => 'Inteligencia Artificial', 'semestre' => 6, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'WEB102', 'nombre' => 'Desarrollo Web II', 'semestre' => 6, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'MOV101', 'nombre' => 'Desarrollo Móvil', 'semestre' => 6, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'MIN101', 'nombre' => 'Minería de Datos', 'semestre' => 6, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'CAL101', 'nombre' => 'Calidad de Software', 'semestre' => 6, 'horas_teoricas' => 2, 'horas_practicas' => 2, 'creditos' => 2],
            
            // Semestre 7
            ['sigla' => 'SIS201', 'nombre' => 'Sistemas Distribuidos', 'semestre' => 7, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'NUB101', 'nombre' => 'Computación en Nube', 'semestre' => 7, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'BIG101', 'nombre' => 'Big Data', 'semestre' => 7, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'TES101', 'nombre' => 'Testing Avanzado', 'semestre' => 7, 'horas_teoricas' => 2, 'horas_practicas' => 2, 'creditos' => 2],
            ['sigla' => 'GES101', 'nombre' => 'Gestión TI', 'semestre' => 7, 'horas_teoricas' => 2, 'horas_practicas' => 1, 'creditos' => 2],
            
            // Semestre 8
            ['sigla' => 'DEV201', 'nombre' => 'DevOps', 'semestre' => 8, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'API101', 'nombre' => 'Diseño de APIs', 'semestre' => 8, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'CIP101', 'nombre' => 'Ciberseguridad Práctica', 'semestre' => 8, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'MAN101', 'nombre' => 'Machine Learning', 'semestre' => 8, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'PRY101', 'nombre' => 'Proyecto I', 'semestre' => 8, 'horas_teoricas' => 2, 'horas_practicas' => 4, 'creditos' => 3],
            
            // Semestre 9
            ['sigla' => 'DIS101', 'nombre' => 'Diseño de Sistemas', 'semestre' => 9, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'GRA101', 'nombre' => 'Gráficos por Computadora', 'semestre' => 9, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'OPT101', 'nombre' => 'Optativa I', 'semestre' => 9, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'PRY102', 'nombre' => 'Proyecto II', 'semestre' => 9, 'horas_teoricas' => 2, 'horas_practicas' => 4, 'creditos' => 3],
            
            // Semestre 10
            ['sigla' => 'PRY103', 'nombre' => 'Proyecto de Grado', 'semestre' => 10, 'horas_teoricas' => 2, 'horas_practicas' => 6, 'creditos' => 4],
            
            // Electivas
            ['sigla' => 'ELE101', 'nombre' => 'Programación Funcional', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'ELE102', 'nombre' => 'IoT y Embebidos', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'ELE103', 'nombre' => 'Realidad Virtual', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'ELE104', 'nombre' => 'Blockchain', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'ELE105', 'nombre' => 'Gestión de Contenido', 'semestre' => null, 'horas_teoricas' => 2, 'horas_practicas' => 2, 'creditos' => 2],
            ['sigla' => 'ELE106', 'nombre' => 'Procesamiento de Imágenes', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 3, 'creditos' => 3],
            ['sigla' => 'ELE107', 'nombre' => 'Ingeniería Reversa', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
            ['sigla' => 'ELE108', 'nombre' => 'Análisis Forense Digital', 'semestre' => null, 'horas_teoricas' => 3, 'horas_practicas' => 2, 'creditos' => 3],
        ];

        foreach ($materias as $materia) {
            Materia::updateOrCreate(
                ['sigla' => $materia['sigla']],
                $materia
            );
        }
        
        echo "✅ " . count($materias) . " materias cargadas exitosamente!\n";
    }
}
