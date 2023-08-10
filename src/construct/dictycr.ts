import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Secret } from "@cdktf/provider-kubernetes/lib/secret"
import { Deployment } from "@cdktf/provider-kubernetes/lib/deployment"
import { Service } from "@cdktf/provider-kubernetes/lib/service"
import { readFileSync } from "fs"

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}
type SecretStackResource = {
  namespace: string
  gcsKey: string
  project: string
  resticPassword: string
  minioUser: string
  minioPassword: string
  arangodbUser: string
  arangodbPassword: string
}
type SecretStackProperties = {
  provider: Provider
  resource: SecretStackResource
}
type BackendDeploymentResource = {
  namespace: string
  image: string
  tag: string
  logLevel: string
  secretName: string
  service: string
  port: number
}
type BackendDeploymentProperties = {
  provider: Provider
  resource: BackendDeploymentResource
}
type BackendServiceProperties = {
  provider: Provider
  resource: {
    namespace: string
    port: number
    app: string
  }
}
type containerProperties = {
  name: string
  imageWithTag: string
  logLevel: string
  secretName: string
  service: string
  port: number
}

class SecretStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: SecretStackProperties) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: {
        gcsKey,
        project,
        resticPassword,
        namespace,
        minioUser,
        minioPassword,
        arangodbUser,
        arangodbPassword,
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
    const metadata = {
      name: id,
      namespace: namespace,
    }
    new Secret(this, id, {
      metadata,
      data: {
        "gcsbucket.credentials": readFileSync(gcsKey).toString(),
        "gcs.project": project,
        "restic.password": resticPassword,
        "arangodb.user": arangodbUser,
        "arangodb.password": arangodbPassword,
        rootUser: minioUser,
        rootPassword: minioPassword,
      },
    })
  }
}

class BackendService extends TerraformStack {
  constructor(scope: Construct, id: string, options: BackendServiceProperties) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { namespace, port, app },
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
    new Service(this, id, {
      metadata: this.#metadata(id, namespace),
      spec: {
        type: "NodePort",
        selector: {
          app: app,
        },
        port: [
          {
            name: id,
            port: port,
            targetPort: id,
          },
        ],
      },
    })
  }
  #metadata(name: string, namespace: string) {
    return { name, namespace }
  }
}

class ArangodbBackendDeployment extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: BackendDeploymentProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { namespace, image, tag, logLevel, secretName, service, port },
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
  }: containerProperties) {
    return [
      {
        name,
        image: imageWithTag,
        args: this.#commandArgs(logLevel),
        env: this.#env(secretName),
        ports: this.#ports(service, port),
      },
    ]
  }
  #commandArgs(logLevel: string) {
    return [
      "--log-level",
      logLevel,
      "start-server",
      "--user",
      "$(ARANGODB_USER)",
      "--pass",
      "$(ARANGODB_PASSWORD)",
    ]
  }
  #env(secretName: string) {
    return [
      {
        name: "ARANGODB_PASSWORD",
        valueFrom: {
          secretKeyRef: {
            name: secretName,
            key: "arangodb.password",
          },
        },
      },
      {
        name: "ARANGODB_USER",
        valueFrom: {
          secretKeyRef: {
            name: secretName,
            key: "arangodb.user",
          },
        },
      },
    ]
  }
  #ports(service: string, port: number) {
    return [{ name: service, containerPort: port, protocol: "TCP" }]
  }
}

export { BackendService, SecretStack, ArangodbBackendDeployment }
