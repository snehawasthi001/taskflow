variable "project_name" {
  type = string
}

variable "repositories" {
  type = list(string)
}

variable "lifecycle_keep" {
  type    = number
  default = 30
}

resource "aws_ecr_repository" "service" {
  for_each             = toset(var.repositories)
  name                 = "${var.project_name}/${each.key}"
  image_tag_mutability = "MUTABLE"

  encryption_configuration {
    encryption_type = "AES256"
  }

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-${each.key}-ecr"
  }
}

resource "aws_ecr_lifecycle_policy" "service" {
  for_each   = aws_ecr_repository.service
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep the most recent ${var.lifecycle_keep} images for cost control."
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.lifecycle_keep
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

output "repository_urls" {
  value = { for name, repo in aws_ecr_repository.service : name => repo.repository_url }
}
