import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg !text-slate-900">Cargando evidencias...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-white hover:text-slate-300"
          >
            ← Volver
          </button>
          <h1 className="text-xl font-bold">Validar Evidencias</h1>
        </div>
        <div className="flex items-center gap-2">
          <span>Iglesia</span>
          <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">I</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 !text-slate-900 hover:bg-gray-300'
                }`}
              >
                Todas ({evidences.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'pending' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-200 !text-slate-800 hover:bg-gray-300'
                }`}
              >
                Pendientes ({evidences.filter(e => e.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'approved' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 !text-slate-800 hover:bg-gray-300'
                }`}
              >
                Aprobadas ({evidences.filter(e => e.status === 'approved').length})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'rejected' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Rechazadas ({evidences.filter(e => e.status === 'rejected').length})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Evidencias */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium !text-slate-900">Evidencias de Práctica</h3>
          </div>
          <div className="p-6">
            {filteredEvidences.length > 0 ? (
              <div className="space-y-4">
                {filteredEvidences.map((evidence) => (
                  <div key={evidence.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h4 className="text-lg font-medium !text-slate-900">
                            {evidence.studentName}
                          </h4>
                          <span className="text-sm !text-slate-800">
                            {evidence.studentCode}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(evidence.status)}`}>
                            {getStatusText(evidence.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium !text-slate-800">Tipo de Práctica:</p>
                            <p className="text-sm !text-slate-800">{evidence.practiceType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium !text-slate-800">Fecha del Reporte:</p>
                            <p className="text-sm !text-slate-800">{evidence.reportDate}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium !text-slate-800">Horas:</p>
                            <p className="text-sm !text-slate-800">{evidence.hours} horas</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium !text-slate-800">Enviado:</p>
                            <p className="text-sm !text-slate-800">
                              {new Date(evidence.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-medium !text-slate-800 mb-1">Actividades:</p>
                          <p className="text-sm !text-slate-800">{evidence.activities}</p>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-medium !text-slate-800 mb-1">Observaciones:</p>
                          <p className="text-sm !text-slate-800">{evidence.observations}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => setSelectedEvidence(evidence)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Ver Detalles
                        </button>
                        {evidence.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleValidation(evidence.id, 'approved')}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleValidation(evidence.id, 'rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
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
              <div className="text-center py-8">
                <p className="!text-slate-800">No hay evidencias para mostrar</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Detalles */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium !text-slate-900">
                  Detalles de Evidencia - {selectedEvidence.studentName}
                </h3>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="!text-slate-600 hover:!text-slate-800"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium !text-slate-800">Estudiante</label>
                <p className="text-sm !text-slate-900">{selectedEvidence.studentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800">Código</label>
                <p className="text-sm !text-slate-900">{selectedEvidence.studentCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800">Tipo de Práctica</label>
                <p className="text-sm !text-slate-900">{selectedEvidence.practiceType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800">Fecha del Reporte</label>
                <p className="text-sm !text-slate-900">{selectedEvidence.reportDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800">Horas</label>
                <p className="text-sm !text-slate-900">{selectedEvidence.hours} horas</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800">Estado</label>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedEvidence.status)}`}>
                      {getStatusText(selectedEvidence.status)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium !text-slate-800 mb-2">Actividades Realizadas</label>
                <p className="text-sm !text-slate-900 bg-gray-50 p-3 rounded-md">{selectedEvidence.activities}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium !text-slate-800 mb-2">Observaciones</label>
                <p className="text-sm !text-slate-900 bg-gray-50 p-3 rounded-md">{selectedEvidence.observations}</p>
                </div>
                
                {selectedEvidence.status === 'pending' && (
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-2">Comentario de Validación</label>
                    <textarea
                      value={validationComment}
                      onChange={(e) => setValidationComment(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Agregar comentarios sobre la validación..."
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md !text-slate-800 hover:bg-gray-50"
                >
                  Cerrar
                </button>
                {selectedEvidence.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleValidation(selectedEvidence.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleValidation(selectedEvidence.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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