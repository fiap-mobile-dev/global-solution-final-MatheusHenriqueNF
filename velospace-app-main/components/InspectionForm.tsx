import { createInspection } from "@/lib/api"
import {
  formatDecimal,
  validateForm,
  validateNumber,
  validatePositive,
  validateRequired,
} from "@/utils/masks"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"

import CustomTextInput from "@/components/ui/CustomTextInput"

interface InspectionFormProps {
  satelliteId: number
}

const InspectionForm = ({ satelliteId }: InspectionFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState({
    measuredHeight: "",
    measuredWidth: "",
    measuredLength: "",
    measuredWeight: "",
  })
  const [dataErrors, setDataErrors] = useState({
    measuredHeight: "",
    measuredWidth: "",
    measuredLength: "",
    measuredWeight: "",
  })

  const validations = {
    measuredHeight: [validateRequired, validateNumber, validatePositive],
    measuredWidth: [validateRequired, validateNumber, validatePositive],
    measuredLength: [validateRequired, validateNumber, validatePositive],
    measuredWeight: [validateRequired, validateNumber, validatePositive],
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    const [validatedData, newErrors] = validateForm(data, validations)
    setDataErrors(newErrors)

    if (Object.values(newErrors).some(Boolean)) return

    try {
      setIsSubmitting(true)

      await createInspection({
        satellite_id: satelliteId,
        measured_height: Number(validatedData.measuredHeight),
        measured_width: Number(validatedData.measuredWidth),
        measured_length: Number(validatedData.measuredLength),
        measured_weight: Number(validatedData.measuredWeight),
      })

      Alert.alert("Inspecao registrada", "A inspecao do satelite foi salva.", [
        {
          text: "OK",
          onPress: () => {
            router.back()
          },
        },
      ])
    } catch (error) {
      Alert.alert(
        "Erro ao registrar",
        error instanceof Error
          ? error.message
          : "Nao foi possivel registrar a inspecao.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View
      style={{
        width: "100%",
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4,
      }}
    >
      <View
        style={{
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: "#0F172A",
            marginBottom: 6,
          }}
        >
          Medidas da inspecao
        </Text>

        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: "#64748B",
          }}
        >
          Informe as medidas aferidas para o satelite #{satelliteId}.
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <CustomTextInput
            label="Altura medida"
            placeholder="Altura"
            value={data.measuredHeight}
            error={dataErrors.measuredHeight}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, measuredHeight: value }))
            }
            dataMask={formatDecimal}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={{ flex: 1 }}>
          <CustomTextInput
            label="Largura medida"
            placeholder="Largura"
            value={data.measuredWidth}
            error={dataErrors.measuredWidth}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, measuredWidth: value }))
            }
            dataMask={formatDecimal}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <CustomTextInput
            label="Comprimento medido"
            placeholder="Comprimento"
            value={data.measuredLength}
            error={dataErrors.measuredLength}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, measuredLength: value }))
            }
            dataMask={formatDecimal}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={{ flex: 1 }}>
          <CustomTextInput
            label="Peso medido"
            placeholder="Peso"
            value={data.measuredWeight}
            error={dataErrors.measuredWeight}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, measuredWeight: value }))
            }
            dataMask={formatDecimal}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => void handleSubmit()}
        disabled={isSubmitting}
        style={{
          minHeight: 56,
          marginTop: 12,
          borderRadius: 999,
          backgroundColor: isSubmitting ? "#86C5A5" : "#059669",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#FFFFFF",
          }}
        >
          {isSubmitting ? "Salvando..." : "Salvar inspecao"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default InspectionForm
