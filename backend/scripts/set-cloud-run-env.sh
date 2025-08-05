#!/bin/bash

# Script to set Cloud Run environment variables from .env file

set -e

SERVICE_NAME=$1
GCP_REGION=$2

if [ -z "$SERVICE_NAME" ] || [ -z "$GCP_REGION" ]; then
    echo "Usage: $0 <service-name> <gcp-region>"
    exit 1
fi

if [ ! -f .env ]; then
    echo "Error: .env file not found in current directory"
    exit 1
fi

echo "Reading environment variables from .env file..."

# Build the env vars string
ENV_VARS=""

# Read .env file and build command
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ -z "$key" || "$key" =~ ^#.* ]]; then
        continue
    fi
    
    # Remove quotes from value
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    
    # Skip GCP-specific vars and reserved Cloud Run vars
    if [[ "$key" == "GCP_PROJECT_ID" || "$key" == "GCP_REGION" || "$key" == "PORT" ]]; then
        continue
    fi
    
    # Add to env vars (escape special characters)
    if [ -n "$ENV_VARS" ]; then
        ENV_VARS="${ENV_VARS},"
    fi
    ENV_VARS="${ENV_VARS}${key}=${value}"
done < .env

# Add NODE_ENV if not in .env
if [[ ! "$ENV_VARS" =~ NODE_ENV= ]]; then
    ENV_VARS="${ENV_VARS},NODE_ENV=production"
fi

echo "Setting environment variables on Cloud Run service..."
gcloud run services update "$SERVICE_NAME" \
    --region "$GCP_REGION" \
    --set-env-vars "$ENV_VARS"

echo "Environment variables updated successfully!"