import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth, useAuthenticatedFetch } from "../../contexts/AuthContext";

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  pendingValidations: number;
  completedValidations: number;
}

interface Student {
  id: string;
  nombre: string;
  codigo: string;
  practica: string;
  estado: string;
  horasCompletadas: number;
  horasRequeridas: number;
}

export default function IglesiaDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    pendingValidations: 0,
    completedValidations: 0
  });
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchDashboardData();
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simular datos por ahora - en el futuro conectar con API real
      setTimeout(() => {
        setStats({
          totalStudents: 12,
          activeStudents: 8,
          pendingValidations: 5,
          completedValidations: 15
        });
        
        setRecentStudents([
          {
            id: '1',
            nombre: 'Juan Pérez',
            codigo: '12345',
            practica: 'Práctica Pastoral I',
            estado: 'Activo',
            horasCompletadas: 45,
            horasRequeridas: 60
          },
          {
            id: '2',
            nombre: 'María García',
            codigo: '23456',
            practica: 'Práctica Pastoral II',
            estado: 'Pendiente Validación',
            horasCompletadas: 60,
            horasRequeridas: 60
          }
        ]);
        
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        <div className="flex items-center gap-4">
          <span>Iglesia</span>
          <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">I</span>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-8 border-4 border-blue-600">
            <div className="text-center">
              <div className="text-blue-900 text-4xl mb-4">👥</div>
              <div className="text-6xl font-black !text-slate-900 mb-4">{stats.totalStudents}</div>
              <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">Total Estudiantes</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-4 border-green-600">
            <div className="text-center">
              <div className="text-green-900 text-4xl mb-4">✓</div>
              <div className="text-6xl font-black !text-slate-900 mb-4">{stats.activeStudents}</div>
              <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">Estudiantes Activos</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-4 border-yellow-600">
            <div className="text-center">
              <div className="text-yellow-900 text-4xl mb-4">⏳</div>
              <div className="text-6xl font-black !text-slate-900 mb-4">{stats.pendingValidations}</div>
              <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">Validaciones Pendientes</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-4 border-purple-600">
            <div className="text-center">
              <div className="text-purple-900 text-4xl mb-4">📋</div>
              <div className="text-6xl font-black !text-slate-900 mb-4">{stats.completedValidations}</div>
              <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">Validaciones Completadas</div>
            </div>
          </div>
        </div>

        {/* Navegación Rápida */}
        <div className="bg-white rounded-lg shadow mb-8 border-4 border-slate-600">
          <div className="px-8 py-6">
            <h3 className="text-3xl font-extrabold mb-8 !text-slate-900 uppercase tracking-wide">Acciones Rápidas</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button 
                onClick={() => router.push('/dashboard/iglesia/estudiantes-asignados')}
                className="border-4 border-blue-600 hover:border-blue-800 hover:bg-blue-50 rounded-lg p-6 text-center transition cursor-pointer bg-white"
              >
                <div className="text-blue-900 text-4xl mb-4">👥</div>
                <div className="font-extrabold !text-slate-900 text-xl">Estudiantes Asignados</div>
                <div className="text-base !text-slate-800 mt-3">Ver y gestionar estudiantes</div>
              </button>

              <button 
                onClick={() => router.push('/dashboard/iglesia/validar-evidencias')}
                className="border-4 border-green-600 hover:border-green-800 hover:bg-green-50 rounded-lg p-6 text-center transition cursor-pointer bg-white"
              >
                <div className="text-green-900 text-4xl mb-4">✅</div>
                <div className="font-extrabold !text-slate-900 text-xl">Validar Evidencias</div>
                <div className="text-base !text-slate-800 mt-3">Revisar reportes y evidencias</div>
              </button>

              <button 
                onClick={() => router.push('/dashboard/iglesia/reportes')}
                className="border-4 border-purple-600 hover:border-purple-800 hover:bg-purple-50 rounded-lg p-6 text-center transition cursor-pointer bg-white"
              >
                <div className="text-purple-900 text-4xl mb-4">📊</div>
                <div className="font-extrabold !text-slate-900 text-xl">Reportes</div>
                <div className="text-base !text-slate-800 mt-3">Ver estadísticas y reportes</div>
              </button>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow border-4 border-slate-600">
          <div className="px-8 py-6">
            <h3 className="text-3xl font-extrabold mb-8 !text-slate-900 uppercase tracking-wide">Estudiantes Recientes</h3>
          </div>
          <div className="p-8">
            {recentStudents.length > 0 ? (
              <div className="space-y-6">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-6 border-2 border-slate-300 rounded-lg bg-white">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-white font-extrabold text-lg">{student.nombre.charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-extrabold !text-slate-900">{student.nombre}</p>
                        <p className="text-base !text-slate-800">{student.codigo} - {student.practica}</p>
                        <p className="text-sm !text-slate-800 mt-1">
                          Progreso: {student.horasCompletadas}/{student.horasRequeridas} horas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-2 text-sm font-bold rounded-full ${
                        student.estado === 'Activo' ? 'bg-green-200 !text-green-900' :
                        student.estado === 'Pendiente Validación' ? 'bg-yellow-200 !text-yellow-900' :
                        'bg-gray-200 !text-slate-900'
                      }`}>
                        {student.estado}
                      </span>
                      <button className="!text-blue-900 hover:!text-blue-700 text-base font-extrabold">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="!text-slate-900 font-extrabold text-center py-8 text-xl">No hay estudiantes recientes</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}