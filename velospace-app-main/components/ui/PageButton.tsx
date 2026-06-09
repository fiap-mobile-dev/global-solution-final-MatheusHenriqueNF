import React from "react"
import { Text, TouchableOpacity } from "react-native"

type PageButtonProps = {
  title: string
  onPress?: () => void
  variant?: "primary" | "secondary"
}

const PageButton = ({ title, onPress, variant = "primary" }: PageButtonProps) => {
  const base = "min-h-14 items-center justify-center rounded-xl px-4"
  const style =
    variant === "primary"
      ? `${base} bg-red-500`
      : `${base} border border-slate-200 bg-slate-50`

  const textStyle = variant === "primary" ? "font-semibold text-white" : "font-semibold text-slate-700"

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} className={style}>
      <Text className={textStyle}>{title}</Text>
    </TouchableOpacity>
  )
}

export default PageButton
