import { type ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  centered?: boolean
  className?: string
  noPadding?: boolean
  hasBottomNav?: boolean
}

export function PageContainer({
  children,
  centered = false,
  className = '',
  noPadding = false,
  hasBottomNav = false,
}: PageContainerProps) {
  return (
    <main
      className={`
        w-full max-w-lg mx-auto min-h-screen
        ${noPadding ? '' : 'px-4 py-4'}
        ${hasBottomNav ? 'pb-20' : ''}
        ${centered ? 'flex flex-col items-center justify-center' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </main>
  )
}
