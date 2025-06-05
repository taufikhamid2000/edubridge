#!/bin/bash
# This script adds imports of the admin config file to all admin pages
# to make them dynamic and exclude them from static builds

# Base directory for admin pages
ADMIN_DIR="d:/Projects/edubridge/src/app/admin"

# Find all page.tsx files under the admin directory
find "$ADMIN_DIR" -name "page.tsx" | while read -r page_file; do
  # Check if the file already imports the config
  if ! grep -q "import.*from.*config" "$page_file"; then
    # Add the import at the top of the file, after any 'use client' directive
    if grep -q "'use client'" "$page_file"; then
      # If 'use client' exists, insert after it
      sed -i "1,/'use client'/s/'use client'/'use client'\n\n\/\/ Import dynamic config to optimize build\nimport '..\/config';/" "$page_file"
    else
      # If 'use client' doesn't exist, insert at the top
      sed -i "1i\\/\/ Import dynamic config to optimize build\nimport '..\/config';" "$page_file"
    fi
    echo "Added config import to $page_file"
  else
    echo "Config already imported in $page_file"
  fi
done

echo "Done adding dynamic config to admin pages!"
