import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import Alert from "../../../components/Alert";
import { useAuth, useAuthenticatedFetch } from "../../../contexts/AuthContext";

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
  const [selectedPractice, setSelectedPractice] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    date: new Date().toISOString().split('T')[0],
    activities: '',
    hours: 0,
    observations: ''
  });

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
          <p className="mt-4 text-gray-600">Cargando...</p>
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
      <div className="flex flex-col items-center min-h-screen bg-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg !text-slate-900">Cargando mis prácticas...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-100">
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold !text-white">SION Prácticas FTR</h1>
        <div className="flex items-center gap-2">
          <span>Estudiante</span>
          <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">E</span>
        </div>
      </header>
      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4">
        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        <div className="bg-white rounded-lg shadow p-6 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold !text-slate-900">Mis Prácticas</h2>
            {selectedPractice && (
              <Button 
                onClick={() => {
                  setShowReportForm(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Nuevo Reporte
              </Button>
            )}
          </div>
          
          {showReportForm && selectedPractice && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-md font-semibold mb-4 !text-slate-900">Crear Reporte de Actividades</h3>
              <form onSubmit={handleCreateReport} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 !text-slate-800">Fecha</label>
                  <input
                    type="date"
                    value={reportForm.date}
                    onChange={(e) => setReportForm({...reportForm, date: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-slate-800">Horas</label>
                  <input
                    type="number"
                    value={reportForm.hours}
                    onChange={(e) => setReportForm({...reportForm, hours: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="12"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 !text-slate-800">Actividades Realizadas</label>
                  <textarea
                    value={reportForm.activities}
                    onChange={(e) => setReportForm({...reportForm, activities: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows={4}
                    required
                    placeholder="Describe las actividades realizadas durante esta jornada..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 !text-slate-800">Observaciones</label>
                  <textarea
                    value={reportForm.observations}
                    onChange={(e) => setReportForm({...reportForm, observations: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Observaciones adicionales, aprendizajes, dificultades..."
                  />
                </div>
                <div className="col-span-2 flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Crear Reporte
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setShowReportForm(false)}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left" role="table">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 !text-slate-800">Práctica</th>
                  <th className="pb-2 !text-slate-800">Institución</th>
                  <th className="pb-2 !text-slate-800">Estado</th>
                  <th className="pb-2 !text-slate-800">Progreso</th>
                  <th className="pb-2 !text-slate-800">Fechas</th>
                  <th className="pb-2 !text-slate-800">Supervisores</th>
                  <th className="pb-2 !text-slate-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {practices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 !text-slate-800">
                      No tienes prácticas asignadas
                    </td>
                  </tr>
                ) : (
                  practices.map((practice) => {
                    const totalHours = getTotalHours(practice.id);
                    const progressPercentage = Math.min((totalHours / practice.hours) * 100, 100);
                    
                    return (
                      <tr key={practice.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <div className="font-medium !text-slate-900">{practice.name}</div>
                            <div className="text-sm !text-slate-800">{practice.description}</div>
                          </div>
                        </td>
                        <td className="py-3 !text-slate-900">{practice.institution}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[practice.status]}`}>
                            {statusLabels[practice.status]}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="w-full">
                            <div className="flex justify-between text-sm mb-1 !text-slate-900">
                              <span>{totalHours}h / {practice.hours}h</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="text-sm !text-slate-900">
                            <div>Inicio: {new Date(practice.startDate).toLocaleDateString()}</div>
                            <div>Fin: {new Date(practice.endDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="text-sm !text-slate-900">
                            {practice.tutor && (
                              <div>Tutor: {practice.tutor.name}</div>
                            )}
                            {practice.teacher && (
                              <div>Docente: {practice.teacher.name}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => {
                                setSelectedPractice(practice.id);
                                // Aquí podrías abrir un modal con detalles
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1"
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
                                className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
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
              <h3 className="text-lg font-semibold mb-4 !text-slate-900">Reportes de Actividades</h3>
              <div className="grid gap-4">
                {reports[selectedPractice].map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium !text-slate-900">
                        {new Date(report.date).toLocaleDateString()} - {report.hours} horas
                      </div>
                    </div>
                    <div className="text-sm !text-slate-900 mb-2">
                      <strong>Actividades:</strong> {report.activities}
                    </div>
                    {report.observations && (
                      <div className="text-sm !text-slate-900">
                        <strong>Observaciones:</strong> {report.observations}
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