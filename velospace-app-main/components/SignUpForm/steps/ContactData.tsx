import CustomTextInput from "@/components/ui/CustomTextInput"
import { Text, View } from "react-native"
import { SignUpData } from ".."

interface ContactDataProps {
  data: SignUpData
  setData: React.Dispatch<React.SetStateAction<SignUpData>>
  errors: any
}

const ContactData = ({ data, setData, errors }: ContactDataProps) => {
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
          Contato
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
          Informe seus dados de contato para continuar.
        </Text>
      </View>

      <CustomTextInput
        label="Email"
        placeholder="Digite seu email"
        value={data.email}
        error={errors.email}
        onChangeText={(value) => setData((prev) => ({ ...prev, email: value }))}
        keyboardType="email-address"
      />

      <CustomTextInput
        label="Telefone"
        placeholder="Digite seu telefone"
        value={data.phone}
        error={errors.phone}
        onChangeText={(value) => setData((prev) => ({ ...prev, phone: value }))}
        keyboardType="phone-pad"
      />
    </View>
  )
}

export default ContactData
