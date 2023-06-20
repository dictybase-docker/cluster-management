import { Construct } from "constructs"
import { TerraformStack } from "cdktf"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Namespace } from "@cdktf/provider-kubernetes/lib/namespace"
import { RemoteStack } from "./remote"

type NamespaceStackProperties = {
  config: string
  remote?: RemoteStack
  namespace: string
}

class NamespaceStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: NamespaceStackProperties) {
    const { remote, namespace, config } = options
    super(scope, id)
    const backend = remote ? remote : this
    new KubernetesProvider(backend, id, { configPath: config })
    new Namespace(backend, `{$id}-namespace`, {
      metadata: { name: namespace },
    })
  }
}

export { NamespaceStack }
