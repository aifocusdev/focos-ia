import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  itemName?: string
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
  itemName = 'itens'
}) => {
  if (totalPages <= 1) return null

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    const halfVisible = Math.floor(maxVisiblePages / 2)
    
    let startPage = Math.max(1, currentPage - halfVisible)
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // First page and ellipsis
    if (startPage > 1) {
      pages.push(
        <Button
          key="first"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={isLoading}
          className="text-gray-300 hover:text-white"
        >
          1
        </Button>
      )
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 text-gray-500">
            ...
          </span>
        )
      }
    }

    // Visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "primary" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          disabled={isLoading}
          className={i === currentPage 
            ? "bg-red-900 text-white" 
            : "text-gray-300 hover:text-white"
          }
        >
          {i}
        </Button>
      )
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 text-gray-500">
            ...
          </span>
        )
      }
      
      pages.push(
        <Button
          key="last"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={isLoading}
          className="text-gray-300 hover:text-white"
        >
          {totalPages}
        </Button>
      )
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg">
      <div className="flex items-center">
        <p className="text-sm text-gray-300">
          Mostrando{' '}
          <span className="font-medium text-white">{startItem}</span>
          {' '}até{' '}
          <span className="font-medium text-white">{endItem}</span>
          {' '}de{' '}
          <span className="font-medium text-white">{totalItems}</span>
          {' '}{itemName}
        </p>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="text-gray-300 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>
        
        <div className="flex items-center space-x-1">
          {renderPageNumbers()}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="text-gray-300 hover:text-white"
        >
          Próximo
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

export default TablePagination