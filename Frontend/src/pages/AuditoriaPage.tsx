import { useState, useEffect } from 'react';

import API from '../services/api';

interface RegistroAuditoria {
    id: number;
    usuario_id: number;
    accion: string;
    entidad: string;
    entidad_id: number;
    ip: string;
    creado_en: string;
}

export default function AuditoriaPage() {
    const [bitacora, setBitacora] = useState<RegistroAuditoria[]>([]);
    const [estadisticas, setEstadisticas] = useState<any>(null);
    const [paginacion, setPaginacion] = useState({
        total: 0,
        pagina: 1,
        por_pagina: 20,
        total_paginas: 1
    });
    const [filtros, setFiltros] = useState({
        usuario_id: '',
        entidad: '',
        accion: '',
        fecha_desde: '',
        fecha_hasta: ''
    });
    const [vista, setVista] = useState('bitacora'); // bitacora o estadisticas
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarBitacora();
    }, []);

    const cargarBitacora = async (pagina = 1) => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({
                pagina: pagina.toString(),
                por_pagina: '20'
            });

            if (filtros.usuario_id) params.append('usuario_id', filtros.usuario_id);
            if (filtros.entidad) params.append('entidad', filtros.entidad);
            if (filtros.accion) params.append('accion', filtros.accion);
            if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
            if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

            const res = await API.get(`/auditoria/bitacora?${params}`);
            if (res.data.success) {
                setBitacora(res.data.data);
                setPaginacion(res.data.paginacion);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar bitácora');
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticas = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await API.get('/auditoria/estadisticas');
            if (res.data.success) {
                setEstadisticas(res.data.estadisticas);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (e: any) => {
        const { name, value } = e.target;
        setFiltros({ ...filtros, [name]: value });
    };

    const aplicarFiltros = () => {
        cargarBitacora(1);
    };

    const limpiarFiltros = () => {
        setFiltros({
            usuario_id: '',
            entidad: '',
            accion: '',
            fecha_desde: '',
            fecha_hasta: ''
        });
        cargarBitacora(1);
    };


    const getColorAccion = (accion: string) => {
        switch (accion.toLowerCase()) {
            case 'crear': return '#28a745';
            case 'actualizar': return '#ffc107';
            case 'eliminar': return '#dc3545';
            case 'ver': return '#17a2b8';
            default: return '#6c757d';
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                <h1 style={{ color: '#0066cc', marginBottom: '20px' }}>CU21 - Auditoría de Acciones (Bitácora)</h1>

                {error && <div style={{ backgroundColor: '#ffcccc', color: '#cc0000', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>{error}</div>}

                {/* Selector de vista */}
                <div style={{ marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
                    <button
                        onClick={() => { setVista('bitacora'); cargarBitacora(1); }}
                        style={{
                            marginRight: '10px',
                            padding: '10px 20px',
                            backgroundColor: vista === 'bitacora' ? '#0066cc' : '#ddd',
                            color: vista === 'bitacora' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Bitácora
                    </button>
                    <button
                        onClick={() => { setVista('estadisticas'); cargarEstadisticas(); }}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: vista === 'estadisticas' ? '#0066cc' : '#ddd',
                            color: vista === 'estadisticas' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Estadísticas
                    </button>
                </div>

                {vista === 'bitacora' && (
                    <>
                        {/* Filtros */}
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                            <h3 style={{ marginBottom: '15px', color: '#333' }}>Filtros</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Usuario ID:</label>
                                    <input
                                        type="number"
                                        name="usuario_id"
                                        value={filtros.usuario_id}
                                        onChange={handleFiltroChange}
                                        placeholder="ID usuario"
                                        style={{
                                            padding: '8px',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Entidad:</label>
                                    <input
                                        type="text"
                                        name="entidad"
                                        value={filtros.entidad}
                                        onChange={handleFiltroChange}
                                        placeholder="Ej: Usuario, Docente"
                                        style={{
                                            padding: '8px',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Acción:</label>
                                    <input
                                        type="text"
                                        name="accion"
                                        value={filtros.accion}
                                        onChange={handleFiltroChange}
                                        placeholder="Crear, Actualizar, Eliminar"
                                        style={{
                                            padding: '8px',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Desde:</label>
                                    <input
                                        type="date"
                                        name="fecha_desde"
                                        value={filtros.fecha_desde}
                                        onChange={handleFiltroChange}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Hasta:</label>
                                    <input
                                        type="date"
                                        name="fecha_hasta"
                                        value={filtros.fecha_hasta}
                                        onChange={handleFiltroChange}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={aplicarFiltros}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#0066cc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Aplicar Filtros
                                </button>
                                <button
                                    onClick={limpiarFiltros}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Limpiar Filtros
                                </button>
                            </div>
                        </div>

                        {/* Tabla de bitácora */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#0066cc' }}>Cargando bitácora...</div>
                        ) : (
                            <>
                                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #0066cc' }}>
                                                <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
                                                <th style={{ padding: '12px', textAlign: 'left' }}>Usuario</th>
                                                <th style={{ padding: '12px', textAlign: 'center' }}>Acción</th>
                                                <th style={{ padding: '12px', textAlign: 'left' }}>Entidad</th>
                                                <th style={{ padding: '12px', textAlign: 'center' }}>ID</th>
                                                <th style={{ padding: '12px', textAlign: 'left' }}>IP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bitacora.map((registro, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #ddd', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                                    <td style={{ padding: '12px' }}>{new Date(registro.creado_en).toLocaleString('es-BO')}</td>
                                                    <td style={{ padding: '12px' }}>UID: {registro.usuario_id}</td>
                                                    <td style={{
                                                        padding: '12px',
                                                        textAlign: 'center'
                                                    }}>
                                                        <span style={{
                                                            backgroundColor: getColorAccion(registro.accion),
                                                            color: 'white',
                                                            padding: '5px 10px',
                                                            borderRadius: '3px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {registro.accion}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>{registro.entidad}</td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>{registro.entidad_id}</td>
                                                    <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>{registro.ip}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación */}
                                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px', textAlign: 'center' }}>
                                    <p style={{ marginBottom: '10px', color: '#666' }}>
                                        Mostrando {bitacora.length} de {paginacion.total} registros | Página {paginacion.pagina} de {paginacion.total_paginas}
                                    </p>
                                    <div>
                                        <button
                                            onClick={() => cargarBitacora(paginacion.pagina - 1)}
                                            disabled={paginacion.pagina === 1}
                                            style={{
                                                marginRight: '5px',
                                                padding: '8px 15px',
                                                backgroundColor: paginacion.pagina === 1 ? '#ccc' : '#0066cc',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: paginacion.pagina === 1 ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => cargarBitacora(paginacion.pagina + 1)}
                                            disabled={paginacion.pagina === paginacion.total_paginas}
                                            style={{
                                                padding: '8px 15px',
                                                backgroundColor: paginacion.pagina === paginacion.total_paginas ? '#ccc' : '#0066cc',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: paginacion.pagina === paginacion.total_paginas ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {vista === 'estadisticas' && estadisticas && (
                    <>
                        <h2 style={{ marginBottom: '20px', color: '#333' }}>Estadísticas de Auditoría</h2>

                        {/* Tarjetas de estadísticas */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ backgroundColor: '#0066cc', color: 'white', padding: '15px', borderRadius: '5px', textAlign: 'center' }}>
                                <h4>Total de Registros</h4>
                                <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{estadisticas.total_registros}</p>
                            </div>
                            <div style={{ backgroundColor: '#28a745', color: 'white', padding: '15px', borderRadius: '5px', textAlign: 'center' }}>
                                <h4>Usuarios Activos</h4>
                                <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{estadisticas.total_usuarios}</p>
                            </div>
                        </div>

                        {/* Acciones por tipo */}
                        <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#333' }}>Registros por Acción</h3>
                        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                            {estadisticas.registros_por_accion && estadisticas.registros_por_accion.map((acc: any, idx: number) => (
                                <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', color: getColorAccion(acc.accion) }}>{acc.accion}</span>
                                    <span style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold' }}>{acc.total}</span>
                                </div>
                            ))}
                        </div>

                        {/* Entidades */}
                        <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#333' }}>Registros por Entidad</h3>
                        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {estadisticas.registros_por_entidad && estadisticas.registros_por_entidad.map((ent: any, idx: number) => (
                                <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{ent.entidad}</span>
                                    <span style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold' }}>{ent.total}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
