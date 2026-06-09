import type { FormErrors, Validations } from "@/types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const formatDecimal = (value: string) => {
  return value
    .replace(/[^\d.,]/g, "")
    .replace(/\./g, ",")
    .replace(/(,.*),/g, "$1")
}

const normalizeNumberValue = (value: string | number) => {
  if (typeof value === "number") return value

  const normalizedValue = value.trim().replace(",", ".")
  return Number(normalizedValue)
}

export const validateForm = <T extends object>(
  data: T,
  validations: Validations<T>,
): [T, FormErrors<T>] => {
  const newErrors = {} as FormErrors<T>
  const validatedData = { ...data } as T

  for (const field in validations) {
    const typedField = field as keyof T
    const fieldValidations = validations[typedField]

    if (!fieldValidations) continue

    let value = validatedData[typedField]

    newErrors[typedField] = ""

    for (const validate of fieldValidations) {
      try {
        value = validate(value)
      } catch (error) {
        newErrors[typedField] =
          error instanceof Error ? error.message : "Erro desconhecido"

        break
      }
    }

    validatedData[typedField] = value as T[keyof T]
  }

  return [validatedData, newErrors]
}

export const validateRequired = (
  value: string,
  message = "Este campo é obrigatório",
) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) throw new Error(message)

  return trimmedValue
}

export const validateNumber = (
  value: string | number,
  message = "Este campo deve ser um valor numérico",
) => {
  const numberValue = normalizeNumberValue(value)

  if (Number.isNaN(numberValue)) {
    throw new Error(message)
  }

  return numberValue
}

export const validatePositive = (
  value: number,
  message = "Este campo deve ser um valor positivo",
) => {
  if (value <= 0) throw new Error(message)

  return value
}

export const isValidEmail = (email: string) => {
  const trimmedEmail = email.trim()
  return EMAIL_REGEX.test(trimmedEmail)
}

export const validateEmail = (
  value: string,
  message = "Digite um email válido",
) => {
  const trimmedValue = value.trim()

  if (!isValidEmail(trimmedValue)) throw new Error(message)

  return trimmedValue
}

export const validateMinLength =
  (minLength: number, message?: string) => (value: string) => {
    const trimmedValue = value.trim()

    if (trimmedValue.length < minLength) {
      throw new Error(
        message ?? `Este campo precisa ter ao menos ${minLength} caracteres`,
      )
    }

    return trimmedValue
  }
