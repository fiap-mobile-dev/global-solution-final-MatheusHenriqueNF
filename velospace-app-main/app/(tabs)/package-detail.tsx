import PackageDetailView from "@/components/PackageDetailView"
import { usePackageDetail } from "@/hooks/usePackageDetail"
import { useLocalSearchParams } from "expo-router"

const PackageDetail = () => {
  const { payloadId } = useLocalSearchParams<{ payloadId: string }>()
  const { packageDetail, loading, notFound, handleBack } = usePackageDetail(payloadId)

  return (
    <PackageDetailView
      packageDetail={packageDetail}
      loading={loading}
      notFound={notFound}
      onBack={handleBack}
    />
  )
}

export default PackageDetail
