import React, { useEffect } from 'react'
import { Search, Filter, X, Calendar } from 'lucide-react'
import { useContactStore } from '../../stores/contactStore'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import TagSelector from './TagSelector'

const ContactFilters: React.FC = () => {
  const { 
    filters, 
    setFilters, 
    clearFilters, 
    fetchContacts 
  } = useContactStore()

  // Apply filters when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchContacts()
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [filters, fetchContacts])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }


  const handleTagsChange = (tagIds: number[]) => {
    setFilters({ tag_ids: tagIds.length > 0 ? tagIds : undefined })
  }

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ date_exp_from: e.target.value || undefined })
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ date_exp_to: e.target.value || undefined })
  }

  const handleClearFilters = () => {
    clearFilters()
  }

  const hasActiveFilters = !!(
    filters.search || 
    (filters.tag_ids && filters.tag_ids.length > 0) ||
    filters.date_exp_from ||
    filters.date_exp_to
  )

  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-red-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Filtros</h3>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center text-gray-300 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              value={filters.search || ''}
              onChange={handleSearchChange}
              placeholder="Nome, telefone ou username..."
              className="pl-10"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Busca por nome, telefone ou username dos accounts
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags
          </label>
          <TagSelector
            selectedTagIds={filters.tag_ids || []}
            onChange={handleTagsChange}
            placeholder="Selecionar tags..."
          />
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Data de Expiração - De
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="date"
              value={filters.date_exp_from || ''}
              onChange={handleDateFromChange}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Accounts que expiram a partir desta data
          </p>
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Data de Expiração - Até
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="date"
              value={filters.date_exp_to || ''}
              onChange={handleDateToChange}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Accounts que expiram até esta data
          </p>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              Filtros ativos:
              {filters.search && ` Busca: "${filters.search}"`}
              {filters.tag_ids && filters.tag_ids.length > 0 && ` Tags: ${filters.tag_ids.length} selecionada(s)`}
              {filters.date_exp_from && ` De: ${new Date(filters.date_exp_from).toLocaleDateString('pt-BR')}`}
              {filters.date_exp_to && ` Até: ${new Date(filters.date_exp_to).toLocaleDateString('pt-BR')}`}
            </span>
            <span className="text-xs text-gray-400">
              Pressione Enter ou aguarde para aplicar
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactFilters