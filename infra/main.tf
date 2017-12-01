provider "aws" {
  region  = "us-east-1"
  version = "~> 1.2.0"
  profile = "admin"
}

terraform {
  backend "s3" {
    acl     = "private"
    bucket  = "dg-test-convert"
    key     = "env-prod/libreoffice/main.tfstate"
    encrypt = "true"
    region  = "us-east-1"
    profile = "admin"
  }
}
