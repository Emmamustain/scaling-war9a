OS := $(shell uname 2>/dev/null || echo Windows_NT)
HR=━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARGS = $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))

setup: init hosts-config generate-certs
	@echo $(HR)
	@echo Building TypeScript projects: shared packages...
	npm run build:shared
	@echo TypeScript build completed!
	@echo Setup complete! Run 'make help' for commands.
	@echo $(HR)

init:
	@echo $(HR)
	@echo Setting up War9a Monorepo...
	@echo $(HR)
	@echo Installing dependencies...
	npm install
	@echo Dependencies installed successfully!
	@echo Project structure:
	@echo   apps/frontend  - Next.js Frontend
	@echo   apps/backend   - NestJS Backend
	@echo   packages/      - Shared packages

hosts-config:
	@echo $(HR)
	@echo Updating hosts file...
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -NoProfile -Command "& {$$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8}"
else
	-@if [ $$(id -u) -ne 0 ]; then \
		echo "Warning: Not running as root - hosts file will not be updated"; \
		echo "To enable local domain access, manually add these entries to your hosts file:"; \
		echo "   127.0.0.1 war9a.localhost"; \
		echo "   127.0.0.1 api.war9a.localhost"; \
		echo "   127.0.0.1 traefik.war9a.localhost"; \
		echo "   127.0.0.1 cdn.war9a.localhost"; \
		echo "   127.0.0.1 storage.war9a.localhost"; \
	else \
		for domain in war9a.localhost api.war9a.localhost traefik.war9a.localhost cdn.war9a.localhost storage.war9a.localhost; do \
		    if ! grep -q "127.0.0.1 $$domain" /etc/hosts; then \
		        echo "127.0.0.1 $$domain" >> /etc/hosts; \
		    fi; \
		done; \
		echo "Hosts file updated successfully!"; \
	fi
endif

generate-certs:
	@echo $(HR)
	@echo Generating SSL certificates...
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -NoProfile -Command "& {$$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; .\scripts\generate-certs.ps1}"
else
	@bash ./scripts/generate-certs.sh
endif

# Development commands
up: generate-certs
	@echo $(HR)
	@echo Starting development Docker containers...
	docker-compose -f docker-compose.dev.yml up --build

upd: generate-certs
	@echo $(HR)
	@echo Starting development Docker containers in background...
	docker-compose -f docker-compose.dev.yml up -d --build

down:
	@echo $(HR)
	@echo Stopping development Docker containers...
	docker-compose -f docker-compose.dev.yml down

restart:
	@echo $(HR)
	@echo Restarting development Docker containers...
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.dev.yml up --build

# Production commands
prod:
	@echo $(HR)
	@echo Starting production Docker containers...
	docker-compose -f docker-compose.prod.yml up --build

prod-up:
	@echo $(HR)
	@echo Starting production Docker containers in background...
	docker-compose -f docker-compose.prod.yml up -d --build

prod-down:
	@echo $(HR)
	@echo Stopping production Docker containers...
	docker-compose -f docker-compose.prod.yml down

prod-build:
	@echo $(HR)
	@echo Building production Docker images...
	docker-compose -f docker-compose.prod.yml build

dev:
	@echo $(HR)
	@echo Starting development environment...
	npm run dev

build:
	@echo $(HR)
	@echo Building all packages and applications...
	npm run nx:build

clean:
	@echo $(HR)
	@echo Cleaning up...
	npx rimraf node_modules
	npx rimraf apps/*/node_modules
	npx rimraf packages/*/node_modules
	npx rimraf apps/*/dist
	npx rimraf packages/*/dist
	npx rimraf apps/frontend/.next

help:
	@echo $(HR)
	@echo War9a - Virtual Queue Management Platform
	@echo $(HR)
	@echo "--- Setup ---"
	@echo "make setup          - Install dependencies, update hosts, generate SSL certs"
	@echo ""
	@echo "--- Development Docker ---"
	@echo "make up             - Start development services in the foreground (with build)"
	@echo "make upd            - Start development services in the background (detached)"
	@echo "make down           - Stop development services"
	@echo "make restart        - Rebuild and restart development services"
	@echo ""
	@echo "--- Production Docker ---"
	@echo "make prod           - Start production services in the foreground (with build)"
	@echo "make prod-up        - Start production services in the background (detached)"
	@echo "make prod-down      - Stop production services"
	@echo "make prod-build     - Build production Docker images only"
	@echo ""
	@echo "--- Package Management ---"
	@echo "make add-frontend-dep <name>  - Add a dependency to the frontend"
	@echo "make add-frontend-dev <name>  - Add a dev dependency to the frontend"
	@echo "make add-backend-dep <name>   - Add a dependency to the backend"
	@echo "make add-backend-dev <name>   - Add a dev dependency to the backend"
	@echo ""
	@echo "--- Database ---"
	@echo "make db-generate    - Generate a new SQL migration from schema changes"
	@echo "make db-migrate     - Apply pending migrations to the database"
	@echo "make db-seed        - Seed the database with sample data"
	@echo "make db-studio      - Open Drizzle Studio"
	@echo $(HR)

# --- Package Management ---
add-frontend-dep:
	@$(if $(ARGS),,echo "Missing package name. Usage: make add-frontend-dep <package-name>" && exit 1)
	@echo "Installing dependency '$(ARGS)' in frontend container..."
	docker-compose -f docker-compose.dev.yml exec frontend npm install $(ARGS)

add-frontend-dev:
	@$(if $(ARGS),,echo "Missing package name. Usage: make add-frontend-dev <package-name>" && exit 1)
	@echo "Installing dev dependency '$(ARGS)' in frontend container..."
	docker-compose -f docker-compose.dev.yml exec frontend npm install -D $(ARGS)

add-backend-dep:
	@$(if $(ARGS),,echo "Missing package name. Usage: make add-backend-dep <package-name>" && exit 1)
	@echo "Installing dependency '$(ARGS)' in backend container..."
	docker-compose -f docker-compose.dev.yml exec backend npm install $(ARGS)

add-backend-dev:
	@$(if $(ARGS),,echo "Missing package name. Usage: make add-backend-dev <package-name>" && exit 1)
	@echo "Installing dev dependency '$(ARGS)' in backend container..."
	docker-compose -f docker-compose.dev.yml exec backend npm install -D $(ARGS)

# --- Shadcn Commands ---
shadcn-add:
	@if [ -z "$(ARGS)" ]; then \
		echo "Missing component name. Usage: make shadcn-add <component-name>"; \
		exit 1; \
	fi
	@echo "Adding shadcn component '$(ARGS)' to frontend..."
	@cd apps/frontend && npx shadcn@latest add $(ARGS)
	docker-compose -f docker-compose.dev.yml exec -u $(shell id -u):$(shell id -g) frontend npm install
	npm install

# --- Database Commands ---
db-migrate:
	@echo $(HR)
	@echo Running database migrations...
	@cd packages/shared/drizzle && npm run drizzle:migrate

db-seed:
	@echo $(HR)
	@echo Seeding the database...
	@cd packages/shared/drizzle && npm run drizzle:seed

db-studio:
	@echo $(HR)
	@echo Opening Drizzle Studio...
	@cd packages/shared/drizzle && npm run drizzle:studio

db-generate:
	@echo $(HR)
	@echo Generating SQL migration from schema changes...
	@cd packages/shared/drizzle && npm run drizzle:generate

	@:

.PHONY: setup init hosts-config generate-certs up upd down restart prod prod-up prod-down prod-build dev build clean help add-frontend-dep add-frontend-dev add-backend-dep add-backend-dev db-migrate db-seed db-studio db-generate shadcn-add
.DEFAULT:
