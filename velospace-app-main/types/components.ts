import type { KeyboardTypeOptions } from "react-native"

export interface CustomTextInputProps {
  label: string
  placeholder: string
  value: string
  error?: string
  onChangeText: (value: string) => void
  keyboardType?: KeyboardTypeOptions
  dataMask?: (value: string) => string
}
