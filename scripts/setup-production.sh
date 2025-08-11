#!/bin/bash

# Alteryx Swag Portal - Production Setup Script
# This script helps set up the production environment

set -e

echo "🚀 Alteryx Swag Portal - Production Setup"
echo "=========================================="

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v gcloud &> /dev/null; then
        echo "❌ Google Cloud CLI (gcloud) is not installed"
        echo "   Install from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git is not installed"
        exit 1
    fi
    
    echo "✅ All requirements met"
}

# Setup Google Cloud project
setup_gcp() {
    echo "☁️ Setting up Google Cloud..."
    
    read -p "Enter your Google Cloud Project ID: " PROJECT_ID
    
    # Set the project
    gcloud config set project $PROJECT_ID
    
    # Enable required APIs
    echo "Enabling required APIs..."
    gcloud services enable run.googleapis.com
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable places-backend.googleapis.com
    gcloud services enable geocoding-backend.googleapis.com
    gcloud services enable maps-backend.googleapis.com
    
    echo "✅ Google Cloud setup complete"
}

# Create service account
create_service_account() {
    echo "🔑 Creating service account..."
    
    read -p "Enter your Google Cloud Project ID: " PROJECT_ID
    
    # Create service account
    gcloud iam service-accounts create alteryx-swag-deployer \
        --display-name="Alteryx Swag Portal Deployer" \
        --description="Service account for Alteryx Swag Portal deployment"
    
    # Add required roles
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:alteryx-swag-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/run.admin"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:alteryx-swag-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/iam.serviceAccountUser"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:alteryx-swag-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/cloudbuild.builds.builder"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:alteryx-swag-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/storage.admin"
    
    # Create and download key
    gcloud iam service-accounts keys create gcp-service-account-key.json \
        --iam-account=alteryx-swag-deployer@$PROJECT_ID.iam.gserviceaccount.com
    
    echo "✅ Service account created and key downloaded to gcp-service-account-key.json"
    echo "⚠️  IMPORTANT: Add this key content to GitHub Secrets as GCP_SA_KEY"
}

# Setup GitHub repository
setup_github() {
    echo "🔗 Setting up GitHub repository..."
    
    read -p "Enter your GitHub username: " GITHUB_USERNAME
    read -p "Enter your repository name (default: alteryx-swag-portal): " REPO_NAME
    REPO_NAME=${REPO_NAME:-alteryx-swag-portal}
    
    # Initialize git if not already done
    if [ ! -d ".git" ]; then
        git init
        git add .
        git commit -m "Initial commit: Alteryx Swag Portal"
        git branch -M main
    fi
    
    # Add remote
    git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
    
    echo "✅ GitHub repository setup complete"
    echo "📝 Next steps:"
    echo "   1. Create the repository on GitHub: https://github.com/new"
    echo "   2. Push your code: git push -u origin main"
    echo "   3. Add GitHub Secrets (see DEPLOYMENT_GUIDE.md)"
}

# Main execution
main() {
    echo "Choose an option:"
    echo "1) Check requirements"
    echo "2) Setup Google Cloud project"
    echo "3) Create service account"
    echo "4) Setup GitHub repository"
    echo "5) Run all setup steps"
    echo "6) Exit"
    
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            check_requirements
            ;;
        2)
            setup_gcp
            ;;
        3)
            create_service_account
            ;;
        4)
            setup_github
            ;;
        5)
            check_requirements
            setup_gcp
            create_service_account
            setup_github
            echo "🎉 All setup steps completed!"
            echo "📖 Next: Follow the DEPLOYMENT_GUIDE.md for detailed instructions"
            ;;
        6)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
}

# Run main function
main
