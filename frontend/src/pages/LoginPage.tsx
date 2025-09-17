import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuthStore } from '../stores'
import { Eye, EyeOff, MessageCircle } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'

const schema = yup.object({
  username: yup
    .string()
    .required('Username é obrigatório')
    .min(1, 'Username deve ter pelo menos 1 caractere'),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
})

type LoginFormData = yup.InferType<typeof schema>

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated]) // Só observar isAuthenticated

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setLoginError(null)

    try {
      await login(data.username, data.password)
      // Navigation is handled by useEffect above when isAuthenticated changes
    } catch (error: unknown) {
      console.error('Login failed:', error)
      
      const loginError = error as Error;
      setLoginError(loginError.message || 'Erro interno do servidor. Tente novamente.');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 w-20 h-20 bg-red-900 rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              FOCOS IA
            </h1>
            <p className="text-gray-300">Sistema de CRM & Atendimento</p>
          </div>

          {/* Error Message */}
          <ErrorMessage message={loginError || undefined} className="mb-6" />

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <Input
              {...register('username')}
              label="Usuário"
              type="text"
              autoComplete="username"
              placeholder="Digite seu usuário"
              disabled={isLoading}
              error={errors.username?.message}
            />

            {/* Password Field */}
            <Input
              {...register('password')}
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              disabled={isLoading}
              error={errors.password?.message}
              icon={showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              onIconClick={() => setShowPassword(!showPassword)}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-dark-600">
            <p className="text-xs text-gray-400">
              © 2025 ApiCeChat - Sistema de CRM
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
