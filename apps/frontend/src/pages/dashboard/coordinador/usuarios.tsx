import React, { useState, useEffect } from "react";
import { useSafeRouter } from "../../../hooks/useSafeRouter";
import SafeLink from "../../../components/SafeLink";

interface User {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export default function UsuariosPage() {
  const { safePush } = useSafeRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    roles: [] as string[]
  });

  const availableRoles = [
    "ADMIN_TECNICO",
    "COORDINADOR", 
    "DECANO",
    "ESTUDIANTE",
    "SUPERVISOR"
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        safePush("/login");
        return;
      }

      const response = await fetch("/api/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar usuarios");
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        safePush("/login");
        return;
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        throw new Error("Error al crear usuario");
      }

      setShowCreateForm(false);
      setNewUser({ email: "", name: "", password: "", roles: [] });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Error al crear el usuario");
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        safePush("/login");
        return;
      }

      const response = await fetch(`/api/users/${userId}/activate`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        throw new Error("Error al cambiar estado del usuario");
      }

      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      setError("Error al cambiar el estado del usuario");
    }
  };

  const handleRoleChange = (role: string) => {
    setNewUser(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

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
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
        >
          + Crear Usuario
        </button>
      </header>

      <main className="flex-1 p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Formulario de creación */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 !text-slate-900">Crear Nuevo Usuario</h2>
              <form onSubmit={handleCreateUser}>
                <div className="mb-4">
                  <label className="block !text-slate-800 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:border-blue-500 !text-slate-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block !text-slate-800 font-semibold mb-2">Nombre</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:border-blue-500 !text-slate-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block !text-slate-800 font-semibold mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:border-blue-500 !text-slate-900"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block !text-slate-800 font-semibold mb-2">Roles</label>
                  <div className="space-y-2">
                    {availableRoles.map(role => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newUser.roles.includes(role)}
                          onChange={() => handleRoleChange(role)}
                          className="mr-2"
                        />
                        <span className="!text-slate-800">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
                  >
                    Crear Usuario
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de usuarios */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 !text-slate-900">Usuarios del Sistema</h2>
          
          {loading ? (
            <div className="text-center py-8 !text-slate-900 font-bold text-xl">
              Cargando usuarios...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-4 py-3 text-left !text-slate-900 font-bold">Email</th>
                    <th className="px-4 py-3 text-left !text-slate-900 font-bold">Nombre</th>
                    <th className="px-4 py-3 text-left !text-slate-900 font-bold">Roles</th>
                    <th className="px-4 py-3 text-left !text-slate-900 font-bold">Estado</th>
                    <th className="px-4 py-3 text-left !text-slate-900 font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-slate-200">
                      <td className="px-4 py-3 !text-slate-800">{user.email}</td>
                      <td className="px-4 py-3 !text-slate-800">{user.name || "Sin nombre"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(role => (
                            <span
                              key={role}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={`px-3 py-1 rounded text-sm font-semibold transition ${
                            user.isActive
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          {user.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="text-center py-8 !text-slate-800">
                  No hay usuarios registrados
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}