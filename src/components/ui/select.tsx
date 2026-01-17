import * as React from "react"
import { cn } from "../../lib/utils"

const Select = ({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        {...props}
    >
        {children}
    </select>
)

const SelectTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("flex items-center justify-between", className)}>{children}</div>
)

const SelectValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>

const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
