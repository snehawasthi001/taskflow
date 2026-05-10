module "vpc" {
  source                  = "./modules/vpc"
  project_name            = var.project_name
  environment             = var.environment
  vpc_cidr                = var.vpc_cidr
  availability_zone_count = var.availability_zone_count
}

module "ecr" {
  source         = "./modules/ecr"
  project_name   = var.project_name
  repositories   = ["frontend", "backend"]
  lifecycle_keep = 30
}

module "eks" {
  source             = "./modules/eks"
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  cluster_version    = var.cluster_version
  node_instance_type = var.eks_node_instance_type
  node_min_size      = var.eks_node_min
  node_max_size      = var.eks_node_max
  node_desired_size  = var.eks_node_desired
}
