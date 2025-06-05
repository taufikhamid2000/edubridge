#!/bin/bash
# This script creates segment config files for all admin routes
# and adds imports to the page files

# Base directory for admin pages
ADMIN_DIR="d:/Projects/edubridge/src/app/admin"

# Create the standard config content
CONFIG_CONTENT='// This configures the route segment to be dynamically rendered
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0; // no caching'

# 1. First, create config.js in each admin subdirectory
echo "Creating config files in admin subdirectories..."
find "$ADMIN_DIR" -mindepth 1 -type d | while read -r dir; do
  # Skip the [...all] catch-all route since it already has config
  if [[ "$dir" == *"[...all]"* ]] || [[ "$dir" == *"[...path]"* ]]; then
    echo "Skipping catch-all route: $dir"
    continue
  fi
  
  # Skip node_modules if it somehow gets included
  if [[ "$dir" == *"node_modules"* ]]; then
    echo "Skipping node_modules directory"
    continue
  fi

  # Create config.js in each directory if it doesn't exist
  if [ ! -f "$dir/config.js" ]; then
    echo "$CONFIG_CONTENT" > "$dir/config.js"
    echo "Created config.js in $dir"
  else
    echo "Config already exists in $dir"
  fi
done

# 2. Now, add imports to all page.tsx files that use 'use client'
echo "Adding imports to page.tsx files..."
find "$ADMIN_DIR" -name "page.tsx" | while read -r page_file; do
  dir_name=$(dirname "$page_file")
  relative_path="${dir_name#$ADMIN_DIR/}"
  
  # Always use the config file in the current directory
  import_path="./config"
  
  # Check if the file already imports config
  if ! grep -q "import.*from.*config" "$page_file"; then
    # Add the import at the top of the file, after any 'use client' directive
    if grep -q "'use client'" "$page_file"; then
      # If 'use client' exists, insert after it
      sed -i "1,/'use client'/s/'use client'/'use client'\n\n\/\/ Import dynamic config to optimize build\nimport '$import_path';/" "$page_file"
      echo "Added config import to $page_file"
    else
      # If the file doesn't have 'use client', add at the top
      sed -i "1i\\/\/ Import dynamic config to optimize build\nimport '$import_path';" "$page_file"
      echo "Added config import to $page_file"
    fi
  else
    echo "Config already imported in $page_file"
  fi
done

# 3. Also make sure the API directory has a config file
API_DIR="d:/Projects/edubridge/src/app/api"
if [ ! -f "$API_DIR/config.js" ]; then
  echo "$CONFIG_CONTENT" > "$API_DIR/config.js"
  echo "Created config.js in $API_DIR"
else
  echo "Config already exists in $API_DIR"
fi

echo "Done setting up segment configs for all admin and API routes!"
