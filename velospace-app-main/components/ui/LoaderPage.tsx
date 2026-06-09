import { SafeAreaView } from "react-native-safe-area-context"
import Loader from "./Loader"

const LoaderPage = () => {
  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <Loader />
    </SafeAreaView>
  )
}

export default LoaderPage
