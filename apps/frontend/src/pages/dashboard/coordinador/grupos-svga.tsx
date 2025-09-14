import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SafeLink from '../../../components/SafeLink';
import { useAuth, useAuthenticatedFetch } from '../../../contexts/AuthContext';

// Interfaces para el sistema SVGA
interface Student {
  id: string;
  name: string;
  code: string;
  email: string;
  corte1?: number;
  corte2?: number;
  corte3?: number;
  notaFinal?: number;
  estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO';
  horasCompletadas: number;
  horasRequeridas: number;
}

interface Group {
  id: string;
  name: string;
  semester: string;
  teacher: {
    id: string;
    name: string;
  };
  students: Student[];
  practiceCenter: string;
  active: boolean;
  createdAt: string;
}

interface GradeStats {
  totalStudents: number;
  approvedStudents: number;
  failedStudents: number;
  averageGrade: number;
  pendingGrades: number;
}

export default function GruposSVGA() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [gradeStats, setGradeStats] = useState<GradeStats>({
    totalStudents: 0,
    approvedStudents: 0,
    failedStudents: 0,
    averageGrade: 0,
    pendingGrades: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grupos' | 'calificaciones' | 'reportes'>('grupos');
  const [editingGrades, setEditingGrades] = useState<{[key: string]: any}>({});
  const [semester, setSemester] = useState('2025-1');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchGroups();
    }
  }, [authLoading, isAuthenticated, semester]);

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

  useEffect(() => {
    if (selectedGroup) {
      calculateGradeStats(selectedGroup);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      const response = await authenticatedFetch(`/api/groups/teacher/${userId}?semester=${semester}`);
      
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
        if (data.length > 0 && !selectedGroup) {
          setSelectedGroup(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGradeStats = (group: Group) => {
    const students = group.students;
    const totalStudents = students.length;
    let approvedStudents = 0;
    let failedStudents = 0;
    let totalGrades = 0;
    let pendingGrades = 0;

    students.forEach(student => {
      if (student.notaFinal !== undefined) {
        totalGrades += student.notaFinal;
        if (student.notaFinal >= 3.0) {
          approvedStudents++;
        } else {
          failedStudents++;
        }
      } else {
        pendingGrades++;
      }
    });

    setGradeStats({
      totalStudents,
      approvedStudents,
      failedStudents,
      averageGrade: totalStudents > 0 ? totalGrades / (totalStudents - pendingGrades) : 0,
      pendingGrades
    });
  };

  const handleGradeChange = (studentId: string, field: string, value: number) => {
    setEditingGrades(prev => ({
      ...prev,
      [`${studentId}_${field}`]: value
    }));
  };

  const saveGrades = async () => {
    try {
      const response = await authenticatedFetch(`/api/groups/${selectedGroup?.id}/grades`, {
        method: 'PUT',
        body: JSON.stringify({ grades: editingGrades })
      });
      
      if (response.ok) {
        alert('Calificaciones guardadas exitosamente');
        setEditingGrades({});
        fetchGroups();
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Error al guardar calificaciones');
    }
  };

  const consolidateGrades = async () => {
    try {
      const response = await authenticatedFetch(`/api/groups/${selectedGroup?.id}/consolidate`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Notas consolidadas exitosamente');
        fetchGroups();
      }
    } catch (error) {
      console.error('Error consolidating grades:', error);
      alert('Error al consolidar notas');
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'snies') => {
    try {
      const response = await authenticatedFetch(`/api/groups/${selectedGroup?.id}/export?format=${format}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${selectedGroup?.name}_${format}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error al exportar reporte');
    }
  };

  const getGradeColor = (grade?: number) => {
    if (grade === undefined) return 'bg-gray-100 text-gray-500';
    if (grade >= 4.5) return 'bg-green-100 text-green-800';
    if (grade >= 3.5) return 'bg-blue-100 text-blue-800';
    if (grade >= 3.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVO': return 'bg-green-100 text-green-800';
      case 'INACTIVO': return 'bg-yellow-100 text-yellow-800';
      case 'RETIRADO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando sistema SVGA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header SVGA */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SafeLink href="/dashboard/coordinador" className="text-white hover:text-blue-200">
              ← Volver al Dashboard
            </SafeLink>
            <div className="h-6 w-px bg-blue-700"></div>
            <h1 className="text-xl font-bold">SVGA - Sistema Virtual de Gestión Académica</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={semester} 
              onChange={(e) => setSemester(e.target.value)}
              className="bg-blue-800 text-white border border-blue-700 rounded px-3 py-1"
            >
              <option value="2025-1">2025-1</option>
              <option value="2024-2">2024-2</option>
              <option value="2024-1">2024-1</option>
            </select>
            <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">SVGA</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar de Grupos */}
        <div className="w-80 bg-white shadow-lg h-screen overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold !text-slate-900">Grupos Académicos</h2>
            <p className="text-sm !text-slate-600">Semestre {semester}</p>
          </div>
          
          <div className="p-4">
            {groups.length === 0 ? (
              <p className="text-center !text-slate-600 py-8">No hay grupos disponibles</p>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedGroup?.id === group.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-medium !text-slate-900">{group.name}</div>
                    <div className="text-sm !text-slate-600">{group.practiceCenter}</div>
                    <div className="text-xs !text-slate-500 mt-1">
                      {group.students.length} estudiantes • {group.teacher.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1">
          {selectedGroup ? (
            <div className="p-6">
              {/* Tabs de Navegación */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { key: 'grupos', label: 'Información del Grupo', icon: '👥' },
                      { key: 'calificaciones', label: 'Gestión de Calificaciones', icon: '📊' },
                      { key: 'reportes', label: 'Reportes y Exportación', icon: '📋' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Contenido de Tabs */}
              {activeTab === 'grupos' && (
                <div className="space-y-6">
                  {/* Información del Grupo */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold !text-slate-900 mb-4">Información del Grupo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium !text-slate-700">Nombre del Grupo</label>
                        <p className="mt-1 text-sm !text-slate-900">{selectedGroup.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium !text-slate-700">Centro de Práctica</label>
                        <p className="mt-1 text-sm !text-slate-900">{selectedGroup.practiceCenter}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium !text-slate-700">Docente</label>
                        <p className="mt-1 text-sm !text-slate-900">{selectedGroup.teacher.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium !text-slate-700">Semestre</label>
                        <p className="mt-1 text-sm !text-slate-900">{selectedGroup.semester}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Estudiantes */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold !text-slate-900">Estudiantes Asignados</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium !text-slate-500 uppercase tracking-wider">Estudiante</th>
                            <th className="px-6 py-3 text-left text-xs font-medium !text-slate-500 uppercase tracking-wider">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium !text-slate-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium !text-slate-500 uppercase tracking-wider">Progreso</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedGroup.students.map((student) => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium !text-slate-900">{student.name}</div>
                                  <div className="text-sm !text-slate-500">{student.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm !text-slate-900">{student.code}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.estado)}`}>
                                  {student.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-1">
                                    <div className="text-sm !text-slate-900">
                                      {student.horasCompletadas}/{student.horasRequeridas} horas
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${Math.min((student.horasCompletadas / student.horasRequeridas) * 100, 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'calificaciones' && (
                <div className="space-y-6">
                  {/* Estadísticas de Calificaciones */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                      <div className="text-2xl font-bold !text-slate-900">{gradeStats.totalStudents}</div>
                      <div className="text-sm !text-slate-600">Total Estudiantes</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{gradeStats.approvedStudents}</div>
                      <div className="text-sm !text-slate-600">Aprobados</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{gradeStats.failedStudents}</div>
                      <div className="text-sm !text-slate-600">Reprobados</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{gradeStats.averageGrade.toFixed(1)}</div>
                      <div className="text-sm !text-slate-600">Promedio</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{gradeStats.pendingGrades}</div>
                      <div className="text-sm !text-slate-600">Pendientes</div>
                    </div>
                  </div>

                  {/* Tabla de Calificaciones */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-semibold !text-slate-900">Gestión de Calificaciones</h3>
                      <div className="space-x-2">
                        <button
                          onClick={saveGrades}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                        >
                          💾 Guardar Cambios
                        </button>
                        <button
                          onClick={consolidateGrades}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                        >
                          📊 Consolidar Notas
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium !text-slate-500 uppercase tracking-wider">Estudiante</th>
                            <th className="px-6 py-3 text-center text-xs font-medium !text-slate-500 uppercase tracking-wider">Corte 1 (30%)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium !text-slate-500 uppercase tracking-wider">Corte 2 (30%)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium !text-slate-500 uppercase tracking-wider">Corte 3 (40%)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium !text-slate-500 uppercase tracking-wider">Nota Final</th>
                            <th className="px-6 py-3 text-center text-xs font-medium !text-slate-500 uppercase tracking-wider">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedGroup.students.map((student) => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium !text-slate-900">{student.name}</div>
                                <div className="text-sm !text-slate-500">{student.code}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="5"
                                  step="0.1"
                                  value={editingGrades[`${student.id}_corte1`] ?? student.corte1 ?? ''}
                                  onChange={(e) => handleGradeChange(student.id, 'corte1', parseFloat(e.target.value))}
                                  className={`w-16 px-2 py-1 text-center border rounded text-sm ${getGradeColor(student.corte1)}`}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="5"
                                  step="0.1"
                                  value={editingGrades[`${student.id}_corte2`] ?? student.corte2 ?? ''}
                                  onChange={(e) => handleGradeChange(student.id, 'corte2', parseFloat(e.target.value))}
                                  className={`w-16 px-2 py-1 text-center border rounded text-sm ${getGradeColor(student.corte2)}`}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="5"
                                  step="0.1"
                                  value={editingGrades[`${student.id}_corte3`] ?? student.corte3 ?? ''}
                                  onChange={(e) => handleGradeChange(student.id, 'corte3', parseFloat(e.target.value))}
                                  className={`w-16 px-2 py-1 text-center border rounded text-sm ${getGradeColor(student.corte3)}`}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(student.notaFinal)}`}>
                                  {student.notaFinal?.toFixed(1) ?? 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  student.notaFinal !== undefined
                                    ? student.notaFinal >= 3.0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {student.notaFinal !== undefined
                                    ? student.notaFinal >= 3.0 ? 'APROBADO' : 'REPROBADO'
                                    : 'PENDIENTE'
                                  }
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reportes' && (
                <div className="space-y-6">
                  {/* Opciones de Exportación */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold !text-slate-900 mb-4">Exportación de Reportes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <h4 className="font-medium !text-slate-900 mb-2">Reporte PDF</h4>
                        <p className="text-sm !text-slate-600 mb-4">Reporte completo con calificaciones y estadísticas</p>
                        <button
                          onClick={() => exportReport('pdf')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm w-full"
                        >
                          Descargar PDF
                        </button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <h4 className="font-medium !text-slate-900 mb-2">Reporte Excel</h4>
                        <p className="text-sm !text-slate-600 mb-4">Hoja de cálculo con datos detallados</p>
                        <button
                          onClick={() => exportReport('excel')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm w-full"
                        >
                          Descargar Excel
                        </button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-4xl mb-2">🏛️</div>
                        <h4 className="font-medium !text-slate-900 mb-2">Formato SNIES</h4>
                        <p className="text-sm !text-slate-600 mb-4">Reporte oficial para el Ministerio de Educación</p>
                        <button
                          onClick={() => exportReport('snies')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm w-full"
                        >
                          Descargar SNIES
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Resumen del Grupo */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold !text-slate-900 mb-4">Resumen del Grupo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium !text-slate-900 mb-2">Información General</h4>
                        <ul className="space-y-1 text-sm !text-slate-600">
                          <li>• Grupo: {selectedGroup.name}</li>
                          <li>• Semestre: {selectedGroup.semester}</li>
                          <li>• Centro: {selectedGroup.practiceCenter}</li>
                          <li>• Docente: {selectedGroup.teacher.name}</li>
                          <li>• Total Estudiantes: {selectedGroup.students.length}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium !text-slate-900 mb-2">Estadísticas Académicas</h4>
                        <ul className="space-y-1 text-sm !text-slate-600">
                          <li>• Estudiantes Aprobados: {gradeStats.approvedStudents}</li>
                          <li>• Estudiantes Reprobados: {gradeStats.failedStudents}</li>
                          <li>• Promedio General: {gradeStats.averageGrade.toFixed(2)}</li>
                          <li>• Calificaciones Pendientes: {gradeStats.pendingGrades}</li>
                          <li>• Tasa de Aprobación: {gradeStats.totalStudents > 0 ? ((gradeStats.approvedStudents / gradeStats.totalStudents) * 100).toFixed(1) : 0}%</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold !text-slate-900 mb-2">Selecciona un Grupo</h3>
                <p className="!text-slate-600">Elige un grupo de la lista para gestionar calificaciones</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}