import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Namespace } from "@cdktf/provider-kubernetes/lib/namespace"
import { TerraformStack, GcsBackend } from "cdktf"
import { readFileSync } from "fs"

type NamespaceStackProperties = {
  config: string
  namespace: string
  credentials: string
  bucketName: string
  bucketPrefix: string
  remote: boolean
}

class NamespaceStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: NamespaceStackProperties) {
    const { namespace, config, credentials, bucketName, bucketPrefix, remote } =
      options
    super(scope, id)
    if (remote) {
      new GcsBackend(this, {
        bucket: bucketName,
        prefix: bucketPrefix,
        credentials: readFileSync(credentials).toString(),
      })
    }
    new KubernetesProvider(this, `${id}-kubernetes`, { configPath: config })
    new Namespace(this, `${id}-namespace`, {
      metadata: { name: namespace },
    })
  }
}

export { NamespaceStack }
