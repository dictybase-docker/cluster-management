import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Manifest } from "@cdktf/provider-kubernetes/lib/manifest"
import { readFileSync } from "fs"

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
}
type PostgresStackProperties = {
  provider: Provider
  resource: Resource
}
class PostgresStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: PostgresStackProperties) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { version, name, storageSize, storageClass, namespace },
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
    const spec = {
      image: `registry.developers.crunchydata.com/crunchydata/crunchy-postgres:ubi8-${postgresVersion}`,
      imagePullPolicy: "IfNotPresent",
      instances: [
        {
          name,
          dataVolumeClaimSpec,
        },
      ],
    }
    const metadata = { name, namespace }
    new Manifest(this, `${id}-manifest`, {
      manifest: {
        apiVersion: "postgres-operator.crunchydata.com/v1beta1",
        kind: "PostgresCluster",
        postgresVersion,
        metadata,
        spec,
      },
    })
  }
}

export { PostgresStack }
