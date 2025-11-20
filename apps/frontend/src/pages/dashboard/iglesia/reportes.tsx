import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SafeLink from "@/components/SafeLink";
import UserDropdown from "../../../components/UserDropdown";

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

  // Restore the loading check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium !text-black">Cargando reportes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with glassmorphism effect */}
      <header className="w-full bg-blue-900 bg-opacity-90 backdrop-blur-lg text-white py-4 px-6 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/iglesia" className="text-white hover:text-blue-200 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </SafeLink>
          <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white !text-black rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="2024-1">2024 - Semestre I</option>
            <option value="2023-2">2023 - Semestre II</option>
            <option value="2023-1">2023 - Semestre I</option>
          </select>
          <button
            onClick={exportReport}
            className="bg-green-600 hover:bg-green-700 !text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Exportar
          </button>
          <UserDropdown />
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium !text-gray-500">Total Estudiantes</p>
                <p className="text-3xl font-bold !text-black">{reportData.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium !text-gray-500">Prácticas Completadas</p>
                <p className="text-3xl font-bold !text-black">{reportData.completedPractices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">⏰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium !text-gray-500">Total Horas</p>
                <p className="text-3xl font-bold !text-black">{reportData.totalHours}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium !text-gray-500">Promedio Horas</p>
                <p className="text-3xl font-bold !text-black">{reportData.averageHours}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progreso de Estudiantes */}
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold !text-black flex items-center">
                <svg className="w-5 h-5 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Progreso de Estudiantes
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {studentProgress.map((student) => (
                  <div key={student.id} className="border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-base font-bold !text-black">{student.name}</h4>
                        <p className="text-sm !text-gray-600">{student.code} - {student.practiceType}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm !text-gray-600 mb-2">
                        <span>Progreso: {student.progress}%</span>
                        <span>{student.completedHours}/{student.requiredHours} horas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${getProgressColor(student.progress)} transition-all duration-500`}
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs !text-gray-600">Última actividad: {student.lastActivity}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actividad Mensual */}
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold !text-black flex items-center">
                <svg className="w-5 h-5 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Actividad Mensual
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {monthlyActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-150">
                    <div>
                      <h4 className="text-base font-bold !text-black">{activity.month}</h4>
                      <p className="text-sm !text-gray-600">{activity.students} estudiantes activos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold !text-black">{activity.validations} validaciones</p>
                      <p className="text-sm !text-gray-600">{activity.hours} horas totales</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Validaciones */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold !text-black flex items-center">
              <svg className="w-5 h-5 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Resumen de Validaciones
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl font-bold !text-black mb-3">
                  {reportData.validationsThisMonth}
                </div>
                <p className="text-sm !text-gray-600">Validaciones este mes</p>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-xl">
                <div className="text-4xl font-bold !text-black mb-3">
                  {reportData.pendingValidations}
                </div>
                <p className="text-sm !text-gray-600">Validaciones pendientes</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-4xl font-bold !text-black mb-3">
                  {Math.round((reportData.validationsThisMonth / (reportData.validationsThisMonth + reportData.pendingValidations)) * 100)}%
                </div>
                <p className="text-sm !text-gray-600">Tasa de validación</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold !text-black flex items-center">
              <svg className="w-5 h-5 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Acciones Rápidas
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/dashboard/iglesia/estudiantes-asignados')}
                className="flex items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-2xl mr-3">👥</span>
                <span className="text-base font-medium !text-black">Ver Estudiantes</span>
              </button>
              <button 
                onClick={() => router.push('/dashboard/iglesia/validar-evidencias')}
                className="flex items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-2xl mr-3">✅</span>
                <span className="text-base font-medium !text-black">Validar Evidencias</span>
              </button>
              <button 
                onClick={exportReport}
                className="flex items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-2xl mr-3">📄</span>
                <span className="text-base font-medium !text-black">Exportar Reporte</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}