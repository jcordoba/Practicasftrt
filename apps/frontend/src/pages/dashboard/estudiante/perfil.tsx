import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth, useAuthenticatedFetch } from '../../../contexts/AuthContext';
import UserDropdown from '../../../components/UserDropdown';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  roles: Array<{
    role: {
      nombre: string;
      description?: string;
    };
  }>;
  createdAt: string;
  updatedAt?: string;
}

interface StudentPracticeStats {
  totalPractices: number;
  activePractices: number;
  completedPractices: number;
  totalHoursLogged: number;
  totalHoursRequired: number;
  totalReports: number;
  averageHoursPerReport: number;
}

interface Placement {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  center?: {
    nombre: string;
  };
  tutor?: {
    nombre: string;
    email?: string;
  };
  teacher?: {
    nombre: string;
    email?: string;
  };
  program?: {
    nombre: string;
  };
  term?: {
    academicYear?: number;
    academicPeriod?: string;
  };
}

type ProfileTab = 'personal' | 'security' | 'settings' | 'practices';

const DEFAULT_SETTINGS = {
  notifications: true,
  privateProfile: false,
  sessionAlerts: true,
};

export default function ProfilePage() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studentPlacements, setStudentPlacements] = useState<Placement[]>([]);
  const [studentStats, setStudentStats] = useState<StudentPracticeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [formData, setFormData] = useState({ name: '' });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchProfile();
    }
  }, [authLoading, isAuthenticated]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ESTUDIANTE':
        return 'Estudiante';
      case 'DOCENTE':
        return 'Docente';
      case 'PASTOR_TUTOR':
        return 'Pastor Tutor';
      case 'COORDINADOR_PRACTICAS':
        return 'Coordinador de Prácticas';
      case 'ADMINISTRADOR_TECNICO':
        return 'Administrador Técnico';
      case 'ADMIN':
        return 'Administrador';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ESTUDIANTE':
        return 'bg-blue-600 text-white border-transparent';
      case 'DOCENTE':
        return 'bg-emerald-600 text-white border-transparent';
      case 'PASTOR_TUTOR':
        return 'bg-violet-600 text-white border-transparent';
      case 'COORDINADOR_PRACTICAS':
        return 'bg-amber-500 text-white border-transparent';
      case 'ADMINISTRADOR_TECNICO':
      case 'ADMIN':
        return 'bg-rose-600 text-white border-transparent';
      default:
        return 'bg-slate-600 text-white border-transparent';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ESTUDIANTE':
        return 'bg-blue-600 text-white';
      case 'DOCENTE':
        return 'bg-emerald-600 text-white';
      case 'PASTOR_TUTOR':
        return 'bg-violet-600 text-white';
      case 'COORDINADOR_PRACTICAS':
        return 'bg-amber-500 text-white';
      case 'ADMINISTRADOR_TECNICO':
      case 'ADMIN':
        return 'bg-rose-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  const isStudentRole = (roleName: string) => roleName.toUpperCase().includes('ESTUDIANTE') || roleName.toLowerCase().includes('student');

  const isCurrentPlacement = (placement: Placement) => {
    const now = new Date();
    const start = new Date(placement.startDate);
    const end = new Date(placement.endDate);
    return start <= now && now <= end;
  };

  const primaryRole = profile?.roles?.[0]?.role.nombre || 'USUARIO';
  const roleNames = profile?.roles?.map((entry) => entry.role.nombre) || [];
  const isStudent = roleNames.some(isStudentRole);
  const activePlacement = studentPlacements.find((placement) => isCurrentPlacement(placement) || placement.status === 'ACTIVE') || studentPlacements[0] || null;
  const progressPercentage = studentStats && studentStats.totalHoursRequired > 0
    ? Math.min(100, Math.round((studentStats.totalHoursLogged / studentStats.totalHoursRequired) * 100))
    : 0;
  const hoursRemaining = studentStats ? Math.max(0, studentStats.totalHoursRequired - studentStats.totalHoursLogged) : 0;

  const fetchJson = async <T,>(path: string): Promise<T | null> => {
    const response = await authenticatedFetch(path);
    if (!response.ok) return null;
    return response.json() as Promise<T>;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchJson<UserProfile>('/api/users/profile');

      if (!data) {
        throw new Error('No se pudo cargar el perfil');
      }

      setProfile(data);
      setFormData({ name: data.name || '' });
      setError(null);

      const dataIsStudent = (data.roles || []).some((entry) => isStudentRole(entry.role.nombre));
      if (dataIsStudent) {
        const [placementsData, statsData] = await Promise.all([
          fetchJson<Placement[]>('/api/placements/my'),
          fetchJson<StudentPracticeStats>('/api/practices/my/stats'),
        ]);

        setStudentPlacements(Array.isArray(placementsData) ? placementsData : []);
        setStudentStats(statsData || null);
      } else {
        setStudentPlacements([]);
        setStudentStats(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar perfil';
      setError(message);
      setProfile(null);
      setStudentPlacements([]);
      setStudentStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        try { URL.revokeObjectURL(avatarPreview); } catch (e) { /* noop */ }
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !profile) return;

    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const resp = await authenticatedFetch(`/api/users/${profile.id}/avatar`, {
        method: 'POST',
        body: fd,
      });

      if (resp.ok) {
        const data = await resp.json();
        // backend may return avatarUrl or updated profile
        if (data && data.avatarUrl) {
          setProfile({ ...profile, avatarUrl: data.avatarUrl });
        } else {
          // try refetching profile for freshest data
          fetchProfile();
        }
      } else {
        setError('No se pudo subir la foto.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error subiendo foto';
      setError(message);
    }
  };

  const handleSave = async () => {
    if (!profile || !formData.name.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }

    try {
      setSaving(true);
      const response = await authenticatedFetch(`/api/users/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: formData.name }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditMode(false);
      setSuccessMessage('Perfil actualizado exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 !text-black">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50">
        <header className="w-full bg-blue-900 text-white py-5 px-8 flex justify-between items-center sticky top-0 z-40 shadow-lg gap-4 border-b border-blue-800">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Link href="/dashboard/estudiante" className="text-white hover:text-blue-200 flex items-center flex-shrink-0 font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </Link>
            <h1 className="text-lg md:text-xl font-bold truncate">SION Prácticas FTR</h1>
          </div>
          <div className="flex-shrink-0">
            <UserDropdown />
          </div>
        </header>

        <main className="flex flex-col items-center w-full max-w-4xl px-4 py-12">
          <div className="w-full rounded-3xl border border-slate-200 bg-white shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13l3 3 7-7m0 0l-7 7-3-3" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold !text-black mb-2">No se pudo cargar el perfil</h2>
            <p className="!text-slate-600 mb-6">
              La información del usuario no llegó completa o hubo un problema temporal al consultar el backend.
            </p>
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 !text-red-700 px-4 py-3 mb-6 text-left">
                {error}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={fetchProfile}
                className="px-5 py-3 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const tabButtonClass = (tab: ProfileTab) =>
    `px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${activeTab === tab
      ? 'bg-blue-900 text-white border-blue-900 shadow-lg'
      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
    }`;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50">
      <header className="w-full bg-blue-900 text-white py-5 px-8 flex justify-between items-center sticky top-0 z-40 shadow-lg gap-4 border-b border-blue-800">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link href="/dashboard/estudiante" className="text-white hover:text-blue-200 flex items-center flex-shrink-0 font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </Link>
          <h1 className="text-lg md:text-xl font-bold truncate">SION Prácticas FTR</h1>
        </div>
        <div className="flex-shrink-0">
          <UserDropdown />
        </div>
      </header>

      <main className="flex flex-col items-center w-full max-w-6xl px-4 pb-12 pt-8">
        <div className="w-full mb-6">
          <h2 className="text-3xl font-bold !text-black mb-2">Mi Perfil</h2>
        </div>

        {error && (
          <div className="w-full bg-red-100 border border-red-200 !text-red-700 px-4 py-3 rounded-2xl mb-6 shadow-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="w-full bg-emerald-100 border border-emerald-200 !text-emerald-700 px-4 py-3 rounded-2xl mb-6 shadow-sm">
            {successMessage}
          </div>
        )}

        <section className="w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 px-6 py-6 md:px-8 md:py-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col md:flex-row md:items-center gap-5 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <label className="relative cursor-pointer inline-block">
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                    {avatarPreview || profile.avatarUrl ? (
                      <img
                        src={avatarPreview || profile.avatarUrl}
                        alt="avatar"
                        className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border border-white/20 shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg">
                        {getInitials(profile.name || profile.email)}
                      </div>
                    )}

                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6" />
                      </svg>
                    </div>
                  </label>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {(profile.roles || []).map((entry) => (
                      <span key={entry.role.nombre} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(entry.role.nombre)}`}>
                        {getRoleDisplayName(entry.role.nombre)}
                      </span>
                    ))}
                  </div>

                  {editMode ? (
                    <div className="space-y-3 max-w-2xl">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Nombre completo</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-lg font-semibold text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                          placeholder="Escribe tu nombre completo"
                        />
                      </div>
                      <p className="text-sm text-white/70">
                        Solo el nombre se guarda en esta versión. El resto de campos se muestran como referencia.
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold mb-2 truncate">{profile.name}</h3>
                      <div className="flex flex-col gap-2 text-white/85 text-sm md:text-base">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-white/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{profile.email}</span>
                        </div>
                        
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-shrink-0">
                {editMode ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white font-semibold transition-colors shadow-lg"
                    >
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setFormData({ name: profile.name });
                      }}
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors border border-white/20"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-5 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-semibold shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar perfil
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-white/70 mb-1">Rol principal</p>
                    <p className="font-semibold">{getRoleDisplayName(primaryRole)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-white/70 mb-1">Estado</p>
                    <p className="font-semibold">Activo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 md:px-8 border-b border-slate-200 bg-slate-50/70">
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setActiveTab('personal')} className={tabButtonClass('personal')}>
                Información personal
              </button>
              <button type="button" onClick={() => setActiveTab('security')} className={tabButtonClass('security')}>
                Seguridad
              </button>
              <button type="button" onClick={() => setActiveTab('settings')} className={tabButtonClass('settings')}>
                Configuración
              </button>
              {isStudent && (
                <button type="button" onClick={() => setActiveTab('practices')} className={tabButtonClass('practices')}>
                  Prácticas
                </button>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                {editMode && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="font-semibold !text-slate-900 mb-2">Edición rápida</p>
                    <p className="!text-slate-600 text-sm">
                      Puedes actualizar tu nombre desde aquí. El resto de datos se muestran en modo consulta para mantener la información consistente.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-transparent flex items-center justify-center">
                            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold !text-black">Información personal</h3>
                        <p className="text-sm !text-slate-600">Datos principales de contacto y biografía</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                        <p className="text-sm font-semibold !text-slate-600 mb-1">Correo electrónico</p>
                        <p className="font-medium !text-slate-900 break-all">{profile.email}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                        <p className="text-sm font-semibold !text-slate-600 mb-1">Teléfono</p>
                        <p className="font-medium !text-slate-900">{profile.phone || 'No registrado'}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 md:col-span-2">
                        <p className="text-sm font-semibold !text-slate-600 mb-1">Biografía</p>
                        <p className="font-medium !text-slate-900 leading-relaxed">
                          {profile.bio || 'Todavía no has agregado una biografía personal.'}
                        </p>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zM6 20v-1a6 6 0 0112 0v1" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold !text-black">Datos básicos</h3>
                        <p className="text-sm !text-slate-600">Identificación y fecha de registro</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                        <p className="text-xs uppercase tracking-wide font-semibold !text-slate-500 mb-1">ID de usuario</p>
                        <p className="font-mono text-sm break-all !text-slate-900">{profile.id}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                        <p className="text-xs uppercase tracking-wide font-semibold !text-slate-500 mb-1">Miembro desde</p>
                        <p className="font-medium !text-slate-900">{formatDate(profile.createdAt)}</p>
                      </div>
                      {profile.updatedAt && (
                        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                          <p className="text-xs uppercase tracking-wide font-semibold !text-slate-500 mb-1">Última actualización</p>
                          <p className="font-medium !text-slate-900">{formatDate(profile.updatedAt)}</p>
                        </div>
                      )}
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                        <p className="text-xs uppercase tracking-wide font-semibold !text-slate-500 mb-2">Roles asignados</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.roles.length > 0 ? profile.roles.map((entry) => (
                            <span key={entry.role.nombre} className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(entry.role.nombre)}`}>
                              {getRoleDisplayName(entry.role.nombre)}
                            </span>
                          )) : (
                            <span className="text-sm !text-slate-600">Sin roles asignados</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-12V7a4 4 0 10-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold !text-black">Cambiar contraseña</h3>
                      <p className="text-sm !text-slate-600">Protege tu acceso con una nueva contraseña</p>
                    </div>
                  </div>

                  <p className="!text-slate-600 text-sm mb-4">
                    Esta acción está lista en la interfaz y puede conectarse al flujo de recuperación cuando esté disponible.
                  </p>

                  <button
                    type="button"
                    disabled
                    className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold !text-slate-500 cursor-not-allowed"
                  >
                    Disponible en la próxima actualización
                  </button>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold !text-black">Cerrar sesión</h3>
                      <p className="text-sm !text-slate-600">Finaliza tu sesión actual de forma segura</p>
                    </div>
                  </div>

                  <p className="!text-slate-600 text-sm mb-4">
                    Si sales desde esta pantalla, volverás directamente a la página de ingreso.
                  </p>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </article>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17a2.25 2.25 0 01-4.5 0m4.5 0a2.25 2.25 0 10-4.5 0m4.5 0h6.75M15.75 17a2.25 2.25 0 01-4.5 0m4.5 0a2.25 2.25 0 10-4.5 0m4.5 0h2.25M7.5 7.5h9m-9 4.5h9m-9 4.5h3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold !text-black">Notificaciones</h3>
                      <p className="text-sm !text-slate-600">Administra los avisos que quieres recibir</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                      <div>
                        <p className="font-semibold !text-slate-900">Alertas por correo</p>
                        <p className="text-sm !text-slate-600">Recibe avisos importantes en tu email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                      <div>
                        <p className="font-semibold !text-slate-900">Alertas de sesión</p>
                        <p className="text-sm !text-slate-600">Notificaciones cuando inicias sesión en un nuevo dispositivo</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.sessionAlerts}
                        onChange={(e) => setSettings({ ...settings, sessionAlerts: e.target.checked })}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold !text-black">Privacidad</h3>
                      <p className="text-sm !text-slate-600">Controla qué tan visible es tu perfil</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                      <div>
                        <p className="font-semibold !text-slate-900">Perfil privado</p>
                        <p className="text-sm !text-slate-600">Oculta detalles no esenciales a otros usuarios</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.privateProfile}
                        onChange={(e) => setSettings({ ...settings, privateProfile: e.target.checked })}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                      <p className="font-semibold !text-slate-900 mb-1">Preferencias guardadas</p>
                      <p className="text-sm !text-slate-600">
                        La estructura ya está lista para conectar el guardado persistente cuando el backend lo soporte.
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            )}

            {activeTab === 'practices' && (
              <div className="space-y-6">
                {!isStudent ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold !text-black mb-2">Sección no disponible para este rol</h3>
                    <p className="!text-slate-600">La información de prácticas solo se muestra cuando el usuario tiene rol de estudiante.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold !text-slate-500 mb-2">Empresa o iglesia asignada</p>
                        <p className="text-lg font-bold !text-slate-900">{activePlacement?.center?.nombre || 'Sin asignación'}</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold !text-slate-500 mb-2">Tutor o líder</p>
                        <p className="text-lg font-bold !text-slate-900">{activePlacement?.tutor?.nombre || activePlacement?.teacher?.nombre || 'Sin tutor asignado'}</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold !text-slate-500 mb-2">Programa</p>
                        <p className="text-lg font-bold !text-slate-900">{activePlacement?.program?.nombre || 'Sin programa'}</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold !text-slate-500 mb-2">Estado</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${activePlacement?.status === 'ACTIVE' ? 'bg-emerald-100 !text-emerald-700' : activePlacement?.status === 'COMPLETED' ? 'bg-blue-100 !text-blue-700' : activePlacement?.status === 'CANCELLED' ? 'bg-red-100 !text-red-700' : 'bg-slate-100 !text-slate-700'}`}>
                          {activePlacement?.status === 'ACTIVE' ? 'Activa' : activePlacement?.status === 'COMPLETED' ? 'Finalizada' : activePlacement?.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold !text-black">Progreso de prácticas</h3>
                            <p className="text-sm !text-slate-600">Horas registradas frente a las horas requeridas</p>
                          </div>
                        </div>

                        {studentStats ? (
                          <>
                            <div className="flex items-end justify-between gap-4 mb-3">
                              <div>
                                <p className="text-sm font-semibold !text-slate-500">Avance general</p>
                                <p className="text-3xl font-bold !text-slate-900">{progressPercentage}%</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm !text-slate-600">Horas restantes</p>
                                <p className="text-lg font-semibold !text-slate-900">{hoursRemaining} horas</p>
                              </div>
                            </div>

                            <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden mb-3">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide !text-slate-500 mb-1">Prácticas</p>
                                <p className="text-2xl font-bold !text-slate-900">{studentStats.totalPractices}</p>
                              </div>
                              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide !text-slate-500 mb-1">Activas</p>
                                <p className="text-2xl font-bold !text-slate-900">{studentStats.activePractices}</p>
                              </div>
                              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide !text-slate-500 mb-1">Finalizadas</p>
                                <p className="text-2xl font-bold !text-slate-900">{studentStats.completedPractices}</p>
                              </div>
                              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide !text-slate-500 mb-1">Reportes</p>
                                <p className="text-2xl font-bold !text-slate-900">{studentStats.totalReports}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                            <p className="!text-slate-600">No se encontraron estadísticas de progreso.</p>
                          </div>
                        )}
                      </article>

                      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold !text-black">Resumen de estado</h3>
                            <p className="text-sm !text-slate-600">Detalles de la asignación actual</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                            <p className="text-xs uppercase tracking-wide font-semibold !text-slate-500 mb-1">Periodo</p>
                            <p className="font-medium !text-slate-900">
                              {activePlacement?.term?.academicYear ? `${activePlacement.term.academicYear} - ${activePlacement.term.academicPeriod || 'Periodo'}` : 'No disponible'}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                            <p className="text-xs uppercase tracking-wide font-semibold !text-slate-500 mb-1">Inicio</p>
                            <p className="font-medium !text-slate-900">{activePlacement?.startDate ? formatDate(activePlacement.startDate) : 'No disponible'}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                            <p className="text-xs uppercase tracking-wide font-semibold !text-slate-500 mb-1">Finalización</p>
                            <p className="font-medium !text-slate-900">{activePlacement?.endDate ? formatDate(activePlacement.endDate) : 'No disponible'}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                            <p className="text-xs uppercase tracking-wide font-semibold !text-slate-500 mb-1">Promedio por reporte</p>
                            <p className="font-medium !text-slate-900">{studentStats ? `${studentStats.averageHoursPerReport.toFixed(1)} horas` : 'No disponible'}</p>
                          </div>
                        </div>
                      </article>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
