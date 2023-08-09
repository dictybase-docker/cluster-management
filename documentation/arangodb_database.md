# Arangodb

## Usage

## Description

## Command Line Options

- `nm` or `name`: The name of the installation. This option is required.
- `ns` or `namespace`: The Kubernetes namespace to install. This option is required.
- `kc` or `kubeconfig`: The path to the Kubernetes config file. This option is required.
- `us` or `user`: The ArangoDB user to be created. This option is required.
- `dbs` or `databases`: An array of ArangoDB databases to create. This option is required.
- `pa` or `password`: The password for the user to be created. This option is required.
- `c` or `credentials`: The path to the service account credentials file for the GCS backend. The default value is "credentials/cloud-manager.json".
- `bn` or `bucket-name`: The name of the GCS bucket where Terraform remote state is stored. The default value is "dicty-terraform-state".
- `r` or `remote`: A boolean flag indicating whether the remote GCS backend will be used. The default value is `true`.
- `gr` or `grant`: The default database permission for the newly created user. The default value is "rw".
- `im` or `image`: The image to use for database and user creations. The default value is "dictybase/arangoadmin:develop-cdf7c20".
- `au` or `admin-user`: The root user for ArangoDB. The default value is "root".
- `ap` or `admin-pass`: The password for the ArangoDB admin user.
