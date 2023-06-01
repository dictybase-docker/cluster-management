import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Manifest } from "@cdktf/provider-kubernetes/lib/manifest"
import { readFileSync } from "fs"

type RedisStandAloneStackProperties = {
  config: string
  redisVersion: string
  redisExporterVersion: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
  namespace: string
  name: string
  storageClass: string
  storageSize: number
}

class RedisStandAloneStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: RedisStandAloneStackProperties,
  ) {
    const {
      remote,
      namespace,
      credentials,
      bucketName,
      bucketPrefix,
      config,
      name,
      storageSize,
      storageClass,
      redisVersion,
      redisExporterVersion,
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
    const redisExporter = {
      enabled: true,
      image: `quay.io/opstree/redis-exporter:v${redisExporterVersion}`,
      imagePullPolicy: "IfNotPresent",
    }
    const kubernetesConfig = {
      image: `quay.io/opstree/redis:v${redisVersion}`,
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
    const probe = {
      failureThreshold: 5,
      initialDelaySeconds: 15,
      periodSeconds: 15,
      successThreshold: 1,
      timeoutSeconds: 5,
    }
    const spec = {
      redisExporter,
      kubernetesConfig,
      storage,
      livenessProbe: probe,
      readinessProbe: probe,
      securityContext: {
        runAsUser: 1000,
        fsGroup: 1000,
      },
    }
    const metadata = {
      name: name,
      namespace: namespace,
    }
    new Manifest(this, `${id}-manifest`, {
      manifest: {
        apiVersion: "redis.redis.opstreelabs.in/v1beta1",
        kind: "Redis",
        metadata,
        spec,
      },
    })
  }
}

export { RedisStandAloneStack }
