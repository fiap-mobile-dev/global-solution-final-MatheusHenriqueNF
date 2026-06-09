import ModalSelect, { type Option } from "@/components/ui/ModalSelect"
import CustomTextInput from "@/components/ui/CustomTextInput"
import { getLaunchProviders } from "@/lib/api"
import { useEffect, useMemo, useState } from "react"
import { Text, View } from "react-native"
import { SignUpData } from ".."

interface PersonalDataProps {
  data: SignUpData
  setData: React.Dispatch<React.SetStateAction<SignUpData>>
  errors: any
}

const DEFAULT_PERSONAL_DATA_CONFIG = {
  showCompanyField: false,
  documentLabel: "CPF/CNPJ",
  documentPlaceholder: "Insira seu CPF/CNPJ",
  nameLabel: "Nome",
  namePlaceholder: "Digite seu nome",
}

const PERSONAL_DATA_CONFIG: Record<
  string,
  typeof DEFAULT_PERSONAL_DATA_CONFIG
> = {
  SHIPPER: {
    showCompanyField: false,
    documentLabel: "CPF/CNPJ",
    documentPlaceholder: "Insira seu CPF/CNPJ",
    nameLabel: "Nome do Expedidor",
    namePlaceholder: "Digite o nome do Expedidor",
  },
  LAUNCHER_PROVIDER: {
    showCompanyField: false,
    documentLabel: "CNPJ",
    documentPlaceholder: "Insira seu CNPJ",
    nameLabel: "Razao social",
    namePlaceholder: "Digite a razao social",
  },
  PAYLOAD_HANDLER: {
    showCompanyField: true,
    documentLabel: "CPF",
    documentPlaceholder: "Insira seu CPF",
    nameLabel: "Nome do Operador de Lancamento",
    namePlaceholder: "Digite o nome do Operador de Lancamento",
  },
}

const PersonalData = ({ data, setData, errors }: PersonalDataProps) => {
  const [isCompanyModalVisible, setIsCompanyModalVisible] = useState(false)
  const [companyOptions, setCompanyOptions] = useState<Option[]>([])
  const personalDataConfig =
    PERSONAL_DATA_CONFIG[data.signUpType] ?? DEFAULT_PERSONAL_DATA_CONFIG
  const selectedCompany = useMemo<Option | null>(() => {
    if (!data.launchProviderId || !data.company) return null

    return {
      id: data.launchProviderId,
      label: data.company,
    }
  }, [data.company, data.launchProviderId])

  useEffect(() => {
    const loadLaunchProviders = async () => {
      if (data.signUpType !== "PAYLOAD_HANDLER") return

      try {
        const response = await getLaunchProviders()
        setCompanyOptions(
          response.items.map((item) => ({
            id: item.launch_provider_id,
            label: item.corporate_name,
          })),
        )
      } catch {
        setCompanyOptions([])
      }
    }

    void loadLaunchProviders()
  }, [data.signUpType])

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
          Dados pessoais
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
          Preencha as informacoes basicas do cadastro.
        </Text>
      </View>

      {personalDataConfig.showCompanyField ? (
        <View style={{ gap: 6 }}>
          <ModalSelect
            title="Empresa"
            visible={isCompanyModalVisible}
            value={selectedCompany}
            options={companyOptions}
            openModal={() => setIsCompanyModalVisible(true)}
            closeModal={() => setIsCompanyModalVisible(false)}
            optionSelected={(option) =>
              setData((prev) => ({
                ...prev,
                company: option.label,
                launchProviderId: Number(option.id),
              }))
            }
          />

          {errors.company ? (
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#EF4444",
              }}
            >
              {errors.company}
            </Text>
          ) : null}
        </View>
      ) : null}

      <CustomTextInput
        label={personalDataConfig.nameLabel}
        placeholder={personalDataConfig.namePlaceholder}
        value={data.name}
        error={errors.name}
        onChangeText={(value) => setData((prev) => ({ ...prev, name: value }))}
      />

      <CustomTextInput
        label={personalDataConfig.documentLabel}
        placeholder={personalDataConfig.documentPlaceholder}
        value={data.document}
        error={errors.document}
        onChangeText={(value) =>
          setData((prev) => ({ ...prev, document: value }))
        }
      />
    </View>
  )
}

export default PersonalData
