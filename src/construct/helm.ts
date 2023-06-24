import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { HelmProvider } from "@cdktf/provider-helm/lib/provider"
import {
  Release,
  ReleaseSet,
  ReleaseSetListStruct,
} from "@cdktf/provider-helm/lib/release"
import { readFileSync } from "fs"

type HelmChartProperties = {
  config: string
  version: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
  repo: string
  namespace: string
  chart: string
  name: string
  values?: Array<ReleaseSet>
  listValues?: Array<ReleaseSetListStruct>
}

class HelmChartStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: HelmChartProperties) {
    const {
      version,
      chart,
      remote,
      namespace,
      credentials,
      bucketName,
      bucketPrefix,
      config,
      repo,
      name,
      values,
      listValues,
    } = options
    super(scope, id)
    if (remote) {
      new GcsBackend(this, {
        bucket: bucketName,
        prefix: bucketPrefix,
        credentials: readFileSync(credentials).toString(),
      })
    }
    new HelmProvider(this, "helm", {
      kubernetes: {
        configPath: config,
      },
    })
    new Release(this, id, {
      name: name,
      chart: chart,
      repository: repo,
      createNamespace: true,
      namespace,
      version,
      set: values,
      setList: listValues,
    })
  }
}

export { HelmChartStack }
