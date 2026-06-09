import React from "react"
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

export type Option = {
  id: string | number
  label: string
}

type ModalListProps = {
  title: string
  visible: boolean
  value?: Option | null
  options: Option[]
  openModal: () => void
  closeModal: () => void
  optionSelected: (option: Option) => void
}

export default function ModalSelect({
  title,
  visible,
  value,
  options,
  openModal,
  closeModal,
  optionSelected,
}: ModalListProps) {
  return (
    <>
      <View style={{ gap: 8 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: "#334155",
          }}
        >
          {title}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={openModal}
          style={{
            minHeight: 56,
            justifyContent: "center",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            backgroundColor: "#F8FAFC",
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: value ? "#0F172A" : "#94A3B8",
            }}
          >
            {value ? value.label : "Selecione uma opção"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
          }}
          onPress={closeModal}
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
                maxHeight: "70%",
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
                  marginBottom: 20,
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#0F172A",
                }}
              >
                {title}
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 12,
                }}
              >
                {options.map((option) => {
                  const isSelected = value?.id === option.id

                  return (
                    <TouchableOpacity
                      key={String(option.id)}
                      activeOpacity={0.85}
                      style={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: isSelected ? "#059669" : "#E2E8F0",
                        backgroundColor: isSelected ? "#ECFDF5" : "#FFFFFF",
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                      }}
                      onPress={() => {
                        optionSelected(option)
                        closeModal()
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: isSelected ? "700" : "400",
                          color: isSelected ? "#047857" : "#1E293B",
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={closeModal}
                style={{
                  marginTop: 20,
                  minHeight: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  backgroundColor: "#059669",
                  paddingHorizontal: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  Fechar
                </Text>
              </TouchableOpacity>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  )
}