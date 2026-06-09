import React, { useState } from "react"
import { SafeAreaView, Text } from "react-native"
import ModalSelect, { Option } from "@/components/ui/ModalSelect"

interface SignUpTypeProps {
  data: any
  setData: any
  errors: any
}

const SignUpType = ({ data, setData, errors }: SignUpTypeProps) => {
  const [openModal, setOpenModal] = useState(false)

  const option: Option[] = [
    { id: "SHIPPER", label: "Expedidor" },
    { id: "LAUNCHER_PROVIDER", label: "Provedora de Lancamento" },
    { id: "PAYLOAD_HANDLER", label: "Operador de Lancamento" },
  ]

  const optionSelected =
    option.find((currentOption) => currentOption.id === data.signUpType) || null

  function handleOptionSelected(selectedOption: Option) {
    setData((prev: any) => ({
      ...prev,
      signUpType: selectedOption.id,
    }))

    setOpenModal(false)
  }

  return (
    <SafeAreaView className="gap-4">

      <ModalSelect
        title="Tipo de cadastro"
        visible={openModal}
        value={optionSelected}
        options={option}
        openModal={() => setOpenModal(true)}
        closeModal={() => setOpenModal(false)}
        optionSelected={handleOptionSelected}
      />

      {errors?.signUpType ? (
        <Text className="text-sm text-red-500">{errors.signUpType}</Text>
      ) : null}
    </SafeAreaView>
  )
}

export default SignUpType
