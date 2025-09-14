import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface ReportData {
  totalStudents: number;
  activeStudents: number;
  completedPractices: number;
  totalHours: number;
  averageHours: number;
  validationsThisMonth: number;
  pendingValidations: number;
}

interface StudentProgress {
  id: string;
  name: string;
  code: string;
  practiceType: string;
  completedHours: number;
  requiredHours: number;
  progress: number;
  status: string;
  lastActivity: string;
}

interface MonthlyActivity {
  month: string;
  validations: number;
  hours: number;
  students: number;
}

export default function Reportes() {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData>({
    totalStudents: 0,
    activeStudents: 0,
    completedPractices: 0,
    totalHours: 0,
    averageHours: 0,
    validationsThisMonth: 0,
    pendingValidations: 0
  });
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<MonthlyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('2024-1');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Simular datos por ahora
      setTimeout(() => {
        setReportData({
          totalStudents: 12,
          activeStudents: 8,
          completedPractices: 4,
          totalHours: 480,
          averageHours: 40,
          validationsThisMonth: 15,
          pendingValidations: 5
        });

        setStudentProgress([
          {
            id: '1',
            name: 'Juan Pérez',
            code: '12345',
            practiceType: 'Práctica Pastoral I',
            completedHours: 45,
            requiredHours: 60,
            progress: 75,
            status: 'Activo',
            lastActivity: '2024-01-15'
          },
          {
            id: '2',
            name: 'María García',
            code: '23456',
            practiceType: 'Práctica Pastoral II',
            completedHours: 60,
            requiredHours: 60,
            progress: 100,
            status: 'Completado',
            lastActivity: '2024-01-14'
          },
          {
            id: '3',
            name: 'Carlos López',
            code: '34567',
            practiceType: 'Práctica Pastoral I',
            completedHours: 30,
            requiredHours: 60,
            progress: 50,
            status: 'Activo',
            lastActivity: '2024-01-13'
          },
          {
            id: '4',
            name: 'Ana Ruiz',
            code: '45678',
            practiceType: 'Práctica Pastoral II',
            completedHours: 55,
            requiredHours: 60,
            progress: 92,
            status: 'Activo',
            lastActivity: '2024-01-12'
          }
        ]);

        setMonthlyActivity([
          { month: 'Enero 2024', validations: 15, hours: 120, students: 8 },
          { month: 'Diciembre 2023', validations: 12, hours: 96, students: 7 },
          { month: 'Noviembre 2023', validations: 18, hours: 144, students: 9 },
          { month: 'Octubre 2023', validations: 14, hours: 112, students: 8 },
          { month: 'Septiembre 2023', validations: 16, hours: 128, students: 8 },
          { month: 'Agosto 2023', validations: 20, hours: 160, students: 10 }
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Simular exportación de reporte
    alert('Funcionalidad de exportación en desarrollo');
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-yellow-500';
    if (progress >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'Activo': return 'bg-blue-100 text-blue-800';
      case 'Inactivo': return 'bg-gray-100 !text-slate-800';
      default: return 'bg-gray-100 !text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg !text-slate-900">Cargando reportes...</div>
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
          <h1 className="text-xl font-bold">Reportes y Estadísticas</h1>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white !text-slate-900 rounded px-3 py-1 text-sm"
          >
            <option value="2024-1">2024 - Semestre I</option>
            <option value="2023-2">2023 - Semestre II</option>
            <option value="2023-1">2023 - Semestre I</option>
          </select>
          <button
            onClick={exportReport}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
          >
            Exportar
          </button>
          <div className="flex items-center gap-2">
            <span>Iglesia</span>
            <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">I</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium !text-slate-800">Total Estudiantes</p>
                <p className="text-2xl font-semibold !text-slate-900">{reportData.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium !text-slate-800">Prácticas Completadas</p>
                <p className="text-2xl font-semibold !text-slate-900">{reportData.completedPractices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">⏰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium !text-slate-800">Total Horas</p>
                <p className="text-2xl font-semibold !text-slate-900">{reportData.totalHours}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium !text-slate-800">Promedio Horas</p>
                <p className="text-2xl font-semibold !text-slate-900">{reportData.averageHours}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progreso de Estudiantes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium !text-slate-900">Progreso de Estudiantes</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {studentProgress.map((student) => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium !text-slate-900">{student.name}</h4>
                        <p className="text-xs !text-slate-800">{student.code} - {student.practiceType}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm !text-slate-800 mb-1">
                        <span>Progreso: {student.progress}%</span>
                        <span>{student.completedHours}/{student.requiredHours} horas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs !text-slate-800">Última actividad: {student.lastActivity}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actividad Mensual */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium !text-slate-900">Actividad Mensual</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {monthlyActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium !text-slate-900">{activity.month}</h4>
                      <p className="text-xs !text-slate-800">{activity.students} estudiantes activos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium !text-slate-900">{activity.validations} validaciones</p>
                      <p className="text-xs !text-slate-800">{activity.hours} horas totales</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Validaciones */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium !text-slate-900">Resumen de Validaciones</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {reportData.validationsThisMonth}
                </div>
                <p className="text-sm !text-slate-800">Validaciones este mes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {reportData.pendingValidations}
                </div>
                <p className="text-sm !text-slate-800">Validaciones pendientes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round((reportData.validationsThisMonth / (reportData.validationsThisMonth + reportData.pendingValidations)) * 100)}%
                </div>
                <p className="text-sm !text-slate-800">Tasa de validación</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium !text-slate-900">Acciones Rápidas</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/dashboard/iglesia/estudiantes-asignados')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mr-3">👥</span>
                <span className="text-sm font-medium !text-slate-900">Ver Estudiantes</span>
              </button>
              <button 
                onClick={() => router.push('/dashboard/iglesia/validar-evidencias')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mr-3">✅</span>
                <span className="text-sm font-medium !text-slate-900">Validar Evidencias</span>
              </button>
              <button 
                onClick={exportReport}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mr-3">📄</span>
                <span className="text-sm font-medium !text-slate-900">Exportar Reporte</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}