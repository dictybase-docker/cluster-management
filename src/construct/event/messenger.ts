import { TerraformStack } from "cdktf"
import { Construct } from "constructs"
import { Deployment } from "@cdktf/provider-kubernetes/lib/deployment"
import { backendKubernetesProvider } from "../../stack_utils"

type containerProperties = {
  name: string
  imageWithTag: string
  logLevel: string
  secretName: string
  configMapName: string
  natsSubject: string
}

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}

type EmailDeploymentResource = Omit<
  containerProperties,
  "imageWithTag" | "name"
> & {
  namespace: string
  image: string
  tag: string
}

type EmailDeploymentProperties = {
  provider: Provider
  resource: EmailDeploymentResource
}

type IssueBackendDeploymentProperties = EmailDeploymentProperties

class EmailBackendDeploymentStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: EmailDeploymentProperties,
  ) {
    const {
      provider,
      resource: {
        namespace,
        image,
        tag,
        logLevel,
        secretName,
        configMapName,
        natsSubject,
      },
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
              logLevel,
              secretName,
              configMapName,
              natsSubject,
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
    configMapName,
    natsSubject,
  }: containerProperties) {
    return [
      {
        name,
        image: imageWithTag,
        args: this.#commandArgs(logLevel, natsSubject),
        env: this.#env(secretName, configMapName),
      },
    ]
  }
  #commandArgs(logLevel: string, natsSubject: string) {
    return [
      "--log-level",
      logLevel,
      "send-email",
      "--subject",
      natsSubject,
      "--domain",
      "$(EMAIL_DOMAIN)",
      "--apiKey",
      "$(MAILGUN_API_KEY)",
      "--name",
      "$(EMAIL_SENDER_NAME)",
      "--sender",
      "$(EMAIL_SENDER)",
      "--cc",
      "$(EMAIL_CC)",
      "--pub",
      "$(PUBLICATION_API_ENDPOINT)",
    ]
  }
  #env(secretName: string, configMapName: string) {
    const secretEnvs = [
      { name: "MAILGUN_API_KEY", key: "eventmessenger.email.apiKey" },
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
    const configEnvs = [
      { name: "EMAIL_DOMAIN", key: "eventmessenger.email.domain" },
      { name: "EMAIL_SENDER_NAME", key: "eventmessenger.email.senderName" },
      { name: "EMAIL_SENDER", key: "eventmessenger.email.sender" },
      { name: "EMAIL_CC", key: "eventmessenger.email.cc" },
      {
        name: "PUBLICATION_API_ENDPOINT",
        key: "eventmessenger.endpoint.publication",
      },
    ].map(({ name, key }) => {
      return {
        name,
        valueFrom: {
          configMapKeyRef: {
            key,
            name: configMapName,
          },
        },
      }
    })
    return [...secretEnvs, ...configEnvs]
  }
}

class IssueBackendDeploymentStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: IssueBackendDeploymentProperties,
  ) {
    const {
      provider,
      resource: {
        namespace,
        image,
        tag,
        logLevel,
        secretName,
        configMapName,
        natsSubject,
      },
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
              logLevel,
              secretName,
              configMapName,
              natsSubject,
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
    configMapName,
    natsSubject,
  }: containerProperties) {
    return [
      {
        name,
        image: imageWithTag,
        args: this.#commandArgs(logLevel, natsSubject),
        env: this.#env(secretName, configMapName),
      },
    ]
  }
  #commandArgs(logLevel: string, natsSubject: string) {
    return [
      "--log-level",
      logLevel,
      "gh-issue",
      "--subject",
      natsSubject,
      "--token",
      "$(GITHUB_TOKEN)",
      "--repository",
      "$(GITHUB_REPOSITORY)",
      "--owner",
      "$(GITHUB_OWNER)",
    ]
  }
  #env(secretName: string, configMapName: string) {
    const secretEnvs = [
      { name: "GITHUB_TOKEN", key: "eventmessenger.github.token" },
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
    const configEnvs = [
      { name: "GITHUB_OWNER", key: "eventmessenger.github.owner" },
      { name: "GITHUB_REPOSITORY", key: "eventmessenger.github.repository" },
    ].map(({ name, key }) => {
      return {
        name,
        valueFrom: {
          configMapKeyRef: {
            key,
            name: configMapName,
          },
        },
      }
    })
    return [...secretEnvs, ...configEnvs]
  }
}

export { IssueBackendDeploymentStack, EmailBackendDeploymentStack }
