import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Secret } from "@cdktf/provider-kubernetes/lib/secret"
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
  secret: Secret
  backupBucket: string
  repository: string
  user: string
  databases: Array<string>
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
      user,
      databases,
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
      users: this.#users(user, databases),
      patroni: this.#dynamicConfiguration(),
    }
  }

  #dynamicConfiguration() {
    return {
      dynamicConfiguration: {
        postgresql: {
          parameters: {
            max_connections: 20,
            max_locks_per_transaction: 640,
            max_pred_locks_per_transaction: 640,
            shared_buffers: "1GB",
            work_mem: "200MB",
            maintenance_work_mem: "200MB",
            temp_buffers: "30MB",
            wal_buffers: "15MB",
            wal_level: "logical",
            min_wal_size: "200MB",
            max_wal_size: "2GB",
            checkpoint_timeout: "10min",
            checkpoint_completion_target: 0.9,
            cpu_tuple_cost: 0.003,
            cpu_index_tuple_cost: 0.01,
            cpu_operator_cost: 0.0005,
            random_page_cost: 2.5,
            default_statistics_target: 250,
            effective_cache_size: "1GB",
            geqo_threshold: 14,
            from_collapse_limit: 14,
            join_collapse_limit: 14,
            log_destination: "stderr",
            logging_collector: "on",
            log_min_messages: "warning",
            log_min_error_statement: "warning",
            log_min_duration_statement: 250,
            log_checkpoints: "on",
            log_connections: "on",
            log_disconnections: "on",
            log_line_prefix: "[%m] [%u@%d] [%p] %r >",
            log_lock_waits: "on",
            log_statement: "mod",
            log_temp_files: 0,
            log_error_verbosity: "default",
            log_timezone: "America/Chicago",
            autovacuum: "on",
            autovacuum_vacuum_scale_factor: 0.1,
            autovacuum_max_workers: 4,
            datestyle: "iso, mdy",
            timezone: "US/Central",
            lc_messages: "C",
            lc_monetary: "C",
            lc_numeric: "C",
            lc_time: "C",
            default_text_search_config: "pg_catalog.english",
          },
        },
      },
    }
  }

  #users(user: string, databases: Array<string>) {
    return [
      {
        name: user,
        databases: databases,
        options: "CREATEDB",
      },
    ]
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
          "compress-level": 3,
          "start-fast": "y",
          "archive-timeout": 10000,
          "archive-check": "y",
          "archive-copy": "y",
          "log-level-console": "detail",
          [`${repository}-path`]: `/pgbackrest/${namespace}/${repository}`,
          [`${repository}-retention-full-type`]: "time",
          [`${repository}-retention-full`]: "30",
          [`${repository}-retention-diff`]: "30",
          [`${repository}-retention-archive`]: "30",
          [`${repository}-bundle`]: "y",
        },
        repos: [
          {
            name: repository,
            gcs: { bucket: backupBucket },
            schedules: {
              full: "0 0 * * *",
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
    const gcsConf = `
[global]
${repository}-gcs-key=/etc/pgbackrest/conf.d/gcs-key.json

`
    const gcsKeyJson = readFileSync(gcsKey).toString()
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
