import { useState } from "react"

// Hook to utilize localstorage
export const useSetting = (key: string, initialValue: string = "") => {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(key) || initialValue
  })

  // Method returned that will set the value in state and localstorage
  const setValueInBothPlaces = (val: string) => {
    const valueToSet = val || ""
    localStorage.setItem(key, valueToSet)
    setValue(valueToSet)
  }

  return [value, setValueInBothPlaces] as [string, (val: string) => void]
}

// Hook to handle requests done by main and having loading/error states in renderer
export const useMainMutation = ({
  mutationFn,
}: {
  mutationFn: () => Promise<string>
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mutate = async () => {
    setError(null)
    setIsSuccess(null)
    setIsLoading(true)

    try {
      await mutationFn()
      setIsSuccess(true)
    } catch (err) {
      // Electron is stupid and appends it's on message on top of mine, so remove that
      const cleanedUpMessage = err.message.replace(
        /Error invoking remote method '(.*?)': /i,
        ""
      )
      setError(cleanedUpMessage)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, isSuccess, error, mutate }
}
