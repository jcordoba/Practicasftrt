import React, { useState } from "react";
import Link from "next/link";

// Simple SVG Icons
const CoordinatorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const StudentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const ChurchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default function DashboardRouter() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const roles = [
    {
      id: "coordinator",
      title: "Coordinador",
      description: "Panel de administración y gestión de prácticas",
      icon: <CoordinatorIcon />,
      href: "/dashboard/coordinador",
      color: "from-blue-600 to-indigo-700",
      hoverColor: "from-blue-500 to-indigo-600"
    },
    {
      id: "student",
      title: "Estudiante",
      description: "Seguimiento de tus prácticas y evidencias",
      icon: <StudentIcon />,
      href: "/dashboard/estudiante",
      color: "from-emerald-600 to-teal-700",
      hoverColor: "from-emerald-500 to-teal-600"
    },
    {
      id: "church",
      title: "Iglesia",
      description: "Supervisión de estudiantes asignados",
      icon: <ChurchIcon />,
      href: "/dashboard/iglesia",
      color: "from-amber-600 to-orange-700",
      hoverColor: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text !text-black mb-4">
            Sistema de Prácticas FTR
          </h1>
          <p className="text-lg !text-black max-w-2xl mx-auto">
            Selecciona tu rol para acceder al panel correspondiente
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Link 
              key={role.id}
              href={role.href}
              className={`block group`}
              onMouseEnter={() => setHoveredCard(role.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`
                relative overflow-hidden rounded-2xl p-6 shadow-xl transition-all duration-300 ease-out
                bg-white/80 backdrop-blur-lg border border-white/50
                hover:shadow-2xl hover:-translate-y-2
                ${hoveredCard === role.id ? 'ring-2 ring-blue-400/50' : ''}
              `}>
                {/* Gradient background effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 transition-opacity duration-300
                  group-hover:opacity-10 -z-10
                `}></div>
                
                {/* Icon container */}
                <div className={`
                  flex justify-center mb-5 transition-transform duration-300
                  ${hoveredCard === role.id ? 'scale-110' : ''}
                `}>
                  <div className={`
                    p-4 rounded-full bg-gradient-to-br ${role.color} 
                    text-white flex items-center justify-center
                    transition-all duration-300
                    group-hover:shadow-lg
                  `}>
                    {role.icon}
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold !text-black mb-2">{role.title}</h2>
                  <p className="!text-black mb-4">{role.description}</p>
                  
                  <div className={`
                    inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                    bg-gradient-to-r ${role.color} text-white
                    transform transition-all duration-300
                    group-hover:scale-105 group-hover:shadow-md
                  `}>
                    Acceder
                    <svg 
                      className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="!text-black text-sm">
            © {new Date().getFullYear()} Sistema de Prácticas FTR - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}