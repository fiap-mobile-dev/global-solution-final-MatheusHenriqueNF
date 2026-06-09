import type { CustomTextInputProps } from "@/types"
import { Text, TextInput, View } from "react-native"

const CustomTextInput = ({
  label,
  placeholder,
  value,
  error,
  onChangeText,
  keyboardType,
  dataMask = (inputValue: string) => inputValue,
}: CustomTextInputProps) => {
  return (
    <View
      style={{
        marginBottom: 16,
        width: "100%",
        gap: 8,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: "#334155",
        }}
      >
        {label}
      </Text>

      <TextInput
        style={{
          minHeight: 56,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: error ? "#F87171" : "#E2E8F0",
          backgroundColor: "#F8FAFC",
          paddingHorizontal: 16,
          fontSize: 16,
          color: "#0F172A",
        }}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={(inputValue) => onChangeText(dataMask(inputValue))}
        keyboardType={keyboardType}
        secureTextEntry={label.toLowerCase().includes("senha")}
      />

      {error ? (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: "#EF4444",
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  )
}

export default CustomTextInput
