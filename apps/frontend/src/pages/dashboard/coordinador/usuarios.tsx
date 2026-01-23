"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useAuthenticatedFetch } from "../../../contexts/AuthContext";
import SafeLink from "../../../components/SafeLink";
import UserDropdown from "../../../components/UserDropdown";

interface User {
  id: number;
  email: string;
  nombre: string;
  estado: "ACTIVO" | "INACTIVO";
  roles: Array<{
    role: {
      nombre: string;
    };
  }>;
  fecha_creacion: string;
}

interface Role {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function UsuariosPage() {
  const authenticatedFetch = useAuthenticatedFetch();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    nombre: "",
    password: "",
    roles: [] as string[]
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch("/api/users");
      
      if (!response.ok) {
        throw new Error("Error al obtener usuarios");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await authenticatedFetch("/api/roles");
      
      if (!response.ok) {
        throw new Error("Error al obtener roles");
      }

      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVO" ? "INACTIVO" : "ACTIVO";
      
      const response = await authenticatedFetch(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ estado: newStatus })
      });

      if (!response.ok) {
        throw new Error("Error al cambiar estado");
      }

      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      setError("Error al cambiar el estado del usuario");
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles.map(r => r.role.nombre));
    setShowRoleModal(true);
  };

  const updateUserRoles = async () => {
    if (!selectedUser) return;

    try {
      const response = await authenticatedFetch(`/api/users/${selectedUser.id}/roles`, {
        method: "PUT",
        body: JSON.stringify({ roles: selectedRoles })
      });

      if (!response.ok) {
        throw new Error("Error al actualizar roles");
      }

      setShowRoleModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating roles:", error);
      setError("Error al actualizar los roles");
    }
  };

  const toggleRole = (roleName: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleName) 
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    );
  };

  const toggleNewUserRole = (roleName: string) => {
    setNewUser(prev => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter(r => r !== roleName)
        : [...prev.roles, roleName]
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.nombre || !newUser.password) {
      setError("Por favor complete todos los campos obligatorios");
      return;
    }

    if (newUser.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (newUser.roles.length === 0) {
      setError("Debe asignar al menos un rol al usuario");
      return;
    }

    try {
      const response = await authenticatedFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          email: newUser.email,
          nombre: newUser.nombre,
          password: newUser.password,
          roles: newUser.roles
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear usuario");
      }

      // Resetear formulario y cerrar modal
      setNewUser({ email: "", nombre: "", password: "", roles: [] });
      setShowCreateModal(false);
      setError("");
      
      // Recargar lista de usuarios
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error instanceof Error ? error.message : "Error al crear el usuario");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.roles.some(r => r.role.nombre === filterRole);
    const matchesStatus = filterStatus === "all" || user.estado === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (roleName: string) => {
    const colors: Record<string, string> = {
      ADMINISTRADOR_TECNICO: "bg-red-50 !text-slate-900 border border-red-100",
      COORDINADOR_PRACTICAS: "bg-blue-50 !text-slate-900 border border-blue-100",
      ESTUDIANTE: "bg-green-50 !text-slate-900 border border-green-100",
      DOCENTE: "bg-purple-50 !text-slate-900 border border-purple-100",
      PASTOR_TUTOR: "bg-yellow-50 !text-slate-900 border border-yellow-100",
    };
    return colors[roleName] || "bg-gray-50 !text-slate-900 border border-gray-100";
  };

  // Estadísticas
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.estado === "ACTIVO").length;
  const inactiveUsers = users.filter(u => u.estado === "INACTIVO").length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Header */}
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/coordinador" className="text-white hover:text-blue-200">
            ← Volver al Dashboard
          </SafeLink>
          <h1 className="text-xl font-bold">Gestión de Usuarios</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 shadow-md"
          >
            <span className="text-xl">+</span> Crear Usuario
          </button>
          <UserDropdown />
        </div>
      </header>

      <main className="flex-1 p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-l-4 border-blue-600 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold !text-slate-600 mb-2 uppercase tracking-wide">Total Usuarios</h3>
                <p className="text-4xl font-bold !text-slate-900">{totalUsers}</p>
              </div>
              <div className="bg-white border-2 border-blue-600 p-3 rounded-full">
                <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white border-l-4 border-green-600 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold !text-slate-600 mb-2 uppercase tracking-wide">Usuarios Activos</h3>
                <p className="text-4xl font-bold !text-slate-900">{activeUsers}</p>
              </div>
              <div className="bg-white border-2 border-green-600 p-3 rounded-full">
                <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white border-l-4 border-red-600 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold !text-slate-600 mb-2 uppercase tracking-wide">Usuarios Inactivos</h3>
                <p className="text-4xl font-bold !text-slate-900">{inactiveUsers}</p>
              </div>
              <div className="bg-white border-2 border-red-600 p-3 rounded-full">
                <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-bold !text-slate-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block !text-slate-800 font-semibold mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:border-blue-500 !text-slate-900"
              />
            </div>

            {/* Filtro por rol */}
            <div>
              <label className="block !text-slate-800 font-semibold mb-2">Rol</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:border-blue-500 !text-slate-900"
              >
                <option value="all">Todos los roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.nombre}>{role.nombre}</option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block !text-slate-800 font-semibold mb-2">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:border-blue-500 !text-slate-900"
              >
                <option value="all">Todos</option>
                <option value="ACTIVO">Activos</option>
                <option value="INACTIVO">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 !text-slate-900">Usuarios del Sistema ({filteredUsers.length})</h2>
          
          {loading ? (
            <div className="text-center py-8 !text-slate-900 font-bold text-xl">
              Cargando usuarios...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-4 py-3 text-left !text-slate-900 font-bold">Nombre</th>
                    <th className="px-4 py-3 text-left !text-slate-900 font-bold">Email</th>
                    <th className="px-4 py-3 text-left !text-slate-900 font-bold">Roles</th>
                    <th className="px-4 py-3 text-left !text-slate-900 font-bold">Estado</th>
                    <th className="px-4 py-3 text-left !text-slate-900 font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 !text-slate-800 font-semibold">{user.nombre || "Sin nombre"}</td>
                      <td className="px-4 py-3 !text-slate-800">{user.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((r, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(r.role.nombre)}`}
                            >
                              {r.role.nombre}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold border ${
                            user.estado === "ACTIVO"
                              ? "bg-green-50 !text-slate-900 border-green-100"
                              : "bg-red-50 !text-slate-900 border-red-100"
                          }`}
                        >
                          {user.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleUserStatus(user.id, user.estado)}
                            className={`px-3 py-1 rounded text-sm font-semibold transition shadow-sm ${
                              user.estado === "ACTIVO"
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                          >
                            {user.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            onClick={() => openRoleModal(user)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition shadow-sm"
                          >
                            Gestionar Roles
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 !text-slate-800">
                  No se encontraron usuarios con los filtros aplicados
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Creación de Usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 !text-slate-900">
              Crear Nuevo Usuario
            </h2>
            
            <form onSubmit={handleCreateUser}>
              {/* Email */}
              <div className="mb-4">
                <label className="block !text-slate-800 font-semibold mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:border-blue-500 !text-slate-900"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>

              {/* Nombre */}
              <div className="mb-4">
                <label className="block !text-slate-800 font-semibold mb-2">
                  Nombre Completo <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:border-blue-500 !text-slate-900"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              {/* Contraseña */}
              <div className="mb-4">
                <label className="block !text-slate-800 font-semibold mb-2">
                  Contraseña <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:border-blue-500 !text-slate-900"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
                <p className="text-xs !text-slate-600 mt-1">Mínimo 8 caracteres</p>
              </div>

              {/* Roles */}
              <div className="mb-6">
                <label className="block !text-slate-800 font-semibold mb-2">
                  Roles <span className="text-red-600">*</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-300 rounded p-3">
                  {roles.map(role => (
                    <label 
                      key={role.id} 
                      className="flex items-start p-2 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newUser.roles.includes(role.nombre)}
                        onChange={() => toggleNewUserRole(role.nombre)}
                        className="mr-3 mt-1 w-4 h-4"
                      />
                      <div className="flex-1">
                        <span className="!text-slate-900 font-semibold block">{role.nombre}</span>
                        {role.descripcion && (
                          <p className="!text-slate-600 text-sm">{role.descripcion}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                {newUser.roles.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">Debe seleccionar al menos un rol</p>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition font-semibold"
                >
                  Crear Usuario
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({ email: "", nombre: "", password: "", roles: [] });
                    setError("");
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Roles */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 !text-slate-900">
              Gestionar Roles - {selectedUser.nombre}
            </h2>
            <p className="!text-slate-700 mb-6">{selectedUser.email}</p>
            
            <div className="space-y-3 mb-6">
              {roles.map(role => (
                <label key={role.id} className="flex items-center p-3 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.nombre)}
                    onChange={() => toggleRole(role.nombre)}
                    className="mr-3 w-5 h-5"
                  />
                  <div>
                    <span className="!text-slate-900 font-semibold">{role.nombre}</span>
                    {role.descripcion && (
                      <p className="!text-slate-600 text-sm">{role.descripcion}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={updateUserRoles}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition font-semibold"
              >
                Guardar Cambios
              </button>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
