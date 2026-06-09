import CustomTextInput from "@/components/ui/CustomTextInput"
import { Text, View } from "react-native"
import { SignUpData } from ".."

interface SecurityProps {
  data: SignUpData
  setData: React.Dispatch<React.SetStateAction<SignUpData>>
  errors: any
}

const Security = ({ data, setData, errors }: SecurityProps) => {
  return (
    <View style={{ width: "100%", gap: 12 }}>
      <View
        style={{
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#0F172A",
          }}
        >
          Segurança
        </Text>

        <Text
          style={{
            maxWidth: 280,
            textAlign: "center",
            fontSize: 14,
            lineHeight: 20,
            color: "#64748B",
          }}
        >
          Defina uma senha forte para concluir o cadastro.
        </Text>
      </View>

      <CustomTextInput
        label="Senha"
        placeholder="Digite sua senha"
        value={data.password}
        error={errors.password}
        onChangeText={(value) =>
          setData((prev) => ({ ...prev, password: value }))
        }
      />

      <CustomTextInput
        label="Confirmar senha"
        placeholder="Confirme sua senha"
        value={data.confirmPassword}
        error={errors.confirmPassword}
        onChangeText={(value) =>
          setData((prev) => ({ ...prev, confirmPassword: value }))
        }
      />
    </View>
  )
}

export default Security