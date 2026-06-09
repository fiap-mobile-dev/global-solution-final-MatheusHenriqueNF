import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const sections = [
  {
    title: "O que e o VeloSpace?",
    content:
      "O VeloSpace conecta proprietarios de CubeSats a empresas fornecedoras de servicos de lancamento espacial, reduzindo burocracia e tornando o processo mais digital, transparente e eficiente.",
  },
  {
    title: "Objetivo",
    content:
      "A plataforma organiza cadastro, candidatura, selecao, rastreabilidade e validacao de pequenos satelites ao longo do fluxo operacional de lancamento.",
  },
  {
    title: "Como funciona",
    content:
      "O proprietario cadastra o satelite com medidas e dados tecnicos. Depois, a base registra novas medicoes e o sistema compara as informacoes para aprovar ou reprovar a continuidade no processo.",
  },
  {
    title: "Beneficios",
    content:
      "Mais seguranca operacional, menos erro manual, maior visibilidade do status do satelite e melhor controle de validacao antes da integracao ao foguete.",
  },
]

const About = () => {
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 60,
          gap: 18,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={{
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="arrow-back" size={18} color="#0F172A" />
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
            Voltar
          </Text>
        </TouchableOpacity>

        <View
          style={{
            borderRadius: 28,
            backgroundColor: "#059669",
            padding: 22,
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#FFFFFF",
              marginBottom: 8,
            }}
          >
            Sobre o App
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: "#D1FAE5",
              maxWidth: 300,
            }}
          >
            Conheca a proposta do VeloSpace e o papel da plataforma no processo
            de validacao e acompanhamento de CubeSats.
          </Text>
        </View>

        {sections.map((section) => (
          <View
            key={section.title}
            style={{
              borderRadius: 22,
              backgroundColor: "#FFFFFF",
              padding: 18,
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: "#0F172A",
                marginBottom: 8,
              }}
            >
              {section.title}
            </Text>

            <Text
              style={{
                fontSize: 14,
                lineHeight: 21,
                color: "#64748B",
              }}
            >
              {section.content}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default About
