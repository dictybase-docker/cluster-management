const resourceOptions = {
  kc: {
    describe: "kubernetes config file",
    type: "string",
    demandOption: true,
    alias: "kubeconfig",
  },
  c: {
    alias: "credentials",
    description: "service account credentials file for gcs backend",
    type: "string",
    default: "credentials/cloud-manager.json",
  },
  bn: {
    alias: "bucket-name",
    type: "string",
    default: "dicty-terraform-state",
    description: "GCS bucket name where terraform remote state is stored.",
  },
  r: {
    alias: "remote",
    type: "boolean",
    default: true,
    description: "whether the remote gcs backend will be used",
  },
}

export { resourceOptions }
