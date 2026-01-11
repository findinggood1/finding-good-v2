import { type ReactNode } from 'react'

export interface NavItem {
  id: string
  label: string
  icon: ReactNode
  href?: string
  onClick?: () => void
}

interface BottomNavProps {
  items: NavItem[]
  activeId?: string
  onNavigate?: (item: NavItem) => void
}

export function BottomNav({ items, activeId, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = item.id === activeId

          const handleClick = () => {
            if (item.onClick) {
              item.onClick()
            }
            if (onNavigate) {
              onNavigate(item)
            }
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={handleClick}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-colors duration-200
                ${isActive
                  ? 'text-[#0D7C66]'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `.trim().replace(/\s+/g, ' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`
                w-6 h-6 mb-1
                ${isActive ? 'scale-110' : ''}
                transition-transform duration-200
              `.trim().replace(/\s+/g, ' ')}>
                {item.icon}
              </div>
              <span className={`
                text-xs font-medium
                ${isActive ? 'font-semibold' : ''}
              `.trim().replace(/\s+/g, ' ')}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
