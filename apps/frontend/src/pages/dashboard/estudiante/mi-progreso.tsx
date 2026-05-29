import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, useAuthenticatedFetch } from '../../../contexts/AuthContext';
import UserDropdown from '../../../components/UserDropdown';

interface StudentStats {
  totalPractices: number;
  activePractices: number;
  completedPractices: number;
  totalHoursLogged: number;
  totalHoursRequired: number;
  totalReports: number;
  averageHoursPerReport: number;
}

export default function ProgressPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchStats();
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
    return null;
  }

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/practices/my/stats');

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const progressPercentage = stats && stats.totalHoursRequired > 0 
    ? Math.min(100, (stats.totalHoursLogged / stats.totalHoursRequired) * 100)
    : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'from-green-500 to-green-600';
    if (percentage >= 75) return 'from-blue-500 to-blue-600';
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
    if (percentage >= 25) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with glassmorphism effect */}
      <header className="w-full bg-blue-900 text-white py-5 px-8 flex justify-between items-center sticky top-0 z-40 shadow-lg gap-4 border-b border-blue-800">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link href="/dashboard/estudiante" className="text-white hover:text-blue-200 flex items-center flex-shrink-0">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </Link>
          <h1 className="text-lg md:text-xl font-bold truncate">SION Prácticas FTR</h1>
        </div>
        <div className="flex-shrink-0">
          <UserDropdown />
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4 pb-12">
        {/* Page title and description */}
        <div className="w-full mb-8">
          <h2 className="text-3xl font-bold !text-black mb-2">Progreso de Prácticas</h2>
          <p className="!text-gray-600">
            Visualiza tu progreso general en el programa de prácticas profesionales
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="w-full bg-red-100 border border-red-400 !text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!stats && !error && (
          <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <svg className="w-16 h-16 !text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="!text-blue-800 text-lg font-semibold mb-2">No hay datos disponibles</p>
            <p className="!text-blue-600">
              Aún no tienes prácticas registradas
            </p>
          </div>
        )}

        {stats && (
          <>
            {/* Main Progress Card */}
            <div className="w-full mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-100">
              <h3 className="text-2xl font-bold !text-black mb-6">Progreso de Horas</h3>
              
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="!text-gray-700 font-semibold">Horas completadas</span>
                  <span className="text-xl font-bold !text-black">
                    {stats.totalHoursLogged} / {stats.totalHoursRequired} horas
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressColor(progressPercentage)} transition-all duration-500 easy-out`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex justify-between text-sm !text-gray-600">
                  <span>{progressPercentage.toFixed(1)}%</span>
                  <span>{stats.totalHoursRequired - stats.totalHoursLogged} horas restantes</span>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2">
                {progressPercentage >= 100 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="!text-green-700 font-semibold">¡Completo! Has alcanzado todas las horas requeridas</p>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="!text-blue-700 font-semibold">En progreso - Continúa completando tus horas</p>
                  </>
                )}
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Practices */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-blue-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="!text-gray-600 text-sm font-semibold mb-1">Total de Prácticas</p>
                    <p className="text-3xl font-bold !text-blue-600">{stats.totalPractices}</p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </div>

              {/* Active Practices */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-green-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="!text-gray-600 text-sm font-semibold mb-1">Prácticas Activas</p>
                    <p className="text-3xl font-bold !text-green-600">{stats.activePractices}</p>
                  </div>
                  <div className="text-4xl">⚡</div>
                </div>
              </div>

              {/* Completed Practices */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-purple-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="!text-gray-600 text-sm font-semibold mb-1">Completas</p>
                    <p className="text-3xl font-bold !text-purple-600">{stats.completedPractices}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>

              {/* Total Reports */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-orange-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="!text-gray-600 text-sm font-semibold mb-1">Reportes Enviados</p>
                    <p className="text-3xl font-bold !text-orange-600">{stats.totalReports}</p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>
            </div>

            {/* Detailed Statistics */}
            <div className="w-full bg-white rounded-xl shadow-md p-8 border border-gray-200">
              <h3 className="text-2xl font-bold !text-black mb-6">Estadísticas Detalladas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hours Statistics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold !text-black mb-4">Estadísticas de Horas</h4>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div>
                      <p className="!text-gray-700 font-medium">Horas Registradas</p>
                      <p className="!text-gray-600 text-sm">Total de horas completadas</p>
                    </div>
                    <p className="text-2xl font-bold !text-blue-600">{stats.totalHoursLogged}h</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div>
                      <p className="!text-gray-700 font-medium">Horas Requeridas</p>
                      <p className="!text-gray-600 text-sm">Total de horas según el programa</p>
                    </div>
                    <p className="text-2xl font-bold !text-purple-600">{stats.totalHoursRequired}h</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div>
                      <p className="!text-gray-700 font-medium">Promedio por Reporte</p>
                      <p className="!text-gray-600 text-sm">Horas promedio en cada reporte</p>
                    </div>
                    <p className="text-2xl font-bold !text-green-600">
                      {stats.averageHoursPerReport.toFixed(1)}h
                    </p>
                  </div>
                </div>

                {/* Practice Statistics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold !text-black mb-4">Desglose de Prácticas</h4>
                  
                  <div className="space-y-2">
                    {/* Total */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="!text-gray-700 font-medium">Total de Prácticas</span>
                      <span className="px-4 py-1 bg-blue-100 !text-blue-700 rounded-full font-bold">
                        {stats.totalPractices}
                      </span>
                    </div>

                    {/* Active */}
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="!text-gray-700 font-medium">En Curso</span>
                      <span className="px-4 py-1 bg-green-100 !text-green-700 rounded-full font-bold">
                        {stats.activePractices}
                      </span>
                    </div>

                    {/* Completed */}
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="!text-gray-700 font-medium">Completadas</span>
                      <span className="px-4 py-1 bg-purple-100 !text-purple-700 rounded-full font-bold">
                        {stats.completedPractices}
                      </span>
                    </div>

                    {/* Pending */}
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <span className="!text-gray-700 font-medium">Próximas a Iniciar</span>
                      <span className="px-4 py-1 bg-orange-100 !text-orange-700 rounded-full font-bold">
                        {Math.max(0, stats.totalPractices - stats.activePractices - stats.completedPractices)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Tips */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold !text-black mb-3">💡 Consejos para el Progreso</h4>
                <ul className="space-y-2 !text-gray-700">
                  <li>✓ Completa tus reportes regularmente para mantener un registro actualizado</li>
                  <li>✓ Mantén comunicación con tus supervisores sobre tu desempeño</li>
                  <li>✓ Realiza seguimiento de tus horas completadas versus las requeridas</li>
                  <li>✓ Solicita retroalimentación periódica para mejorar tu experiencia</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
