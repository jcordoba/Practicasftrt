import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserDropdown } from '../hooks/useUserDropdown';
import { useRouter } from 'next/router';

const UserDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const { isOpen, toggleDropdown, dropdownRef } = useUserDropdown();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // Redirect to login page
    router.push('/login');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  const getRoleDisplay = () => {
    if (!user?.roles || user.roles.length === 0) return 'Usuario';
    // Map role codes to display names
    const roleMap: Record<string, string> = {
      'coordinator': 'Coordinador',
      'student': 'Estudiante',
      'pastor': 'Pastor',
      'teacher': 'Docente',
      'dean': 'Decano'
    };
    
    const role = user.roles[0];
    return roleMap[role] || role;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 transition-all duration-200 hover:bg-blue-800"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm transition-all duration-200 hover:bg-blue-500">
          {getUserInitials()}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium !text-white truncate max-w-[120px]">
            {user?.name || 'Usuario'}
          </div>
          <div className="text-xs !text-blue-200">
            {getRoleDisplay()}
          </div>
        </div>
        <svg 
          className={`w-4 h-4 !text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 border border-gray-200 animate-fade-in-down z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium !text-gray-900 truncate">
              {user?.name || 'Usuario'}
            </p>
            <p className="text-xs !text-gray-500">
              {user?.email || 'usuario@example.com'}
            </p>
            <p className="text-xs !text-blue-600 font-medium mt-1">
              {getRoleDisplay()}
            </p>
          </div>

          <div className="py-1">
            <button
              className="flex items-center w-full px-4 py-2 text-sm !text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              role="menuitem"
              onClick={() => {
                toggleDropdown();
                // TODO: Implement profile/config page
                console.log('Navigate to profile/config');
              }}
            >
              <svg className="w-5 h-5 mr-3 !text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mi perfil
            </button>
          </div>

          <div className="py-1 border-t border-gray-100">
            <button
              className="flex items-center w-full px-4 py-2 text-sm !text-red-600 hover:bg-red-50 transition-colors duration-150"
              role="menuitem"
              onClick={handleLogout}
            >
              <svg className="w-5 h-5 mr-3 !text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UserDropdown;