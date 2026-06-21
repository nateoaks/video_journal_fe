import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 py-16 text-center',
        className
      )}
    >
      {icon && (
        <div className="text-muted-foreground flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
