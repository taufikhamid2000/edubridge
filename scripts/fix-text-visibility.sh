#!/bin/bash

# Safe script to fix specific text color visibility issues
# This script only targets the specific pattern: text-gray-800 dark:text-gray-100
# and inverts it to: text-gray-100 dark:text-gray-800

echo "🔧 Fixing text color visibility issues..."
echo "Target pattern: text-gray-800 dark:text-gray-100"
echo "Will change to: text-gray-100 dark:text-gray-800"
echo

# Find all TypeScript/TSX files in src directory
find src -name "*.tsx" -o -name "*.ts" | while read -r file; do
    # Check if the file contains our target pattern
    if grep -q "text-gray-800 dark:text-gray-100" "$file"; then
        echo "📝 Processing: $file"
        
        # Create backup of the file
        cp "$file" "$file.bak"
        
        # Apply the specific fix
        sed -i 's/text-gray-800 dark:text-gray-100/text-gray-100 dark:text-gray-800/g' "$file"
        
        # Verify the change was made
        if grep -q "text-gray-100 dark:text-gray-800" "$file"; then
            echo "   ✅ Successfully updated"
            # Remove backup if successful
            rm "$file.bak"
        else
            echo "   ❌ Failed to update, restoring backup"
            mv "$file.bak" "$file"
        fi
    fi
done

echo
echo "🎉 Text color visibility fixes complete!"
echo "All instances of 'text-gray-800 dark:text-gray-100' have been inverted."
