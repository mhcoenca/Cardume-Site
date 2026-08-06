"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitive.Provider
const useToastManager = ToastPrimitive.useToastManager

function ToastList() {
  const { toasts } = useToastManager()

  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      swipeDirection={['right', 'down']}
      className={cn(
        "rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-lg outline-none select-none",
        "transition-all data-starting-style:translate-y-2 data-starting-style:opacity-0 data-ending-style:opacity-0",
      )}
    >
      <ToastPrimitive.Title className="font-medium text-foreground" />
      {toast.description && (
        <ToastPrimitive.Description className="mt-0.5 text-xs text-muted-foreground" />
      )}
    </ToastPrimitive.Root>
  ))
}

function Toaster() {
  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        className="fixed bottom-4 left-1/2 z-100 flex w-72 -translate-x-1/2 flex-col gap-2 sm:right-4 sm:left-auto sm:translate-x-0"
      >
        <ToastList />
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}

export { Toaster, ToastProvider, useToastManager }
