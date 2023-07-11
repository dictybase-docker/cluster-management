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
  backupBucketName: string
}

type RepositoryStackProperties = {
  provider: Provider
  resource: Resource
}
type containersProperties = {
  name: string
  secretName: string
  image: string
  bucketName: string
  volumeName: string
}

type backupContainersProperties = {
  name: string
  secretName: string
  image: string
  bucketName: string
  volumeName: string
  pgSecretName: string
  database: string
}
type PostgresBackupStackProperties = {
  provider: Provider
  resource: Resource & {
    pgSecretName: string
    database: string
  }
}

class RepositoryStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: RepositoryStackProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { image, namespace, secretName, backupBucketName },
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
            volume: this.#volumes(`${id}-volumes`, secretName),
            restartPolicy: "Never",
            container: this.#containers({
              name: `${id}-container`,
              bucketName: backupBucketName,
              volumeName: `${id}-volumes`,
              secretName,
              image,
            }),
          },
        },
      },
    })
  }
  #containers({
    name,
    secretName,
    image,
    bucketName,
    volumeName,
  }: containersProperties) {
    return [
      {
        name,
        image,
        command: ["restic", "-r", `gs:${bucketName}:/`, "init"],
        volumeMount: this.#volumeMounts(volumeName),
        env: [
          ...this.#env(secretName),
          {
            name: "GOOGLE_APPLICATION_CREDENTIALS",
            value: "/var/secret/credentials.json",
          },
        ],
      },
    ]
  }
  #env(secretName: string) {
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
    new Job(this, id, {
      metadata,
      spec: {
        backoffLimit: 0,
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
        command: [
          "pg_dump",
          "-Fc",
          database,
          "|",
          "restic",
          "-r",
          `gs:${bucketName}:/`,
          "backup",
          "--stdin",
          "--stdin-filename",
          database.concat(".dump"),
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
