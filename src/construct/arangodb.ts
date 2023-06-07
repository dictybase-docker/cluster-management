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
  arangodbVersion: string
  arangodbExporterVersion: string
  storageClass: string
  storageSize: number
}
type ArangodbSingleProperties = {
  provider: Provider
  resource: Resource
}
class ArangodbSingle extends TerraformStack {
  constructor(scope: Construct, id: string, options: ArangodbSingleProperties) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: {
        arangodbVersion,
        arangodbExporterVersion,
        name,
        storageSize,
        storageClass,
        namespace,
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
    const metrics = {
      mode: "sidecar",
      enabled: true,
      image: `arangodb/arangodb-exporter:${arangodbExporterVersion}`,
    }
    const annotations = {
      "prometheus.io/scrape": true,
      "prometheus.io/port": "9101",
      "prometheus.io/scrape_interval": "10s",
    }
    const image = {
      image: `arangodb/arangodb:${arangodbVersion}`,
      imagePullPolicy: "IfNotPresent",
    }
    const storage = {
      volumeClaimTemplate: {
        spec: {
          storageClassName: storageClass,
          accessModes: ["ReadWriteOnce"],
          resources: {
            requests: {
              storage: `${storageSize}Gi`,
            },
          },
        },
      },
    }
    const spec = {
      metrics,
      annotations,
      image,
      mode: "Single",
      environment: "Development",
      single: storage,
      externalAccess: { type: "NodePort" },
    }
    const metadata = {
      name: name,
      namespace: namespace,
    }
    new Manifest(this, `${id}-manifest`, {
      manifest: {
        apiVersion: "database.arangodb.com/v1",
        kind: "ArangoDeployment",
        metadata,
        spec,
      },
    })
  }
}

export { ArangodbSingle }
