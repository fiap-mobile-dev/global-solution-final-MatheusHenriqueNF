import { getLaunchProviders, createSatellite } from "@/lib/api"
import ModalSelect, { type Option } from "@/components/ui/ModalSelect"
import {
  formatDecimal,
  validateForm,
  validateNumber,
  validatePositive,
  validateRequired,
} from "@/utils/masks"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"
import CustomTextInput from "./ui/CustomTextInput"

const NewPackageForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProviderModalVisible, setIsProviderModalVisible] = useState(false)
  const [providerOptions, setProviderOptions] = useState<Option[]>([])
  const [data, setData] = useState({
    name: "",
    launchProviderId: "",
    launchProviderName: "",
    height: "",
    width: "",
    length: "",
    weight: "",
    justify: "",
  })

  const [dataErrors, setDataErrors] = useState({
    name: "",
    launchProviderId: "",
    height: "",
    width: "",
    length: "",
    weight: "",
    justify: "",
  })

  const selectedProvider = useMemo<Option | null>(() => {
    if (!data.launchProviderId || !data.launchProviderName) return null

    return {
      id: data.launchProviderId,
      label: data.launchProviderName,
    }
  }, [data.launchProviderId, data.launchProviderName])

  const validations = {
    name: [validateRequired],
    launchProviderId: [validateRequired, validateNumber, validatePositive],
    height: [validateRequired, validateNumber, validatePositive],
    width: [validateRequired, validateNumber, validatePositive],
    length: [validateRequired, validateNumber, validatePositive],
    weight: [validateRequired, validateNumber, validatePositive],
    justify: [validateRequired],
  }

  useEffect(() => {
    const loadLaunchProviders = async () => {
      try {
        const response = await getLaunchProviders()
        setProviderOptions(
          response.items.map((item) => ({
            id: item.launch_provider_id,
            label: item.corporate_name,
          })),
        )
      } catch {
        setProviderOptions([])
      }
    }

    void loadLaunchProviders()
  }, [])

  const handleSubmit = async () => {
    if (isSubmitting) return

    const [validatedData, newErrors] = validateForm(data, validations)
    setDataErrors(newErrors)

    if (Object.values(newErrors).some(Boolean)) return

    try {
      setIsSubmitting(true)

      await createSatellite({
        launch_provider_id: Number(validatedData.launchProviderId),
        name: validatedData.name,
        height: Number(validatedData.height),
        width: Number(validatedData.width),
        length: Number(validatedData.length),
        weight: Number(validatedData.weight),
        launch_justification: validatedData.justify,
      })

      Alert.alert("Satelite cadastrado", "Seu satelite foi enviado com sucesso.", [
        {
          text: "OK",
          onPress: () => {
            setData({
              name: "",
              launchProviderId: "",
              launchProviderName: "",
              height: "",
              width: "",
              length: "",
              weight: "",
              justify: "",
            })
            router.back()
          },
        },
      ])
    } catch (error) {
      Alert.alert(
        "Erro ao cadastrar",
        error instanceof Error
          ? error.message
          : "Nao foi possivel cadastrar o satelite.",
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
          Dados do satelite
        </Text>

        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: "#64748B",
          }}
        >
          Preencha os dados tecnicos para continuar com o envio.
        </Text>
      </View>

      <CustomTextInput
        label="Nome"
        placeholder="Defina um nome para seu satelite"
        value={data.name}
        error={dataErrors.name}
        onChangeText={(value) => setData((prev) => ({ ...prev, name: value }))}
      />

      <View style={{ gap: 6 }}>
        <ModalSelect
          title="Provedora de lancamento"
          visible={isProviderModalVisible}
          value={selectedProvider}
          options={providerOptions}
          openModal={() => setIsProviderModalVisible(true)}
          closeModal={() => setIsProviderModalVisible(false)}
          optionSelected={(option) =>
            setData((prev) => ({
              ...prev,
              launchProviderId: String(option.id),
              launchProviderName: option.label,
            }))
          }
        />

        {dataErrors.launchProviderId ? (
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: "#EF4444",
            }}
          >
            {dataErrors.launchProviderId}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <CustomTextInput
            label="Altura"
            placeholder="Altura"
            value={data.height}
            error={dataErrors.height}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, height: value }))
            }
            dataMask={formatDecimal}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={{ flex: 1 }}>
          <CustomTextInput
            label="Largura"
            placeholder="Largura"
            value={data.width}
            error={dataErrors.width}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, width: value }))
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
            label="Comprimento"
            placeholder="Comprimento"
            value={data.length}
            error={dataErrors.length}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, length: value }))
            }
            dataMask={formatDecimal}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={{ flex: 1 }}>
          <CustomTextInput
            label="Peso"
            placeholder="Peso"
            value={data.weight}
            error={dataErrors.weight}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, weight: value }))
            }
            dataMask={formatDecimal}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <CustomTextInput
        label="Justificativa"
        placeholder="Por que seu satelite deve ser selecionado?"
        value={data.justify}
        error={dataErrors.justify}
        onChangeText={(value) =>
          setData((prev) => ({ ...prev, justify: value }))
        }
      />

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
          {isSubmitting ? "Enviando..." : "Enviar solicitacao"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default NewPackageForm
