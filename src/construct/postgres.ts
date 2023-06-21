import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Secret } from "@cdktf/provider-kubernetes/lib/secret"
import { Manifest } from "@cdktf/provider-kubernetes/lib/manifest"
import { readFileSync } from "fs"
import { Buffer } from "buffer"

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}
type Resource = {
  namespace: string
  name: string
  version: string
  storageClass: string
  storageSize: number
  secret: Secret
  backupBucket: string
  repository: string
}
type PostgresStackProperties = {
  provider: Provider
  resource: Resource
}
type PostgresSecretStackProperties = {
  provider: Provider
  resource: {
    gcsKey: string
    namespace: string
    repository: string
  }
}

class PostgresStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: PostgresStackProperties) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource,
    } = options
    const { name, namespace } = resource
    super(scope, id)
    if (remote) {
      new GcsBackend(this, {
        bucket: bucketName,
        prefix: bucketPrefix,
        credentials: readFileSync(credentials).toString(),
      })
    }
    new KubernetesProvider(this, `${id}-provider`, { configPath: config })
    const manifest = {
      apiVersion: "postgres-operator.crunchydata.com/v1beta1",
      kind: "PostgresCluster",
      metadata: this.#metadata(name, namespace),
      spec: this.#spec(resource),
    }
    new Manifest(this, id, { manifest })
  }

  #spec(options: Resource) {
    const {
      version,
      name,
      storageSize,
      storageClass,
      namespace,
      secret,
      backupBucket,
      repository,
    } = options
    const postgresVersion = version.split(".")[0]
    return {
      postgresVersion,
      image: `registry.developers.crunchydata.com/crunchydata/crunchy-postgres:ubi8-${version}`,
      imagePullPolicy: "IfNotPresent",
      instances: [
        {
          name,
          dataVolumeClaimSpec: this.#storageSpec(storageClass, storageSize),
        },
      ],
      backups: this.#backups(secret, namespace, repository, backupBucket),
    }
  }

  #storageSpec(storageClass: string, storageSize: number) {
    return {
      storageClassName: storageClass,
      accessModes: ["ReadWriteOnce"],
      resources: {
        requests: {
          storage: `${storageSize}Gi`,
        },
      },
    }
  }

  #metadata(name: string, namespace: string) {
    return { name, namespace }
  }

  #backups(
    secret: Secret,
    namespace: string,
    repository: string,
    backupBucket: string,
  ) {
    return {
      pgbackrest: {
        configuration: [{ secret: { name: secret.metadata.name } }],
        global: {
          "archive-async": "y",
          "compress-type": "zst",
          [`${repository}-path`]: `/pgbackrest/${namespace}/${repository}`,
          [`${repository}-retention-full-type`]: "time",
          [`${repository}-retention-full`]: "30",
          [`${repository}-retention-diff`]: "30",
          [`${repository}-retention-archive`]: "30",
          [`${repository}-retention-archive-type`]: "diff",
        },
        repos: [
          {
            name: repository,
            gcs: { bucket: backupBucket },
            schedules: {
              differential: "0 0 * * *",
            },
          },
        ],
      },
    }
  }
}

class PostgresSecretStack extends TerraformStack {
  public readonly secret: Secret
  constructor(
    scope: Construct,
    id: string,
    options: PostgresSecretStackProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { gcsKey, namespace, repository },
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
    const gcsConf = Buffer.from(
      `
		[global]
		${repository}-gcs-key=/etc/pgbackrest/conf.d/gcs-key.json
	`,
    ).toString("base64")
    const gcsKeyJson = Buffer.from(readFileSync(gcsKey).toString()).toString(
      "base64",
    )
    this.secret = new Secret(this, id, {
      metadata,
      data: {
        "gcs.conf": gcsConf,
        "gcs-key.json": gcsKeyJson,
      },
    })
  }
}

export { PostgresStack, PostgresSecretStack }
