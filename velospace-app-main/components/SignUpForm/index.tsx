import { useMultiStepForm } from "@/hooks/useMultiStepForm"
import { createLaunchProvider } from "@/services/launchProviders"
import { createOperator as createLaunchOperator } from "@/services/operators"
import { createShipper } from "@/services/shippers"
import {
  validateEmail,
  validateForm,
  validateMinLength,
  validateRequired,
} from "@/utils/masks"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native"
import ContactData from "./steps/ContactData"
import PersonalData from "./steps/PersonalData"
import Security from "./steps/Security"
import SignUpType from "./steps/SignUpType"

export interface SignUpData {
  signUpType: string
  company?: string
  launchProviderId?: number
  name: string
  document: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

const SIGN_UP_TYPE_LABELS: Record<string, string> = {
  SHIPPER: "Expedidor",
  LAUNCHER_PROVIDER: "Provedora de Lancamento",
  PAYLOAD_HANDLER: "Operador de Lancamento",
}
const onlyDigits = (value: string) => value.replace(/\D/g, "")

const getStepErrors = (currentStepIndex: number, data: SignUpData) => {
  switch (currentStepIndex) {
    case 0: {
      const [, nextErrors] = validateForm(
        { signUpType: data.signUpType },
        {
          signUpType: [
            (value) => validateRequired(value, "O tipo de cadastro e obrigatorio"),
          ],
        },
      )

      return { signUpType: nextErrors.signUpType }
    }
    case 1: {
      const [validatedData, nextErrors] = validateForm(
        {
          company: data.company ?? "",
          name: data.name,
          document: data.document,
        },
        {
          company:
            data.signUpType === "PAYLOAD_HANDLER"
              ? [(value) => validateRequired(value, "A empresa e obrigatoria")]
              : [],
          name: [(value) => validateRequired(value, "O nome e obrigatorio")],
          document: [
            (value) => validateRequired(value, "O CPF/CNPJ e obrigatorio"),
          ],
        },
      )

      const normalizedDocument = onlyDigits(validatedData.document)

      return {
        company: nextErrors.company,
        name: nextErrors.name,
        document:
          validatedData.document && !normalizedDocument
            ? "Informe um CPF/CNPJ valido"
            : nextErrors.document,
      }
    }
    case 2: {
      const [validatedData, nextErrors] = validateForm(
        {
          email: data.email,
          phone: data.phone,
        },
        {
          email: [
            (value) => validateRequired(value, "O email e obrigatorio"),
            validateEmail,
          ],
          phone: [(value) => validateRequired(value, "O telefone e obrigatorio")],
        },
      )

      const normalizedPhone = onlyDigits(validatedData.phone)

      return {
        email: nextErrors.email,
        phone:
          validatedData.phone && !normalizedPhone
            ? "Informe um telefone valido"
            : nextErrors.phone,
      }
    }
    case 3: {
      const [validatedData, nextErrors] = validateForm(
        {
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
        {
          password: [
            (value) => validateRequired(value, "A senha e obrigatoria"),
            validateMinLength(6, "A senha precisa ter ao menos 6 caracteres"),
          ],
          confirmPassword: [
            (value) => validateRequired(value, "Confirme sua senha"),
          ],
        },
      )

      return {
        password: nextErrors.password,
        confirmPassword:
          validatedData.password &&
          validatedData.confirmPassword &&
          validatedData.password !== validatedData.confirmPassword
            ? "As senhas nao coincidem"
            : nextErrors.confirmPassword,
      }
    }
    default:
      return {}
  }
}

const SignUpForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [data, setData] = useState<SignUpData>({
    signUpType: "",
    company: undefined,
    name: "",
    document: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [dataErrors, setDataErrors] = useState({
    signUpType: "",
    company: "",
    name: "",
    document: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async () => {
    if (isSubmitting) return

    const [validatedData, validatedErrors] = validateForm(data, {
      signUpType: [
        (value) => validateRequired(value, "O tipo de cadastro e obrigatorio"),
      ],
      company:
        data.signUpType === "PAYLOAD_HANDLER"
          ? [(value) => validateRequired(value, "A empresa e obrigatoria")]
          : [],
      name: [(value) => validateRequired(value, "O nome e obrigatorio")],
      document: [
        (value) => validateRequired(value, "O CPF/CNPJ e obrigatorio"),
      ],
      email: [
        (value) => validateRequired(value, "O email e obrigatorio"),
        validateEmail,
      ],
      phone: [(value) => validateRequired(value, "O telefone e obrigatorio")],
      password: [
        (value) => validateRequired(value, "A senha e obrigatoria"),
        validateMinLength(6, "A senha precisa ter ao menos 6 caracteres"),
      ],
      confirmPassword: [
        (value) => validateRequired(value, "Confirme sua senha"),
      ],
    })

    const nextErrors = {
      ...dataErrors,
      ...validatedErrors,
    }
    const normalizedDocument = onlyDigits(validatedData.document)
    const normalizedPhone = onlyDigits(validatedData.phone)

    if (
      validatedData.password &&
      validatedData.confirmPassword &&
      validatedData.password !== validatedData.confirmPassword
    ) {
      nextErrors.confirmPassword = "As senhas nao coincidem"
    }

    if (validatedData.document && !normalizedDocument) {
      nextErrors.document = "Informe um CPF/CNPJ valido"
    }

    if (validatedData.phone && !normalizedPhone) {
      nextErrors.phone = "Informe um telefone valido"
    }

    setDataErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) return

    setData(validatedData)

    try {
      setIsSubmitting(true)

      if (validatedData.signUpType === "SHIPPER") {
        await createShipper({
          type: "PF",
          shipper_document: normalizedDocument,
          name: validatedData.name,
          email: validatedData.email,
          phone: normalizedPhone,
          password: validatedData.password,
        })
      } else if (validatedData.signUpType === "LAUNCHER_PROVIDER") {
        await createLaunchProvider({
          cnpj: normalizedDocument,
          corporate_name: validatedData.name,
          email: validatedData.email,
          phone: normalizedPhone,
          password: validatedData.password,
        })
      } else if (validatedData.signUpType === "PAYLOAD_HANDLER") {
        await createLaunchOperator({
          launch_provider_id: validatedData.launchProviderId ?? 1,
          cpf: normalizedDocument,
          name: validatedData.name,
          email: validatedData.email,
          phone: normalizedPhone,
          password: validatedData.password,
        })
      } else {
        throw new Error("Tipo de cadastro invalido para esta integracao.")
      }

      Alert.alert("Cadastro realizado", "Seu cadastro foi enviado com sucesso.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/sign-in"),
        },
      ])
    } catch (error) {
      Alert.alert(
        "Erro ao cadastrar",
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir o cadastro.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedSignUpTypeLabel = data.signUpType
    ? SIGN_UP_TYPE_LABELS[data.signUpType] ?? data.signUpType
    : "Tipo de cadastro"

  const { steps, currentStepIndex, step, isFirstStep, isLastStep, back, next } =
    useMultiStepForm([
      <SignUpType key={1} data={data} setData={setData} errors={dataErrors} />,
      <PersonalData
        key={2}
        data={data}
        setData={setData}
        errors={dataErrors}
      />,
      <ContactData key={3} data={data} setData={setData} errors={dataErrors} />,
      <Security key={4} data={data} setData={setData} errors={dataErrors} />,
    ])

  return (
    <View style={{ width: "100%", flex: 1 }}>
      <View
        style={{
          marginBottom: 18,
          alignItems: "center",
          gap: 4,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "#059669",
          }}
        >
          Etapa {currentStepIndex + 1} de {steps.length}
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: "#475569",
            textAlign: "center",
          }}
        >
          {selectedSignUpTypeLabel}
        </Text>
      </View>

      <ScrollView
        style={{ width: "100%", flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step}
      </ScrollView>

      <View
        style={{
          marginTop: 26,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {isFirstStep ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace("/(auth)/sign-in")}
            style={{
              minHeight: 56,
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Voltar ao login
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => back()}
            style={{
              minHeight: 56,
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Voltar
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (isLastStep) {
              void handleSubmit()
              return
            }

            const currentStepErrors = getStepErrors(currentStepIndex, data)

            setDataErrors((prev) => ({ ...prev, ...currentStepErrors }))

            if (Object.values(currentStepErrors).some(Boolean)) return

            next()
          }}
          disabled={isSubmitting}
          style={{
            minHeight: 56,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            backgroundColor: isSubmitting ? "#86C5A5" : "#059669",
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#FFFFFF",
            }}
          >
            {isLastStep
              ? isSubmitting
                ? "Cadastrando..."
                : "Finalizar"
              : "Avançar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SignUpForm
