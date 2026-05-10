variable "project_name" {
  description = "Project name used for AWS resource naming."
  type        = string
  default     = "taskflow"
}

variable "environment" {
  description = "Environment name: dev, staging, or prod."
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region for EKS and supporting resources."
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR block."
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zone_count" {
  description = "Number of availability zones. Two keeps demo cost low while remaining multi-AZ."
  type        = number
  default     = 2
}

variable "cluster_version" {
  description = "EKS Kubernetes version."
  type        = string
  default     = "1.31"
}

variable "eks_node_instance_type" {
  description = "Cost-conscious EKS worker node instance type."
  type        = string
  default     = "t3.small"
}

variable "eks_node_min" {
  description = "Minimum EKS managed node group size."
  type        = number
  default     = 1
}

variable "eks_node_max" {
  description = "Maximum EKS managed node group size for autoscaling."
  type        = number
  default     = 3
}

variable "eks_node_desired" {
  description = "Desired EKS managed node group size."
  type        = number
  default     = 1
}
