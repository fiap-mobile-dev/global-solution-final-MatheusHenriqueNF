import { generateTrackingCode } from "@/lib/delivery-api"
import { updateSatelliteTrackingCode } from "@/lib/api"
import type { DeliverySimulationSendResponse } from "@/types"
import { useEffect, useState } from "react"
import {
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

import CustomTextInput from "@/components/ui/CustomTextInput"

interface TrackingCodeModalProps {
  visible: boolean
  satelliteId: number | null
  satelliteName: string
  onClose: () => void
  onTrackingUpdated?: () => void | Promise<void>
}

const TrackingCodeModal = ({
  visible,
  satelliteId,
  satelliteName,
  onClose,
  onTrackingUpdated,
}: TrackingCodeModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmittingTrack, setIsSubmittingTrack] = useState(false)
  const [sendResult, setSendResult] = useState<DeliverySimulationSendResponse | null>(
    null,
  )
  const [trackingCode, setTrackingCode] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!visible) {
      setIsGenerating(false)
      setIsSubmittingTrack(false)
      setSendResult(null)
      setTrackingCode("")
      setErrorMessage("")
    }
  }, [visible])

  const handleGenerateCode = async () => {
    try {
      setIsGenerating(true)
      setErrorMessage("")

      const generatedCode = await generateTrackingCode()
      setSendResult(generatedCode)
      setTrackingCode(generatedCode.code)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel gerar o codigo de rastreio.",
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitTrackingCode = async () => {
    const normalizedTrackingCode = trackingCode.trim().toUpperCase()

    if (!satelliteId) {
      setErrorMessage("Nao foi possivel identificar o satelite.")
      return
    }

    if (!normalizedTrackingCode) {
      setErrorMessage("Cole um codigo de rastreio para enviar.")
      return
    }

    try {
      setIsSubmittingTrack(true)
      setErrorMessage("")

      await updateSatelliteTrackingCode(satelliteId, {
        tracking_code: normalizedTrackingCode,
      })
      await onTrackingUpdated?.()
      onClose()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar o codigo de rastreio.",
      )
    } finally {
      setIsSubmittingTrack(false)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
        }}
        onPress={onClose}
      >
        <SafeAreaView
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Pressable
            style={{
              width: "100%",
              borderRadius: 28,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: 24,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 8,
            }}
            onPress={(event) => event.stopPropagation()}
          >
            <Text
              style={{
                marginBottom: 8,
                fontSize: 24,
                fontWeight: "700",
                color: "#0F172A",
              }}
            >
              Codigo de rastreio
            </Text>

            <Text
              style={{
                marginBottom: 20,
                fontSize: 14,
                lineHeight: 20,
                color: "#64748B",
              }}
            >
              Gere o codigo para {satelliteName} e copie manualmente para usar no track.
            </Text>

            {sendResult ? (
              <View
                style={{
                  borderRadius: 20,
                  backgroundColor: "#F8FAFC",
                  padding: 16,
                  marginBottom: 16,
                  gap: 10,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#64748B",
                      marginBottom: 4,
                    }}
                  >
                    Codigo gerado
                  </Text>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: "#0F172A",
                      letterSpacing: 0.6,
                    }}
                  >
                    {sendResult.code}
                  </Text>
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#64748B",
                      marginBottom: 4,
                    }}
                  >
                    Criado em
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#0F172A",
                    }}
                  >
                    {sendResult.created_at}
                  </Text>
                </View>
              </View>
            ) : null}

            <CustomTextInput
              label="Codigo de rastreio"
              placeholder="Cole aqui o codigo que deseja enviar"
              value={trackingCode}
              onChangeText={setTrackingCode}
            />

            {errorMessage ? (
              <Text
                style={{
                  marginBottom: 16,
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#DC2626",
                }}
              >
                {errorMessage}
              </Text>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => void handleGenerateCode()}
              disabled={isGenerating || isSubmittingTrack}
              style={{
                minHeight: 52,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                backgroundColor:
                  isGenerating || isSubmittingTrack ? "#86C5A5" : "#059669",
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                {isGenerating
                  ? "Gerando..."
                  : sendResult
                    ? "Gerar novo codigo"
                    : "Gerar codigo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => void handleSubmitTrackingCode()}
              disabled={isGenerating || isSubmittingTrack}
              style={{
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "#059669",
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 16,
                marginBottom: 12,
                opacity: isGenerating || isSubmittingTrack ? 0.7 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#059669",
                }}
              >
                {isSubmittingTrack ? "Enviando codigo..." : "Enviar codigo no track"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={{
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                backgroundColor: "#E2E8F0",
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
                Fechar
              </Text>
            </TouchableOpacity>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  )
}

export default TrackingCodeModal
