import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useServers } from '../../hooks/data/useServers'
import { useApplications } from '../../hooks/data/useApplications'
import { useDevices } from '../../hooks/data/useDevices'
import type { ContactUserAccount, UpdateContactUserAccountRequest } from '../../types/contact-user-accounts.types'

interface EditContactUserAccountFormProps {
  account: ContactUserAccount
  isLoading: boolean
  onSubmit: (data: UpdateContactUserAccountRequest) => Promise<void>
  onCancel: () => void
}

const schema = yup.object({
  username_final: yup
    .string()
    .optional()
    .max(150, 'Username deve ter no máximo 150 caracteres'),
  password_final: yup
    .string()
    .optional()
    .max(255, 'Senha deve ter no máximo 255 caracteres'),
  server_id: yup
    .number()
    .required('Servidor é obrigatório')
    .positive('Servidor deve ser válido'),
  date_exp: yup
    .string()
    .required('Data de expiração é obrigatória')
    .test('is-valid-date', 'Data inválida', (value) => {
      if (!value) return false
      return !isNaN(Date.parse(value))
    }),
  application_id: yup
    .number()
    .optional()
    .nullable()
    .transform((value) => (value === null || value === '' || isNaN(Number(value))) ? null : Number(value)),
  device_id: yup
    .number()
    .optional()
    .nullable()
    .transform((value) => (value === null || value === '' || isNaN(Number(value))) ? null : Number(value))
})

const EditContactUserAccountForm: React.FC<EditContactUserAccountFormProps> = ({
  account,
  isLoading,
  onSubmit,
  onCancel
}) => {
  const [apiError, setApiError] = React.useState<string | null>(null)
  const { servers, isLoading: isLoadingServers } = useServers()
  const { applications, isLoading: isLoadingApplications } = useApplications()
  const { devices, isLoading: isLoadingDevices } = useDevices()
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors } 
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username_final: account.username_final,
      password_final: '',
      server_id: account.server_id || undefined,
      date_exp: account.date_exp ? new Date(account.date_exp).toISOString().substring(0, 16) : '',
      application_id: account.application_id || undefined,
      device_id: account.device_id || undefined
    }
  })

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    try {
      setApiError(null) // Limpa erros anteriores
      const updateData: UpdateContactUserAccountRequest = {
        username_final: data.username_final as string,
        password_final: (data.password_final as string) || undefined,
        server_id: Number(data.server_id),
        date_exp: new Date(data.date_exp as string).toISOString(),
        application_id: (data.application_id as number) || undefined,
        device_id: (data.device_id as number) || undefined
      }
      await onSubmit(updateData)
    } catch (error) {
      console.error('Error submitting form:', error)
      // Captura e exibe o erro específico da API
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar conta do usuário'
      setApiError(errorMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Username"
        {...register('username_final')}
        error={errors.username_final?.message}
        disabled={isLoading}
        placeholder="Digite o username"
      />

      <Input
        label="Nova Senha (opcional)"
        type="password"
        {...register('password_final')}
        error={errors.password_final?.message}
        disabled={isLoading}
        placeholder="Digite a nova senha (deixe vazio para manter a atual)"
      />

      <Controller
        key="server_id_controller"
        name="server_id"
        control={control}
        render={({ field }) => {
          return (
            <Select
              label="Servidor"
              options={servers.map(server => ({
                value: server.id,
                label: server.name
              }))}
              value={field.value}
              onChange={field.onChange}
              placeholder={isLoadingServers ? "Carregando servidores..." : "Selecione um servidor"}
              disabled={isLoading || isLoadingServers}
              error={errors.server_id?.message}
            />
          )
        }}
      />

      <Input
        label="Data de Expiração"
        type="datetime-local"
        {...register('date_exp')}
        error={errors.date_exp?.message}
        disabled={isLoading}
      />

      <Controller
        key="application_id_controller"
        name="application_id"
        control={control}
        render={({ field }) => {
          return (
            <Select
              label="Aplicação (opcional)"
              options={applications.map(app => ({
                value: app.id,
                label: app.name
              }))}
              value={field.value}
              onChange={field.onChange}
              placeholder={isLoadingApplications ? "Carregando aplicações..." : "Selecione uma aplicação"}
              disabled={isLoading || isLoadingApplications}
              error={errors.application_id?.message}
              allowEmpty
              emptyLabel="Nenhuma aplicação"
            />
          )
        }}
      />

      <Controller
        key="device_id_controller"
        name="device_id"
        control={control}
        render={({ field }) => {
          return (
            <Select
              label="Dispositivo (opcional)"
              options={devices.map(device => ({
                value: device.id,
                label: device.name
              }))}
              value={field.value}
              onChange={field.onChange}
              placeholder={isLoadingDevices ? "Carregando dispositivos..." : "Selecione um dispositivo"}
              disabled={isLoading || isLoadingDevices}
              error={errors.device_id?.message}
              allowEmpty
              emptyLabel="Nenhum dispositivo"
            />
          )
        }}
      />

      {/* Exibe erro específico da API */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          loading={isLoading}
          className="flex-1"
        >
          Atualizar Conta
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export default EditContactUserAccountForm