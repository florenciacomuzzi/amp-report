#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="your-gcp-project-id"
SERVICE_NAME="amp-report-backend"
REGION="us-east1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Cloud Run deployment...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Prompt for project ID if not set
if [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
    echo -n "Enter your GCP Project ID: "
    read PROJECT_ID
    IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
fi

# Set the project
echo -e "${GREEN}Setting GCP project to ${PROJECT_ID}...${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${GREEN}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the Docker image
echo -e "${GREEN}Building Docker image...${NC}"
docker build -t ${IMAGE_NAME} .

# Configure Docker to use gcloud as a credential helper
echo -e "${GREEN}Configuring Docker authentication...${NC}"
gcloud auth configure-docker

# Push the image to Google Container Registry
echo -e "${GREEN}Pushing image to Container Registry...${NC}"
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo -e "${GREEN}Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --region ${REGION} \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --timeout 60 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}"
echo ""
echo -e "${YELLOW}Don't forget to set your environment variables in Cloud Run:${NC}"
echo "  - DATABASE_URL or NEON_DATABASE_URL"
echo "  - JWT_SECRET"
echo "  - GOOGLE_MAPS_API_KEY"
echo "  - OPENAI_API_KEY"
echo ""
echo -e "${YELLOW}You can set them using:${NC}"
echo "gcloud run services update ${SERVICE_NAME} --region ${REGION} --set-env-vars KEY=VALUE"