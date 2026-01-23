// apps/frontend/src/pages/dashboard/docente/validar-reportes.tsx
import React, { useState, useEffect } from 'react';
import { useAuth, useAuthenticatedFetch } from '../../../contexts/AuthContext';
import UserDropdown from '../../../components/UserDropdown';
import SafeLink from '../../../components/SafeLink';
import Button from '../../../components/Button';

interface Practice {
  id: string;
  name: string;
  institution: string;
  student: {
    id: string;
    nombre: string;
    correo: string;
  };
}

interface Report {
  id: string;
  date: string;
  activities: string;
  hours: number;
  observations: string;
  practice: Practice;
  createdAt: string;
}

export default function ValidarReportesDocente() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchReports();
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

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/practices');
      
      if (!response.ok) {
        throw new Error('Error al cargar prácticas');
      }
      
      const practices = await response.json();
      
      // Obtener todos los reportes de todas las prácticas
      const allReports: Report[] = [];
      for (const practice of practices) {
        const reportsResponse = await authenticatedFetch(`/api/practices/${practice.id}/reports`);
        if (reportsResponse.ok) {
          const practiceReports = await reportsResponse.json();
          allReports.push(...practiceReports.map((r: any) => ({
            ...r,
            practice
          })));
        }
      }
      
      // Ordenar por fecha más reciente
      allReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReports(allReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg !text-black">Cargando reportes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="w-full bg-blue-900 bg-opacity-90 backdrop-blur-lg text-white py-4 px-6 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/coordinador" className="text-white hover:text-blue-200 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </SafeLink>
          <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        </div>
        <UserDropdown />
      </header>

      <main className="flex flex-col items-center w-full max-w-7xl mt-8 px-4 pb-12">
        {/* Resumen Estadístico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
          <div className="bg-white border-l-4 border-blue-600 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold !text-slate-600 uppercase tracking-wide">Total Reportes</p>
                <p className="text-3xl font-bold !text-slate-900 mt-2">{reports.length}</p>
              </div>
              <div className="bg-white border-2 border-blue-600 p-3 rounded-full">
                <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border-l-4 border-green-600 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold !text-slate-600 uppercase tracking-wide">Total Horas</p>
                <p className="text-3xl font-bold !text-slate-900 mt-2">
                  {reports.reduce((sum, r) => sum + r.hours, 0)} hrs
                </p>
              </div>
              <div className="bg-white border-2 border-green-600 p-3 rounded-full">
                <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border-l-4 border-yellow-500 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold !text-slate-600 uppercase tracking-wide">Esta Semana</p>
                <p className="text-3xl font-bold !text-slate-900 mt-2">
                  {reports.filter(r => {
                    const reportDate = new Date(r.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return reportDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <div className="bg-white border-2 border-yellow-500 p-3 rounded-full">
                <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
          <h2 className="text-2xl font-bold !text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Reportes de Estudiantes
          </h2>

          {reports.length === 0 ? (
            <div className="text-center py-12 !text-gray-600">
              <svg className="w-16 h-16 mx-auto mb-4 !text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No hay reportes disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold !text-black">{report.practice.student.nombre}</h3>
                      <p className="text-sm !text-gray-600">{report.practice.student.correo}</p>
                      <p className="text-sm !text-gray-600 mt-1">{report.practice.name}</p>
                      <p className="text-xs !text-gray-500 mt-1">{report.practice.institution}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                        {report.hours}h
                      </div>
                      <p className="text-xs !text-gray-500">
                        {new Date(report.date).toLocaleDateString('es-ES', { 
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-semibold !text-gray-700 mb-1">Actividades:</p>
                    <p className="text-sm !text-gray-800">{report.activities}</p>
                  </div>

                  {report.observations && (
                    <div>
                      <p className="text-sm font-semibold !text-gray-700 mb-1">Observaciones:</p>
                      <p className="text-sm !text-gray-800">{report.observations}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-xs !text-gray-500">
                      Reportado: {new Date(report.createdAt).toLocaleString('es-ES')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de detalle (opcional, para futuras mejoras) */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold !text-black">Detalle del Reporte</h2>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold !text-gray-700">Estudiante</label>
                <p className="text-base !text-black">{selectedReport.practice.student.nombre}</p>
                <p className="text-sm !text-gray-600">{selectedReport.practice.student.correo}</p>
              </div>

              <div>
                <label className="text-sm font-semibold !text-gray-700">Práctica</label>
                <p className="text-base !text-black">{selectedReport.practice.name}</p>
                <p className="text-sm !text-gray-600">{selectedReport.practice.institution}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold !text-gray-700">Fecha</label>
                  <p className="text-base !text-black">
                    {new Date(selectedReport.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold !text-gray-700">Horas</label>
                  <p className="text-base !text-black">{selectedReport.hours} horas</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold !text-gray-700">Actividades Realizadas</label>
                <p className="text-base !text-black whitespace-pre-wrap">{selectedReport.activities}</p>
              </div>

              {selectedReport.observations && (
                <div>
                  <label className="text-sm font-semibold !text-gray-700">Observaciones</label>
                  <p className="text-base !text-black whitespace-pre-wrap">{selectedReport.observations}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm !text-gray-500">
                  Reportado el {new Date(selectedReport.createdAt).toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => setSelectedReport(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
