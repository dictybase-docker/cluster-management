import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Deployment } from "@cdktf/provider-kubernetes/lib/deployment"
import { readFileSync } from "fs"
import { V1Secret } from "@kubernetes/client-node"

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
  secret: V1Secret
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
  secret: V1Secret
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
        secret,
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
              secret,
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
    secret,
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
        env: this.#env(secret),
        port: this.#ports({ adminService, apiService, adminPort, apiPort }),
      },
    ]
  }
  #env(secret: V1Secret) {
    return [
      {
        name: "DB_URL",
        value: "postgresql://"
          .concat(secret?.data?.user as string)
          .concat(":")
          .concat(secret?.data?.password as string)
          .concat("@")
          .concat(secret?.data?.host as string)
          .concat(":")
          .concat(secret?.data?.port as string)
          .concat("/")
          .concat(secret?.data?.dbname as string),
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
