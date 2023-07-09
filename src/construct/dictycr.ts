import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Secret } from "@cdktf/provider-kubernetes/lib/secret"
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
  gcsKey: string
  project: string
  resticName: string
  resticPassword: string
}
type SecretStackProperties = {
  provider: Provider
  resource: Resource
}

class SecretStack extends TerraformStack {
  public readonly secret: Secret
  constructor(scope: Construct, id: string, options: SecretStackProperties) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { gcsKey, project, resticName, resticPassword, namespace },
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
    this.secret = new Secret(this, id, {
      metadata,
      data: {
        "gcsbucket.credentials": readFileSync(gcsKey).toString(),
        "gcs.project": project,
        "restic.name": resticName,
        "restic.password": resticPassword,
      },
    })
  }
}

export { SecretStack }
