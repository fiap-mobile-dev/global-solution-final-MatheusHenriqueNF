export type ValidationFunction<T = any> = (value: T) => any

export type Validations<T> = {
  [K in keyof T]?: ValidationFunction[]
}

export type FormErrors<T> = {
  [K in keyof T]: string
}
