import { TerraformStack } from "cdktf"
import { Construct } from "constructs"
import { Manifest } from "@cdktf/provider-kubernetes/lib/manifest"
import { backendKubernetesProvider, type Provider } from "../../stack_utils"

type FrontendIngressResource = {
  namespace: string
  name: string
  secret: string
  issuer: string
  service: string
  path: string
  backendHosts: Array<string>
}

type FrontendIngressStackProperties = {
  provider: Provider
  resource: FrontendIngressResource
}

class FrontendIngressStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: FrontendIngressStackProperties,
  ) {
    const { provider, resource } = options
    const { name, namespace, issuer } = resource
    super(scope, id)
    backendKubernetesProvider({ ...provider, id, cls: this })
    const manifest = {
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: this.#metadata(name, namespace, issuer),
      spec: this.#spec(resource),
    }
    new Manifest(this, id, { manifest })
  }
  #metadata(name: string, namespace: string, issuer: string) {
    return {
      name,
      namespace,
      annotations: {
        "cert-manager.io/issuer": issuer,
      },
    }
  }
  #spec(options: FrontendIngressResource) {
    const { secret, backendHosts, service, path } = options
    return {
      ingressClassName: "nginx",
      tls: this.#tls(secret, backendHosts),
      rules: this.#rules(backendHosts, service, path),
    }
  }
  #tls(secret: string, hosts: Array<string>) {
    return [{ secretName: secret, hosts }]
  }
  #rules(hosts: Array<string>, service: string, path: string) {
    return hosts.map((h) => {
      return { host: h, http: this.#backendPaths(service, path) }
    })
  }
  #backendPaths(service: string, path: string) {
    return {
      paths: [
        {
          pathType: "Prefix",
          path: path,
          backend: {
            service: { name: service, port: { number: 3000 } },
          },
        },
      ],
    }
  }
}

export { FrontendIngressStack }
