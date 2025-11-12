import { useState } from 'react';

import API from '../services/api';

export default function ExportarReportes() {
    const [tipoReporte, setTipoReporte] = useState('asistencia');
    const [tipoExportacion, setTipoExportacion] = useState('pdf');
    const [formData, setFormData] = useState({
        tipo: 'asignacion',
        id_asignacion: '',
        cod_docente: '',
        id_gestion: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleExportar = async () => {
        setError('');
        setSuccess('');

        if (tipoReporte === 'asistencia' && !formData.tipo) {
            setError('Selecciona tipo de reporte');
            return;
        }

        setLoading(true);

        try {
            let endpoint = '';
            let payload = {};

            if (tipoReporte === 'asistencia' && tipoExportacion === 'pdf') {
                endpoint = '/exportar/asistencia/pdf';
                payload = { tipo: formData.tipo };

                if (formData.tipo === 'asignacion' && !formData.id_asignacion) {
                    setError('Especifica ID de asignación');
                    setLoading(false);
                    return;
                }
                if (formData.tipo === 'docente' && !formData.cod_docente) {
                    setError('Especifica cód. de docente');
                    setLoading(false);
                    return;
                }
                if (formData.tipo === 'gestion' && !formData.id_gestion) {
                    setError('Especifica ID de gestión');
                    setLoading(false);
                    return;
                }

                if (formData.tipo === 'asignacion') payload = { ...payload, id_asignacion: formData.id_asignacion };
                if (formData.tipo === 'docente') payload = { ...payload, cod_docente: formData.cod_docente };
                if (formData.tipo === 'gestion') payload = { ...payload, id_gestion: formData.id_gestion };
            } else if (tipoReporte === 'asistencia' && tipoExportacion === 'excel') {
                endpoint = '/exportar/asistencia/excel';
                payload = { tipo: formData.tipo };

                if (formData.tipo === 'asignacion') payload = { ...payload, id_asignacion: formData.id_asignacion };
                if (formData.tipo === 'docente') payload = { ...payload, cod_docente: formData.cod_docente };
                if (formData.tipo === 'gestion') payload = { ...payload, id_gestion: formData.id_gestion };
            } else if (tipoReporte === 'carga' && tipoExportacion === 'pdf') {
                endpoint = '/exportar/carga-horaria/pdf';
                payload = { tipo: 'docente' };
            } else if (tipoReporte === 'carga' && tipoExportacion === 'excel') {
                endpoint = '/exportar/carga-horaria/excel';
                payload = { tipo: 'docente' };
            }

            const res = await API.post(endpoint, payload);
            if (res.data.success) {
                setSuccess(`${res.data.data.tipo} exportado: ${res.data.data.filename} (${res.data.data.rows} registros)`);
                setFormData({ tipo: 'asignacion', id_asignacion: '', cod_docente: '', id_gestion: '' });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al exportar');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                <h1 style={{ color: '#0066cc', marginBottom: '20px' }}>CU19 - Exportar Reportes</h1>

                {error && <div style={{ backgroundColor: '#ffcccc', color: '#cc0000', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>{error}</div>}
                {success && <div style={{ backgroundColor: '#ccffcc', color: '#00aa00', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>{success}</div>}

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Tipo de Reporte:</label>
                        <select
                            value={tipoReporte}
                            onChange={(e) => setTipoReporte(e.target.value)}
                            style={{
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                width: '300px',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="asistencia">Reporte de Asistencia</option>
                            <option value="carga">Reporte de Carga Horaria</option>
                        </select>
                    </div>

                    {tipoReporte === 'asistencia' && (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Subtipo:</label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleInputChange}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '5px',
                                        border: '1px solid #ccc',
                                        width: '300px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="asignacion">Por Asignación</option>
                                    <option value="docente">Por Docente</option>
                                    <option value="gestion">Por Gestión</option>
                                </select>
                            </div>

                            {formData.tipo === 'asignacion' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>ID Asignación:</label>
                                    <input
                                        type="number"
                                        name="id_asignacion"
                                        value={formData.id_asignacion}
                                        onChange={handleInputChange}
                                        placeholder="ID de la asignación"
                                        style={{
                                            padding: '10px',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc',
                                            width: '300px'
                                        }}
                                    />
                                </div>
                            )}

                            {formData.tipo === 'docente' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Código Docente:</label>
                                    <input
                                        type="text"
                                        name="cod_docente"
                                        value={formData.cod_docente}
                                        onChange={handleInputChange}
                                        placeholder="Código del docente"
                                        style={{
                                            padding: '10px',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc',
                                            width: '300px'
                                        }}
                                    />
                                </div>
                            )}

                            {formData.tipo === 'gestion' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>ID Gestión:</label>
                                    <input
                                        type="number"
                                        name="id_gestion"
                                        value={formData.id_gestion}
                                        onChange={handleInputChange}
                                        placeholder="ID de la gestión"
                                        style={{
                                            padding: '10px',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc',
                                            width: '300px'
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Formato de Exportación:</label>
                        <select
                            value={tipoExportacion}
                            onChange={(e) => setTipoExportacion(e.target.value)}
                            style={{
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                width: '300px',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                        </select>
                    </div>

                    <button
                        onClick={handleExportar}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: loading ? '#ccc' : '#0066cc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? 'Exportando...' : 'Exportar Reporte'}
                    </button>
                </div>
            </div>
        </div>
    );
}
