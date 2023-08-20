import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Job } from "@cdktf/provider-kubernetes/lib/job"
import { readFileSync } from "fs"

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}

type Resource = {
  secretName: string
  namespace: string
  image: string
  tag: string
  database: string
}

type containersProperties = {
  name: string
  secretName: string
  image: string
  tag: string
  database: string
}

type PgSchemaLoadingStackProperties = {
  provider: Provider
  resource: Resource
}

class PgschemLoadingStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: PgSchemaLoadingStackProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { image, namespace, secretName, tag, database },
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
    new Job(this, id, {
      metadata,
      spec: {
        backoffLimit: 0,
        template: {
          metadata: this.#template_metadata(`${id}-template`),
          spec: {
            restartPolicy: "Never",
            container: this.#containers({
              name: `${id}-container`,
              secretName,
              image,
              tag,
              database,
            }),
          },
        },
      },
    })
  }
  #containers({
    database,
    name,
    secretName,
    image,
    tag,
  }: containersProperties) {
    return [
      {
        name,
        image: `${image}:${tag}`,
        command: ["goose"],
        args: [
          "-dir",
          "/usr/src/appdata",
          "postgres",
          `dbname=${database} `.concat(
            "user=$(USER) dbname=$(DBNAME) host=$(HOST) port=$(PORT) password=$(PASS) sslmode=disable",
          ),
          "up",
        ],
        env: this.#env(secretName),
      },
    ]
  }
  #env(secretName: string) {
    return [
      { name: "USER", key: "user" },
      { name: "PASS", key: "password" },
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
  #template_metadata(name: string) {
    return { name }
  }
}

export { PgschemLoadingStack }
