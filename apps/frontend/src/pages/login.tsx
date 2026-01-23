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
  const [showPassword, setShowPassword] = useState(false);

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
            router.push('/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-2xl shadow-lg">
              <span className="!text-black">S</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">Sistema de Prácticas FTR</h1>
            <p className="mt-1 text-blue-100">
              {step === 'credentials' ? 'Inicia sesión para continuar' : 'Verificación de dos factores'}
            </p>
          </div>
          
          <div className="p-8">
            {step === 'credentials' ? (
              <>
                <form className="space-y-6" onSubmit={handleCredentialSubmit} noValidate>
                  <div>
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
                  </div>
                  
                  <div>
                    <Input
                      id="password"
                      label="Contraseña"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={errors.password}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isButtonDisabled}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cargando...
                      </>
                    ) : 'Continuar'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold !text-black">Verificar Código</h2>
                  <p className="mt-1 text-sm !text-black">Se ha enviado un código a {email}</p>
                </div>
                
                <form className="space-y-6" onSubmit={handleOtpSubmit} noValidate>
                  <div>
                    <Input
                      id="otp"
                      label="Código OTP"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      error={errors.otp}
                      required
                      placeholder="123456"
                      maxLength={6}
                    />
                    <p className="mt-2 text-xs !text-black">Ingresa el código de 6 dígitos enviado a tu correo</p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isButtonDisabled}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                      </>
                    ) : 'Iniciar sesión'}
                  </button>
                </form>

              </>
            )}
            
            {apiError && (
              <div className="mt-6 p-4 rounded-lg border border-red-200 bg-red-50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{apiError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs !text-black">
            © {new Date().getFullYear()} Sistema de Prácticas FTR. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}