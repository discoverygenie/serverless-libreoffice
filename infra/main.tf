provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region  = "us-east-2"
  version = "~> 1.2.0"
  profile = "vlad"
}

terraform {
  backend "s3" {
    acl     = "private"
    bucket  = "dg-test-converted"
    key     = "env-prod/libreoffice/main.tfstate"
    encrypt = "true"
    region  = "us-east-2"
    profile = "vlad"
  }
}
