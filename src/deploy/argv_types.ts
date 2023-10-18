type providerArgvProperties = {
  kc: string
  c: string
  bn: string
  r: boolean
}

type basicArgvProperties = {
  [x: string]: unknown
  nm: string
  ns: string
  _: (string | number)[]
}

export { type providerArgvProperties, basicArgvProperties }
