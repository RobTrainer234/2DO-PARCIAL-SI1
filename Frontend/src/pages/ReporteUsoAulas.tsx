import { useState, useEffect } from 'react';

import API from '../services/api';

interface EstatisticasAulas {
    total_aulas: number;
    aulas_activas: number;
    horas_totales_utilizadas: number;
    promedio_horas_por_aula: number;
    aula_mas_utilizada: any;
    aula_menos_utilizada: any;
}

interface DetalleAula {
    id_infraestructura: number;
    nro: string;
    piso: string;
    capacidad: number;
    tipo: string;
    sesiones_totales: number;
    horas_totales: number;
    docentes: number;
    materias: number;
    grupos: number;
    ocupacion: number;
    distribucion_por_dia: Record<string, number>;
    promedio_horas_por_sesion: number;
}

export default function ReporteUsoAulas() {
    const [reporteAulas, setReporteAulas] = useState<DetalleAula[]>([]);
    const [reportePorTipo, setReportePorTipo] = useState<any[]>([]);
    const [reportePorDocente, setReportePorDocente] = useState<any[]>([]);
    const [estadisticas, setEstadisticas] = useState<EstatisticasAulas | null>(null);
    const [tipoReporte, setTipoReporte] = useState('general');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarReportes();
    }, [tipoReporte]);

    const cargarReportes = async () => {
        setLoading(true);
        setError('');
        try {
            if (tipoReporte === 'general') {
                const res = await API.get('/reportes/uso-aulas');
                if (res.data.success) {
                    setReporteAulas(res.data.detalle_aulas);
                    setEstadisticas(res.data.estadisticas);
                }
            } else if (tipoReporte === 'por-tipo') {
                const res = await API.get('/reportes/uso-aulas/por-tipo');
                if (res.data.success) {
                    setReportePorTipo(res.data.reporte);
                }
            } else if (tipoReporte === 'por-docente') {
                const res = await API.get('/reportes/uso-aulas/por-docente');
                if (res.data.success) {
                    setReportePorDocente(res.data.reporte);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar reporte');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
            
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                <h1 style={{ color: '#0066cc', marginBottom: '20px' }}>CU18 - Reporte de Uso de Aulas</h1>

                {error && <div style={{ backgroundColor: '#ffcccc', color: '#cc0000', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>{error}</div>}

                {/* Selector de tipo de reporte */}
                <div style={{ marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Tipo de Reporte:</label>
                    <select
                        value={tipoReporte}
                        onChange={(e) => setTipoReporte(e.target.value)}
                        style={{
                            padding: '8px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            cursor: 'pointer',
                            width: '200px'
                        }}
                    >
                        <option value="general">Reporte General de Aulas</option>
                        <option value="por-tipo">Reporte por Tipo de Aula</option>
                        <option value="por-docente">Reporte por Docente</option>
                    </select>
                </div>

                {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#0066cc' }}>Cargando reporte...</div>}

                {/* Reporte General */}
                {tipoReporte === 'general' && estadisticas && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ backgroundColor: '#0066cc', color: 'white', padding: '15px', borderRadius: '5px', textAlign: 'center' }}>
                                <h3>Total Aulas</h3>
                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{estadisticas.total_aulas}</p>
                            </div>
                            <div style={{ backgroundColor: '#28a745', color: 'white', padding: '15px', borderRadius: '5px', textAlign: 'center' }}>
                                <h3>Aulas Activas</h3>
                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{estadisticas.aulas_activas}</p>
                            </div>
                            <div style={{ backgroundColor: '#ffc107', color: 'white', padding: '15px', borderRadius: '5px', textAlign: 'center' }}>
                                <h3>Horas Totales</h3>
                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{estadisticas.horas_totales_utilizadas}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ backgroundColor: '#17a2b8', color: 'white', padding: '15px', borderRadius: '5px', textAlign: 'center' }}>
                                <h3>Promedio Horas/Aula</h3>
                                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{estadisticas.promedio_horas_por_aula}</p>
                            </div>
                            <div style={{ backgroundColor: '#6c757d', color: 'white', padding: '15px', borderRadius: '5px', textAlign: 'center' }}>
                                <h3>Aula Más Utilizada</h3>
                                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    {estadisticas.aula_mas_utilizada?.nro} ({estadisticas.aula_mas_utilizada?.horas_totales} hrs)
                                </p>
                            </div>
                        </div>

                        <h2 style={{ marginTop: '30px', marginBottom: '15px', color: '#333' }}>Detalle de Aulas</h2>
                        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #0066cc' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Nro. Aula</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Piso</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Capacidad</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Sesiones</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Horas Totales</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Docentes</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Materias</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reporteAulas.map((aula, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #ddd', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{aula.nro}</td>
                                            <td style={{ padding: '12px' }}>{aula.piso}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{aula.capacidad}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: aula.sesiones_totales > 0 ? '#28a745' : '#999' }}>
                                                {aula.sesiones_totales}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{aula.horas_totales}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{aula.docentes}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{aula.materias}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Reporte por Tipo */}
                {tipoReporte === 'por-tipo' && (
                    <>
                        <h2 style={{ marginBottom: '15px', color: '#333' }}>Distribución por Tipo de Aula</h2>
                        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #0066cc' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Tipo</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Cantidad de Aulas</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Total Sesiones</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Capacidad Promedio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportePorTipo.map((tipo, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #ddd', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                            <td style={{ padding: '12px' }}>{tipo.tipo}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{tipo.cantidad_aulas}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{tipo.total_sesiones}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{tipo.capacidad_promedio.toFixed(0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Reporte por Docente */}
                {tipoReporte === 'por-docente' && (
                    <>
                        <h2 style={{ marginBottom: '15px', color: '#333' }}>Aulas Utilizadas por Docente</h2>
                        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #0066cc' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Docente</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Aulas Utilizadas</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Total Sesiones</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Números de Aula</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportePorDocente.map((docente, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #ddd', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                            <td style={{ padding: '12px' }}>{docente.docente}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{docente.aulas_utilizadas}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{docente.total_sesiones}</td>
                                            <td style={{ padding: '12px' }}>{docente.numeros_aula || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
