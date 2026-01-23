import React, { useState, useEffect, useRef } from "react";
import Button from "../../../components/Button";
import Alert from "../../../components/Alert";
import { useAuth, useAuthenticatedFetch } from "../../../contexts/AuthContext";
import SafeLink from "@/components/SafeLink";
import UserDropdown from "../../../components/UserDropdown";

interface Practice {
  id: string;
  name: string;
  description: string;
  institution: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  hours: number;
  tutor?: {
    id: string;
    name: string;
    email: string;
  };
  teacher?: {
    id: string;
    name: string;
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
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
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
      
      // Cargar reportes para cada práctica
      for (const practice of data) {
        await fetchPracticeReports(practice.id);
      }
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
      <header className="w-full bg-blue-900 bg-opacity-90 backdrop-blur-lg text-white py-4 px-6 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/estudiante" className="text-white hover:text-blue-200 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </SafeLink>
          <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        </div> 
        <UserDropdown />
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
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Total Prácticas</p>
                  <p className="text-3xl font-bold mt-1">{practices.length}</p>
                </div>
                <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Activas</p>
                  <p className="text-3xl font-bold mt-1">
                    {practices.filter(p => p.status === 'IN_PROGRESS').length}
                  </p>
                </div>
                <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Horas Totales</p>
                  <p className="text-3xl font-bold mt-1">
                    {practices.reduce((sum, p) => sum + getTotalHours(p.id), 0)}h
                  </p>
                </div>
                <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Total Reportes</p>
                  <p className="text-3xl font-bold mt-1">
                    {Object.values(reports).reduce((sum, arr) => sum + arr.length, 0)}
                  </p>
                </div>
                <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
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
            <div className="mb-6 p-6 border rounded-2xl bg-gray-50">
              <h3 className="text-xl font-bold mb-4 !text-black">Crear Reporte de Actividades</h3>
              <form onSubmit={handleCreateReport} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 !text-black">Fecha</label>
                  <input
                    type="date"
                    value={reportForm.date}
                    onChange={(e) => setReportForm({...reportForm, date: e.target.value})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-black">Horas</label>
                  <input
                    type="number"
                    value={reportForm.hours}
                    onChange={(e) => setReportForm({...reportForm, hours: parseInt(e.target.value)})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    min="1"
                    max="12"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 !text-black">Actividades Realizadas</label>
                  <textarea
                    value={reportForm.activities}
                    onChange={(e) => setReportForm({...reportForm, activities: e.target.value})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    rows={4}
                    required
                    placeholder="Describe las actividades realizadas durante esta jornada..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 !text-black">Observaciones</label>
                  <textarea
                    value={reportForm.observations}
                    onChange={(e) => setReportForm({...reportForm, observations: e.target.value})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    rows={3}
                    placeholder="Observaciones adicionales, aprendizajes, dificultades..."
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:bg-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out font-semibold shadow-md rounded-lg px-4 py-2">
                    Crear Reporte
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setShowReportForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 active:bg-gray-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out font-semibold shadow-md rounded-lg px-4 py-2"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 !text-black font-bold text-base">Práctica</th>
                  <th className="py-4 px-6 !text-black font-bold text-base">Institución</th>
                  <th className="py-4 px-6 !text-black font-bold text-base">Estado</th>
                  <th className="py-4 px-6 !text-black font-bold text-base">Progreso</th>
                  <th className="py-4 px-6 !text-black font-bold text-base">Fechas</th>
                  <th className="py-4 px-6 !text-black font-bold text-base">Supervisores</th>
                  <th className="py-4 px-6 !text-black font-bold text-base">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {practices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 !text-black">
                      No tienes prácticas asignadas
                    </td>
                  </tr>
                ) : (
                  practices.map((practice) => {
                    const totalHours = getTotalHours(practice.id);
                    const progressPercentage = Math.min((totalHours / practice.hours) * 100, 100);
                    
                    return (
                      <tr key={practice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-bold !text-black">{practice.name}</div>
                            <div className="text-sm !text-gray-600">{practice.description}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 !text-black">{practice.institution}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[practice.status]}`}>
                            {statusLabels[practice.status]}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="w-full">
                            <div className="flex justify-between text-sm mb-1 !text-black">
                              <span>{totalHours}h / {practice.hours}h</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm !text-black">
                            <div>Inicio: {new Date(practice.startDate).toLocaleDateString()}</div>
                            <div>Fin: {new Date(practice.endDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm !text-black">
                            {practice.tutor && (
                              <div>Tutor: {practice.tutor.name}</div>
                            )}
                            {practice.teacher && (
                              <div>Docente: {practice.teacher.name}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => {
                                setSelectedPractice(practice.id);
                                // Aquí podrías abrir un modal con detalles
                              }}
                              className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:bg-blue-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out text-xs px-3 py-1.5 font-semibold shadow-sm rounded-md"
                              aria-label={`Ver detalles de ${practice.name}`}
                            >
                              Ver
                            </Button>
                            {practice.status === 'IN_PROGRESS' && (
                              <Button 
                                onClick={() => {
                                  setSelectedPractice(practice.id);
                                  setShowReportForm(true);
                                }}
                                className="bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 active:bg-green-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out text-xs px-3 py-1.5 font-semibold shadow-sm rounded-md"
                              >
                                Reportar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
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
                  <div key={report.id} className="border rounded-xl p-5 bg-gray-50 hover:bg-gray-100 transition-colors duration-150">
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-bold !text-black">
                        {new Date(report.date).toLocaleDateString()} - {report.hours} horas
                      </div>
                    </div>
                    <div className="text-base !text-black mb-3">
                      <strong className="block mb-1">Actividades:</strong> {report.activities}
                    </div>
                    {report.observations && (
                      <div className="text-base !text-black">
                        <strong className="block mb-1">Observaciones:</strong> {report.observations}
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