import { Construct } from "constructs"
import { TerraformStack, GcsBackend } from "cdktf"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Namespace } from "@cdktf/provider-kubernetes/lib/namespace"
import { readFileSync } from "fs"

type NamespaceStackProperties = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
  namespace: string
}

class NamespaceStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: NamespaceStackProperties) {
    const { remote, namespace, credentials, bucketName, bucketPrefix, config } =
      options
    super(scope, id)
    if (remote) {
      new GcsBackend(this, {
        bucket: bucketName,
        prefix: bucketPrefix,
        credentials: readFileSync(credentials).toString(),
      })
    }
    new KubernetesProvider(this, id, { configPath: config })
    new Namespace(this, `{$id}-namespace`, {
      metadata: { name: namespace },
    })
  }
}

export { NamespaceStack }
