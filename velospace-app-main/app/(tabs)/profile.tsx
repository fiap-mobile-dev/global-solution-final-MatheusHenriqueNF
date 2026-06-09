import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useContext, useEffect, useState } from "react"
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import CustomTextInput from "@/components/ui/CustomTextInput"
import { AuthContext } from "@/contexts/AuthContext"
import { LaunchProviderContext } from "@/contexts/LaunchProviderContext"
import { OperatorContext } from "@/contexts/OperatorContext"
import { UserContext } from "@/contexts/UserContext"
import { clearSession, storeUser } from "@/hooks/useAuthStorage"
import {
  getOperatorById,
  updateLaunchProviderPassword,
  updateLaunchProviderProfile,
  updateOperatorProfile,
  updateShipperPassword,
  updateShipperProfile,
} from "@/lib/api"
import type { OperatorProfile, User } from "@/types"
import {
  validateEmail,
  validateForm,
  validateMinLength,
  validateRequired,
} from "@/utils/masks"

const Profile = () => {
  const router = useRouter()
  const { user, setUser } = useContext(AuthContext)
  const {
    profile: operatorContextProfile,
    refreshProfile: refreshOperatorProfile,
  } = useContext(OperatorContext)
  const {
    profile: launchProviderProfile,
    refreshProfile: refreshLaunchProviderProfile,
  } = useContext(LaunchProviderContext)
  const { profile, refreshProfile } = useContext(UserContext)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [operatorProfile, setOperatorProfile] = useState<OperatorProfile | null>(null)

  const [role, setRole] = useState("")
  const [document, setDocument] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const [documentError, setDocumentError] = useState("")
  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [currentPasswordError, setCurrentPasswordError] = useState("")
  const [newPasswordError, setNewPasswordError] = useState("")
  const isOperator = user?.type === "PAYLOAD_HANDLER"
  const isLaunchProvider = user?.type === "LAUNCHER_PROVIDER"

  useEffect(() => {
    const loadOperatorProfile = async () => {
      if (!isOperator || !operatorContextProfile?.operator_id) {
        setOperatorProfile(null)
        return
      }

      try {
        const nextProfile = await getOperatorById(operatorContextProfile.operator_id)
        setOperatorProfile(nextProfile)
      } catch {
        setOperatorProfile(operatorContextProfile)
      }
    }

    void loadOperatorProfile()
  }, [isOperator, operatorContextProfile])

  useEffect(() => {
    if (user) {
      if (isOperator) {
        setRole("PAYLOAD_HANDLER")
        setDocument(operatorProfile?.cpf ?? "")
        setName(operatorProfile?.name ?? user.name ?? "")
        setEmail(operatorProfile?.user_account.email ?? user.email ?? "")
        setPhone(operatorProfile?.user_account.phone ?? "")
        return
      }

      if (isLaunchProvider) {
        setRole("LAUNCHER_PROVIDER")
        setDocument(launchProviderProfile?.cnpj ?? "")
        setName(launchProviderProfile?.corporate_name ?? user.name ?? "")
        setEmail(launchProviderProfile?.user_account.email ?? user.email ?? "")
        setPhone(launchProviderProfile?.user_account.phone ?? "")
        return
      }

      setRole(profile?.type ?? user.type)
      setDocument(profile?.shipper_document ?? "")
      setName(profile?.name ?? user.name ?? "")
      setEmail(profile?.user_account.email ?? user.email ?? "")
      setPhone(profile?.user_account.phone ?? "")
    }
  }, [isLaunchProvider, isOperator, launchProviderProfile, operatorProfile, profile, user])

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Deseja encerrar sua sessao?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await clearSession()
          setUser(null)
          router.replace("/(auth)/sign-in")
        },
      },
    ])
  }

  const handleSave = async () => {
    if (isSubmitting) return

    const [validatedData, newErrors] = validateForm(
      {
        document,
        name,
        email,
        phone,
        ...((isOperator ? {} : { currentPassword }) as Record<string, string>),
      },
      {
        document: [
          (value) => validateRequired(value, "O documento e obrigatorio"),
        ],
        name: [(value) => validateRequired(value, "O nome e obrigatorio")],
        email: [
          (value) => validateRequired(value, "O email e obrigatorio"),
          validateEmail,
        ],
        phone: [(value) => validateRequired(value, "O telefone e obrigatorio")],
        ...(isOperator
          ? {}
          : {
              currentPassword: [
                (value) => validateRequired(value, "Informe a senha atual"),
              ],
            }),
      },
    )

    const nextCurrentPasswordError =
      !isOperator && currentPassword
        ? validatePasswordField(currentPassword, "Informe a senha atual")
        : ""

    const nextNewPasswordError =
      !isOperator && newPassword
        ? validatePasswordField(
            newPassword,
            "Informe a nova senha",
            "A nova senha precisa ter ao menos 6 caracteres",
          )
        : ""

    setDocumentError(newErrors.document)
    setNameError(newErrors.name)
    setEmailError(newErrors.email)
    setPhoneError(newErrors.phone)
    setCurrentPasswordError(nextCurrentPasswordError)
    setNewPasswordError(nextNewPasswordError)

    if (
      Object.values(newErrors).some(Boolean) ||
      nextCurrentPasswordError ||
      nextNewPasswordError
    ) {
      return
    }

    try {
      setIsSubmitting(true)

      if (isOperator) {
        if (!operatorProfile) {
          throw new Error("Dados do operador nao foram carregados.")
        }

        const updatedOperator = await updateOperatorProfile(operatorProfile.operator_id, {
          ...operatorProfile,
          cpf: validatedData.document,
          name: validatedData.name,
          user_account: {
            ...operatorProfile.user_account,
            email: validatedData.email,
            phone: validatedData.phone,
          },
        })

        setOperatorProfile(updatedOperator)
        await refreshOperatorProfile()
      } else if (isLaunchProvider) {
        if (!launchProviderProfile?.launch_provider_id) {
          throw new Error("Dados da provedora nao foram carregados.")
        }

        await updateLaunchProviderProfile(launchProviderProfile.launch_provider_id, {
          cnpj: validatedData.document,
          corporate_name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          password: currentPassword,
        })

        if (currentPassword && newPassword) {
          await updateLaunchProviderPassword(launchProviderProfile.launch_provider_id, {
            current_password: currentPassword,
            new_password: newPassword,
          })
        }

        await refreshLaunchProviderProfile()
      } else {
        if (!profile?.shipper_id) {
          throw new Error("Dados do expedidor nao foram carregados.")
        }

        await updateShipperProfile(profile.shipper_id, {
          type: profile.type,
          shipper_document: validatedData.document,
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          password: currentPassword,
        })

        if (currentPassword && newPassword) {
          await updateShipperPassword(profile.shipper_id, {
            current_password: currentPassword,
            new_password: newPassword,
          })
        }

        await refreshProfile()
      }

      const nextUser: User = {
        id: user?.id ?? 1,
        name: validatedData.name,
        email: validatedData.email,
        type: user?.type ?? "SHIPPER",
      }

      setUser(nextUser)
      await storeUser(nextUser)

      setCurrentPassword("")
      setNewPassword("")

      Alert.alert("Perfil atualizado", "Seus dados foram atualizados com sucesso.")
    } catch (error) {
      Alert.alert(
        "Erro ao salvar",
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar seu perfil.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 100,
        }}
      >
        <View
          style={{
            width: "100%",
            backgroundColor: "#059669",
            borderRadius: 24,
            paddingHorizontal: 20,
            paddingVertical: 24,
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View
            style={{
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 86,
                height: 86,
                borderRadius: 999,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Ionicons name="person" size={42} color="#059669" />
            </View>

            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: "#FFFFFF",
                marginBottom: 4,
              }}
            >
              Perfil do Usuario
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#FFFFFF",
                marginBottom: 6,
              }}
            >
              {isOperator
                ? operatorProfile?.name ?? user?.name ?? "Usuario"
                : isLaunchProvider
                  ? launchProviderProfile?.corporate_name ?? user?.name ?? "Usuario"
                  : profile?.name ?? user?.name ?? "Usuario"}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#D1FAE5",
                textAlign: "center",
              }}
            >
              Atualize seus dados e mantenha sua conta em dia.
            </Text>
          </View>
        </View>

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
              Dados da conta
            </Text>

            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: "#64748B",
              }}
          >
              Edite suas informacoes de acesso e identificacao.
            </Text>
          </View>

          <ReadOnlyField label="Cargo" value={role} />

          <CustomTextInput
            label="Documento"
            placeholder={
              isOperator
                ? "Digite seu CPF"
                : isLaunchProvider
                  ? "Digite seu CNPJ"
                  : "Digite seu documento"
            }
            value={document}
            error={documentError}
            onChangeText={setDocument}
          />

          <CustomTextInput
            label="Nome"
            placeholder="Digite seu nome"
            value={name}
            error={nameError}
            onChangeText={setName}
          />

          <CustomTextInput
            label="Email"
            placeholder="Digite seu email"
            value={email}
            error={emailError}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <CustomTextInput
            label="Telefone"
            placeholder="Digite seu telefone"
            value={phone}
            error={phoneError}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {!isOperator ? (
            <>
              <CustomTextInput
                label="Senha atual"
                placeholder="Digite sua senha atual"
                value={currentPassword}
                error={currentPasswordError}
                onChangeText={setCurrentPassword}
              />

              <CustomTextInput
                label="Nova senha"
                placeholder="Digite sua nova senha"
                value={newPassword}
                error={newPasswordError}
                onChangeText={setNewPassword}
              />
            </>
          ) : null}

          <View style={{ marginTop: 10, gap: 12 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => void handleSave()}
              disabled={isSubmitting}
              style={{
                minHeight: 56,
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
                {isSubmitting ? "Salvando..." : "Salvar alteracoes"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogout}
              style={{
                minHeight: 56,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "#FCA5A5",
                backgroundColor: "#FFF1F2",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#B91C1C",
                }}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const validatePasswordField = (
  value: string,
  requiredMessage: string,
  minLengthMessage = "A senha precisa ter ao menos 6 caracteres",
) => {
  try {
    const requiredValue = validateRequired(value, requiredMessage)
    validateMinLength(6, minLengthMessage)(requiredValue)
    return ""
  } catch (error) {
    return error instanceof Error ? error.message : requiredMessage
  }
}

const ReadOnlyField = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <View style={{ marginBottom: 14 }}>
    <Text
      style={{
        fontSize: 14,
        fontWeight: "500",
        color: "#334155",
        marginBottom: 8,
      }}
    >
      {label}
    </Text>

    <View
      style={{
        minHeight: 54,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 16,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 16,
          color: value ? "#0F172A" : "#94A3B8",
        }}
      >
        {value || "Nao informado"}
      </Text>
    </View>
  </View>
)

export default Profile
