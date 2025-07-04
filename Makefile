# Docker settings
DOCKER_IMAGE_NAME ?= bettergr-web-app
DOCKER_TAG ?= latest
DOCKERFILE ?= Dockerfile
DOCKER_REGISTRY ?= ghcr.io/bettergr

# Default target
all: install build

# Install dependencies
install:
	@echo [NPM] Installing dependencies...
	@npm ci
	@echo [NPM] Dependencies installed.

# Generate GraphQL types (only if API is available)
codegen:
	@echo [CODEGEN] Generating GraphQL types...
	@npm run codegen || echo "Warning: GraphQL codegen failed - API might not be available"
	@echo [CODEGEN] GraphQL types generation completed.

# Build the application
build: install
	@echo [BUILD] Building Nuxt application...
	@npm run build
	@echo [BUILD] Nuxt application built successfully.

# Development server
dev: install
	@echo [DEV] Starting development server...
	@npm run dev

# Preview production build
preview: build
	@echo [PREVIEW] Starting preview server...
	@npm run preview

# Format code (if you have prettier configured)
fmt:
	@echo [FMT] Formatting code...
	@npm run format || echo "No format script found"
	@echo [FMT] Code formatted.

# Lint code (if you have linting configured)
lint:
	@echo [LINT] Running linter...
	@npm run lint || echo "No lint script found"
	@echo [LINT] Lint checks completed.

# Test (if you have tests configured)
test:
	@echo [TEST] Running tests...
	@npm run test || echo "No test script found"
	@echo [TEST] Tests completed.

# Build Docker image
docker-build:
	@echo [DOCKER] Building Docker image $(DOCKER_IMAGE_NAME):$(DOCKER_TAG)... 
	@docker build -t $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) -f $(DOCKERFILE) .
	@echo [DOCKER] Docker image $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) built successfully.

# Push Docker image to registry
docker-push: docker-build
ifeq ($(DOCKER_REGISTRY),docker.io)
	@echo [DOCKER] Docker registry is set to docker.io.
else
	@echo [DOCKER] Docker registry set to $(DOCKER_REGISTRY).
endif
	@echo [DOCKER] Pushing Docker image $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) to $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)...
	@docker tag $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)
	@docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)
	@echo [DOCKER] Docker image pushed successfully.

# Clean up generated files and node_modules
clean:
	@echo [CLEAN] Removing generated files and dependencies...
ifeq ($(OS),Windows_NT)
	@if exist node_modules rmdir /s /q node_modules
	@if exist .nuxt rmdir /s /q .nuxt
	@if exist .output rmdir /s /q .output
	@if exist dist rmdir /s /q dist
else
	@rm -rf node_modules
	@rm -rf .nuxt
	@rm -rf .output
	@rm -rf dist
endif
	@echo [CLEAN] Clean up complete.

help:
	@echo Available targets:
	@echo   all               Install dependencies and build
	@echo   install           Install npm dependencies
	@echo   codegen           Generate GraphQL types (requires running API)
	@echo   build             Build the Nuxt application
	@echo   dev               Start development server
	@echo   preview           Start preview server for production build
	@echo   fmt               Format code (if configured)
	@echo   lint              Run linter (if configured)
	@echo   test              Run tests (if configured)
	@echo   docker-build      Build Docker image
	@echo   docker-push       Push Docker image to registry
	@echo   clean             Clean up generated files and dependencies

.PHONY: all install codegen build dev preview fmt lint test docker-build docker-push clean help