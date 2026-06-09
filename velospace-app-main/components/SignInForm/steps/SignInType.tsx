import ModalSelect, { Option } from "@/components/ui/ModalSelect"
import { SIGN_IN_OPTIONS } from "@/lib/auth"
import React, { useState } from "react"
import { SafeAreaView, Text } from "react-native"

interface SignInTypeProps {
  data: any
  setData: any
  errors: any
  setErrors: any
}

const SignInType = ({ data, setData, errors, setErrors }: SignInTypeProps) => {
  const [openModal, setOpenModal] = useState(false)

  const option: Option[] = SIGN_IN_OPTIONS as unknown as Option[]

  const optionSelected =
    option.find((currentOption) => currentOption.id === data.signInType) || null

  function handleOptionSelected(selectedOption: Option) {
    setData((prev: any) => ({
      ...prev,
      signInType: selectedOption.id,
    }))
    setErrors((prev: any) => ({ ...prev, signInType: "" }))

    setOpenModal(false)
  }

  return (
    <SafeAreaView style={{ gap: 4 }}>

      <ModalSelect
        title="Tipo de login"
        visible={openModal}
        value={optionSelected}
        options={option}
        openModal={() => setOpenModal(true)}
        closeModal={() => setOpenModal(false)}
        optionSelected={handleOptionSelected}
      />
      

      {errors?.signInType ? (
        <Text style={{ top: 10, color: "#F87171",  fontSize: 14, fontWeight: "600", }}>
          {errors.signInType}
        </Text>
      ) : null}
    </SafeAreaView>
  )
}

export default SignInType
