import React, { useState } from 'react';
import API from '../services/api';

interface ResultadosImportacion {
  creadas: number;
  actualizadas: number;
  errores: number;
  detalles_errores: Array<{ fila: number; razon: string }>;
}

interface RespuestaImportacion {
  mensaje: string;
  resultados: ResultadosImportacion;
}

export default function ImportarMaterias() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<RespuestaImportacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [descargandoPlantilla, setDescargandoPlantilla] = useState(false);

  const handleDescargarPlantilla = async () => {
    setDescargandoPlantilla(true);
    try {
      const token = localStorage.getItem('api_token');
      const response = await API.get('/materias/plantilla/descargar', {
        responseType: 'blob',
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });

      // Crear un blob y descargar el archivo
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Plantilla_Importar_Materias.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al descargar la plantilla');
      console.error('Error:', err);
    } finally {
      setDescargandoPlantilla(false);
    }
  };

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const archivo = e.target.files[0];
      // Validar que sea Excel
      const esExcel = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'].includes(archivo.type);
      
      if (!esExcel) {
        setError('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV');
        setArchivo(null);
        return;
      }

      setArchivo(archivo);
      setError(null);
      setResultado(null);
    }
  };

  const handleImportar = async () => {
    if (!archivo) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setCargando(true);
    setError(null);
    setResultado(null);

    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const token = localStorage.getItem('api_token');
      const response = await API.post('/materias/importar-excel', formData, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'multipart/form-data'
        }
      });

      setResultado(response.data);
      setArchivo(null);
      // Limpiar input
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) input.value = '';
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.mensaje || 'Error al importar archivo');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '20px auto', 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>Importar Materias desde Excel</h2>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px', border: '1px solid #b3d9ff' }}>
        <p style={{ color: '#004085', fontSize: '14px', marginBottom: '10px' }}>
          <strong>💡 Consejo:</strong> Si no estás seguro de la estructura del archivo, descarga la plantilla que proporciona el sistema. 
          La plantilla ya incluye todas las columnas necesarias correctamente configuradas.
        </p>
        <button
          onClick={handleDescargarPlantilla}
          disabled={descargandoPlantilla}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: descargandoPlantilla ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: descargandoPlantilla ? 0.6 : 1
          }}
        >
          {descargandoPlantilla ? 'Descargando...' : '📥 Descargar Plantilla Excel'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#666', fontSize: '14px' }}>
          <strong>Columnas requeridas:</strong> sigla, nombre
        </p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          <strong>Columnas opcionales:</strong> semestre (1-10, dejar en blanco para materias electivas)
        </p>
        <p style={{ color: '#999', fontSize: '13px', marginTop: '10px' }}>
          <strong>Ejemplos:</strong>
          <br/>• MAT101 | CALCULO I | 1
          <br/>• ELC101 | CRIPTOGRAFIA Y SEGURIDAD | (sin semestre)
        </p>
      </div>

      <div style={{ 
        padding: '20px', 
        border: '2px dashed #ccc', 
        borderRadius: '4px',
        backgroundColor: '#fafafa',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleArchivoSeleccionado}
          disabled={cargando}
          style={{ marginBottom: '10px' }}
        />
        {archivo && (
          <p style={{ color: '#27ae60', marginTop: '10px' }}>
            ✓ Archivo seleccionado: {archivo.name}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleImportar}
          disabled={!archivo || cargando}
          style={{
            padding: '10px 20px',
            backgroundColor: archivo && !cargando ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: archivo && !cargando ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          {cargando ? 'Importando...' : 'Importar'}
        </button>
        {archivo && (
          <button
            onClick={() => {
              setArchivo(null);
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (input) input.value = '';
            }}
            disabled={cargando}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {resultado && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#d4edda', 
          color: '#155724',
          borderRadius: '4px',
          border: '1px solid #c3e6cb',
          marginBottom: '20px'
        }}>
          <h3>Resultados de la Importación</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#c3e6cb', borderRadius: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
                {resultado.resultados.creadas}
              </div>
              <div style={{ fontSize: '14px' }}>Materias creadas</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>
                {resultado.resultados.actualizadas}
              </div>
              <div style={{ fontSize: '14px' }}>Materias actualizadas</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
                {resultado.resultados.errores}
              </div>
              <div style={{ fontSize: '14px' }}>Errores</div>
            </div>
          </div>

          {resultado.resultados.detalles_errores.length > 0 && (
            <div>
              <button
                onClick={() => setMostrarDetalles(!mostrarDetalles)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#155724',
                  border: '1px solid #155724',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '10px',
                  fontWeight: 'bold'
                }}
              >
                {mostrarDetalles ? 'Ocultar detalles' : 'Mostrar detalles de errores'}
              </button>

              {mostrarDetalles && resultado.resultados.detalles_errores.length > 0 && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                  <h4>Errores ({resultado.resultados.detalles_errores.length}):</h4>
                  <ul style={{ fontSize: '12px' }}>
                    {resultado.resultados.detalles_errores.map((error, idx) => (
                      <li key={idx}>
                        <strong>Fila {error.fila}:</strong> {error.razon}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
