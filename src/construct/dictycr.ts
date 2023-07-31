import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Secret } from "@cdktf/provider-kubernetes/lib/secret"
import { Deployment } from "@cdktf/provider-kubernetes/lib/deployment"
import { readFileSync } from "fs"

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}
type SecretStackResource = {
  namespace: string
  gcsKey: string
  project: string
  resticPassword: string
  minioUser: string
  minioPassword: string
}
type SecretStackProperties = {
  provider: Provider
  resource: SecretStackResource
}
type BackendDeploymentResource = {
  namespace: string
  image: string
  tag: string
}
type BackendDeploymentProperties = {
  provider: Provider
  resource: BackendDeploymentResource
}

class SecretStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: SecretStackProperties) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: {
        gcsKey,
        project,
        resticPassword,
        namespace,
        minioUser,
        minioPassword,
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
    new Secret(this, id, {
      metadata,
      data: {
        "gcsbucket.credentials": readFileSync(gcsKey).toString(),
        "gcs.project": project,
        "restic.password": resticPassword,
        rootUser: minioUser,
        rootPassword: minioPassword,
      },
    })
  }
}

class BackendDeployment extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: BackendDeploymentProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { namespace },
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
  }
  #metadata(name: string, namespace: string) {
    return { name, namespace }
  }
  #commandArgs() {
    return []
  }
  #env() {
    return []
  }
  #containers() {
    return []
  }
}

export { SecretStack, BackendDeployment }
