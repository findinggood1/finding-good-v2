import { type ReactNode } from 'react'

interface TopBarProps {
  title?: string
  logo?: ReactNode
  actions?: ReactNode
}

export function TopBar({ title, logo, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {logo && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}
          {title && (
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
