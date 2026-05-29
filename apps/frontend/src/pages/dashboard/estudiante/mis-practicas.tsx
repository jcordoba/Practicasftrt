import React, { useState, useEffect, useRef } from "react";
import Button from "../../../components/Button";
import Alert from "../../../components/Alert";
import { useAuth, useAuthenticatedFetch } from "../../../contexts/AuthContext";
import SafeLink from "@/components/SafeLink";
import UserDropdown from "../../../components/UserDropdown";

interface Practice {
  id: string;
  name?: string;
  nombre?: string;
  description: string;
  institution: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  hours: number;
  tutorId?: string | null;
  teacherId?: string | null;
  tutor?: {
    id: string;
    name?: string;
    nombre?: string;
    email: string;
  };
  teacher?: {
    id: string;
    name?: string;
    nombre?: string;
    email: string;
  };
}

interface PracticeReport {
  id: string;
  date: string;
  activities: string;
  hours: number;
  observations: string;
}

const statusLabels = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada'
};

const statusColors = {
  PENDING: 'bg-yellow-100 !text-yellow-900 font-semibold px-3 py-1.5 rounded-lg text-xs',
  IN_PROGRESS: 'bg-blue-600 !text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-sm',
  COMPLETED: 'bg-green-600 !text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-sm',
  CANCELLED: 'bg-red-600 !text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-sm'
};

export default function MisPracticasEstudiantePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [reports, setReports] = useState<{[key: string]: PracticeReport[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    date: new Date().toISOString().split('T')[0],
    activities: '',
    hours: 0,
    observations: ''
  });
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (error) {
      setShowError(true);
      
      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      
      // Set new timeout to hide error after 2 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setShowError(false);
      }, 2000);
    }
  }, [error]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchMyPractices();
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

  const fetchMyPractices = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/practices/my');
      
      if (!response.ok) {
        throw new Error('Error al cargar las prácticas');
      }
      
      const data = await response.json();
      setPractices(data);

      // Cargar reportes en paralelo para mejorar tiempos de render
      await Promise.all((data as Practice[]).map((practice) => fetchPracticeReports(practice.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchPracticeReports = async (practiceId: string) => {
    try {
      const response = await authenticatedFetch(`/api/practices/${practiceId}/reports`);
      
      if (response.ok) {
        const data = await response.json();
        setReports(prev => ({ ...prev, [practiceId]: data }));
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPractice) return;
    
    try {
      const response = await authenticatedFetch(`/api/practices/${selectedPractice}/reports`, {
        method: 'POST',
        body: JSON.stringify({
          ...reportForm,
          date: new Date(reportForm.date).toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el reporte');
      }
      
      await fetchPracticeReports(selectedPractice);
      setShowReportForm(false);
      setReportForm({
        date: new Date().toISOString().split('T')[0],
        activities: '',
        hours: 0,
        observations: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el reporte');
    }
  };

  const getTotalHours = (practiceId: string) => {
    const practiceReports = reports[practiceId] || [];
    return practiceReports.reduce((total, report) => total + report.hours, 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg !text-black">Cargando mis prácticas...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with glassmorphism effect */}
      <header className="w-full bg-blue-900 text-white py-5 px-8 flex justify-between items-center sticky top-0 z-40 shadow-lg gap-4 border-b border-blue-800">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <SafeLink href="/dashboard/estudiante" className="text-white hover:text-blue-200 flex items-center flex-shrink-0">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </SafeLink>
          <h1 className="text-lg md:text-xl font-bold truncate">SION Prácticas FTR</h1>
        </div> 
        <div className="flex-shrink-0">
          <UserDropdown />
        </div>
      </header>
      
      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4 pb-12">
        {showError && (
          <div className="relative w-full mb-6">
            <Alert type="error" className="!text-white shadow-lg font-bold text-lg rounded-xl">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button 
                  onClick={() => {
                    setShowError(false);
                    if (errorTimeoutRef.current) {
                      clearTimeout(errorTimeoutRef.current);
                    }
                  }}
                  className="ml-4 text-white hover:text-gray-200 font-bold text-xl"
                  aria-label="Cerrar alerta"
                >
                  ×
                </button>
              </div>
            </Alert>
          </div>
        )}
        
        {/* Resumen Estadístico */}
        {practices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full mb-6">
            <div className="bg-white border-l-4 border-blue-600 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold !text-slate-600 uppercase tracking-wide">Total Prácticas</p>
                  <p className="text-3xl font-bold !text-slate-900 mt-2">{practices.length}</p>
                </div>
                <div className="bg-white border-2 border-blue-600 p-3 rounded-full">
                  <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-l-4 border-green-600 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold !text-slate-600 uppercase tracking-wide">Activas</p>
                  <p className="text-3xl font-bold !text-slate-900 mt-2">
                    {practices.filter(p => p.status === 'IN_PROGRESS').length}
                  </p>
                </div>
                <div className="bg-white border-2 border-green-600 p-3 rounded-full">
                  <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-l-4 border-purple-600 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold !text-slate-600 uppercase tracking-wide">Horas Totales</p>
                  <p className="text-3xl font-bold !text-slate-900 mt-2">
                    {practices.reduce((sum, p) => sum + getTotalHours(p.id), 0)}h
                  </p>
                </div>
                <div className="bg-white border-2 border-purple-600 p-3 rounded-full">
                  <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-l-4 border-orange-600 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold !text-slate-600 uppercase tracking-wide">Total Reportes</p>
                  <p className="text-3xl font-bold !text-slate-900 mt-2">
                    {Object.values(reports).reduce((sum, arr) => sum + arr.length, 0)}
                  </p>
                </div>
                <div className="bg-white border-2 border-orange-600 p-3 rounded-full">
                  <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold !text-black flex items-center">
              <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Mis Prácticas
            </h2>
            {selectedPractice && (
              <Button 
                onClick={() => {
                  setShowReportForm(true);
                }}
                className="bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 active:bg-green-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out font-semibold shadow-md rounded-lg px-4 py-2"
              >
                Nuevo Reporte
              </Button>
            )}
          </div>
          
          {showReportForm && selectedPractice && (
            <div className="mb-6 border border-gray-200 rounded-xl bg-gray-50 p-6">
              <h3 className="text-xl font-bold mb-4 !text-black">Crear Reporte de Actividades</h3>
              <form onSubmit={handleCreateReport} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 !text-black">Fecha</label>
                  <input
                    type="date"
                    value={reportForm.date}
                    onChange={(e) => setReportForm({...reportForm, date: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg !text-black bg-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 !text-black">Horas</label>
                  <input
                    type="number"
                    value={reportForm.hours}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        hours: Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value),
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg !text-black bg-white focus:border-blue-500 focus:outline-none"
                    min="1"
                    max="12"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 !text-black">Actividades Realizadas</label>
                  <textarea
                    value={reportForm.activities}
                    onChange={(e) => setReportForm({...reportForm, activities: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg !text-black bg-white focus:border-blue-500 focus:outline-none"
                    rows={4}
                    required
                    placeholder="Describe las actividades realizadas durante esta jornada..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 !text-black">Observaciones</label>
                  <textarea
                    value={reportForm.observations}
                    onChange={(e) => setReportForm({...reportForm, observations: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg !text-black bg-white focus:border-blue-500 focus:outline-none"
                    rows={3}
                    placeholder="Observaciones adicionales, aprendizajes, dificultades..."
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:bg-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out font-semibold shadow-md rounded-lg px-4 py-2 !text-white">
                    Crear Reporte
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setShowReportForm(false)}
                    className="bg-gray-400 hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 active:bg-gray-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out font-semibold shadow-md rounded-lg px-4 py-2 !text-white"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          {practices.length === 0 ? (
              <div className="text-center py-12 bg-white border rounded-xl">
                <svg className="w-12 h-12 mx-auto mb-4 !text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 00 6.586 13H4" />
                </svg>
                <p className="!text-gray-600 text-lg">No tienes prácticas asignadas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {practices.map((practice) => {
                  const totalHours = getTotalHours(practice.id);
                  const progressPercentage = Math.min((totalHours / practice.hours) * 100, 100);
                  const practiceName = practice.name || practice.nombre || 'Práctica sin nombre';
                  const tutorName = practice.tutor?.name || practice.tutor?.nombre;
                  const teacherName = practice.teacher?.name || practice.teacher?.nombre;
                  
                  // Determine border and icon color based on status
                  const borderColorClass = {
                    PENDING: 'border-l-4 border-yellow-600',
                    IN_PROGRESS: 'border-l-4 border-blue-600',
                    COMPLETED: 'border-l-4 border-green-600',
                    CANCELLED: 'border-l-4 border-red-600'
                  }[practice.status];
                  
                  const iconBgClass = {
                    PENDING: 'bg-yellow-100 !text-yellow-600 border-yellow-600',
                    IN_PROGRESS: 'bg-blue-100 !text-blue-600 border-blue-600',
                    COMPLETED: 'bg-green-100 !text-green-600 border-green-600',
                    CANCELLED: 'bg-red-100 !text-red-600 border-red-600'
                  }[practice.status];
                  
                  return (
                    <div key={practice.id} className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${borderColorClass}`}>
                      <div className="p-6">
                        {/* Header with title and status */}
                        <div className="mb-5">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold !text-black text-lg flex-1 pr-2 leading-tight">{practiceName}</h4>
                          </div>
                          <p className="text-xs font-semibold !text-slate-600 uppercase tracking-wide">{practice.institution}</p>
                          {practice.description && (
                            <p className="text-xs !text-gray-600 mt-1">{practice.description}</p>
                          )}
                        </div>

                        {/* Status badge */}
                        <div className="mb-5 flex items-center">
                          <span className={`inline-block transition-all duration-200 ${statusColors[practice.status]}`}>
                            {statusLabels[practice.status]}
                          </span>
                        </div>

                        {/* Progress bar and hours */}
                        <div className="mb-5">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="!text-black font-medium">{totalHours}h / {practice.hours}h</span>
                            <span className="!text-slate-600 font-medium">{Math.round(progressPercentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Dates and supervisors */}
                        <div className="mb-5 pb-5 border-b border-gray-200">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="!text-slate-600 font-medium uppercase tracking-wide mb-1">Inicio</p>
                              <p className="!text-black">{new Date(practice.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="!text-slate-600 font-medium uppercase tracking-wide mb-1">Fin</p>
                              <p className="!text-black">{new Date(practice.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {(tutorName || teacherName) && (
                            <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                              {tutorName && (
                                <div>
                                  <p className="!text-slate-600 font-medium uppercase tracking-wide mb-1">Tutor</p>
                                  <p className="!text-black truncate">{tutorName}</p>
                                </div>
                              )}
                              {teacherName && (
                                <div>
                                  <p className="!text-slate-600 font-medium uppercase tracking-wide mb-1">Docente</p>
                                  <p className="!text-black truncate">{teacherName}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              setSelectedPractice(practice.id);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:bg-blue-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out text-xs px-3 py-2 font-semibold shadow-sm rounded-md !text-white"
                          >
                            Ver
                          </Button>
                          {practice.status === 'IN_PROGRESS' && (
                            <Button 
                              onClick={() => {
                                setSelectedPractice(practice.id);
                                setShowReportForm(true);
                              }}
                              className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 active:bg-green-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out text-xs px-3 py-2 font-semibold shadow-sm rounded-md !text-white"
                            >
                              Reportar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          
          {selectedPractice && reports[selectedPractice] && reports[selectedPractice].length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 !text-black flex items-center">
                <svg className="w-5 h-5 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reportes de Actividades
              </h3>
              <div className="grid gap-4">
                {reports[selectedPractice].map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-semibold !text-black text-sm">
                        {new Date(report.date).toLocaleDateString()} - <span className="text-blue-600">{report.hours} horas</span>
                      </div>
                    </div>
                    <div className="text-sm !text-gray-700 mb-3">
                      <strong className="block mb-1 !text-black">Actividades:</strong> {report.activities}
                    </div>
                    {report.observations && (
                      <div className="text-sm !text-gray-700">
                        <strong className="block mb-1 !text-black">Observaciones:</strong> {report.observations}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}