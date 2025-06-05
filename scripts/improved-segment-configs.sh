#!/bin/bash
# Improved script for setting up segment config files for admin routes

# Base directory for admin pages
ADMIN_DIR="d:/Projects/edubridge/src/app/admin"
API_DIR="d:/Projects/edubridge/src/app/api"

# Create the standard config content
CONFIG_CONTENT='// This configures the route segment to be dynamically rendered
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0; // no caching'

# Function to create config file in a directory
create_config_file() {
  local dir="$1"
  
  # Skip certain directories
  if [[ "$dir" == *"node_modules"* ]]; then
    return
  fi
  
  # Create config.js in the directory if it doesn't exist
  if [ ! -f "$dir/config.js" ]; then
    echo "$CONFIG_CONTENT" > "$dir/config.js"
    echo "Created config.js in $dir"
  else
    echo "Config already exists in $dir"
  fi
}

# Function to add import to page.tsx files
add_import_to_page() {
  local page_file="$1"
  
  # Skip if the file doesn't exist
  if [ ! -f "$page_file" ]; then
    return
  fi
  
  # Check if the file already imports config
  if grep -q "import.*from.*['\"].*config['\"]" "$page_file"; then
    echo "Config already imported in $page_file"
    return
  fi
  
  # Add the import right after 'use client' or at the top of the file
  if grep -q "'use client'" "$page_file"; then
    # Safer sed command avoiding special character issues
    sed -i "/'use client'/a\\
// Import dynamic config to optimize build\\
import './config';" "$page_file"
    echo "Added config import to $page_file"
  else
    # Add at the top of the file if no 'use client' directive
    sed -i "1i// Import dynamic config to optimize build\\
import './config';" "$page_file"
    echo "Added config import to $page_file"
  fi
}

echo "======= Setting up segment configs for admin routes ======="

# Process admin directories recursively
echo "Creating config files in admin directories..."
find "$ADMIN_DIR" -type d | while read -r dir; do
  # Skip catch-all routes
  if [[ "$dir" == *"[...all]"* ]] || [[ "$dir" == *"[...path]"* ]]; then
    echo "Skipping catch-all route: $dir"
    continue
  fi
  
  create_config_file "$dir"
done

# Process admin page files
echo "Adding imports to admin page files..."
find "$ADMIN_DIR" -name "page.tsx" | while read -r page_file; do
  add_import_to_page "$page_file"
done

# Make sure API has config
echo "Setting up API config..."
create_config_file "$API_DIR"

# Process API route handlers
echo "Adding imports to API route handlers..."
find "$API_DIR" -name "route.ts" | while read -r route_file; do
  dir_name=$(dirname "$route_file")
  
  # Create config in the API route directory
  create_config_file "$dir_name"
done

echo "======= Done setting up segment configs ======="
echo "Run 'npm run build' to verify optimization"
