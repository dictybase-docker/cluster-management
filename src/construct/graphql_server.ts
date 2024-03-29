import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Deployment } from "@cdktf/provider-kubernetes/lib/deployment"
import { Manifest } from "@cdktf/provider-kubernetes/lib/manifest"
import { readFileSync } from "fs"

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}

type GraphqlIngressResource = {
  namespace: string
  name: string
  secret: string
  issuer: string
  service: string
  backendHosts: Array<string>
}

type GraphqlIngressStackProperties = {
  resource: GraphqlIngressResource
  provider: Provider
}

type GraphqlBackendDeploymentResource = {
  namespace: string
  image: string
  tag: string
  logLevel: string
  configMapname: string
  secretName: string
  service: string
  port: number
  origins: Array<string>
}
type GraphqlBackendDeploymentProperties = {
  provider: Provider
  resource: GraphqlBackendDeploymentResource
}
type containerProperties = {
  secretName: string
  name: string
  imageWithTag: string
  logLevel: string
  configMapname: string
  service: string
  port: number
  origins: Array<string>
}

class GraphqlBackendDeploymentStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: GraphqlBackendDeploymentProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: {
        namespace,
        image,
        tag,
        logLevel,
        configMapname,
        service,
        port,
        origins,
        secretName,
      },
    } = options
    super(scope, id)
    if (remote) {
      new GcsBackend(this, {
        bucket: bucketName,
        prefix: bucketPrefix,
        credentials: readFileSync(credentials).toString(),
      })
    }
    new KubernetesProvider(this, `${id}-provider`, { configPath: config })
    new Deployment(this, id, {
      metadata: this.#metadata(id, namespace),
      spec: {
        selector: {
          matchLabels: {
            app: id,
          },
        },
        template: {
          metadata: { labels: { app: id } },
          spec: {
            container: this.#containers({
              name: `${id}-container`,
              imageWithTag: `${image}:${tag}`,
              logLevel,
              configMapname,
              service,
              port,
              origins,
              secretName,
            }),
          },
        },
      },
    })
  }
  #metadata(name: string, namespace: string) {
    return { name, namespace }
  }
  #containers({
    name,
    imageWithTag,
    logLevel,
    configMapname,
    service,
    port,
    origins,
    secretName,
  }: containerProperties) {
    return [
      {
        name,
        image: imageWithTag,
        args: this.#commandArgs(logLevel, origins),
        env: this.#env(configMapname, secretName),
        port: this.#ports(service, port),
      },
    ]
  }
  #commandArgs(logLevel: string, origins: Array<string>) {
    return ["--log-level", logLevel, "start-server"].concat(
      ...origins.map((o) => ["allowed-origin", o]),
    )
  }
  #env(configMapname: string, secretName: string) {
    return [
      {
        name: "PUBLICATION_API_ENDPOINT",
        valueFrom: {
          configMapKeyRef: {
            name: configMapname,
            key: "endpoint.publication",
          },
        },
      },
      {
        name: "AUTH_ENDPOINT",
        valueFrom: {
          configMapKeyRef: {
            name: configMapname,
            key: "auth.endpoint",
          },
        },
      },
      {
        name: "ORGANISM_API_ENDPOINT",
        valueFrom: {
          configMapKeyRef: {
            name: configMapname,
            key: "endpoint.organism",
          },
        },
      },
      {
        name: "JWT_AUDIENCE",
        valueFrom: {
          secretKeyRef: {
            name: secretName,
            key: "auth.JwtAudience",
          },
        },
      },
      {
        name: "JWT_ISSUER",
        valueFrom: {
          secretKeyRef: {
            name: secretName,
            key: "auth.JwtIssuer",
          },
        },
      },
      {
        name: "JWKS_PUBLIC_URI",
        valueFrom: {
          secretKeyRef: {
            name: secretName,
            key: "auth.JwksURI",
          },
        },
      },
      {
        name: "APPLICATION_SECRET",
        valueFrom: {
          secretKeyRef: {
            name: secretName,
            key: "auth.appSecret",
          },
        },
      },
      {
        name: "APPLICATION_ID",
        valueFrom: {
          secretKeyRef: {
            name: secretName,
            key: "auth.appId",
          },
        },
      },
    ]
  }
  #ports(service: string, port: number) {
    return [{ name: service, containerPort: port, protocol: "TCP" }]
  }
}

class GraphqlIngressStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: GraphqlIngressStackProperties,
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
  #metadata(name: string, namespace: string, issuer: string) {
    return {
      name,
      namespace,
      annotations: {
        "cert-manager.io/issuer": issuer,
      },
    }
  }
  #spec(options: GraphqlIngressResource) {
    const { secret, backendHosts, service } = options
    return {
      ingressClassName: "nginx",
      tls: this.#tls(secret, backendHosts),
      rules: this.#rules(backendHosts, service),
    }
  }
  #tls(secret: string, hosts: Array<string>) {
    return [{ secretName: secret, hosts }]
  }
  #rules(hosts: Array<string>, service: string) {
    return hosts.map((h) => {
      return { host: h, http: this.#backendPaths(service) }
    })
  }
  #backendPaths(service: string) {
    return {
      paths: [
        {
          pathType: "Prefix",
          path: "/",
          backend: {
            service: { name: service, port: { number: 8080 } },
          },
        },
      ],
    }
  }
}

export { GraphqlBackendDeploymentStack, GraphqlIngressStack }
