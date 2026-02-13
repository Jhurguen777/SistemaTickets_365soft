import React from 'react'
import { cn } from '@/utils/cn'

export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, hoverable = false }) => {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-lg border border-border',
        'shadow-sm',
        hoverable && 'hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return <div className={cn('p-6', className)}>{children}</div>
}

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>
}

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return <div className={cn('p-6 pt-0 flex items-center', className)}>{children}</div>
}

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return <h3 className={cn('text-lg font-bold leading-tight', className)}>{children}</h3>
}

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

export default Card
