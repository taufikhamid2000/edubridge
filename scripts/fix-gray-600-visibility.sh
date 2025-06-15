#!/bin/bash

# Safe script to fix text-gray-600 dark:text-gray-300 visibility issues
# This script only targets the specific pattern: text-gray-600 dark:text-gray-300
# and inverts it to: text-gray-300 dark:text-gray-600

echo "🔧 Fixing text-gray-600 visibility issues..."
echo "Target pattern: text-gray-600 dark:text-gray-300"
echo "Will change to: text-gray-300 dark:text-gray-600"
echo

# Find all TypeScript/TSX files in src directory
find src -name "*.tsx" -o -name "*.ts" | while read -r file; do
    # Check if the file contains our target pattern
    if grep -q "text-gray-600 dark:text-gray-300" "$file"; then
        echo "📝 Processing: $file"
        
        # Create backup of the file
        cp "$file" "$file.bak"
        
        # Apply the specific fix
        sed -i 's/text-gray-600 dark:text-gray-300/text-gray-300 dark:text-gray-600/g' "$file"
        
        # Verify the change was made
        if grep -q "text-gray-300 dark:text-gray-600" "$file"; then
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
echo "🎉 Text-gray-600 visibility fixes complete!"
echo "All instances of 'text-gray-600 dark:text-gray-300' have been inverted."
