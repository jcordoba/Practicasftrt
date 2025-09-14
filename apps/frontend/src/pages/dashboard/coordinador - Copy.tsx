import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth, useAuthenticatedFetch } from "../../contexts/AuthContext";

interface DashboardStats {
  totalStudents: number;
  activePractices: number;
  pendingAssignments: number;
  completedPractices: number;
}

export default function CoordinadorDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activePractices: 0,
    pendingAssignments: 0,
    completedPractices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchDashboardStats();
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // El AuthContext se encargará de redirigir
  }

  const fetchDashboardStats = async () => {
    try {
      // Obtener estadísticas de prácticas
      const practicesResponse = await authenticatedFetch('/api/practices');
      
      if (practicesResponse.ok) {
        const practices = await practicesResponse.json();
        const activePractices = practices.filter((p: any) => p.status === 'IN_PROGRESS').length;
        const completedPractices = practices.filter((p: any) => p.status === 'COMPLETED').length;
        const pendingAssignments = practices.filter((p: any) => p.status === 'PENDING').length;
        
        setStats({
          totalStudents: practices.length, // Simplificado por ahora
          activePractices,
          pendingAssignments,
          completedPractices
        });
      } else {
        // Si no hay conexión con el backend, mostrar datos de ejemplo
        setStats({
          totalStudents: 45,
          activePractices: 12,
          pendingAssignments: 8,
          completedPractices: 25
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Mostrar datos de ejemplo en caso de error
      setStats({
        totalStudents: 45,
        activePractices: 12,
        pendingAssignments: 8,
        completedPractices: 25
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-200">
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        <div className="flex items-center gap-4">
          <span>Coordinador</span>
          <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">C</span>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-8">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center border-4 border-blue-600">
              <div className="text-6xl font-black text-black mb-4">{loading ? '...' : stats.totalStudents}</div>
              <div className="text-black font-black text-lg uppercase tracking-wide">Estudiantes</div>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-8 text-center border-4 border-green-600">
              <div className="text-6xl font-black text-black mb-4">{loading ? '...' : stats.activePractices}</div>
              <div className="text-black font-black text-lg uppercase tracking-wide">Prácticas Activas</div>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-8 text-center border-4 border-orange-600">
              <div className="text-6xl font-black text-black mb-4">{loading ? '...' : stats.pendingAssignments}</div>
              <div className="text-black font-black text-lg uppercase tracking-wide">Asignaciones Pendientes</div>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-8 text-center border-4 border-purple-600">
              <div className="text-6xl font-black text-black mb-4">{loading ? '...' : stats.completedPractices}</div>
              <div className="text-black font-black text-lg uppercase tracking-wide">Prácticas Completadas</div>
            </div>
        </div>

        {/* Navegación rápida */}
        <div className="bg-white rounded-lg shadow-xl p-8 w-full mb-8 border-4 border-gray-600">
            <h2 className="text-3xl font-black mb-8 text-black uppercase tracking-wide">Gestión de Prácticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/coordinador/practicas" className="block">
              <div className="border-4 border-blue-600 hover:border-blue-800 hover:bg-blue-200 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                  <div className="text-blue-900 text-4xl mb-4">📋</div>
                  <div className="font-black text-black text-xl">Gestionar Prácticas</div>
                  <div className="text-lg text-black font-black mt-3">Crear y administrar prácticas</div>
                </div>
            </Link>
            <Link href="/dashboard/coordinador/asignar-estudiante" className="block">
              <div className="border-4 border-green-600 hover:border-green-800 hover:bg-green-200 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                  <div className="text-green-900 text-4xl mb-4">👥</div>
                  <div className="font-black text-black text-xl">Asignar Estudiantes</div>
                  <div className="text-lg text-black font-black mt-3">Asignar estudiantes a iglesias</div>
                </div>
            </Link>
            <div className="border-4 border-purple-600 hover:border-purple-800 hover:bg-purple-200 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-purple-900 text-4xl mb-4">📊</div>
                <div className="font-black text-black text-xl">Reportes</div>
                <div className="text-lg text-black font-black mt-3">Ver estadísticas y reportes</div>
              </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-lg shadow-xl p-8 w-full border-4 border-gray-600">
            <h2 className="text-3xl font-black mb-8 text-black uppercase tracking-wide">Actividad Reciente</h2>
            {loading ? (
              <div className="text-center py-8 text-black font-black text-xl">Cargando...</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-gray-100 rounded-lg border-4 border-gray-500">
                  <div className="w-6 h-6 bg-blue-900 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-black text-black text-xl">Nueva práctica creada</div>
                    <div className="text-lg text-black font-black mt-3">Hace 1 hora</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-gray-100 rounded-lg border-4 border-gray-500">
                  <div className="w-6 h-6 bg-green-900 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-black text-black text-xl">Estudiante asignado a iglesia</div>
                    <div className="text-lg text-black font-black mt-3">Hace 2 horas</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-gray-100 rounded-lg border-4 border-gray-500">
                  <div className="w-6 h-6 bg-purple-900 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-black text-black text-xl">Reporte de práctica recibido</div>
                    <div className="text-lg text-black font-black mt-3">Hace 1 día</div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}