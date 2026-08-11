# AWS-Cloud-Resume**Author:** Richmond Cequeña Rivera  
**Location:** Philippines  
**Current Focus:** Upskilling in DevOps, Cloud Infrastructure, CI/CD, and Automation to transition from Production Application Support to Cloud Engineering.

## 🚀 Project Overview

This repository contains the source code and infrastructure configuration for my implementation of the [AWS Cloud Resume Challenge](https://richmondrivera.com/). The challenge is a multi-step project aimed at building a full-stack, cloud-native application using Amazon Web Services (AWS). It serves as a hands-on demonstration of deploying a static website, creating a serverless backend, and fully automating the deployment process using CI/CD pipelines and Infrastructure as Code (IaC).

## 🏗️ Architecture

The architecture leverages the following AWS services:

### Frontend
* **Amazon S3:** Hosts the static website (HTML, CSS, JavaScript).
* **Amazon CloudFront:** Content Delivery Network (CDN) to securely serve the website with HTTPS and low latency.
* **Amazon Route 53:** DNS management for custom domain routing.
* **AWS Certificate Manager (ACM):** Provisions the SSL/TLS certificate for secure HTTPS communication.

### Backend (Serverless)
* **Amazon DynamoDB:** NoSQL database storing the visitor counter data.
* **AWS Lambda:** Python-based serverless function that interacts with DynamoDB to retrieve and update the visitor count.
* **Amazon API Gateway:** REST/HTTP API endpoint that triggers the Lambda function from the frontend JavaScript.

### Automation & CI/CD
* **GitHub Actions:** Automated CI/CD pipelines divided into two workflows:
  * *Frontend Pipeline:* Automates the deployment of static web assets to S3 and invalidates the CloudFront cache upon repository changes.
  * *Backend Pipeline:* Automates the deployment of Lambda code and API Gateway configurations, along with unit testing.
* **Terraform / IaC:** Provisions and manages all AWS resources declaratively, ensuring repeatable and consistent cloud deployments without manual console configuration.

## 🛠️ Skills & Technologies Demonstrated

* **Cloud Infrastructure:** AWS Core Services (S3, CloudFront, Route53, ACM, DynamoDB, Lambda, API Gateway, IAM)
* **DevOps & Automation:** Infrastructure as Code (Terraform)
* **CI/CD:** GitHub Actions (Continuous Integration, Continuous Deployment, Automated Testing)
* **Programming:** Python (Serverless Backend), JavaScript/HTML/CSS (Frontend)
* **Version Control:** Git & GitHub

## 📂 Repository Structure

```text
├── frontend/               # Website assets (HTML, CSS, JS)
├── backend/                # Lambda function (Python) and unit tests
├── infrastructure/         # Terraform configuration files (.tf)
├── .github/workflows/      # GitHub Actions CI/CD pipeline definitions
└── README.md
```

## ⚙️ Deployment Steps

1. **Infrastructure:**
   - Navigate to the `infrastructure` directory.
   - Run `terraform init` to initialize the AWS provider.
   - Run `terraform plan` to verify the resources to be created.
   - Run `terraform apply` to provision the infrastructure.
2. **Backend:**
   - Push backend changes to the `main` branch to trigger the backend GitHub Actions workflow.
   - The workflow runs Python unit tests and deploys the updated code to AWS Lambda.
3. **Frontend:**
   - Update the API endpoint URL in the frontend JavaScript file based on the API Gateway output.
   - Push frontend changes to trigger the frontend GitHub Actions workflow.
   - The workflow synchronizes files with the S3 bucket and automatically invalidates the CloudFront cache.

## 📈 Next Steps & Learning Roadmap

Over the next 3 to 6 months, this project will serve as a foundation for advanced learning:
- Migrating workloads to containerized environments (Docker, AWS ECS/EKS).
- Exploring advanced CI/CD tooling (Jenkins, AWS CodePipeline).
- Integrating artificial intelligence services to pivot towards AI Engineering workflows.
