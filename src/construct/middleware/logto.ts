import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Deployment } from "@cdktf/provider-kubernetes/lib/deployment"
import { readFileSync } from "fs"

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}

type LogtoBackendDeploymentResource = {
  namespace: string
  image: string
  tag: string
  configMapname: string
  adminService: string
  apiService: string
  adminPort: number
  apiPort: number
  origins: Array<string>
}

type LogtoBackendDeploymentProperties = {
  provider: Provider
  resource: LogtoBackendDeploymentResource
}

type portPropterties = Pick<
  LogtoBackendDeploymentResource,
  "apiService" | "adminService" | "apiPort" | "adminPort"
>

type containerProperties = portPropterties & {
  name: string
  configMapname: string
  image: string
  tag: string
}

class LogtoBackendDeploymentStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: LogtoBackendDeploymentProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: {
        namespace,
        image,
        tag,
        configMapname,
        adminService,
        apiService,
        adminPort,
        apiPort,
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
              image,
              tag,
              configMapname,
              adminService,
              apiService,
              adminPort,
              apiPort,
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
    image,
    configMapname,
    adminService,
    apiService,
    adminPort,
    apiPort,
    tag,
  }: containerProperties) {
    return [
      {
        name,
        image: `${image}:${tag}`,
        command: ["/bin/sh"],
        args: [
          "-c",
          `npm run alteration deploy ${tag} && npm run cli db seed -- --swe && npm start`,
        ],
        env: this.#env(configMapname),
        port: this.#ports({ adminService, apiService, adminPort, apiPort }),
      },
    ]
  }
  #env(configMapname: string) {
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
        name: "ORGANISM_API_ENDPOINT",
        valueFrom: {
          configMapKeyRef: {
            name: configMapname,
            key: "endpoint.organism",
          },
        },
      },
    ]
  }
  #ports({ adminService, apiService, adminPort, apiPort }: portPropterties) {
    return [
      { name: adminService, containerPort: adminPort, protocol: "TCP" },
      { name: apiService, containerPort: apiPort, protocol: "TCP" },
    ]
  }
}

export { LogtoBackendDeploymentStack }
