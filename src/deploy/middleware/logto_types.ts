import { type providerArgvProperties, basicArgvProperties } from "../argv_types"

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

export { type logtoArgvProperties }
