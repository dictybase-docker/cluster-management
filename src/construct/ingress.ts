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
  secret: string
  issuer: string
  backendHost: string
  frontendHost: string
}
type BaseRowResource = Resource & {
  backendService: string
  frontendService: string
}
type BaseRowIngressStackProperties = {
  resource: BaseRowResource
  provider: Provider
}
type httpRules = {
  host: string
  service: string
}
type rulesProperties = {
  backend: httpRules
  frontend: httpRules
}

class BaserowIngressStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: BaseRowIngressStackProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource,
    } = options
    const { name, namespace, issuer } = resource
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
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: this.#metadata(name, namespace, issuer),
      spec: this.#spec(resource),
    }
    new Manifest(this, id, { manifest })
  }
  #frontendPaths(service: string) {
    return {
      paths: [
        {
          pathType: "Prefix",
          path: "/",
          backend: {
            service: { name: service, port: { number: 80 } },
          },
        },
      ],
    }
  }
  #backendPaths(service: string) {
    return {
      paths: [
        {
          pathType: "Prefix",
          path: "/",
          backend: {
            service: { name: service, port: { number: 80 } },
          },
        },
        {
          pathType: "Prefix",
          path: "/ws/",
          backend: {
            service: { name: service, port: { number: 80 } },
          },
        },
      ],
    }
  }
  #rules({ backend, frontend }: rulesProperties) {
    return {
      rules: [
        {
          host: backend.host,
          http: this.#backendPaths(backend.service),
        },
        {
          host: frontend.host,
          http: this.#frontendPaths(frontend.service),
        },
      ],
    }
  }
  #tls(secret: string, hosts: Array<string>) {
    return {
      tls: [{ secretName: secret, hosts }],
    }
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
  #spec(options: BaseRowResource) {
    const {
      secret,
      backendHost,
      frontendHost,
      backendService,
      frontendService,
    } = options
    return {
      ingressClassName: "nginx",
      tls: this.#tls(secret, [frontendHost, backendHost]),
      rules: this.#rules({
        backend: {
          host: backendHost,
          service: backendService,
        },
        frontend: {
          host: frontendHost,
          service: frontendService,
        },
      }),
    }
  }
}

export { BaserowIngressStack }
