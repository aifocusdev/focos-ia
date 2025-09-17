import React, { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

export interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string | number | null
  onChange: (value: string | number | null) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  allowEmpty?: boolean
  emptyLabel?: string
}

const Select: React.FC<SelectProps> = (props) => {
  const {
    options,
    value,
    onChange,
    placeholder = "Selecione uma opção",
    disabled = false,
    error,
    label,
    allowEmpty = false,
    emptyLabel = "Nenhum"
  } = props

  const allOptions = useMemo(() => {
    return allowEmpty 
      ? [{ value: '', label: emptyLabel }, ...options]
      : options
  }, [allowEmpty, emptyLabel, options])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value
    if (newValue === '') {
      onChange(allowEmpty ? '' : null)
    } else {
      // Tenta converter para número se for um número
      const numValue = Number(newValue)
      onChange(isNaN(numValue) ? newValue : numValue)
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={handleChange}
          disabled={disabled}
          className={clsx(
            "w-full appearance-none rounded-lg bg-gray-700 py-3 pl-3 pr-10 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-red-500 ring-red-500/20",
            !value && "text-gray-400"
          )}
        >
          {!allowEmpty && !value && (
            <option value="" disabled className="text-gray-400">
              {placeholder}
            </option>
          )}
          
          {allOptions.map((option) => (
            <option 
              key={`option-${option.value}`}
              value={option.value}
              className="bg-gray-700 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

export default Select