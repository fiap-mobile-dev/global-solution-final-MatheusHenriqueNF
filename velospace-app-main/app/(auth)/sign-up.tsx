import SignUpForm from "@/components/SignUpForm"
import { Image, Text, View, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const SignUp = () => {
  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
  
          <View
            style={{
              height: "50%",
              backgroundColor: "#118845",
              alignItems: "center",
              justifyContent: "flex-end",
              overflow: "hidden",
            }}
          >
            <Image
              source={require("../../assets/images/img_1.png")}
              resizeMode="cover"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </View>
  
          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 38,
              borderTopRightRadius: 38,
              marginTop: -36,
              paddingHorizontal: 24,
              paddingTop: 32,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: "#118845",
                marginBottom: 8,
              }}
            >
              Velo
              <Text style={{ color: "#F97316" }}>S</Text>
              pace
            </Text>
  
            {/* <Text
              style={{
                fontSize: 13,
                color: "#64748B",
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 18,
                maxWidth: 280,
              }}
            >
              Envie o seu satélite para o espaço e monitore sua plantação em tempo real!
            </Text> */}
  
            <ScrollView style={{ width: "100%", paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
              <SignUpForm />
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    );
}

export default SignUp