# cluster management

[![License](https://img.shields.io/badge/License-BSD%202--Clause-blue.svg)](LICENSE)
[![ci develop](https://github.com/dictybase-docker/cluster-management/actions/workflows/ci-develop.yml/badge.svg?branch=develop)](https://github.com/dictybase-docker/cluster-management/actions/workflows/ci-develop.yml)
[![codecov](https://codecov.io/gh/dictybase-docker/cluster-management/branch/develop/graph/badge.svg)](https://codecov.io/gh/dictybase-docker/cluster-management)
[![Maintainability](https://api.codeclimate.com/v1/badges/afaf5e515b14d8a7dcbc/maintainability)](https://codeclimate.com/github/dictybase-docker/cluster-management/maintainability)
![Last commit](https://badgen.net/github/last-commit/dictybase-docker/cluster-management/develop)
[![Funding](https://badgen.net/badge/Funding/Rex%20L%20Chisholm,dictyBase,DCR/yellow?list=|)](https://reporter.nih.gov/project-details/10024726)

- Manages a kubernetes cluster using [kops](https://kops.sigs.k8s.io)

## Prerequisites

### Install terraform

From [here](https://www.terraform.io/downloads.html)

### Learn CDK for terraform

From [here](https://developer.hashicorp.com/terraform/cdktf)

### Learn features of GCP

- IAM,role and permissions from [here](https://cloud.google.com/iam/docs/overview).
- Service accounts from [here](https://cloud.google.com/iam/docs/service-accounts).

### Service account key file for running terraform

- Create a custom **role** from **IAM and Admin** section.
- The role should have the following [permissions](/documentation/terraform_gcp_permissions.md)
- Create a GCP `service account`.
- Assign the above role to the service account.
- Download the json formatted service account key and use it to run `cdktf` scripts.
- It is recommended to rename the downloaded json file and rename it to something understable.
- All of the `cdktf` scripts can pick up the service account file
  by passing it through `[-c|--credentials]` command line option.

## Running commands

The scripts are kept in the `src/deploy` folder of this repository. The two commands
`yarn synth` and `yarn deploy` will be used to run those scripts.

### Deploy with CDK

- `yarn synth -a "tsx src/main.ts --pi <google cloud project id>`
- `` yarn deploy vm-instance k0s-cluster -a `tsx src/main.ts --pi <google cloud
project id> ``

The `deploy` command do run `synth`, however it is easier to verify the command
by the `synth` separately.
