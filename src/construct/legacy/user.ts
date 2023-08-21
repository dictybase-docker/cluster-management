import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Deployment } from "@cdktf/provider-kubernetes/lib/deployment"
import { readFileSync } from "fs"

type commandProperties = {
  logLevel: string
  port: string
  command: string
  database: string
  apiHost: string
}

type containerProperties = commandProperties & {
  name: string
  imageWithTag: string
  secretName: string
  service: string
}

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}

type BackendDeploymentResource = Omit<containerProperties, "imageWithTag"> & {
  namespace: string
  image: string
  tag: string
}

type BackendDeploymentProperties = {
  provider: Provider
  resource: BackendDeploymentResource
}

class UserBackendDeployment extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: BackendDeploymentProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: {
        namespace,
        image,
        tag,
        logLevel,
        secretName,
        service,
        port,
        command,
        database,
        apiHost,
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
              secretName,
              service,
              port,
              command,
              database,
              apiHost,
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
    secretName,
    service,
    port,
    command,
    database,
    apiHost,
  }: containerProperties) {
    return [
      {
        name,
        image: imageWithTag,
        args: this.#commandArgs({ logLevel, port, command, database, apiHost }),
        env: this.#env(secretName),
        port: this.#ports(service, port),
      },
    ]
  }
  #commandArgs({
    logLevel,
    port,
    command,
    database,
    apiHost,
  }: commandProperties) {
    return [
      "--log-level",
      logLevel,
      command,
      "--dictyuser-user",
      "$(USER)",
      "--dictyuser-pass",
      "$(PASSWORD)",
      "--dictyuser-host",
      "$(HOST)",
      "--dictyuser-port",
      "$(PORT)",
      "--dictyuser-db",
      database,
      "--port",
      port,
      "--user-api-http-host",
      apiHost,
    ]
  }
  #env(secretName: string) {
    return [
      { name: "USER", key: "user" },
      { name: "PASSWORD", key: "password" },
      { name: "HOST", key: "host" },
      { name: "PORT", key: "port" },
    ].map(({ name, key }) => {
      return {
        name,
        valueFrom: {
          secretKeyRef: {
            key,
            name: secretName,
          },
        },
      }
    })
  }
  #ports(service: string, port: string) {
    return [{ name: service, containerPort: Number(port), protocol: "TCP" }]
  }
}

export { UserBackendDeployment }
