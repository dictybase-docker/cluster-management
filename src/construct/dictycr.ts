import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Secret } from "@cdktf/provider-kubernetes/lib/secret"
import { ConfigMap } from "@cdktf/provider-kubernetes/lib/config-map"
import { Deployment } from "@cdktf/provider-kubernetes/lib/deployment"
import { Service } from "@cdktf/provider-kubernetes/lib/service"
import { readFileSync } from "fs"
import { backendKubernetesProvider } from "../stack_utils"

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}
type AuthSecretProperties = {
  appId: string
  appSecret: string
  JwksURI: string
  JwtIssuer: string
  JwtAudience: string
}
type SecretStackResource = {
  namespace: string
  cloud: {
    gcsKey: string
    project: string
  }
  backup: {
    resticPassword: string
  }
  storage: {
    minioUser: string
    minioPassword: string
  }
  database: {
    arangodbUser: string
    arangodbPassword: string
  }
  email: {
    APIKey: string
    token: string
  }
  auth: AuthSecretProperties
}
type SecretStackProperties = {
  provider: Provider
  resource: SecretStackResource
}
type GraphqlProperties = {
  publication: string
  organism: string
  graphlEndpoint: string
}
type EmailProperties = {
  owner: string
  sender: string
  senderName: string
  domain: string
  repository: string
  senderCc: string
}
type ConfigMapStackProperties = {
  provider: Provider
  resource: {
    namespace: string
    graphql: GraphqlProperties
    email: EmailProperties
    auth: { endpoint: string }
  }
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
type FrontendDeploymentStackProperties = {
  provider: Provider
  resource: Pick<
    BackendDeploymentResource,
    "namespace" | "image" | "tag" | "service" | "port"
  >
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
type NatsBackendServiceProperties = {
  provider: Provider
  resource: Omit<BackendServiceProperties["resource"], "port">
}
type containerProperties = {
  name: string
  imageWithTag: string
  logLevel: string
  secretName: string
  service: string
  port: number
}

type frontendContainerProperties = Pick<
  containerProperties,
  "name" | "imageWithTag" | "service" | "port"
>

class ConfigMapStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: ConfigMapStackProperties) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: {
        namespace,
        graphql: { publication, graphlEndpoint, organism },
        email: { domain, sender, senderName, owner, repository, senderCc },
        auth: { endpoint },
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
    new ConfigMap(this, id, {
      metadata,
      data: {
        "endpoint.publication": publication,
        "endpoint.organism": organism,
        "eventmessenger.endpoint.publication": graphlEndpoint,
        "eventmessenger.email.domain": domain,
        "eventmessenger.email.sender": sender,
        "eventmessenger.email.senderName": senderName,
        "eventmessenger.github.owner": owner,
        "eventmessenger.github.repository": repository,
        "eventmessenger.email.cc": senderCc,
        "auth.endpoint": endpoint,
      },
    })
  }
}

class SecretStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: SecretStackProperties) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: {
        namespace,
        cloud: { gcsKey, project },
        backup: { resticPassword },
        storage: { minioUser, minioPassword },
        database: { arangodbUser, arangodbPassword },
        email: { APIKey, token },
        auth: { appId, appSecret, JwksURI, JwtIssuer, JwtAudience },
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
        "auth.appId": appId,
        "auth.appSecret": appSecret,
        "auth.JwksURI": JwksURI,
        "auth.JwtAudience": JwtAudience,
        "auth.JwtIssuer": JwtIssuer,
        "gcsbucket.credentials": readFileSync(gcsKey).toString(),
        "gcs.project": project,
        "restic.password": resticPassword,
        "arangodb.user": arangodbUser,
        "arangodb.password": arangodbPassword,
        "minio.accesskey": minioUser,
        "minio.secretkey": minioPassword,
        "eventmessenger.email.apiKey": APIKey,
        "eventmessenger.github.token": token,
        rootUser: minioUser,
        rootPassword: minioPassword,
      },
    })
  }
}

class NatsBackendService extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: NatsBackendServiceProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { namespace, app },
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
        type: "ClusterIP",
        port: this.#ports(),
        selector: {
          "app.kubernetes.io/instance": app,
          "app.kubernetes.io/name": app,
        },
      },
    })
  }
  #metadata(name: string, namespace: string) {
    return { name, namespace }
  }
  #ports() {
    return [
      {
        appProtocol: "tcp",
        name: "client",
        port: 4222,
        protocol: "TCP",
        targetPort: "4222",
      },
      {
        appProtocol: "tcp",
        name: "cluster",
        port: 6222,
        protocol: "TCP",
        targetPort: "6222",
      },
      {
        appProtocol: "http",
        name: "monitor",
        port: 8222,
        protocol: "TCP",
        targetPort: "8222",
      },
      {
        appProtocol: "http",
        name: "metrics",
        port: 7777,
        protocol: "TCP",
        targetPort: "7777",
      },
      {
        appProtocol: "tcp",
        name: "leafnodes",
        port: 7422,
        protocol: "TCP",
        targetPort: "7422",
      },
      {
        appProtocol: "tcp",
        name: "gateways",
        port: 7522,
        protocol: "TCP",
        targetPort: "7522",
      },
    ]
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
        args: this.#commandArgs(logLevel, port) as Array<string>,
        env: this.#env(secretName),
        port: this.#ports(service, port),
      },
    ]
  }
  #commandArgs(logLevel: string, port: number) {
    return [
      "--log-level",
      logLevel,
      "start-server",
      "--user",
      "$(ARANGODB_USER)",
      "--pass",
      "$(ARANGODB_PASSWORD)",
      "--port",
      port,
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

class FrontendDeploymentStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: FrontendDeploymentStackProperties,
  ) {
    const {
      provider,
      resource: { namespace, image, tag, service, port },
    } = options
    super(scope, id)
    backendKubernetesProvider({ ...provider, id, cls: this })
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
    service,
    port,
  }: frontendContainerProperties) {
    return [
      {
        name,
        image: imageWithTag,
        port: this.#ports(service, port),
      },
    ]
  }
  #ports(service: string, port: number) {
    return [{ name: service, containerPort: port, protocol: "TCP" }]
  }
}

export {
  BackendService,
  SecretStack,
  ArangodbBackendDeployment,
  NatsBackendService,
  ConfigMapStack,
  FrontendDeploymentStack,
}
