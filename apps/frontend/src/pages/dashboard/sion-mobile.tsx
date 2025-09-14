import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SafeLink from '../../components/SafeLink';
import { useAuth, useAuthenticatedFetch } from '../../contexts/AuthContext';

// Interfaces para el dashboard SION
interface DashboardPanel {
  id: string;
  title: string;
  type: 'stats' | 'chart' | 'list' | 'quick-actions' | 'notifications' | 'calendar';
  size: 'small' | 'medium' | 'large' | 'full';
  position: number;
  visible: boolean;
  data?: any;
  config?: {
    color?: string;
    icon?: string;
    refreshInterval?: number;
  };
}

interface SionStats {
  totalStudents: number;
  activeAssignments: number;
  pendingEvaluations: number;
  completedPractices: number;
  averageGrade: number;
  attendanceRate: number;
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  href: string;
  count?: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

export default function SionMobileDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [panels, setPanels] = useState<DashboardPanel[]>([]);
  const [stats, setStats] = useState<SionStats>({
    totalStudents: 0,
    activeAssignments: 0,
    pendingEvaluations: 0,
    completedPractices: 0,
    averageGrade: 0,
    attendanceRate: 0
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'coordinador' | 'docente' | 'estudiante'>('coordinador');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      initializeDashboard();
      fetchDashboardData();
    }
  }, [selectedRole, authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // El AuthContext se encargará de redirigir
  }

  const initializeDashboard = () => {
    const defaultPanels: DashboardPanel[] = [
      {
        id: 'welcome',
        title: 'Bienvenido al Sistema SION',
        type: 'stats',
        size: 'full',
        position: 1,
        visible: true,
        config: { color: 'blue', icon: '🏛️' }
      },
      {
        id: 'quick-stats',
        title: 'Estadísticas Rápidas',
        type: 'stats',
        size: 'large',
        position: 2,
        visible: true,
        config: { color: 'green', icon: '📊' }
      },
      {
        id: 'quick-actions',
        title: 'Acciones Rápidas',
        type: 'quick-actions',
        size: 'medium',
        position: 3,
        visible: true,
        config: { color: 'purple', icon: '⚡' }
      },
      {
        id: 'notifications',
        title: 'Notificaciones',
        type: 'notifications',
        size: 'medium',
        position: 4,
        visible: true,
        config: { color: 'orange', icon: '🔔' }
      },
      {
        id: 'recent-activity',
        title: 'Actividad Reciente',
        type: 'list',
        size: 'large',
        position: 5,
        visible: true,
        config: { color: 'indigo', icon: '📋' }
      },
      {
        id: 'performance-chart',
        title: 'Rendimiento Académico',
        type: 'chart',
        size: 'large',
        position: 6,
        visible: selectedRole !== 'estudiante',
        config: { color: 'teal', icon: '📈' }
      }
    ];

    setPanels(defaultPanels.filter(panel => 
      selectedRole === 'coordinador' || 
      (selectedRole === 'docente' && panel.id !== 'welcome') ||
      (selectedRole === 'estudiante' && !['performance-chart', 'welcome'].includes(panel.id))
    ));

    // Configurar acciones rápidas según el rol
    const roleActions: Record<string, QuickAction[]> = {
      coordinador: [
        { id: '1', title: 'Gestionar Prácticas', icon: '📋', color: 'blue', href: '/dashboard/coordinador/practicas', count: 12 },
        { id: '2', title: 'Asignar Estudiantes', icon: '👥', color: 'green', href: '/dashboard/coordinador/asignar-estudiante', count: 8 },
        { id: '3', title: 'Sistema SVGA', icon: '🎓', color: 'orange', href: '/dashboard/coordinador/grupos-svga' },
        { id: '4', title: 'Reportes', icon: '📊', color: 'purple', href: '/dashboard/coordinador/reportes' },
        { id: '5', title: 'Organización', icon: '🏛️', color: 'indigo', href: '/dashboard/coordinador/organizacion' },
        { id: '6', title: 'Usuarios', icon: '👤', color: 'teal', href: '/dashboard/coordinador/usuarios' }
      ],
      docente: [
        { id: '1', title: 'Mis Grupos', icon: '👥', color: 'blue', href: '/dashboard/docente/grupos', count: 3 },
        { id: '2', title: 'Calificaciones', icon: '📝', color: 'green', href: '/dashboard/docente/calificaciones', count: 15 },
        { id: '3', title: 'Evaluaciones', icon: '📋', color: 'orange', href: '/dashboard/docente/evaluaciones', count: 5 },
        { id: '4', title: 'Reportes', icon: '📊', color: 'purple', href: '/dashboard/docente/reportes' }
      ],
      estudiante: [
        { id: '1', title: 'Mis Prácticas', icon: '📚', color: 'blue', href: '/dashboard/estudiante/practicas', count: 2 },
        { id: '2', title: 'Calificaciones', icon: '📝', color: 'green', href: '/dashboard/estudiante/calificaciones' },
        { id: '3', title: 'Horarios', icon: '📅', color: 'orange', href: '/dashboard/estudiante/horarios' },
        { id: '4', title: 'Perfil', icon: '👤', color: 'purple', href: '/dashboard/estudiante/perfil' }
      ]
    };

    setQuickActions(roleActions[selectedRole] || []);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simular datos mientras se conecta con la API real
      setTimeout(() => {
        setStats({
          totalStudents: selectedRole === 'coordinador' ? 245 : selectedRole === 'docente' ? 45 : 1,
          activeAssignments: selectedRole === 'coordinador' ? 32 : selectedRole === 'docente' ? 8 : 3,
          pendingEvaluations: selectedRole === 'coordinador' ? 18 : selectedRole === 'docente' ? 5 : 2,
          completedPractices: selectedRole === 'coordinador' ? 156 : selectedRole === 'docente' ? 28 : 1,
          averageGrade: selectedRole === 'estudiante' ? 4.2 : 3.8,
          attendanceRate: selectedRole === 'estudiante' ? 95 : 87
        });

        setNotifications([
          {
            id: '1',
            title: 'Nueva asignación',
            message: 'Se ha creado una nueva práctica para el grupo 2025-A',
            type: 'info',
            timestamp: '2025-01-15T10:30:00Z',
            read: false
          },
          {
            id: '2',
            title: 'Evaluación pendiente',
            message: 'Tienes 3 evaluaciones pendientes por completar',
            type: 'warning',
            timestamp: '2025-01-15T09:15:00Z',
            read: false
          },
          {
            id: '3',
            title: 'Práctica completada',
            message: 'Juan Pérez ha completado su práctica en la Iglesia Central',
            type: 'success',
            timestamp: '2025-01-14T16:45:00Z',
            read: true
          }
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const togglePanelVisibility = (panelId: string) => {
    setPanels(prev => prev.map(panel => 
      panel.id === panelId ? { ...panel, visible: !panel.visible } : panel
    ));
  };

  const movePanelUp = (panelId: string) => {
    setPanels(prev => {
      const panels = [...prev];
      const index = panels.findIndex(p => p.id === panelId);
      if (index > 0) {
        [panels[index], panels[index - 1]] = [panels[index - 1], panels[index]];
        panels[index].position = index + 1;
        panels[index - 1].position = index;
      }
      return panels;
    });
  };

  const movePanelDown = (panelId: string) => {
    setPanels(prev => {
      const panels = [...prev];
      const index = panels.findIndex(p => p.id === panelId);
      if (index < panels.length - 1) {
        [panels[index], panels[index + 1]] = [panels[index + 1], panels[index]];
        panels[index].position = index + 1;
        panels[index + 1].position = index + 2;
      }
      return panels;
    });
  };

  const getPanelSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-1 md:col-span-2';
      case 'large': return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'full': return 'col-span-1 md:col-span-2 lg:col-span-4';
      default: return 'col-span-1';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-blue-500 bg-blue-50';
      case 'warning': return 'border-orange-500 bg-orange-50';
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const renderPanel = (panel: DashboardPanel) => {
    if (!panel.visible) return null;

    const baseClasses = `bg-white rounded-lg shadow-lg border-2 transition-all duration-200 ${getPanelSizeClass(panel.size)}`;
    const borderColor = `border-${panel.config?.color || 'gray'}-500`;

    return (
      <div key={panel.id} className={`${baseClasses} ${borderColor} relative group`}>
        {editMode && (
          <div className="absolute top-2 right-2 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => movePanelUp(panel.id)}
              className="bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600"
            >
              ↑
            </button>
            <button
              onClick={() => movePanelDown(panel.id)}
              className="bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600"
            >
              ↓
            </button>
            <button
              onClick={() => togglePanelVisibility(panel.id)}
              className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-4 md:p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">{panel.config?.icon}</span>
            <h3 className="text-lg font-semibold !text-slate-900">{panel.title}</h3>
          </div>

          {panel.type === 'stats' && panel.id === 'welcome' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏛️</div>
              <h2 className="text-2xl font-bold !text-slate-900 mb-2">Sistema SION</h2>
              <p className="!text-slate-600 mb-4">Sistema Integral de Organización y Notas</p>
              <div className="flex justify-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedRole === 'coordinador' ? 'bg-blue-100 text-blue-800' :
                  selectedRole === 'docente' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Mobile Dashboard
                </span>
              </div>
            </div>
          )}

          {panel.type === 'stats' && panel.id === 'quick-stats' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold !text-slate-900">{stats.totalStudents}</div>
                <div className="text-sm !text-slate-600">Estudiantes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold !text-slate-900">{stats.activeAssignments}</div>
                <div className="text-sm !text-slate-600">Asignaciones</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold !text-slate-900">{stats.pendingEvaluations}</div>
                <div className="text-sm !text-slate-600">Evaluaciones</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold !text-slate-900">{stats.completedPractices}</div>
                <div className="text-sm !text-slate-600">Completadas</div>
              </div>
              {selectedRole === 'estudiante' && (
                <>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <div className="text-2xl font-bold !text-slate-900">{stats.averageGrade}</div>
                    <div className="text-sm !text-slate-600">Promedio</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold !text-slate-900">{stats.attendanceRate}%</div>
                    <div className="text-sm !text-slate-600">Asistencia</div>
                  </div>
                </>
              )}
            </div>
          )}

          {panel.type === 'quick-actions' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <SafeLink key={action.id} href={action.href} className="block">
                  <div className={`p-4 rounded-lg text-center transition-all hover:scale-105 bg-${action.color}-50 border border-${action.color}-200 hover:bg-${action.color}-100`}>
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <div className="text-sm font-medium !text-slate-900">{action.title}</div>
                    {action.count && (
                      <div className={`text-xs mt-1 bg-${action.color}-500 text-white rounded-full px-2 py-1 inline-block`}>
                        {action.count}
                      </div>
                    )}
                  </div>
                </SafeLink>
              ))}
            </div>
          )}

          {panel.type === 'notifications' && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${getNotificationColor(notification.type)}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium !text-slate-900">{notification.title}</div>
                      <div className="text-sm !text-slate-600 mt-1">{notification.message}</div>
                      <div className="text-xs !text-slate-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {panel.type === 'list' && (
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="font-medium !text-slate-900">Práctica completada</div>
                  <div className="text-sm !text-slate-600">María González - Iglesia San Juan</div>
                </div>
                <div className="text-xs !text-slate-500">Hace 1h</div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="font-medium !text-slate-900">Nueva asignación</div>
                  <div className="text-sm !text-slate-600">Grupo 2025-A - Centro Pastoral</div>
                </div>
                <div className="text-xs !text-slate-500">Hace 2h</div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="font-medium !text-slate-900">Evaluación pendiente</div>
                  <div className="text-sm !text-slate-600">Carlos Ruiz - Revisión final</div>
                </div>
                <div className="text-xs !text-slate-500">Hace 3h</div>
              </div>
            </div>
          )}

          {panel.type === 'chart' && (
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <div className="!text-slate-600">Gráfico de rendimiento</div>
                <div className="text-sm !text-slate-500 mt-1">Datos en tiempo real</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando Dashboard SION...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header Mobile-First */}
      <header className="bg-blue-900 text-white py-3 px-4 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SafeLink href="/dashboard" className="text-white hover:text-blue-200">
              ← Dashboard
            </SafeLink>
            <div className="h-5 w-px bg-blue-700"></div>
            <h1 className="text-lg font-bold">SION Mobile</h1>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="bg-blue-800 text-white border border-blue-700 rounded px-2 py-1 text-sm"
            >
              <option value="coordinador">Coordinador</option>
              <option value="docente">Docente</option>
              <option value="estudiante">Estudiante</option>
            </select>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`p-2 rounded text-sm transition-colors ${
                editMode ? 'bg-yellow-500 text-blue-900' : 'bg-blue-800 hover:bg-blue-700'
              }`}
            >
              {editMode ? '✓' : '⚙️'}
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {panels
            .sort((a, b) => a.position - b.position)
            .map(panel => renderPanel(panel))
          }
        </div>

        {/* Panel de Configuración */}
        {editMode && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 border-2 border-blue-500 max-w-sm">
            <h3 className="font-semibold !text-slate-900 mb-3">Configurar Paneles</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {panels.map((panel) => (
                <div key={panel.id} className="flex items-center justify-between text-sm">
                  <span className={`${panel.visible ? '!text-slate-900' : '!text-slate-500'}`}>
                    {panel.config?.icon} {panel.title}
                  </span>
                  <button
                    onClick={() => togglePanelVisibility(panel.id)}
                    className={`px-2 py-1 rounded text-xs ${
                      panel.visible 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {panel.visible ? 'Visible' : 'Oculto'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}