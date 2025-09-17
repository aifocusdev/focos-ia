import React from 'react'
import { clsx } from 'clsx'

interface TableColumn {
  key: string
  header: string
  className?: string
  render?: (value: any, item: any, index: number) => React.ReactNode
}

interface TableProps {
  columns: TableColumn[]
  data: any[]
  isLoading?: boolean
  loadingRows?: number
  emptyMessage?: string
  emptyAction?: React.ReactNode
  className?: string
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  isLoading = false,
  loadingRows = 5,
  emptyMessage = 'Nenhum item encontrado',
  emptyAction,
  className
}) => {
  const renderSkeletonRow = (index: number) => (
    <tr key={`skeleton-${index}`} className="border-b border-gray-600">
      {columns.map((column) => (
        <td key={column.key} className="px-4 py-4">
          <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  )

  const renderDataRow = (item: any, index: number) => (
    <tr 
      key={item.id || index} 
      className="border-b border-gray-600 hover:bg-gray-700 transition-colors duration-150"
    >
      {columns.map((column) => (
        <td 
          key={column.key} 
          className={clsx(
            'px-4 py-4 text-gray-300',
            column.className
          )}
        >
          {column.render 
            ? column.render(item[column.key], item, index)
            : item[column.key]
          }
        </td>
      ))}
    </tr>
  )

  const renderEmptyState = () => (
    <tr>
      <td colSpan={columns.length} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-gray-500 rounded-full"></div>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {emptyMessage}
          </h3>
          {emptyAction && (
            <div className="mt-4">
              {emptyAction}
            </div>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className={clsx('overflow-hidden rounded-lg border border-gray-700', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-4 py-3 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider',
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-600">
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, index) => 
                renderSkeletonRow(index)
              )
            ) : data.length > 0 ? (
              data.map((item, index) => renderDataRow(item, index))
            ) : (
              renderEmptyState()
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table