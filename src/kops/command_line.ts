import yargs from "yargs/yargs"

const argv = yargs(process.argv.slice(2))
  .options({
    cn: {
      alias: "cluster-name",
      type: "string",
      demandOption: true,
      description: "name of the cluster",
      default: process.env.KOPS_CLUSTER_NAME,
    },
    cred: {
      alias: "credentials",
      type: "string",
      description: "google cloud service account file in JSON format",
      default: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    },
    st: {
      alias: "state",
      type: "string",
      description: "remote location of kops state",
      default: process.env.KOPS_STATE_STORE,
      demandOption: true,
    },
    pi: {
      alias: "project-id",
      type: "string",
      demandOption: true,
      description: "the google cloud project id",
    },
    z: {
      alias: "zone",
      type: "string",
      description: "the google cloud zone",
      default: "us-central1-c",
    },
    sk: {
      alias: "ssh-key",
      description:
        "public ssh key file that will be injected in the vm for login",
      type: "string",
      default: "k8sVM.pub",
    },
    l: {
      alias: "log-level",
      type: "string",
      default: "error",
      description: "logging level, should be one of debug,info,warn,error",
    },
    kc: {
      alias: "kubeconfig",
      type: "string",
      description: "kubernetes config file of k8s cluster",
      default: process.env.KUBECONFIG,
    },
    cp: {
      alias: "provider",
      type: "string",
      describe: "cloud provider where the cluster will be hosted",
      default: "gce",
    },
    ms: {
      alias: "master-size",
      type: "string",
      default: "n1-custom-2-2048",
      description: "The machine type for kubernetes master",
    },
    mc: {
      alias: "master-count",
      type: "string",
      default: 2,
      describe: "no of kubernetes master to create",
    },
    mvs: {
      alias: "master-volume-size",
      type: "number",
      default: 50,
      description: "size of the boot disk of kubernetes master in GB",
    },
    im: {
      alias: "image",
      type: "string",
      description: "compute image to be used for the vm",
      value: "ubuntu-os-cloud/ubuntu-minimal-2204-jammy-v20230428",
    },
    kv: {
      alias: "kubernetes-version",
      type: "string",
      describe: "version of kubernetes cluster",
      value: "1.24.12",
    },
    ns: {
      alias: "node-size",
      type: "string",
      default: "n1-custom-2-4096",
      description: "The machine type for kubernetes node",
    },
    nvs: {
      alias: "node-volume-size",
      type: "number",
      default: 50,
      description: "size of the boot disk of kubernetes nodes in GB",
    },
    nc: {
      alias: "node-count",
      type: "string",
      default: 3,
      describe: "no of kubernetes worker node to create",
    },
  })
  .parseSync()

export { argv }
