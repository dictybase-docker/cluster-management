import { TerraformStack, GcsBackend } from "cdktf"
import { readFileSync } from "fs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}

type backendProviderProperties = Provider & { cls: TerraformStack; id: string }

const backendKubernetesProvider = ({
  remote,
  credentials,
  bucketName,
  bucketPrefix,
  config,
  cls,
  id,
}: backendProviderProperties) => {
  if (remote) {
    new GcsBackend(cls, {
      bucket: bucketName,
      prefix: bucketPrefix,
      credentials: readFileSync(credentials).toString(),
    })
  }
  new KubernetesProvider(cls, `${id}-provider`, { configPath: config })
}

const getOnes = () => [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
]

const getTens = () => [
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
]

const numberToText = (num: number): string => {
  const ones = getOnes()
  const tens = getTens()
  switch (true) {
    case num === 0:
      return "zero"
    case num > 0 && num < 20:
      return ones[num - 1]
    case num > 20 && num < 100:
      return tens[Math.floor(num / 10)].concat(
        num % 10 !== 0 ? "" : ones[(num % 10) - 1],
      )
    default:
      break
  }
  return "none"
}

const times = (n: number, callback: () => void) => {
  if (n <= 0) return
  callback()
  times(n - 1, callback)
}

export {
  times,
  numberToText,
  backendKubernetesProvider,
  type backendProviderProperties,
  type Provider,
}
