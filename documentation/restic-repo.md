# Create restic repository

## Usage

```shell
yarn tsx src/deploy/create_restic_repo.ts [.....]
```

## Description

The script is responsible for creating a repository stack for managing backups
using Restic and Google Cloud Storage
(GCS) as the backend.

## Command Line Options

- **`--name` (`-nm`)**: Specifies the name of the installation.
  It is a required option and must be provided.

- **`--namespace` (`-ns`)**: Specifies the Kubernetes namespace where the installation will take place. It is a required option and must be provided.

- **`--kubeconfig` (`-kc`)**: Specifies the path to the Kubernetes config file. It is a required option and must be provided.

- **`--credentials` (`-c`)**: Specifies the path to the service account credentials file for the GCS backend. It is an optional option and has a default value of `"credentials/cloud-manager.json"`.

- **`--bucket-name` (`-bn`)**: Specifies the name of the GCS bucket where the Terraform remote state is stored. It is an optional option and has a default value of `"dicty-terraform-state"`.

- **`--remote` (`-r`)**: Specifies whether the remote GCS backend will be used. It is a boolean option and has a default value of `true`.

- **`--backup-bucket` (`-bb`)**: Specifies the name of the GCS bucket used for backup. It is a required option and must be provided.

- **`--dictyr-secret` (`-ds`)**: Specifies the name of the dictycr secret that contains the Restic credentials. It is a required option and must be provided.

- **`--backup-image` (`-im`)**: Specifies the image to use for the backup job. It is an optional option and has a default value of `"dictybase/resticpg:develop-393cb4e"`.
