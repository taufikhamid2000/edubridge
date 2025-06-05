#!/bin/bash
# This script creates segment config files for all admin routes
# to make them dynamically rendered and excluded from static builds

# Base directory for admin pages
ADMIN_DIR="d:/Projects/edubridge/src/app/admin"

# Create the standard config content
CONFIG_CONTENT='// This configures the route segment to be dynamically rendered
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0; // no caching'

# Find all directories under admin
find "$ADMIN_DIR" -mindepth 1 -type d | while read -r dir; do
  # Skip the [...all] catch-all route since it already has config
  if [[ "$dir" == *"[...all]"* ]] || [[ "$dir" == *"[...path]"* ]]; then
    echo "Skipping catch-all route: $dir"
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

echo "Created segment configs for all admin routes!"
