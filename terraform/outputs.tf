output "vpc_id" {
  description = "VPC ID."
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs for load balancers."
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs for EKS workloads."
  value       = module.vpc.private_subnet_ids
}

output "eks_cluster_name" {
  description = "EKS cluster name."
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint."
  value       = module.eks.cluster_endpoint
}

output "ecr_repository_urls" {
  description = "ECR repository URLs by service."
  value       = module.ecr.repository_urls
}

output "cloudwatch_log_group" {
  description = "EKS control plane CloudWatch log group."
  value       = module.eks.cloudwatch_log_group
}
