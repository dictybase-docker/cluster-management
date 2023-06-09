import yargs from "yargs/yargs"

const argv = yargs(process.argv.slice(2))
  .options({
    rms: {
      alias: "remove-script",
      type: "string",
      description: "script to remove microk8s",
      default: "scripts/remove_microk8s.sh",
    },
    rmk: {
      alias: "remove-microk8s",
      type: "boolean",
      description: "whether or not to remove microk8s",
      default: false,
    },
    rs: {
      alias: "restart-script",
      type: "string",
      description: "script to restart the microk8s server",
      default: "scripts/restart_microk8s.sh",
    },
    u: {
      alias: "user",
      type: "string",
      description: "user name for remote server",
      default: "newman",
    },
    sk: {
      alias: "ssh-key",
      description: "private ssh key file that will be used for login",
      type: "string",
      default: "k8sVM",
    },
    ss: {
      alias: "script",
      type: "string",
      default: "scripts/bootstrap_microk8s.sh",
      description: "script to execute on remote server",
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
      default: "kubeconfig.yaml",
      description: "kubernetes config file of k8s cluster",
    },
    i: {
      alias: "input",
      type: "string",
      default: "ip.json",
      description:
        "json output file generated from terraform run containing the public ips of vm instance",
    },
    ct: {
      alias: "certificate-template",
      type: "string",
      default: "templates/csr.conf.template",
      description:
        "certificate template file that will be copied to server for ip based kubectl access",
    },
  })
  .parseSync()

export { argv }
