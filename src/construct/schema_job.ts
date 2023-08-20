import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { CronJob } from "@cdktf/provider-kubernetes/lib/cron-job"
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

class PostgresBackupStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: PostgresBackupStackProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: {
        image,
        namespace,
        secretName,
        backupBucketName,
        pgSecretName,
        database,
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
    new CronJob(this, id, {
      metadata,
      spec: {
        schedule: "30 1 * * *",
        jobTemplate: {
          metadata: this.#template_metadata(`${id}-job-template`),
          spec: {
            template: {
              metadata: this.#template_metadata(`${id}-template`),
              spec: {
                volume: this.#volumes(`${id}-volumes`, secretName),
                restartPolicy: "Never",
                container: this.#containers({
                  name: `${id}-container`,
                  bucketName: backupBucketName,
                  volumeName: `${id}-volumes`,
                  pgSecretName,
                  secretName,
                  image,
                  database,
                }),
              },
            },
          },
        },
      },
    })
  }
  #containers({
    name,
    secretName,
    pgSecretName,
    image,
    bucketName,
    volumeName,
    database,
  }: backupContainersProperties) {
    return [
      {
        name,
        image,
        command: ["/bin/sh", "-c"],
        args: [
          `pg_dump -Fc ${database} | restic -r gs:${bucketName}:/ backup --stdin --stdin-filename ${database}.dump`,
        ],
        volumeMount: this.#volumeMounts(volumeName),
        env: [
          ...this.#resticEnv(secretName),
          ...this.#pgEnv(pgSecretName),
          {
            name: "GOOGLE_APPLICATION_CREDENTIALS",
            value: "/var/secret/credentials.json",
          },
        ],
      },
    ]
  }
  #pgEnv(secretName: string) {
    return ["host", "port", "user", "password"]
      .map((key) => {
        return { name: "PG".concat(key.toUpperCase()), key }
      })
      .map(({ name, key }) => {
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
  #resticEnv(secretName: string) {
    return [
      { name: "RESTIC_PASSWORD", key: "restic.password" },
      { name: "GOOGLE_PROJECT_ID", key: "gcs.project" },
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
  #volumeMounts(name: string) {
    return [{ name, mountPath: "/var/secret" }]
  }
  #template_metadata(name: string) {
    return { name }
  }
  #volumes(name: string, secretName: string) {
    return [
      {
        name: name,
        secret: {
          secretName,
          items: [
            {
              key: "gcsbucket.credentials",
              path: "credentials.json",
            },
          ],
        },
      },
    ]
  }
}

export { RepositoryStack, PostgresBackupStack }
