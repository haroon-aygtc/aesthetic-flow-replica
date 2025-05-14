import * as React from "react"
import { X, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface MultiSelectOption {
    label: string
    value: string
}

interface MultiSelectProps {
    options: MultiSelectOption[]
    selected: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    disabled = false,
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (value: string) => {
        const updatedSelected = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value]

        onChange(updatedSelected)
    }

    const handleRemove = (value: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onChange(selected.filter((item) => item !== value))
    }

    return (
        <Popover open={open && !disabled} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-auto min-h-10 px-3 py-2",
                        disabled && "opacity-50 cursor-not-allowed",
                        !selected.length && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length > 0 ? (
                            selected.map((value) => {
                                const option = options.find((o) => o.value === value)
                                return (
                                    <Badge
                                        key={value}
                                        variant="secondary"
                                        className="mr-1 mb-1"
                                    >
                                        {option?.label}
                                        <button
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                            }}
                                            onClick={(e) => handleRemove(value, e)}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )
                            })
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command className="max-h-64">
                    <CommandGroup>
                        {options.map((option) => {
                            const isSelected = selected.includes(option.value)
                            return (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <div className={cn(
                                            "flex-shrink-0 border rounded-sm w-4 h-4 flex items-center justify-center",
                                            isSelected ? "bg-primary border-primary" : "border-input"
                                        )}>
                                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                        </div>
                                        <span>{option.label}</span>
                                    </div>
                                </CommandItem>
                            )
                        })}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
} 