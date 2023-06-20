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
  }
}

class PostgresStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: PostgresStackProperties) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: {
        version,
        name,
        storageSize,
        storageClass,
        namespace,
        secret,
        backupBucket,
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
    new KubernetesProvider(this, id, { configPath: config })
    const postgresVersion = version.split(".")[0]
    const dataVolumeClaimSpec = {
      storageClassName: storageClass,
      accessModes: ["ReadWriteOnce"],
      resources: {
        requests: {
          storage: `${storageSize}Gi`,
        },
      },
    }
    const pgbackrest = {
      configuration: [{ secret: { name: secret.metadata.name } }],
      global: {
        "repo1-path": `/pgbackrest/${namespace}/repo1`,
      },
      repos: [{ name: "repo1", gcs: { bucket: backupBucket } }],
    }
    const spec = {
      postgresVersion,
      image: `registry.developers.crunchydata.com/crunchydata/crunchy-postgres:ubi8-${version}`,
      imagePullPolicy: "IfNotPresent",
      instances: [
        {
          name,
          dataVolumeClaimSpec,
        },
      ],
      backups: {
        pgbackrest,
      },
    }
    const metadata = { name, namespace }
    new Manifest(this, `${id}-manifest`, {
      manifest: {
        apiVersion: "postgres-operator.crunchydata.com/v1beta1",
        kind: "PostgresCluster",
        metadata,
        spec,
      },
    })
  }
}

class PostgresSecretStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: PostgresSecretStackProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { gcsKey, namespace },
    } = options
    super(scope, id)
    if (remote) {
      new GcsBackend(this, {
        bucket: bucketName,
        prefix: bucketPrefix,
        credentials: readFileSync(credentials).toString(),
      })
    }
    new KubernetesProvider(this, id, { configPath: config })
    const secretName = `${id}-pgbackrest-secret`
    const metadata = {
      name: secretName,
      namespace: namespace,
    }
    const gcsConf = Buffer.from(
      `
		[global]
		repo1-gcs-key=/etc/pgbackrest/conf.d/gcs-key.json
	`,
    ).toString("base64")
    const gcsKeyJson = Buffer.from(readFileSync(gcsKey).toString()).toString(
      "base64",
    )
    new Secret(this, secretName, {
      metadata,
      data: {
        "gcs.conf": gcsConf,
        "gcs-key.json": gcsKeyJson,
      },
    })
  }
}

export { PostgresStack, PostgresSecretStack }
