#!/usr/bin/env bash
# Bouwt de backend-image, pusht naar Artifact Registry, en deployt naar Cloud Run.
# Vereist: gcloud ingelogd (`gcloud auth login`) met project confessions-461517 actief,
# en Docker Desktop draaiend. Draai dit vanuit de backend/-map.
#
# Gebruik: ./deploy.sh [tag]   (tag default: v1)

set -euo pipefail

PROJECT_ID="confessions-461517"
REGION="europe-west1"
REPOSITORY="confessor"
SERVICE_NAME="confessor-backend"
SERVICE_ACCOUNT="kul-confessions@${PROJECT_ID}.iam.gserviceaccount.com"
TAG="${1:-v1}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/backend:${TAG}"

echo "Bouwt en pusht ${IMAGE} (linux/amd64, ook vanaf Apple Silicon)..."
docker buildx build --platform linux/amd64 -t "${IMAGE}" --push .

echo "Deployt naar Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --image="${IMAGE}" \
  --service-account="${SERVICE_ACCOUNT}" \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=${PROJECT_ID},SHEET_ID=1W_Yuo-ql5lneUYsChpH_nfBFeeisKhJaPA0bEPuWero,STORAGE_BUCKET=confessions-461517.firebasestorage.app" \
  --max-instances=3 \
  --port=8080 \
  --no-allow-unauthenticated \
  --quiet

# --no-allow-unauthenticated blijft staan - toegang loopt via Identity-Aware Proxy
# vóór deze service (issue #31), niet via --allow-unauthenticated. Zie README
# "Beveiliging"/"Deployment".
