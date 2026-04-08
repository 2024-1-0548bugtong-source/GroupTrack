"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const isExtension =
  import.meta.env.VITE_IS_EXTENSION === "true" ||
  window.location.protocol === "chrome-extension:"

function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join("")
  if (React.isValidElement(node)) return getNodeText((node as React.ReactElement<any>).props?.children)
  return ""
}

function findLabelForValue(children: React.ReactNode, value?: string): string | null {
  if (!value) return null

  const walk = (node: React.ReactNode): string | null => {
    if (!React.isValidElement(node)) {
      if (Array.isArray(node)) {
        for (const child of node) {
          const found = walk(child)
          if (found) return found
        }
      }
      return null
    }

    const element = node as React.ReactElement<any>
    if (element.props?.value === value) {
      const text = getNodeText(element.props?.children).trim()
      return text || null
    }

    return walk(element.props?.children)
  }

  return walk(children)
}

// Extension-mode fallback Select context
const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (val: string) => void
}>({})

// Simple wrapper for extension mode
const SelectExtension = ({ 
  value, 
  onValueChange, 
  children,
  disabled
}: { 
  value?: string
  onValueChange?: (val: string) => void
  children: React.ReactNode
  disabled?: boolean
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement>(null)
  
  const handleSelectItem = (itemValue: string) => {
    onValueChange?.(itemValue)
    setIsOpen(false)
  }
  
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const selectedLabel = React.useMemo(() => {
    const label = findLabelForValue(children, value)
    return label || value || "Select..."
  }, [children, value])
  
  return (
    <SelectContext.Provider value={{ value, onValueChange: handleSelectItem }}>
      <div className="relative w-full" ref={triggerRef}>
        <div 
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="line-clamp-1">{selectedLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
        {isOpen && !disabled && (
          <div 
            className={cn(
              "absolute top-full left-0 z-50 w-full mt-1 min-w-[8rem] max-h-72",
              "overflow-y-auto rounded-md border bg-popover p-1",
              "text-popover-foreground shadow-md"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        )}
      </div>
    </SelectContext.Provider>
  )
}

const SelectWithProps = (props: any) => {
  const { disabled, ...rest } = props
  return <SelectExtension {...rest} disabled={disabled} />
}

const Select = isExtension ? SelectWithProps : SelectPrimitive.Root

const SelectGroup = isExtension ? ({ children }: { children: React.ReactNode }) => <>{children}</> : SelectPrimitive.Group

const SelectValue = isExtension ? ({ placeholder }: { placeholder?: string }) => {
  const ctx = React.useContext(SelectContext)
  return <span>{ctx.value || placeholder}</span>
} : SelectPrimitive.Value

const SelectTrigger = isExtension
  ? React.forwardRef<HTMLDivElement, { className?: string; children: React.ReactNode }>(
      ({ className, children }, ref) => <>{children}</>,
    )
  : React.forwardRef<
      React.ElementRef<typeof SelectPrimitive.Trigger>,
      React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
    >(({ className, children, ...props }, ref) => (
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className
        )}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    ))
SelectTrigger.displayName = "SelectTrigger"

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = isExtension
  ? React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
      ({ children, className }, ref) => <>{children}</>,
    )
  : React.forwardRef<
      React.ElementRef<typeof SelectPrimitive.Content>,
      React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
    >(({ className, children, position = "popper", ...props }, ref) => {
      const resolvedPosition = isExtension ? "item-aligned" : position

      const content = (
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            "relative z-50 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
            isExtension ? "max-h-72" : "max-h-[--radix-select-content-available-height]",
            resolvedPosition === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className
          )}
          position={resolvedPosition}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              "p-1",
              resolvedPosition === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      )

      return <SelectPrimitive.Portal>{content}</SelectPrimitive.Portal>
    })
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItemExt = React.forwardRef<
  HTMLDivElement,
  { value: string; children: React.ReactNode; className?: string }
>(({ value, children, className }, ref) => {
  const ctx = React.useContext(SelectContext)
  const isSelected = ctx.value === value
  
  return (
    <div
      ref={ref}
      onClick={() => {
        ctx.onValueChange?.(value)
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
        className
      )}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      <span className={isSelected ? "pl-0" : ""}>{children}</span>
    </div>
  )
})
SelectItemExt.displayName = "SelectItemExt"

const SelectItem = isExtension 
  ? SelectItemExt 
  : React.forwardRef<
      React.ElementRef<typeof SelectPrimitive.Item>,
      React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
    >(({ className, children, ...props }, ref) => (
      <SelectPrimitive.Item
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <SelectPrimitive.ItemIndicator>
            <Check className="h-4 w-4" />
          </SelectPrimitive.ItemIndicator>
        </span>

        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    ))
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
