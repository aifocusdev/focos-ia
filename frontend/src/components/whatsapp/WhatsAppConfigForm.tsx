import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Eye, EyeOff, ExternalLink, Info } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { API_VERSIONS } from '../../types/whatsapp.types'
import type { WhatsAppConfig, CreateWhatsAppConfig, UpdateWhatsAppConfig } from '../../types/whatsapp.types'

// Schema de validação
const createSchema = yup.object({
  access_token: yup
    .string()
    .required('Access Token é obrigatório')
    .min(50, 'Access Token deve ter pelo menos 50 caracteres')
    .matches(/^EAA[A-Za-z0-9]+$/, 'Formato inválido de Access Token (deve começar com EAA)'),
  phone_number_id: yup
    .string()
    .required('Phone Number ID é obrigatório')
    .matches(/^\d{15,16}$/, 'Phone Number ID deve ter 15-16 dígitos'),
  business_account_id: yup
    .string()
    .matches(/^\d{15,16}$/, 'Business Account ID deve ter 15-16 dígitos')
    .optional(),
  api_version: yup
    .string()
    .required('Versão da API é obrigatória')
})

const updateSchema = yup.object({
  access_token: yup
    .string()
    .min(50, 'Access Token deve ter pelo menos 50 caracteres')
    .matches(/^EAA[A-Za-z0-9]+$/, 'Formato inválido de Access Token (deve começar com EAA)')
    .optional(),
  phone_number_id: yup
    .string()
    .matches(/^\d{15,16}$/, 'Phone Number ID deve ter 15-16 dígitos')
    .optional(),
  business_account_id: yup
    .string()
    .matches(/^\d{15,16}$/, 'Business Account ID deve ter 15-16 dígitos')
    .optional(),
  api_version: yup
    .string()
    .optional()
})

interface WhatsAppConfigFormProps {
  config?: WhatsAppConfig
  loading?: boolean
  onSubmit: (data: CreateWhatsAppConfig | UpdateWhatsAppConfig) => Promise<void>
  onCancel: () => void
}

type WhatsAppConfigFormData = {
  access_token: string
  phone_number_id: string
  business_account_id: string
  api_version: string
}

const WhatsAppConfigForm: React.FC<WhatsAppConfigFormProps> = ({ 
  config, 
  loading = false, 
  onSubmit, 
  onCancel 
}) => {
  const [showAccessToken, setShowAccessToken] = useState(false)
  const isEdit = !!config
  const schema = isEdit ? updateSchema : createSchema

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<WhatsAppConfigFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: config ? {
      access_token: '', // Token sempre vazio no edit por segurança
      phone_number_id: config.phone_number_id,
      business_account_id: config.business_account_id || '',
      api_version: config.api_version
    } : {
      access_token: '',
      phone_number_id: '',
      business_account_id: '',
      api_version: 'v23.0' // Versão padrão
    }
  })

  const handleFormSubmit = async (data: WhatsAppConfigFormData) => {
    try {
      if (isEdit) {
        const updateData: UpdateWhatsAppConfig = {}
        if (data.access_token) updateData.access_token = data.access_token
        if (data.phone_number_id !== config?.phone_number_id) updateData.phone_number_id = data.phone_number_id
        if (data.business_account_id !== config?.business_account_id) updateData.business_account_id = data.business_account_id
        if (data.api_version !== config?.api_version) updateData.api_version = data.api_version
        
        await onSubmit(updateData)
      } else {
        const createData: CreateWhatsAppConfig = {
          access_token: data.access_token,
          phone_number_id: data.phone_number_id,
          api_version: data.api_version,
        }
        if (data.business_account_id) {
          createData.business_account_id = data.business_account_id
        }
        
        await onSubmit(createData)
      }
    } catch (error) {
      console.error('Form submit error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Access Token */}
      <div>
        <Input
          {...register('access_token')}
          label={isEdit ? "Novo Access Token (deixe vazio para manter)" : "Access Token"}
          type={showAccessToken ? 'text' : 'password'}
          placeholder={isEdit ? "Digite o novo token ou deixe vazio" : "EAA..."}
          disabled={loading}
          error={errors.access_token?.message}
          icon={showAccessToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          onIconClick={() => setShowAccessToken(!showAccessToken)}
        />
        <div className="mt-2 p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Como obter o Access Token:</p>
              <p className="mb-2">1. Acesse o Meta Business Manager</p>
              <p className="mb-2">2. Vá em Configurações do Sistema → Tokens de Acesso</p>
              <p className="mb-2">3. Gere um token com permissões para WhatsApp Business</p>
              <a 
                href="https://developers.facebook.com/docs/whatsapp/business-management-api/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-300 hover:text-blue-200"
              >
                Ver documentação
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Number ID */}
      <div>
        <Input
          {...register('phone_number_id')}
          label="Phone Number ID"
          type="text"
          placeholder="1234567890123456"
          disabled={loading}
          error={errors.phone_number_id?.message}
        />
        <div className="mt-2 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-yellow-200">
              <p>ID único do número de telefone registrado no WhatsApp Business. Encontre este ID no Meta Business Manager.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Account ID */}
      <div>
        <Input
          {...register('business_account_id')}
          label="Business Account ID (Opcional)"
          type="text"
          placeholder="1234567890123456"
          disabled={loading}
          error={errors.business_account_id?.message}
        />
        <div className="mt-1 text-sm text-gray-400">
          ID da conta de negócios no Meta Business Manager (opcional)
        </div>
      </div>

      {/* API Version */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Versão da API
        </label>
        <select
          {...register('api_version')}
          disabled={loading}
          className={`
            w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors.api_version ? 'border-red-500' : ''}
          `}
        >
          {API_VERSIONS.map((version) => (
            <option key={version.value} value={version.value}>
              {version.label}
            </option>
          ))}
        </select>
        {errors.api_version && (
          <p className="mt-1 text-sm text-red-400">{errors.api_version.message}</p>
        )}
        <div className="mt-1 text-sm text-gray-400">
          Recomendamos usar a versão mais recente da API
        </div>
      </div>

      {/* Security Warning */}
      <div className="p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-red-200">
            <p className="font-medium mb-1">⚠️ Importante sobre Segurança:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Nunca compartilhe seu Access Token</li>
              <li>O token será criptografado e armazenado com segurança</li>
              <li>Monitore o uso da API regularmente</li>
              <li>Revogue tokens comprometidos imediatamente</li>
            </ul>
          </div>
        </div>
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
          {isEdit ? 'Atualizar' : 'Criar'} Configuração
        </Button>
      </div>
    </form>
  )
}

export default WhatsAppConfigForm