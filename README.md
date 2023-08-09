# cluster management

[![License](https://img.shields.io/badge/License-BSD%202--Clause-blue.svg)](LICENSE)
[![ci develop](https://github.com/dictybase-docker/cluster-management/actions/workflows/ci-develop.yml/badge.svg?branch=develop)](https://github.com/dictybase-docker/cluster-management/actions/workflows/ci-develop.yml)
[![codecov](https://codecov.io/gh/dictybase-docker/cluster-management/branch/develop/graph/badge.svg)](https://codecov.io/gh/dictybase-docker/cluster-management)
[![Maintainability](https://api.codeclimate.com/v1/badges/afaf5e515b14d8a7dcbc/maintainability)](https://codeclimate.com/github/dictybase-docker/cluster-management/maintainability)
![Last commit](https://badgen.net/github/last-commit/dictybase-docker/cluster-management/develop)
[![Funding](https://badgen.net/badge/Funding/Rex%20L%20Chisholm,dictyBase,DCR/yellow?list=|)](https://reporter.nih.gov/project-details/10024726)

- Manages a kubernetes cluster using [k0s](https://docs.k0sproject.io/)

## Prerequisites

### Install terraform

From [here](https://www.terraform.io/downloads.html)

### Learn CDK for terraform

From [here](https://developer.hashicorp.com/terraform/cdktf)

### Learn features of GCP

- IAM,role and permissions from [here](https://cloud.google.com/iam/docs/overview).
- Service accounts from [here](https://cloud.google.com/iam/docs/service-accounts).

### Service account for running terraform

- Create a custom **role** from **IAM and Admin** section.
- The role should have the following [permissions](/documentation/terraform_gcp_permissions.md)
- Create a GCP `service account`.
- Assign the above role to the service account.
- Download the json formatted service account key to this current folder and
  rename it to `credentials.json`. In case the key file has a different name or
  resides in a different path, it can be set through command line.

## Running commands

The commands are defined in the script field of `package.json` file. The two
main commands will be `yarn synth` and `yarn deploy`. To get a list of all
available command line options run `yarn tsx src/main.ts -h`.

### Deploy with CDK

- `yarn synth -a "tsx src/main.ts --pi <google cloud project id>`
- `` yarn deploy vm-instance k0s-cluster -a `tsx src/main.ts --pi <google cloud
project id> ``

  The `deploy` command do run `synth`, however it is easier to verify the command
  by the `synth` separately.
