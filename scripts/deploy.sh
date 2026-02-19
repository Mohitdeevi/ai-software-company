#!/bin/bash
set -e

NAMESPACE="promptcorp"
REGISTRY="${REGISTRY:-your-registry.com}"
TAG="${TAG:-latest}"

echo "🚀 PromptCorp OS - Kubernetes Deployment"
echo "=========================================="
echo "Registry: $REGISTRY"
echo "Tag: $TAG"
echo "Namespace: $NAMESPACE"
echo ""

# Build and push images
echo "🔨 Building backend image..."
docker build -f infrastructure/docker/Dockerfile.backend -t "$REGISTRY/promptcorp-backend:$TAG" ./backend
docker push "$REGISTRY/promptcorp-backend:$TAG"

echo "🔨 Building frontend image..."
docker build -f infrastructure/docker/Dockerfile.frontend -t "$REGISTRY/promptcorp-frontend:$TAG" ./frontend
docker push "$REGISTRY/promptcorp-frontend:$TAG"

# Update image tags in manifests
echo "📝 Updating Kubernetes manifests..."
sed -i "s|\${REGISTRY}|$REGISTRY|g" infrastructure/k8s/backend-deployment.yaml
sed -i "s|\${REGISTRY}|$REGISTRY|g" infrastructure/k8s/frontend-deployment.yaml
sed -i "s|:latest|:$TAG|g" infrastructure/k8s/backend-deployment.yaml
sed -i "s|:latest|:$TAG|g" infrastructure/k8s/frontend-deployment.yaml

# Apply manifests in order
echo "☸️  Applying Kubernetes manifests..."
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/configmap.yaml
kubectl apply -f infrastructure/k8s/secret.yaml
kubectl apply -f infrastructure/k8s/mongodb-statefulset.yaml
kubectl apply -f infrastructure/k8s/mongodb-service.yaml
kubectl apply -f infrastructure/k8s/redis-deployment.yaml
kubectl apply -f infrastructure/k8s/redis-service.yaml
kubectl apply -f infrastructure/k8s/backend-deployment.yaml
kubectl apply -f infrastructure/k8s/backend-service.yaml
kubectl apply -f infrastructure/k8s/frontend-deployment.yaml
kubectl apply -f infrastructure/k8s/frontend-service.yaml
kubectl apply -f infrastructure/k8s/ingress.yaml
kubectl apply -f infrastructure/k8s/hpa-backend.yaml
kubectl apply -f infrastructure/k8s/hpa-frontend.yaml

# Wait for rollout
echo "⏳ Waiting for deployments..."
kubectl rollout status deployment/backend -n $NAMESPACE --timeout=300s
kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=300s

echo ""
echo "=========================================="
echo "✅ Deployment complete!"
kubectl get pods -n $NAMESPACE
echo "=========================================="
