terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Create this S3 bucket and DynamoDB table once with terraform/bootstrap.
  # Remote state gives teams locking, auditability, and safe concurrent plans.
  backend "s3" {
    bucket         = "taskflow-terraform-state"
    key            = "taskflow/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "taskflow-terraform-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
