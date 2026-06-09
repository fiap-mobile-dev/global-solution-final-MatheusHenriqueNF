import { Text, View, Image} from "react-native"

interface HeaderProps {
  userName: string
}

const Header = ({ userName }: HeaderProps) => {
  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "#078C4B",
        paddingHorizontal: 18,
        paddingVertical: 20,
        marginBottom: 22,
        overflow: "hidden",
        flexDirection: "row",
      }}
    >

      <View style={{ flex:1,  alignItems: "center"}}>
      <Image
        source={require("../../assets/images/img_profile.png")}
        resizeMode="cover"
        style={{
          borderRadius: 999,
          width: 80,
          height: 80,
        }}
      />
</View>

<View style={{ flex: 3}}>
      
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: "#D1FAE5",
          marginBottom: 4,
        }}
      >
        Olá, {userName}
      </Text>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          color: "#FFFFFF",
          lineHeight: 28,
          marginBottom: 6,
        }}
      >
        Pronto para lançar seu satélite?
      </Text>

      <Text
        style={{
          fontSize: 12,
          fontWeight: "400",
          color: "#DCFCE7",
          lineHeight: 17,
          maxWidth: 260,
        }}
      >
        Monitore seus envios espaciais e acompanhe cada etapa da missão em tempo real.
      </Text>

      <View
        style={{
          position: "absolute",
          right: -28,
          top: -28,
          width: 110,
          height: 110,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.10)",
        }}
      />

      <View
        style={{
          position: "absolute",
          right: 26,
          bottom: -36,
          width: 90,
          height: 90,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      />
    </View>
    </View>
  )
}

export default Header
