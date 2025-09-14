import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Input from '../components/Input';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; otp?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateCredentials = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato del correo no es válido';
    }
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    }
    return newErrors;
  };

  const validateOtp = () => {
    const newErrors: { otp?: string } = {};
    if (!otp) {
      newErrors.otp = 'El código OTP es requerido.';
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = 'El código OTP debe tener 6 dígitos.';
    }
    return newErrors;
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateCredentials();
    setErrors(validationErrors);
    setApiError(null);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          setStep('otp');
        } else {
          const data = await response.json();
          setApiError(data.error || 'Las credenciales son incorrectas. Inténtalo de nuevo.');
        }
      } catch (error) {
        setApiError('No se pudo conectar al servidor. Por favor, inténtalo más tarde.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateOtp();
    setErrors(validationErrors);
    setApiError(null);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, code: otp }),
        });

        const data = await response.json();

        if (response.ok) {
          // Obtener información del usuario
          const userResponse = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${data.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            authLogin(data.token, userData.user);
            router.push('/dashboard/coordinador');
          } else {
            setApiError('Error al obtener información del usuario');
          }
        } else {
          setApiError(data.error || 'El código OTP es incorrecto. Inténtalo de nuevo.');
        }
      } catch (error) {
        setApiError('No se pudo conectar al servidor. Por favor, inténtalo más tarde.');
      } finally {
        setLoading(false);
      }
    }
  };

  const isButtonDisabled = step === 'credentials' ? (!email || !password || loading) : (!otp || loading);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {step === 'credentials' ? (
          <>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                S
              </div>
              <h1 className="mt-4 text-3xl font-extrabold !text-slate-900">Sistema de Prácticas FTR</h1>
              <p className="mt-2 text-sm !text-slate-800">Inicia sesión para continuar</p>
            </div>
            <form className="space-y-6" onSubmit={handleCredentialSubmit} noValidate>
              <Input
                id="email"
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
                required
                placeholder="tu@correo.com"
              />
              <Input
                id="password"
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
              <button
                type="submit"
                disabled={isButtonDisabled}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {loading ? 'Cargando...' : 'Continuar'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="mt-4 text-3xl font-extrabold !text-slate-900">Verificar Código</h1>
              <p className="mt-2 text-sm !text-slate-800">Se ha enviado un código a {email}</p>
            </div>
            <form className="space-y-6" onSubmit={handleOtpSubmit} noValidate>
              <Input
                id="otp"
                label="Código OTP"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                error={errors.otp}
                required
                placeholder="123456"
              />
              <button
                type="submit"
                disabled={isButtonDisabled}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {loading ? 'Verificando...' : 'Iniciar sesión'}
              </button>
            </form>
          </>
        )}

        {apiError && (
          <div className="mt-4 p-4 rounded-md border-2" style={{backgroundColor: '#fef2f2', borderColor: '#dc2626'}}>
            <p className="!text-red-900 font-bold text-sm mb-1" style={{color: '#7f1d1d !important', fontWeight: 'bold'}}>Error</p>
            <p className="!text-red-900 font-semibold text-sm" style={{color: '#7f1d1d !important', fontWeight: '600'}}>{apiError}</p>
          </div>
        )}
      </div>
    </div>
  );
}