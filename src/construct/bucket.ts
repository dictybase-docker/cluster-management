import { Construct } from "constructs"
import { TerraformStack, GcsBackend } from "cdktf"
import { readFileSync } from "fs"
import { StorageBucket } from "@cdktf/provider-google/lib/storage-bucket"
import { GoogleProvider } from "@cdktf/provider-google/lib/provider"

type Backend = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}

type Provider = {
  credentials: string
  projectId: string
  region: string
  zone: string
}

type Resource = {
  bucketName: string
}

type BucketStackProperties = {
  provider: Provider
  resource: Resource
  backend: Backend
}

class BucketStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: BucketStackProperties) {
    super(scope, id)
    const { provider, resource, backend } = options
    if (backend.remote) {
      new GcsBackend(this, {
        bucket: backend.bucketName,
        prefix: backend.bucketPrefix,
        credentials: readFileSync(backend.credentials).toString(),
      })
    }
    new GoogleProvider(this, `${id}-google-provider`, {
      credentials: readFileSync(provider.credentials).toString(),
      project: provider.projectId,
      region: provider.region,
      zone: provider.zone,
    })
    new StorageBucket(this, id, {
      forceDestroy: true,
      name: resource.bucketName,
      location: "US",
      versioning: {
        enabled: true,
      },
    })
  }
}

export { BucketStack }
