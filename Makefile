# AMP Report – Makefile

# Variables
SLIDE=slides/mvp.md
EXPORT_DIR=docs/presentation
REVEAL_PORT=1948

.PHONY: install client-install db-seed slides slides-export docker-up docker-down docker-logs generate-types deploy-backend deploy-backend-env

install:
	cd backend && npm install

client-install:
	cd client && npm install

db-seed:
	cd backend && npm run db:seed

generate-types:
	cd backend && npm run generate:trpc-types

# Launch presentation locally
slides:
	npm run present:mvp

# Export static HTML version of the slides (placed in $(EXPORT_DIR))
slides-export:
	npx reveal-md $(SLIDE) --static $(EXPORT_DIR)

# Convenience wrappers for docker-compose

docker-up:
	docker-compose -f docker-compose.dev.yml up -d

docker-down:
	docker-compose -f docker-compose.dev.yml down

docker-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Cloud Run deployment targets
# Include .env file if it exists
-include backend/.env
export

# GCP Configuration - these will be overridden by backend/.env if it exists
GCP_PROJECT_ID ?= your-gcp-project-id
GCP_REGION ?= us-east1
SERVICE_NAME = amp-report-backend
IMAGE_NAME = gcr.io/$(GCP_PROJECT_ID)/$(SERVICE_NAME)

# Show current configuration
show-config:
	@echo "Current configuration:"
	@echo "  GCP_PROJECT_ID: $(GCP_PROJECT_ID)"
	@echo "  GCP_REGION: $(GCP_REGION)"
	@echo "  SERVICE_NAME: $(SERVICE_NAME)"
	@echo "  IMAGE_NAME: $(IMAGE_NAME)"

# Configure GCP and Docker authentication
gcp-auth:
	@echo "Configuring GCP authentication..."
	gcloud config set project $(GCP_PROJECT_ID)
	gcloud auth configure-docker
	gcloud services enable cloudbuild.googleapis.com
	gcloud services enable run.googleapis.com
	gcloud services enable containerregistry.googleapis.com

# Deploy backend to Cloud Run
deploy-backend: gcp-auth
	@echo "Deploying backend to Cloud Run..."
	@if [ "$(GCP_PROJECT_ID)" != "development-454916" ]; then \
		echo "Error: Please set GCP_PROJECT_ID in your .env file or as an environment variable"; \
		exit 1; \
	fi
	cd backend && docker buildx build --platform linux/amd64 -f Dockerfile.cloudrun -t $(IMAGE_NAME) --load .
	docker push $(IMAGE_NAME)
	gcloud run deploy $(SERVICE_NAME) \
		--image $(IMAGE_NAME) \
		--region $(GCP_REGION) \
		--platform managed \
		--allow-unauthenticated \
		--memory 1Gi \
		--cpu 1 \
		--timeout 300 \
		--max-instances 10 \
		--set-env-vars NODE_ENV=production \
		--no-cpu-throttling

# Deploy backend with environment variables from .env
deploy-backend-env: deploy-backend
	@if [ ! -f backend/.env ]; then \
		echo "Error: backend/.env file not found. Please create it from backend/.env.example"; \
		exit 1; \
	fi
	@echo "Setting environment variables from .env..."
	cd backend && ./scripts/set-cloud-run-env.sh $(SERVICE_NAME) $(GCP_REGION)
	@echo "Deployment complete!"
	@echo "Service URL: https://$(SERVICE_NAME)-$(shell gcloud config get-value project)-$(shell echo $(GCP_REGION) | sed 's/-[a-z]$$//')-a.run.app"
