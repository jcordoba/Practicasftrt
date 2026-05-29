import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SafeLink from "@/components/SafeLink";
import UserDropdown from "../../../components/UserDropdown";

interface Evidence {
  id: string;
  studentName: string;
  studentCode: string;
  practiceType: string;
  reportDate: string;
  activities: string;
  hours: number;
  observations: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export default function ValidarEvidencias() {
  const router = useRouter();
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [validationComment, setValidationComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchEvidences();
  }, []);

  const fetchEvidences = async () => {
    try {
      setLoading(true);
      // Simular datos por ahora
      setTimeout(() => {
        setEvidences([
          {
            id: '1',
            studentName: 'Juan Pérez',
            studentCode: '12345',
            practiceType: 'Práctica Pastoral I',
            reportDate: '2024-01-15',
            activities: 'Participación en culto dominical, apoyo en ministerio de niños, visitas pastorales',
            hours: 8,
            observations: 'Excelente participación y compromiso con las actividades asignadas',
            status: 'pending',
            submittedAt: '2024-01-16T10:30:00Z'
          },
          {
            id: '2',
            studentName: 'María García',
            studentCode: '23456',
            practiceType: 'Práctica Pastoral II',
            reportDate: '2024-01-14',
            activities: 'Predicación en servicio vespertino, consejería pastoral, organización de eventos',
            hours: 10,
            observations: 'Demostró liderazgo y capacidad de organización',
            status: 'pending',
            submittedAt: '2024-01-15T14:20:00Z'
          },
          {
            id: '3',
            studentName: 'Carlos López',
            studentCode: '34567',
            practiceType: 'Práctica Pastoral I',
            reportDate: '2024-01-13',
            activities: 'Apoyo en ministerio de jóvenes, preparación de material didáctico',
            hours: 6,
            observations: 'Buen desempeño en actividades juveniles',
            status: 'approved',
            submittedAt: '2024-01-14T09:15:00Z'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching evidences:', error);
      setLoading(false);
    }
  };

  const handleValidation = async (evidenceId: string, status: 'approved' | 'rejected') => {
    try {
      // Aquí iría la llamada a la API para validar la evidencia
      setEvidences(prev => 
        prev.map(evidence => 
          evidence.id === evidenceId 
            ? { ...evidence, status }
            : evidence
        )
      );
      setSelectedEvidence(null);
      setValidationComment('');
      alert(`Evidencia ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`);
    } catch (error) {
      console.error('Error validating evidence:', error);
      alert('Error al validar la evidencia');
    }
  };

  const filteredEvidences = evidences.filter(evidence => {
    if (filter === 'all') return true;
    return evidence.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 !text-white';
      case 'approved': return 'bg-green-100 !text-white';
      case 'rejected': return 'bg-red-100 !text-white';
      default: return 'bg-gray-100 !text-slate-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return 'Desconocido';
    }
  };

  // Restore the loading check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium !text-black">Cargando evidencias...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with glassmorphism effect */}
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/iglesia" className="text-white hover:text-blue-200 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </SafeLink>
          <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        </div>
        <UserDropdown />
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="p-6">
            <h3 className="text-xl font-bold !text-black mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'all' 
                    ? 'bg-blue-100 !text-white border border-blue-200 shadow-sm' 
                    : 'bg-gray-100 !text-black hover:bg-gray-200'
                }`}
              >
                Todas ({evidences.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'pending' 
                    ? 'bg-yellow-100 !text-white border border-yellow-200 shadow-sm' 
                    : 'bg-gray-100 !text-black hover:bg-gray-200'
                }`}
              >
                Pendientes ({evidences.filter(e => e.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'approved' 
                    ? 'bg-green-100 !text-white border border-green-200 shadow-sm' 
                    : 'bg-gray-100 !text-black hover:bg-gray-200'
                }`}
              >
                Aprobadas ({evidences.filter(e => e.status === 'approved').length})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'rejected' 
                    ? 'bg-red-100 !text-white border border-red-200 shadow-sm' 
                    : 'bg-gray-100 !text-black hover:bg-gray-200'
                }`}
              >
                Rechazadas ({evidences.filter(e => e.status === 'rejected').length})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Evidencias */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold !text-black flex items-center">
              <svg className="w-5 h-5 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Evidencias de Práctica
            </h3>
          </div>
          <div className="p-6">
            {filteredEvidences.length > 0 ? (
              <div className="space-y-4">
                {filteredEvidences.map((evidence) => (
                  <div key={evidence.id} className="border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h4 className="text-lg font-bold !text-black">
                            {evidence.studentName}
                          </h4>
                          <span className="text-sm !text-gray-600">
                            {evidence.studentCode}
                          </span>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(evidence.status)}`}>
                            {getStatusText(evidence.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium !text-gray-500">Tipo de Práctica:</p>
                            <p className="text-sm !text-black">{evidence.practiceType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium !text-gray-500">Fecha del Reporte:</p>
                            <p className="text-sm !text-black">{evidence.reportDate}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium !text-gray-500">Horas:</p>
                            <p className="text-sm !text-black">{evidence.hours} horas</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium !text-gray-500">Enviado:</p>
                            <p className="text-sm !text-black">
                              {new Date(evidence.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-medium !text-gray-500 mb-1">Actividades:</p>
                          <p className="text-sm !text-black">{evidence.activities}</p>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-medium !text-gray-500 mb-1">Observaciones:</p>
                          <p className="text-sm !text-black">{evidence.observations}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedEvidence(evidence)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                          Ver Detalles
                        </button>
                        {evidence.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleValidation(evidence.id, 'approved')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleValidation(evidence.id, 'rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 !text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="!text-black font-medium">No hay evidencias para mostrar</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Detalles */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold !text-black">
                  Detalles de Evidencia - {selectedEvidence.studentName}
                </h3>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="!text-gray-500 hover:!text-gray-700 text-xl font-bold"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium !text-gray-500 mb-1">Estudiante</label>
                    <p className="text-sm !text-black font-medium">{selectedEvidence.studentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-gray-500 mb-1">Código</label>
                    <p className="text-sm !text-black font-medium">{selectedEvidence.studentCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-gray-500 mb-1">Tipo de Práctica</label>
                    <p className="text-sm !text-black font-medium">{selectedEvidence.practiceType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-gray-500 mb-1">Fecha del Reporte</label>
                    <p className="text-sm !text-black font-medium">{selectedEvidence.reportDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-gray-500 mb-1">Horas</label>
                    <p className="text-sm !text-black font-medium">{selectedEvidence.hours} horas</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-gray-500 mb-1">Estado</label>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(selectedEvidence.status)}`}>
                      {getStatusText(selectedEvidence.status)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium !text-gray-500 mb-2">Actividades Realizadas</label>
                  <p className="text-sm !text-black bg-gray-50 p-4 rounded-lg">{selectedEvidence.activities}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium !text-gray-500 mb-2">Observaciones</label>
                  <p className="text-sm !text-black bg-gray-50 p-4 rounded-lg">{selectedEvidence.observations}</p>
                </div>
                
                {selectedEvidence.status === 'pending' && (
                  <div>
                    <label className="block text-sm font-medium !text-gray-500 mb-2">Comentario de Validación</label>
                    <textarea
                      value={validationComment}
                      onChange={(e) => setValidationComment(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm !text-black bg-white"
                      rows={3}
                      placeholder="Agregar comentarios sobre la validación..."
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg !text-black hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  Cerrar
                </button>
                {selectedEvidence.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleValidation(selectedEvidence.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleValidation(selectedEvidence.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      Aprobar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}