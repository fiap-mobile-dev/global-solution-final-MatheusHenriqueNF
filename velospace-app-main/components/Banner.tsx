import { Image, Text, TouchableOpacity, View } from "react-native"

interface HomeHeroBannerProps {
  userName?: string
  onPressAction?: () => void
}

const Banner = ({
  userName = "Usuário",
  onPressAction,
}: HomeHeroBannerProps) => {
  return (
    <View
      style={{
        width: "100%",
        minHeight: 150,
        backgroundColor: "#0B8F50",
        borderRadius: 24,
        paddingLeft: 18,
        paddingTop: 18,
        paddingBottom: 18,
        paddingRight: 140,
        marginTop: 12,
        marginBottom: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
      }}
    >


      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: "#FFFFFF",
          lineHeight: 26,
          marginBottom: 8,
        }}
      >
        Sua próxima missão começa aqui
      </Text>

      <Text
        style={{
          fontSize: 12,
          lineHeight: 18,
          color: "#DCFCE7",
          marginBottom: 14,
          maxWidth: 250,
        }}
      >
        Acompanhe seus envios, descubra atualizações importantes e mantenha sua
        operação sempre em órbita.
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPressAction}
        style={{
          alignSelf: "flex-start",
          backgroundColor: "#111827",
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 999,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: "#FFFFFF",
          }}
        >
          VeloSpace
        </Text>
      </TouchableOpacity>

      <Image
        source={require("../assets/images/img_2.png")}
        resizeMode="cover"
        style={{
          position: "absolute",
          right: -10,
          bottom: 0,
          width: 200,
          height: 200,
        }}
      />

      <View
        style={{
          position: "absolute",
          top: -30,
          right: 70,
          width: 120,
          height: 120,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      />

      <View
        style={{
          position: "absolute",
          bottom: -35,
          right: 10,
          width: 90,
          height: 90,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      />
    </View>
  )
}

export default Banner