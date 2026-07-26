import { useEffect } from "react"
import { toast } from "sonner"
import { useRegisterSW } from "virtual:pwa-register/react"

export function usePwaUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (needRefresh) {
      toast("New app version available.", {
        duration: Infinity,
        action: {
          label: "Update",
          onClick: () => updateServiceWorker(true),
        },
        cancel: {
          label: "Dismiss",
          onClick: () => setNeedRefresh(false),
        },
        onDismiss: () => setNeedRefresh(false),
      })
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh])
}
