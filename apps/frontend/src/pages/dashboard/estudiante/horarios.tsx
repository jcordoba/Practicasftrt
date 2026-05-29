import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, useAuthenticatedFetch } from '../../../contexts/AuthContext';
import UserDropdown from '../../../components/UserDropdown';

interface Placement {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  center?: {
    id: string;
    nombre: string;
  };
  tutor?: {
    id: string;
    nombre: string;
    email?: string;
  };
  teacher?: {
    id: string;
    nombre: string;
    email?: string;
  };
  program?: {
    id: string;
    nombre: string;
  };
  term?: {
    id: string;
    academicYear?: number;
    academicPeriod?: string;
  };
}

export default function HorariosPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchPlacements();
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

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/placements/my');

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPlacements(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar horarios';
      setError(message);
      setPlacements([]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 !text-green-700';
      case 'INACTIVE':
        return 'bg-gray-100 !text-gray-700';
      case 'COMPLETED':
        return 'bg-blue-100 !text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 !text-red-700';
      default:
        return 'bg-gray-100 !text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'INACTIVE':
        return 'Inactivo';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getIsactive = (placement: Placement) => {
    const now = new Date();
    const start = new Date(placement.startDate);
    const end = new Date(placement.endDate);
    return start <= now && now <= end;
  };

  // Separar placements activos y pasados
  const activePlacements = placements.filter(p => getIsactive(p) || p.status === 'ACTIVE');
  const upcomingPlacements = placements.filter(
    p => new Date(p.startDate) > new Date() && p.status !== 'CANCELLED',
  );
  const completedPlacements = placements.filter(p => p.status === 'COMPLETED' || p.status === 'CANCELLED');

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
          <h2 className="text-3xl font-bold !text-black mb-2">Horarios de Prácticas</h2>
          <p className="!text-gray-600">
            Visualiza el calendario de tus prácticas profesionales y supervisores
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="w-full bg-red-100 border border-red-400 !text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {placements.length === 0 && !error && (
          <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <svg className="w-16 h-16 !text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="!text-blue-800 text-lg font-semibold mb-2">Aún no tienes horarios asignados</p>
            <p className="!text-blue-600">
              Tu coordinador te asignará tus prácticas y supervisores
            </p>
          </div>
        )}

        {/* Active Placements */}
        {activePlacements.length > 0 && (
          <div className="w-full mb-8">
            <h3 className="text-2xl font-bold !text-black mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                {activePlacements.length}
              </span>
              Prácticas Activas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePlacements.map((placement) => (
                <div
                  key={placement.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-green-500"
                >
                  <div className="p-6">
                    {/* Header with status */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold !text-black">
                          {placement.center?.nombre || 'Centro no especificado'}
                        </h4>
                        <p className="!text-gray-500 text-sm mt-1">
                          {placement.program?.nombre || 'Programa sin nombre'}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 ${getStatusColor(placement.status)}`}>
                        {getStatusLabel(placement.status)}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <p className="!text-gray-600 text-sm font-semibold mb-2">Duración:</p>
                      <p className="!text-black text-sm font-medium">
                        📅 {formatDate(placement.startDate)} a {formatDate(placement.endDate)}
                      </p>
                    </div>

                    {/* Supervisors */}
                    <div className="space-y-3">
                      {placement.tutor && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="!text-gray-600 text-xs font-semibold mb-1">Tutor Pastor:</p>
                          <p className="!text-black text-sm font-medium">👨‍💼 {placement.tutor.nombre}</p>
                          {placement.tutor.email && (
                            <p className="!text-gray-500 text-xs mt-1">{placement.tutor.email}</p>
                          )}
                        </div>
                      )}

                      {placement.teacher && (
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="!text-gray-600 text-xs font-semibold mb-1">Docente:</p>
                          <p className="!text-black text-sm font-medium">👩‍🏫 {placement.teacher.nombre}</p>
                          {placement.teacher.email && (
                            <p className="!text-gray-500 text-xs mt-1">{placement.teacher.email}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Placements */}
        {upcomingPlacements.length > 0 && (
          <div className="w-full mb-8">
            <h3 className="text-2xl font-bold !text-black mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                {upcomingPlacements.length}
              </span>
              Próximas Prácticas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingPlacements.map((placement) => (
                <div
                  key={placement.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-blue-500"
                >
                  <div className="p-6">
                    {/* Header with status */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold !text-black">
                          {placement.center?.nombre || 'Centro no especificado'}
                        </h4>
                        <p className="!text-gray-500 text-sm mt-1">
                          {placement.program?.nombre || 'Programa sin nombre'}
                        </p>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 !text-blue-700 flex-shrink-0">
                        Próximamente
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="!text-gray-600 text-sm font-semibold mb-2">Duración:</p>
                      <p className="!text-black text-sm font-medium">
                        📅 {formatDate(placement.startDate)} a {formatDate(placement.endDate)}
                      </p>
                    </div>

                    {/* Supervisors */}
                    <div className="space-y-3">
                      {placement.tutor && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="!text-gray-600 text-xs font-semibold mb-1">Tutor Pastor:</p>
                          <p className="!text-black text-sm font-medium">👨‍💼 {placement.tutor.nombre}</p>
                          {placement.tutor.email && (
                            <p className="!text-gray-500 text-xs mt-1">{placement.tutor.email}</p>
                          )}
                        </div>
                      )}

                      {placement.teacher && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="!text-gray-600 text-xs font-semibold mb-1">Docente:</p>
                          <p className="!text-black text-sm font-medium">👩‍🏫 {placement.teacher.nombre}</p>
                          {placement.teacher.email && (
                            <p className="!text-gray-500 text-xs mt-1">{placement.teacher.email}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Placements */}
        {completedPlacements.length > 0 && (
          <div className="w-full">
            <h3 className="text-2xl font-bold !text-black mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-400 text-white rounded-full text-sm font-bold">
                {completedPlacements.length}
              </span>
              Prácticas Completadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedPlacements.map((placement) => (
                <div
                  key={placement.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-gray-400 opacity-75"
                >
                  <div className="p-6">
                    {/* Header with status */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold !text-black">
                          {placement.center?.nombre || 'Centro no especificado'}
                        </h4>
                        <p className="!text-gray-500 text-sm mt-1">
                          {placement.program?.nombre || 'Programa sin nombre'}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 ${getStatusColor(placement.status)}`}>
                        {getStatusLabel(placement.status)}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="!text-gray-600 text-sm font-semibold mb-2">Duración:</p>
                      <p className="!text-black text-sm font-medium">
                        📅 {formatDate(placement.startDate)} a {formatDate(placement.endDate)}
                      </p>
                    </div>

                    {/* Supervisors */}
                    <div className="space-y-3">
                      {placement.tutor && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="!text-gray-600 text-xs font-semibold mb-1">Tutor Pastor:</p>
                          <p className="!text-black text-sm font-medium">👨‍💼 {placement.tutor.nombre}</p>
                        </div>
                      )}

                      {placement.teacher && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="!text-gray-600 text-xs font-semibold mb-1">Docente:</p>
                          <p className="!text-black text-sm font-medium">👩‍🏫 {placement.teacher.nombre}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
