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
	docker-compose -f docker-compose.dev.yml up

upd: generate-certs
	@echo $(HR)
	@echo Starting development Docker containers in background...
	docker-compose -f docker-compose.dev.yml up -d

build: generate-certs
	@echo $(HR)
	@echo Building and starting development Docker containers...
	docker-compose -f docker-compose.dev.yml up --build

buildd: generate-certs
	@echo $(HR)
	@echo Building and starting development Docker containers in background...
	docker-compose -f docker-compose.dev.yml up -d --build

down:
	@echo $(HR)
	@echo Stopping development Docker containers...
	docker-compose -f docker-compose.dev.yml down

restart:
	@echo $(HR)
	@echo Restarting development Docker containers...
	docker-compose -f docker-compose.dev.yml restart

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
	@echo "make db-simulate                       - Run real-time queue activity simulation"
	@echo "make db-simulate SERVICE=uuid          - Simulate only that service"
	@echo "make db-simulate BUSINESS=uuid         - Simulate only that business"
	@echo "make db-simulate USERS=50              - Number of simulated users (default: 20)"
	@echo "make db-simulate JOIN_RATE=40          - % of active users that join per tick (default: 30)"
	@echo "make db-simulate LEAVE_RATE=10         - % of active users that leave per tick (default: 15)"
	@echo "make db-simulate WORKER_RATE=80        - % of workers that call next per tick (default: 50)"
	@echo "make db-simulate SERVE_DELAY=3000      - ms before marking entry as served (default: 2000)"
	@echo "make db-simulate INTERVAL=1000         - tick interval in ms (default: 2000)"
	@echo "make db-clear       - Wipe all data (keeps schema/migrations)"
	@echo "make db-migrate     - Apply pending migrations to the database"
	@echo "make db-seed        - Seed the database with sample data"
	@echo "make db-studio      - Open Drizzle Studio"
	@echo ""
	@echo "--- Capacitor / Mobile ---"
	@echo "make cap-dev        - Sync Capacitor pointing to dev server"
	@echo "make cap-prod       - Sync Capacitor pointing to production server"
	@echo "make cap-apk        - Build debug Android APK"
	@echo "make cap-apk-release - Build release Android APK"
	@echo "make cap-android    - Open Android Studio"
	@echo "make cap-ios        - Open Xcode (macOS only)"
	@echo ""
	@echo "--- E2E Tests ---"
	@echo "make e2e-install    - Install Playwright + browsers (run once)"
	@echo "make e2e            - Run all E2E tests (desktop + mobile)"
	@echo "make e2e-desktop    - Run desktop tests only"
	@echo "make e2e-mobile     - Run mobile (phone browser) tests only"
	@echo "make e2e-headed     - Run tests with visible browser window"
	@echo "make e2e-ui         - Open interactive Playwright UI (watch & debug)"
	@echo "make e2e-report     - Open HTML report from last test run"
	@echo "make e2e-auth       - Run auth tests only"
	@echo "make e2e-queue      - Run queue tests only"
	@echo "make e2e-security   - Run security/rate-limit tests only"
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

# --- Capacitor / Mobile Commands ---
cap-dev:
	@echo $(HR)
	@echo Syncing Capacitor with dev server...
	@cd apps/frontend && NEXT_PUBLIC_BACKEND_URL=http://10.0.2.2:4000 npx cap sync

cap-prod:
	@echo $(HR)
	@echo Syncing Capacitor with production server...
	@cd apps/frontend && npx cap sync

cap-apk:
	@echo $(HR)
	@echo Building Android APK...
	@cd apps/frontend && npx cap sync android
	@cd apps/frontend/android && ./gradlew assembleDebug
	@echo APK generated at: apps/frontend/android/app/build/outputs/apk/debug/app-debug.apk

cap-apk-release:
	@echo $(HR)
	@echo Building Android release APK...
	@cd apps/frontend && npx cap sync android
	@cd apps/frontend/android && ./gradlew assembleRelease
	@echo APK generated at: apps/frontend/android/app/build/outputs/apk/release/

cap-android:
	@echo $(HR)
	@echo Opening Android Studio...
	@cd apps/frontend && npx cap open android

cap-ios:
	@echo $(HR)
	@echo Opening Xcode...
	@cd apps/frontend && npx cap open ios

# --- E2E Tests ---
e2e-install:
	@echo $(HR)
	@echo Installing Playwright browsers...
	@cd e2e && npm install && npx playwright install chromium
	@echo Playwright browsers installed!

e2e:
	@echo $(HR)
	@echo Running E2E tests (desktop + mobile)...
	@cd e2e && npx playwright test
	@echo Done! Run 'make e2e-report' to view results.

e2e-desktop:
	@echo $(HR)
	@echo Running E2E tests (desktop only)...
	@cd e2e && npx playwright test --project=desktop

e2e-mobile:
	@echo $(HR)
	@echo Running E2E tests (mobile only)...
	@cd e2e && npx playwright test --project=mobile

e2e-headed:
	@echo $(HR)
	@echo Running E2E tests with visible browser...
	@cd e2e && npx playwright test --headed --project=desktop

e2e-ui:
	@echo $(HR)
	@echo Opening Playwright interactive UI...
	@cd e2e && npx playwright test --ui

e2e-report:
	@echo $(HR)
	@echo Opening last test report...
	@cd e2e && npx playwright show-report

e2e-auth:
	@echo $(HR)
	@echo Running auth tests only...
	@cd e2e && npx playwright test tests/auth/

e2e-queue:
	@echo $(HR)
	@echo Running queue tests only...
	@cd e2e && npx playwright test tests/queue/

e2e-security:
	@echo $(HR)
	@echo Running security/rate-limit tests only...
	@cd e2e && npx playwright test tests/security/

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

db-simulate:
	@echo $(HR)
	@echo Starting queue simulation...
	@cd packages/shared/drizzle && npm run drizzle:simulate -- \
		$(if $(SERVICE),--service $(SERVICE)) \
		$(if $(BUSINESS),--business $(BUSINESS)) \
		$(if $(USERS),--users $(USERS)) \
		$(if $(JOIN_RATE),--join-rate $(JOIN_RATE)) \
		$(if $(LEAVE_RATE),--leave-rate $(LEAVE_RATE)) \
		$(if $(WORKER_RATE),--worker-rate $(WORKER_RATE)) \
		$(if $(SERVE_DELAY),--serve-delay $(SERVE_DELAY)) \
		$(if $(INTERVAL),--interval $(INTERVAL))

db-clear:
	@echo $(HR)
	@echo Clearing all data from the database...
	@docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d war9a -c "\
		TRUNCATE TABLE service_feedback, queue_events, queue_entries, worker_sessions, \
		appointments, guichets, queue_services, business_workers, business_categories, \
		business_hours, business_logs, business_branches, businesses, categories, \
		verifications, sessions, accounts, users RESTART IDENTITY CASCADE;"
	@echo Done! Run 'make db-seed' to repopulate.

	@:

.PHONY: setup init hosts-config generate-certs up upd down restart prod prod-up prod-down prod-build dev build clean help add-frontend-dep add-frontend-dev add-backend-dep add-backend-dev db-migrate db-seed db-studio db-generate db-simulate db-clear shadcn-add cap-dev cap-prod cap-apk cap-apk-release cap-android cap-ios e2e-install e2e e2e-desktop e2e-mobile e2e-headed e2e-ui e2e-report e2e-auth e2e-queue e2e-security
.DEFAULT:
