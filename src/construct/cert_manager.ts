import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Manifest } from "@cdktf/provider-kubernetes/lib/manifest"
import { readFileSync } from "fs"

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}
type Resource = {
  namespace: string
  name: string
  server: string
  secretRef: string
  email: string
}

type IssuerStackProperties = {
  resource: Resource
  provider: Provider
}
class IssuerStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: IssuerStackProperties) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource,
    } = options
    const { name, namespace } = resource
    super(scope, id)
    if (remote) {
      new GcsBackend(this, {
        bucket: bucketName,
        prefix: bucketPrefix,
        credentials: readFileSync(credentials).toString(),
      })
    }
    new KubernetesProvider(this, `${id}-provider`, { configPath: config })
    const manifest = {
      apiVersion: "cert-manager.io/v1",
      kind: "Issuer",
      metadata: this.#metadata(name, namespace),
      spec: this.#spec(resource),
    }
    new Manifest(this, `${id}-manifest`, { manifest })
  }
  #metadata(name: string, namespace: string) {
    return { name, namespace }
  }
  #spec(resource: Resource) {
    const { server, secretRef, email } = resource
    return {
      acme: {
        server,
        email,
        privateKeySecretRef: { name: secretRef },
        solvers: this.#solvers(),
      },
    }
  }
  #solvers() {
    return [
      {
        http01: {
          ingress: { ingressClassName: "nginx" },
        },
      },
    ]
  }
}

export { IssuerStack }
