import React, { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { User, CreateUser, UpdateUser, Role } from '../../types/user.types'
import { roleService } from '../../services/role/role.service'

// Schema de validação para criação
const createSchema = yup.object({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  username: yup
    .string()
    .required('Username é obrigatório')
    .max(150, 'Username deve ter no máximo 150 caracteres'),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(255, 'Senha deve ter no máximo 255 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/, 'Senha deve conter pelo menos 1 letra e 1 número'),
  role_id: yup
    .number()
    .required('Role é obrigatório')
    .positive('Role deve ser um número positivo'),
  contact_type_preference: yup
    .string()
    .required('Tipo de contato é obrigatório')
    .oneOf(['ads', 'all', 'support'], 'Tipo de contato inválido'),
  contact_type_restriction: yup
    .boolean()
    .required('Restrição de contato é obrigatória')
})

// Schema de validação para edição  
const updateSchema = yup.object({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  username: yup
    .string()
    .required('Username é obrigatório')
    .max(150, 'Username deve ter no máximo 150 caracteres'),
  password: yup
    .string()
    .test('password-validation', 'Senha inválida', function(value) {
      if (!value || value === '') return true; // Allow empty = keep current password
      if (value.length < 6) return this.createError({ message: 'Senha deve ter pelo menos 6 caracteres' });
      if (value.length > 255) return this.createError({ message: 'Senha deve ter no máximo 255 caracteres' });
      if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(value)) return this.createError({ message: 'Senha deve conter pelo menos 1 letra e 1 número' });
      return true;
    }),
  role_id: yup
    .number()
    .required('Role é obrigatório')
    .positive('Role deve ser um número positivo'),
  contact_type_preference: yup
    .string()
    .required('Tipo de contato é obrigatório')
    .oneOf(['ads', 'all', 'support'], 'Tipo de contato inválido'),
  contact_type_restriction: yup
    .boolean()
    .required('Restrição de contato é obrigatória')
})

interface UserFormProps {
  user?: User
  loading?: boolean
  onSubmit: (data: CreateUser | UpdateUser) => Promise<void>
  onCancel: () => void
}

type UserFormData = {
  name: string
  username: string
  password: string
  role_id: number
  contact_type_preference: 'ads' | 'all' | 'support'
  contact_type_restriction: boolean
}

const UserForm: React.FC<UserFormProps> = ({ 
  user, 
  loading = false, 
  onSubmit, 
  onCancel 
}) => {
  const isEdit = !!user
  const schema = isEdit ? updateSchema : createSchema
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [rolesError, setRolesError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control
  } = useForm<UserFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: user ? {
      name: user.name,
      username: user.username,
      password: '', // Senha sempre vazia no edit
      role_id: user.role_id,
      contact_type_preference: user.contact_type_preference,
      contact_type_restriction: user.contact_type_restriction
    } : {
      name: '',
      username: '',
      password: '',
      role_id: 0, // Will be set after roles are loaded
      contact_type_preference: 'all' as 'ads' | 'all' | 'support',
      contact_type_restriction: false
    }
  })

  // Watch contact_type_restriction value for toggle display
  const contactTypeRestriction = useWatch({
    control,
    name: 'contact_type_restriction'
  })

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true)
        setRolesError(null)
        const fetchedRoles = await roleService.getRoles()
        setRoles(fetchedRoles)
        
        // Set default role for new users (first available role or fallback)
        if (!user && fetchedRoles.length > 0) {
          const defaultRole = fetchedRoles.find(role => role.name.toLowerCase() === 'operador') || fetchedRoles[0]
          setValue('role_id', defaultRole.id)
        }
      } catch (error) {
        console.error('Error fetching roles:', error)
        setRolesError('Erro ao carregar perfis')
        // Fallback to default roles if API fails
        const fallbackRoles = [
          { id: 1, name: 'Admin' },
          { id: 2, name: 'Operador' },
          { id: 3, name: 'Usuário' }
        ]
        setRoles(fallbackRoles)
        if (!user) {
          setValue('role_id', 2) // Default to Operador
        }
      } finally {
        setRolesLoading(false)
      }
    }

    fetchRoles()
  }, [user, setValue])

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      // Remove campos vazios no caso de edição
      if (isEdit) {
        const updateData: UpdateUser = {}
        if (data.name !== user?.name) updateData.name = data.name
        if (data.username !== user?.username) updateData.username = data.username
        if (data.password) updateData.password = data.password
        if (data.role_id !== user?.role_id) updateData.role_id = data.role_id
        if (data.contact_type_preference !== user?.contact_type_preference) updateData.contact_type_preference = data.contact_type_preference
        if (data.contact_type_restriction !== user?.contact_type_restriction) updateData.contact_type_restriction = data.contact_type_restriction
        
        await onSubmit(updateData)
      } else {
        await onSubmit(data)
      }
    } catch (error) {
      // Error handling é feito pelo componente pai
      console.error('Form submit error:', error)
    }
  }


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Nome */}
      <Input
        {...register('name')}
        label="Nome"
        type="text"
        placeholder="Digite o nome completo"
        disabled={loading}
        error={errors.name?.message}
      />

      {/* Username */}
      <Input
        {...register('username')}
        label="Username"
        type="text"
        placeholder="Digite o nome de usuário"
        disabled={loading}
        error={errors.username?.message}
      />

      {/* Password */}
      <Input
        {...register('password')}
        label={isEdit ? "Nova Senha (deixe vazio para manter)" : "Senha"}
        type="password"
        placeholder={isEdit ? "Digite a nova senha ou deixe vazio" : "Digite a senha"}
        disabled={loading}
        error={errors.password?.message}
      />

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Perfil
        </label>
        <select
          {...register('role_id', { valueAsNumber: true })}
          disabled={loading || rolesLoading}
          className={`
            w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors.role_id ? 'border-red-500' : ''}
          `}
        >
          {rolesLoading ? (
            <option value="">Carregando perfis...</option>
          ) : roles.length === 0 ? (
            <option value="">Nenhum perfil disponível</option>
          ) : (
            roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))
          )}
        </select>
        {rolesError && (
          <p className="mt-1 text-sm text-yellow-400">{rolesError}</p>
        )}
        {errors.role_id && (
          <p className="mt-1 text-sm text-red-400">{errors.role_id.message}</p>
        )}
      </div>

      {/* Contact Type Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tipo de Contato
        </label>
        <select
          {...register('contact_type_preference')}
          disabled={loading}
          className={`
            w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors.contact_type_preference ? 'border-red-500' : ''}
          `}
        >
          <option value="ads">Anúncios</option>
          <option value="all">Todos</option>
          <option value="support">Suporte</option>
        </select>
        {errors.contact_type_preference && (
          <p className="mt-1 text-sm text-red-400">{errors.contact_type_preference.message}</p>
        )}
      </div>

      {/* Contact Type Restriction */}
      <div>
        <label className="flex items-center">
          <input
            {...register('contact_type_restriction')}
            type="checkbox"
            disabled={loading}
            className="sr-only"
          />
          <div className={`
            relative inline-block w-10 h-6 transition-colors duration-200 ease-in-out rounded-full
            ${contactTypeRestriction ? 'bg-red-600' : 'bg-gray-600'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}>
            <span className={`
              inline-block w-4 h-4 transition-transform duration-200 ease-in-out transform bg-white rounded-full shadow
              ${contactTypeRestriction ? 'translate-x-5' : 'translate-x-1'}
            `} />
          </div>
          <span className="ml-3 text-sm font-medium text-gray-300">
            Restrição de Tipo de Contato
          </span>
        </label>
        <p className="mt-1 text-sm text-gray-400">
          Quando ativa, restringe o usuário ao tipo de contato selecionado
        </p>
        {errors.contact_type_restriction && (
          <p className="mt-1 text-sm text-red-400">{errors.contact_type_restriction.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
        >
          {isEdit ? 'Atualizar' : 'Criar'} Usuário
        </Button>
      </div>
    </form>
  )
}

export default UserForm