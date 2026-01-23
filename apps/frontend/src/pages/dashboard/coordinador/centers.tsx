// Página de gestión de centros de práctica
import React, { useState, useEffect } from "react";
import { useAuth, useAuthenticatedFetch } from "../../../contexts/AuthContext";
import { useSafeRouter } from "../../../hooks/useSafeRouter";
import SafeLink from "../../../components/SafeLink";
import UserDropdown from "../../../components/UserDropdown";

interface Center {
  id: string;
  nombre: string;
  tipo: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  correoContacto?: string;
  nombreContacto?: string;
  capacidadMaxima: number;
  capacidadDisponible: number;
  estado: string;
  observaciones?: string;
}

export default function CentersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const { safePush } = useSafeRouter();

  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [filterCiudad, setFilterCiudad] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "congregacion",
    direccion: "",
    ciudad: "",
    telefono: "",
    correoContacto: "",
    nombreContacto: "",
    capacidadMaxima: 5,
    observaciones: "",
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchCenters();
    }
  }, [authLoading, isAuthenticated, filterTipo, filterCiudad]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      let url = "/api/centers";
      const params = new URLSearchParams();
      if (filterTipo) params.append("tipo", filterTipo);
      if (filterCiudad) params.append("ciudad", filterCiudad);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await authenticatedFetch(url);
      if (response.ok) {
        const data = await response.json();
        setCenters(data);
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCenter
        ? `/api/centers/${editingCenter.id}`
        : "/api/centers";
      const method = editingCenter ? "PUT" : "POST";

      const response = await authenticatedFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCenters();
        resetForm();
        alert(
          editingCenter
            ? "Centro actualizado exitosamente"
            : "Centro creado exitosamente"
        );
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error saving center:", error);
      alert("Error al guardar el centro");
    }
  };

  const handleEdit = (center: Center) => {
    setEditingCenter(center);
    setFormData({
      nombre: center.nombre,
      tipo: center.tipo,
      direccion: center.direccion || "",
      ciudad: center.ciudad || "",
      telefono: center.telefono || "",
      correoContacto: center.correoContacto || "",
      nombreContacto: center.nombreContacto || "",
      capacidadMaxima: center.capacidadMaxima,
      observaciones: center.observaciones || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de desactivar este centro?")) return;

    try {
      const response = await authenticatedFetch(`/api/centers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCenters();
        alert("Centro desactivado exitosamente");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting center:", error);
      alert("Error al desactivar el centro");
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      tipo: "congregacion",
      direccion: "",
      ciudad: "",
      telefono: "",
      correoContacto: "",
      nombreContacto: "",
      capacidadMaxima: 5,
      observaciones: "",
    });
    setEditingCenter(null);
    setShowForm(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full bg-blue-900 bg-opacity-90 backdrop-blur-lg text-white py-4 px-6 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-4">
          <SafeLink href="/dashboard/coordinador">
            <button className="text-white hover:text-blue-200 transition flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
          </SafeLink>
          <h1 className="text-xl font-bold">Gestión de Centros de Práctica</h1>
        </div>
        <UserDropdown />
      </header>

      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4 pb-12">
        {/* Botón para crear nuevo centro */}
        {!showForm && (
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-4">
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="congregacion">Congregación</option>
                <option value="institucion">Institución</option>
              </select>

              <input
                type="text"
                placeholder="Filtrar por ciudad"
                value={filterCiudad}
                onChange={(e) => setFilterCiudad(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Centro
              </span>
            </button>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 w-full">
            <h2 className="text-2xl font-bold !text-black mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {editingCenter ? "Editar Centro" : "Nuevo Centro"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block !text-gray-900 font-bold mb-2">
                    Nombre del Centro *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block !text-gray-900 font-bold mb-2">
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="congregacion">Congregación</option>
                    <option value="institucion">Institución</option>
                  </select>
                </div>

                <div>
                  <label className="block !text-gray-900 font-bold mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({ ...formData, direccion: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block !text-gray-900 font-bold mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) =>
                      setFormData({ ...formData, ciudad: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block !text-gray-900 font-bold mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block !text-gray-900 font-bold mb-2">
                    Nombre del Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.nombreContacto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombreContacto: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block !text-gray-900 font-bold mb-2">
                    Correo del Contacto
                  </label>
                  <input
                    type="email"
                    value={formData.correoContacto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correoContacto: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block !text-gray-900 font-bold mb-2">
                    Capacidad Máxima *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacidadMaxima}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacidadMaxima: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block !text-gray-900 font-bold mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-red-400 text-gray-700 rounded-lg hover:bg-red-500 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingCenter ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de centros */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Ciudad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Capacidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {centers.map((center) => (
                <tr key={center.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {center.nombre}
                    </div>
                    {center.nombreContacto && (
                      <div className="text-sm text-gray-500">
                        {center.nombreContacto}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        center.tipo === "congregacion"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {center.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {center.ciudad || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {center.capacidadDisponible} / {center.capacidadMaxima}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        center.estado === "ACTIVO"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {center.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(center)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    {center.estado === "ACTIVO" && (
                      <button
                        onClick={() => handleDelete(center.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {centers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay centros registrados. Cree uno nuevo.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
