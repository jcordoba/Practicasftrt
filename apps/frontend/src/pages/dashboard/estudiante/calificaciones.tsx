import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, useAuthenticatedFetch } from '../../../contexts/AuthContext';
import UserDropdown from '../../../components/UserDropdown';

interface EvaluationDimension {
  academic?: number;
  pastoral?: number;
  social?: number;
  administrative?: number;
}

interface Grade {
  id: string;
  finalGrade: number;
  evaluationDate: string;
  evaluationType: string;
  status: string;
  observations?: string;
  evaluationDimensions: EvaluationDimension;
  placement: {
    id: string;
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
  };
}

export default function CalificacionesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchGrades();
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

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/practices/my/grades');

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGrades(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar calificaciones';
      setError(message);
      setGrades([]);
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

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full bg-blue-900 text-white py-5 px-8 flex justify-between items-center sticky top-0 z-40 shadow-lg gap-4 border-b border-blue-800">
        <div className="flex items-center min-w-0 flex-1">
          <Link href="/dashboard/estudiante" className="text-white hover:text-blue-200 mr-3 transition-colors flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg md:text-xl font-bold truncate">Mis Calificaciones</h1>
        </div>
        <div className="flex-shrink-0">
          <UserDropdown />
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4 pb-12">
        {/* Page title and description */}
        <div className="w-full mb-8">
          <h2 className="text-3xl font-bold !text-black mb-2">Calificaciones de Prácticas</h2>
          <p className="!text-gray-600">
            Visualiza el histórico de evaluaciones de tus prácticas profesionales
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="w-full bg-red-100 border border-red-400 !text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {grades.length === 0 && !error && (
          <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <svg className="w-16 h-16 !text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="!text-blue-800 text-lg font-semibold mb-2">Aún no tienes calificaciones</p>
            <p className="!text-blue-600">
              Completa tus prácticas y espera la evaluación de tus supervisores
            </p>
          </div>
        )}

        {/* Grades grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-blue-600"
            >
              <div className="p-6">
                {/* Header with program and center */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold !text-black">
                      {grade.placement?.program?.nombre || 'Programa sin nombre'}
                    </h3>
                    <p className="!text-gray-500 text-sm mt-1">
                      {grade.placement?.center?.nombre || 'Centro no especificado'}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    grade.status === 'draft' ? 'bg-gray-100 !text-gray-700' :
                    grade.status === 'submitted' ? 'bg-blue-100 !text-blue-700' :
                    grade.status === 'approved' ? 'bg-green-100 !text-green-700' :
                    'bg-red-100 !text-red-700'
                  }`}>
                    {grade.status === 'draft' ? 'Borrador' :
                     grade.status === 'submitted' ? 'Enviada' :
                     grade.status === 'approved' ? 'Aprobada' :
                     grade.status === 'rejected' ? 'Rechazada' : grade.status}
                  </span>
                </div>

                {/* Grade Circle */}
                <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl !text-white ${
                      grade.finalGrade >= 4.5
                        ? 'bg-green-500'
                        : grade.finalGrade >= 3.5
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  >
                    {grade.finalGrade.toFixed(2)}
                  </div>
                  <div className="ml-4">
                    <p className="!text-gray-500 text-sm">Calificación Final</p>
                    <p className="!text-black font-semibold">
                      {grade.finalGrade >= 4.5
                        ? 'Excelente'
                        : grade.finalGrade >= 3.5
                          ? 'Bueno'
                          : 'Requiere mejora'}
                    </p>
                  </div>
                </div>

                {/* Evaluation details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center !text-black text-sm">
                    <span className="text-base mr-2">📅</span>
                    <span>
                      {new Date(grade.evaluationDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center !text-black text-sm">
                    <span className="text-base mr-2">📋</span>
                    <span>
                      {grade.evaluationType === 'regular'
                        ? 'Evaluación Regular'
                        : grade.evaluationType === 'remedial'
                          ? 'Evaluación Remedial'
                          : 'Evaluación Final'}
                    </span>
                  </div>
                </div>

                {/* Supervisors */}
                {(grade.placement?.tutor || grade.placement?.teacher) && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                    <p className="!text-gray-600 font-semibold mb-2">Supervisores:</p>
                    {grade.placement?.tutor && (
                      <p className="!text-black">👨‍🏫 Tutor: {grade.placement.tutor.nombre}</p>
                    )}
                    {grade.placement?.teacher && (
                      <p className="!text-black">👩‍🏫 Docente: {grade.placement.teacher.nombre}</p>
                    )}
                  </div>
                )}

                {/* Dimensions and Observations */}
                {(grade.evaluationDimensions && Object.keys(grade.evaluationDimensions).length > 0) || grade.observations ? (
                  <>
                    {grade.evaluationDimensions && Object.keys(grade.evaluationDimensions).length > 0 && (
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <p className="!text-gray-600 font-semibold mb-2 text-sm">📊 Dimensiones:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {grade.evaluationDimensions.academic !== undefined && (
                            <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                              <p className="!text-gray-600 text-xs">Académica</p>
                              <p className="!text-black font-bold text-lg">
                                🎓 {grade.evaluationDimensions.academic.toFixed(2)}
                              </p>
                            </div>
                          )}
                          {grade.evaluationDimensions.pastoral !== undefined && (
                            <div className="bg-purple-50 p-2 rounded border-l-2 border-purple-400">
                              <p className="!text-gray-600 text-xs">Pastoral</p>
                              <p className="!text-black font-bold text-lg">
                                ✨ {grade.evaluationDimensions.pastoral.toFixed(2)}
                              </p>
                            </div>
                          )}
                          {grade.evaluationDimensions.social !== undefined && (
                            <div className="bg-green-50 p-2 rounded border-l-2 border-green-400">
                              <p className="!text-gray-600 text-xs">Social</p>
                              <p className="!text-black font-bold text-lg">
                                👥 {grade.evaluationDimensions.social.toFixed(2)}
                              </p>
                            </div>
                          )}
                          {grade.evaluationDimensions.administrative !== undefined && (
                            <div className="bg-orange-50 p-2 rounded border-l-2 border-orange-400">
                              <p className="!text-gray-600 text-xs">Administrativa</p>
                              <p className="!text-black font-bold text-lg">
                                ⚙️ {grade.evaluationDimensions.administrative.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {grade.observations && (
                      <div className="bg-yellow-50 p-3 rounded border-l-2 border-yellow-400">
                        <p className="!text-gray-600 font-semibold mb-1 text-sm">💬 Observaciones:</p>
                        <p className="!text-black text-sm">{grade.observations}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
