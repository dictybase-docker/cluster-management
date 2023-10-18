import { type providerArgvProperties, basicArgvProperties } from "../argv_types"

type logtoIngressArgvProperties = providerArgvProperties &
  basicArgvProperties & {
    sr: string
    sc: string
    is: string
    hs: (string | number)[]
  }

type logtoArgvProperties = providerArgvProperties &
  basicArgvProperties & {
    im: string
    tg: string
    sc: string
    ss: number
    adp: number
    sr: string
    ap: number
    db: string
    ep: string
  }

export { type logtoArgvProperties, logtoIngressArgvProperties }
