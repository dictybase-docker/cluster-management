import { Construct } from "constructs"
import { TerraformStack, GcsBackend } from "cdktf"
import { readFileSync } from "fs"

type RemoteStackProperties = {
  credentials: string
  bucketName: string
  bucketPrefix: string
}

class RemoteStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: RemoteStackProperties) {
    const { credentials, bucketName, bucketPrefix } = options
    super(scope, id)
    new GcsBackend(this, {
      bucket: bucketName,
      prefix: bucketPrefix,
      credentials: readFileSync(credentials).toString(),
    })
  }
}

export { RemoteStack }
