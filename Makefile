# AMP Report – Makefile

# Variables
SLIDE=slides/mvp.md
EXPORT_DIR=docs/presentation
REVEAL_PORT=1948

.PHONY: install client-install db-seed slides slides-export docker-up docker-down docker-logs generate-types

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
