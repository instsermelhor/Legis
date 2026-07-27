# Legis Connect OpenTofu 1.8+ Networking Module
terraform {
  required_version = ">= 1.8.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

variable "environment" {
  type        = string
  description = "Ambiente de deploy (dev, staging, prod)"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.100.0.0/16"
}

resource "aws_vpc" "legis_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "legis-vpc-${var.environment}"
    Environment = var.environment
    ManagedBy   = "OpenTofu"
    Project     = "LegisConnect"
  }
}
