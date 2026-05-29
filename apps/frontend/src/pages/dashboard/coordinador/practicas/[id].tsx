import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth, useAuthenticatedFetch } from "../../../../contexts/AuthContext";
import SafeLink from "../../../../components/SafeLink";
import UserDropdown from "../../../../components/UserDropdown";
import Button from "../../../../components/Button";
import StatusDropdown from "../../../../components/StatusDropdown";

interface Practice {
  id: string;
  name: string;
  description: string;
  institution: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  hours: number;
  studentId?: string;
  tutorId?: string;
  teacherId?: string;
  student?: {
    id: string;
    nombre?: string;
    name?: string;
    email: string;
  };
  tutor?: {
    id: string;
    nombre?: string;
    name?: string;
    email: string;
  };
  teacher?: {
    id: string;
    nombre?: string;
    name?: string;
    email: string;
  };
}

const statusLabels = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada'
};

const statusColors = {
  PENDING: 'bg-yellow-100 !text-slate-900 border-yellow-200',
  IN_PROGRESS: 'bg-green-100 !text-slate-900 border-green-200',
  COMPLETED: 'bg-blue-100 !text-slate-900 border-blue-200',
  CANCELLED: 'bg-red-100 !text-slate-900 border-red-200'
};

const statusOptions = [
  { value: 'PENDING', label: 'Pendiente', triggerClass: statusColors.PENDING, dotClass: 'bg-yellow-500' },
  { value: 'IN_PROGRESS', label: 'En Progreso', triggerClass: statusColors.IN_PROGRESS, dotClass: 'bg-green-600' },
  { value: 'COMPLETED', label: 'Completada', triggerClass: statusColors.COMPLETED, dotClass: 'bg-blue-600' },
  { value: 'CANCELLED', label: 'Cancelada', triggerClass: statusColors.CANCELLED, dotClass: 'bg-red-600' }
];

export default function PracticeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  
  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    tutorId: '',
    teacherId: '',
  });
  const [savingAssignments, setSavingAssignments] = useState(false);
  const [assignmentFeedback, setAssignmentFeedback] = useState<string | null>(null);

  const getDisplayName = (user?: { nombre?: string; name?: string }) => {
    if (!user) return '';
    return user.nombre || user.name || '';
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && id) {
      fetchPractice();
    }
  }, [authLoading, isAuthenticated, id]);

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

  const fetchPractice = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`/api/practices/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar la práctica');
      }
      
      const data = await response.json();
      setPractice(data);
      setAssignmentForm({
        tutorId: data.tutorId || '',
        teacherId: data.teacherId || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentsSave = async () => {
    if (!practice) return;

    try {
      setSavingAssignments(true);
      setAssignmentFeedback(null);

      const response = await authenticatedFetch(`/api/practices/${practice.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          tutorId: assignmentForm.tutorId,
          teacherId: assignmentForm.teacherId,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar Tutor y Docente');
      }

      await fetchPractice();
      setAssignmentFeedback('Tutor y Docente actualizados correctamente.');
    } catch (err) {
      setAssignmentFeedback(err instanceof Error ? err.message : 'Error al actualizar participantes');
    } finally {
      setSavingAssignments(false);
    }
  };

  const handleStatusChange = async (newStatus: Practice['status']) => {
    if (!practice) return;
    
    try {
      const response = await authenticatedFetch(`/api/practices/${practice.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }
      
      await fetchPractice();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-lg !text-black">Cargando práctica...</div>
      </div>
    );
  }

  if (error || !practice) {
    return (
      <div className="min-h-screen bg-slate-100">
        <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            <SafeLink href="/dashboard/coordinador/practicas" className="text-white hover:text-blue-200 transition flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </SafeLink>
          </div>
          <UserDropdown />
        </header>
        <main className="max-w-7xl mx-auto py-6 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Práctica no encontrada'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/coordinador/practicas" className="text-white hover:text-blue-200 transition flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </SafeLink>
          <h1 className="text-2xl font-bold !text-white">Detalle de Práctica</h1>
        </div>
        <UserDropdown />
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Información Principal */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold !text-slate-900 mb-2">{practice.name}</h2>
              <p className="!text-slate-600 text-lg">{practice.description}</p>
            </div>
            <StatusDropdown
              value={practice.status}
              onChange={(newStatus) => handleStatusChange(newStatus as Practice['status'])}
              options={statusOptions}
              size="md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Institución */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-sm font-semibold !text-slate-600 uppercase mb-2">Institución</h3>
              <p className="!text-slate-900 text-lg font-medium">{practice.institution}</p>
            </div>

            {/* Horas */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-sm font-semibold !text-slate-600 uppercase mb-2">Horas Requeridas</h3>
              <p className="!text-slate-900 text-lg font-medium">{practice.hours} horas</p>
            </div>

            {/* Fecha de Inicio */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-sm font-semibold !text-slate-600 uppercase mb-2">Fecha de Inicio</h3>
              <p className="!text-slate-900 text-lg font-medium">
                {new Date(practice.startDate).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Fecha de Fin */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-sm font-semibold !text-slate-600 uppercase mb-2">Fecha de Fin</h3>
              <p className="!text-slate-900 text-lg font-medium">
                {new Date(practice.endDate).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Participantes */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold !text-slate-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Participantes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Estudiante */}
            <div className="border rounded-lg p-6 bg-blue-50 border-blue-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white rounded-full p-3 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold !text-slate-900">Estudiante</h3>
              </div>
              {practice.student ? (
                <div>
                  <p className="!text-slate-900 font-medium">{getDisplayName(practice.student)}</p>
                  <p className="!text-slate-600 text-sm mt-1">{practice.student.email}</p>
                </div>
              ) : (
                <div>
                  <p className="!text-slate-600 italic">Sin asignar</p>
                  {practice.studentId && (
                    <p className="!text-slate-500 text-xs mt-1">ID asignado: {practice.studentId}</p>
                  )}
                </div>
              )}
            </div>

            {/* Tutor */}
            <div className="border rounded-lg p-6 bg-green-50 border-green-200">
              <div className="flex items-center mb-4">
                <div className="bg-green-600 text-white rounded-full p-3 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold !text-slate-900">Tutor</h3>
              </div>
              {practice.tutor ? (
                <div>
                  <p className="!text-slate-900 font-medium">{getDisplayName(practice.tutor)}</p>
                  <p className="!text-slate-600 text-sm mt-1">{practice.tutor.email}</p>
                </div>
              ) : (
                <div>
                  <p className="!text-slate-600 italic">Sin asignar</p>
                  {practice.tutorId && (
                    <p className="!text-slate-500 text-xs mt-1">ID asignado: {practice.tutorId}</p>
                  )}
                </div>
              )}
            </div>

            {/* Docente */}
            <div className="border rounded-lg p-6 bg-purple-50 border-purple-200">
              <div className="flex items-center mb-4">
                <div className="bg-purple-600 text-white rounded-full p-3 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold !text-slate-900">Docente</h3>
              </div>
              {practice.teacher ? (
                <div>
                  <p className="!text-slate-900 font-medium">{getDisplayName(practice.teacher)}</p>
                  <p className="!text-slate-600 text-sm mt-1">{practice.teacher.email}</p>
                </div>
              ) : (
                <div>
                  <p className="!text-slate-600 italic">Sin asignar</p>
                  {practice.teacherId && (
                    <p className="!text-slate-500 text-xs mt-1">ID asignado: {practice.teacherId}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold !text-slate-900 mb-4">Asignación rápida de Tutor y Docente</h3>

            {assignmentFeedback && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 !text-blue-800 font-medium">
                {assignmentFeedback}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold !text-slate-700 mb-2">ID Tutor</label>
                <input
                  type="text"
                  value={assignmentForm.tutorId}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, tutorId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 !text-slate-900 focus:ring-2 focus:ring-green-500"
                  placeholder="Ingrese ID de usuario tutor"
                />
                <p className="text-xs !text-slate-500 mt-1">Dejar vacío para quitar asignación.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold !text-slate-700 mb-2">ID Docente</label>
                <input
                  type="text"
                  value={assignmentForm.teacherId}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, teacherId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 !text-slate-900 focus:ring-2 focus:ring-purple-500"
                  placeholder="Ingrese ID de usuario docente"
                />
                <p className="text-xs !text-slate-500 mt-1">Dejar vacío para quitar asignación.</p>
              </div>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleAssignmentsSave}
                disabled={savingAssignments}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-60"
              >
                {savingAssignments ? 'Guardando...' : 'Guardar asignación'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
