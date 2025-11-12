import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'

// === DASHBOARD ===
import DashboardIndicadores from './pages/DashboardIndicadores'

// === GESTIÓN DE USUARIOS ===
import Users from './pages/Users'
import Roles from './pages/Roles'
import Permisos from './pages/Permisos'

// === GESTIÓN ACADÉMICA ===
import Docentes from './pages/Docentes'
import Materias from './pages/Materias'
import Grupos from './pages/Grupos'
import Aulas from './pages/Aulas'
import Horarios from './pages/Horarios'

// === DOCENCIA ===
import Asignaciones from './pages/Asignaciones'
import QRScan from './pages/QRScan'
import Asistencias from './pages/Asistencias'
import ValidacionAsistencia from './pages/ValidacionAsistencia'
import ConsultaHorario from './pages/ConsultaHorario'

// === REPORTES ===
import ReporteAsistencia from './pages/ReporteAsistencia'
import ReporteCargaHoraria from './pages/ReporteCargaHoraria'
import ReporteUsoAulas from './pages/ReporteUsoAulas'
import ExportarReportes from './pages/ExportarReportes'

// === ADMINISTRACIÓN ===
import AuditoriaPage from './pages/AuditoriaPage'
import Gestiones from './pages/Gestiones'

import './App.css'

// ProtectedRoute para rutas que requieren autenticación
function ProtectedRoute({ children, userRoles = ['admin'] }: { children: ReactNode; userRoles?: string[] }) {
  const token = localStorage.getItem('api_token')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return (
    <Layout userRoles={userRoles}>
      {children}
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta por defecto - Redirige a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* ========== RUTAS PÚBLICAS ========== */}
        <Route path="/login" element={<Login />} />
        
        {/* ========== RUTAS PROTEGIDAS ========== */}
        
        {/* DASHBOARD */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><DashboardIndicadores /></ProtectedRoute>} 
        />
        
        {/* ===== GESTIÓN DE USUARIOS (Admin) ===== */}
        <Route 
          path="/admin/usuarios" 
          element={<ProtectedRoute><Users /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/roles" 
          element={<ProtectedRoute><Roles /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/permisos" 
          element={<ProtectedRoute><Permisos /></ProtectedRoute>} 
        />
        
        {/* ===== GESTIÓN ACADÉMICA (Admin/Administrativo) ===== */}
        <Route 
          path="/admin/docentes" 
          element={<ProtectedRoute><Docentes /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/materias" 
          element={<ProtectedRoute><Materias /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/grupos" 
          element={<ProtectedRoute><Grupos /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/aulas" 
          element={<ProtectedRoute><Aulas /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/horarios" 
          element={<ProtectedRoute><Horarios /></ProtectedRoute>} 
        />
        
        {/* ===== DOCENCIA (Docentes) ===== */}
        <Route 
          path="/docencia/asignaciones" 
          element={<ProtectedRoute><Asignaciones /></ProtectedRoute>} 
        />
        <Route 
          path="/docencia/mi-carga-horaria" 
          element={<ProtectedRoute><QRScan /></ProtectedRoute>} 
        />
        <Route 
          path="/docencia/asistencias" 
          element={<ProtectedRoute><Asistencias /></ProtectedRoute>} 
        />
        <Route 
          path="/docencia/calificaciones" 
          element={<ProtectedRoute><ValidacionAsistencia /></ProtectedRoute>} 
        />
        
        {/* ===== REPORTES (Admin/Docente) ===== */}
        <Route 
          path="/reportes/asistencia" 
          element={<ProtectedRoute><ReporteAsistencia /></ProtectedRoute>} 
        />
        <Route 
          path="/reportes/carga-horaria" 
          element={<ProtectedRoute><ReporteCargaHoraria /></ProtectedRoute>} 
        />
        <Route 
          path="/reportes/aulas" 
          element={<ProtectedRoute><ReporteUsoAulas /></ProtectedRoute>} 
        />
        <Route 
          path="/reportes/dashboard" 
          element={<ProtectedRoute><ExportarReportes /></ProtectedRoute>} 
        />
        
        {/* ===== ADMINISTRACIÓN (Admin) ===== */}
        <Route 
          path="/admin/auditoria" 
          element={<ProtectedRoute><AuditoriaPage /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/configuracion" 
          element={<ProtectedRoute><Gestiones /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/respaldo" 
          element={<ProtectedRoute><Gestiones /></ProtectedRoute>} 
        />
        
        {/* RUTAS LEGADAS (Compatibilidad hacia atrás) */}
        <Route 
          path="/qr" 
          element={<ProtectedRoute><QRScan /></ProtectedRoute>} 
        />
        <Route 
          path="/validacion-asistencia" 
          element={<ProtectedRoute><ValidacionAsistencia /></ProtectedRoute>} 
        />
        <Route 
          path="/consulta-horario" 
          element={<ProtectedRoute><ConsultaHorario /></ProtectedRoute>} 
        />
        <Route 
          path="/gestiones" 
          element={<ProtectedRoute><Gestiones /></ProtectedRoute>} 
        />
        
        {/* REDIRECCIONES POR DEFECTO */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
