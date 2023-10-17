import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Deployment } from "@cdktf/provider-kubernetes/lib/deployment"
import { PersistentVolumeClaim } from "@cdktf/provider-kubernetes/lib/persistent-volume-claim"
import { readFileSync } from "fs"
import { V1Secret } from "@kubernetes/client-node"
import { decodeSecretData } from "../../k8s"

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
  claim: string
  database: string
  endpoint: string
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
  volumeName: string
  database: string
  endpoint: string
}

type initContainerProperties = Pick<
  containerProperties,
  "name" | "image" | "volumeName" | "tag"
>

type LogtoPersistentVolumeClaimStackProperties = {
  provider: Provider
  resource: {
    namespace: string
    storageClass: string
    diskSize: number
  }
}

class LogtoPersistentVolumeClaimStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: LogtoPersistentVolumeClaimStackProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { namespace, diskSize, storageClass },
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
    new PersistentVolumeClaim(this, id, {
      metadata: { name: id, namespace },
      spec: {
        storageClassName: storageClass,
        accessModes: ["ReadWriteOnce"],
        resources: {
          requests: {
            storage: `${diskSize}Gi`,
          },
        },
      },
    })
  }
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
        claim,
        database,
        endpoint,
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
    const volumeName = `${id}-volume`
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
            initContainer: this.#initcontainer({
              name: `${id}-init-container`,
              image,
              tag,
              volumeName,
            }),
            container: this.#containers({
              name: `${id}-container`,
              image,
              tag,
              secret,
              adminService,
              apiService,
              adminPort,
              apiPort,
              volumeName,
              database,
              endpoint,
            }),
            volume: [
              {
                name: volumeName,
                persistentVolumeClaim: {
                  claimName: claim,
                },
              },
            ],
          },
        },
      },
    })
  }
  #metadata(name: string, namespace: string) {
    return { name, namespace }
  }
  #initcontainer({ name, image, tag, volumeName }: initContainerProperties) {
    return Array.of({
      name,
      image: `${image}:${tag}`,
      command: Array.of("/bin/sh"),
      args: Array.of("-c", "npm run cli connector add -- --official"),
      volumeMount: Array.of({
        name: volumeName,
        mountPath: "/etc/logto/packages/core/connectors",
      }),
    })
  }
  #containers({
    volumeName,
    name,
    image,
    secret,
    adminService,
    apiService,
    adminPort,
    apiPort,
    tag,
    database,
    endpoint,
  }: containerProperties) {
    return Array.of({
      name,
      image: `${image}:${tag}`,
      command: ["/bin/sh"],
      args: Array.of("-c", `npm run cli db seed -- --swe && npm start`),
      env: this.#env(secret, database, endpoint),
      port: this.#ports({ adminService, apiService, adminPort, apiPort }),
      volumeMount: Array.of({
        name: volumeName,
        mountPath: "/etc/logto/packages/core/connectors",
        readOnly: true,
      }),
    })
  }
  #env(secret: V1Secret, database: string, endpoint: string) {
    return Array.of(
      {
        name: "DB_URL",
        value: "postgresql://"
          .concat(decodeSecretData(secret?.data?.user as string))
          .concat("@")
          .concat(decodeSecretData(secret?.data?.host as string))
          .concat(":")
          .concat(decodeSecretData(secret?.data?.port as string))
          .concat("/")
          .concat(database)
          .concat("?sslmode=no-verify"),
      },
      {
        name: "PGPASSWORD",
        value: decodeSecretData(secret?.data?.password as string),
      },
      { name: "ENDPOINT", value: endpoint },
    )
  }
  #ports({ adminService, apiService, adminPort, apiPort }: portPropterties) {
    return Array.of(
      { name: adminService, containerPort: adminPort, protocol: "TCP" },
      { name: apiService, containerPort: apiPort, protocol: "TCP" },
    )
  }
}

export { LogtoBackendDeploymentStack, LogtoPersistentVolumeClaimStack }
