import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth, useAuthenticatedFetch } from "../../contexts/AuthContext";
import UserDropdown from "../../components/UserDropdown";

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
          <p className="mt-4 !text-black">Cargando...</p>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium !text-black">Cargando dashboard...</div>
        </div>
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

  // Stat card component with enhanced design
  const StatCard = ({ 
    title, 
    value, 
    color, 
    icon,
    loading 
  }: { 
    title: string; 
    value: number | string; 
    color: string; 
    icon: React.ReactNode;
    loading: boolean;
  }) => {
    // Extract color class to determine icon color
    const iconColor = color.includes('blue') ? 'text-blue-500' : 
                     color.includes('green') ? 'text-green-500' : 
                     color.includes('orange') ? 'text-orange-500' : 
                     color.includes('purple') ? 'text-purple-500' : 
                     color.includes('yellow') ? 'text-yellow-500' : 'text-gray-500';
    
    return (
      <div className={`
        bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-300
        hover:shadow-xl hover:-translate-y-1 border-b-4 ${color}
        flex flex-col items-center
      `}>
        <div className={`mb-4 p-3 rounded-full bg-gray-100 ${iconColor}`}>
          {icon}
        </div>
        <div className="text-4xl font-bold !text-black mb-2 transition-all duration-500">
          {loading ? (
            <div className="inline-block animate-pulse bg-gray-200 rounded w-12 h-10"></div>
          ) : (
            value
          )}
        </div>
        <div className="!text-black font-semibold text-lg uppercase tracking-wide">
          {title}
        </div>
      </div>
    );
  };

  // Action card component with enhanced design
  const ActionCard = ({ 
    onClick, 
    title, 
    description, 
    color, 
    icon 
  }: { 
    onClick: () => void;
    title: string; 
    description: string; 
    color: string; 
    icon: React.ReactNode;
  }) => {
    // Extract color class to determine icon color
    const iconColor = color.includes('blue') ? 'text-blue-500' : 
                     color.includes('green') ? 'text-green-500' : 
                     color.includes('orange') ? 'text-orange-500' : 
                     color.includes('purple') ? 'text-purple-500' : 
                     color.includes('indigo') ? 'text-indigo-500' : 
                     color.includes('teal') ? 'text-teal-500' : 'text-gray-500';
    
    return (
      <button 
        onClick={onClick}
        className="block group w-full"
      >
        <div className={`
          rounded-2xl p-6 text-center transition-all duration-300
          border-2 border-gray-200 hover:border-2 ${color}
          bg-white hover:bg-gray-50
          transform hover:-translate-y-1 hover:shadow-lg
        `}>
          <div className={`text-4xl mb-4 transition-transform duration-300 group-hover:scale-110 ${iconColor}`}>
            {icon}
          </div>
          <div className="font-bold !text-black text-xl mb-2 transition-colors duration-300 group-hover:!text-blue-700">
            {title}
          </div>
          <div className="!text-black text-sm">
            {description}
          </div>
          <div className="mt-4 flex items-center justify-center !text-blue-600 font-medium text-sm">
            Acceder
            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with glassmorphism effect */}
      <header className="w-full bg-blue-900 bg-opacity-90 backdrop-blur-lg text-white py-4 px-6 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        </div>
        <UserDropdown />
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Estudiantes" 
            value={stats.totalStudents} 
            color="border-blue-500" 
            icon={
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            loading={loading}
          />
          
          <StatCard 
            title="Estudiantes Activos" 
            value={stats.activeStudents} 
            color="border-green-500" 
            icon={
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            loading={loading}
          />
          
          <StatCard 
            title="Validaciones Pendientes" 
            value={stats.pendingValidations} 
            color="border-yellow-500" 
            icon={
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            loading={loading}
          />
          
          <StatCard 
            title="Validaciones Completadas" 
            value={stats.completedValidations} 
            color="border-purple-500" 
            icon={
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            loading={loading}
          />
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="px-8 py-6">
            <h3 className="text-2xl font-bold !text-black mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Acciones Rápidas
            </h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ActionCard 
                onClick={() => router.push('/dashboard/iglesia/estudiantes-asignados')}
                title="Estudiantes Asignados"
                description="Ver y gestionar estudiantes"
                color="border-blue-500 hover:border-blue-600"
                icon="👥"
              />
              
              <ActionCard 
                onClick={() => router.push('/dashboard/iglesia/validar-evidencias')}
                title="Validar Evidencias"
                description="Revisar reportes y evidencias"
                color="border-green-500 hover:border-green-600"
                icon="✅"
              />
              
              <ActionCard 
                onClick={() => router.push('/dashboard/iglesia/reportes')}
                title="Reportes"
                description="Ver estadísticas y reportes"
                color="border-purple-500 hover:border-purple-600"
                icon="📊"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Recent Students */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="px-8 py-6">
            <h3 className="text-2xl font-bold !text-black mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Estudiantes Recientes
            </h3>
          </div>
          <div className="p-8">
            {recentStudents.length > 0 ? (
              <div className="space-y-4">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{student.nombre.charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-bold !text-black">{student.nombre}</p>
                        <p className="text-base !text-black">{student.codigo} - {student.practica}</p>
                        <p className="text-sm !text-black mt-1">
                          Progreso: {student.horasCompletadas}/{student.horasRequeridas} horas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full !text-black ${
                        student.estado === 'Activo' ? 'bg-green-500' :
                        student.estado === 'Pendiente Validación' ? 'bg-yellow-500' :
                        'bg-gray-100'
                      }`}>
                        {student.estado}
                      </span>
                      <button className="!text-blue-600 hover:!text-blue-800 text-base font-medium">
                        Ver Detalles
                        <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="!text-black font-bold text-center py-8 text-xl">No hay estudiantes recientes</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}