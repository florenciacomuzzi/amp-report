#!/bin/bash

# Docker setup script for AMP Report

set -e

echo "🚀 AMP Report Docker Setup"
echo "========================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Docker installation
if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx/ssl
mkdir -p logs

# Check for environment files
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual configuration"
fi

if [ ! -f .env.docker ]; then
    echo "📝 .env.docker file already exists"
fi

# Function to start services
start_local() {
    echo "🏃 Starting local development environment..."
    docker-compose up -d
    echo "✅ Local environment started"
    echo "📍 Application: http://localhost:3000"
    echo "📍 PostgreSQL: localhost:5432"
}



start_production() {
    echo "🚀 Starting production environment..."
    docker-compose -f docker-compose.prod.yml up -d
    echo "✅ Production environment started"
    echo "📍 Application: http://localhost (nginx)"
    echo "📍 Direct app: http://localhost:3000"
}

stop_all() {
    echo "🛑 Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down
    echo "✅ All services stopped"
}

logs() {
    docker-compose logs -f "$@"
}

# Main menu
case "$1" in
    "local")
        start_local
        ;;
    "production")
        start_production
        ;;
    "stop")
        stop_all
        ;;
    "logs")
        shift
        logs "$@"
        ;;
    "build")
        echo "🔨 Building Docker images..."
        docker-compose build
        echo "✅ Build complete"
        ;;
    "seed")
        echo "🌱 Seeding database..."
        docker-compose exec app npm run db:seed
        echo "✅ Database seeded"
        ;;
    "shell")
        echo "🐚 Opening shell in app container..."
        docker-compose exec app sh
        ;;
    "psql")
        echo "🐘 Opening PostgreSQL shell..."
        docker-compose exec postgres psql -U postgres amp_report
        ;;
    *)
        echo "Usage: $0 {local|production|stop|logs|build|seed|shell|psql}"
        echo ""
        echo "Commands:"
        echo "  local       - Start local development environment"
        echo "  production  - Start production-like environment"
        echo "  stop        - Stop all services"
        echo "  logs        - View logs (optionally specify service)"
        echo "  build       - Build Docker images"
        echo "  seed        - Seed the database"
        echo "  shell       - Open shell in app container"
        echo "  psql        - Open PostgreSQL shell"
        echo ""
        echo "Examples:"
        echo "  $0 local                 # Start local dev"
        echo "  $0 logs app             # View app logs"
        exit 1
        ;;
esac