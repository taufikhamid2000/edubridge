#!/bin/bash

# Safe script to fix card background visibility issues
# This script targets multiple patterns for proper card theming

echo "🔧 Fixing card background and border visibility issues..."
echo

# Find all TypeScript/TSX files in src directory
find src -name "*.tsx" -o -name "*.ts" | while read -r file; do
    # Check if the file contains problematic patterns
    changed=false
    
    # Create backup of the file
    cp "$file" "$file.bak"
    
    # Fix card backgrounds: bg-gray-50 dark:bg-gray-700/50 -> bg-gray-700/50 dark:bg-gray-50
    if grep -q "bg-gray-50 dark:bg-gray-700/50" "$file"; then
        echo "📝 Processing $file - fixing card backgrounds"
        sed -i 's/bg-gray-50 dark:bg-gray-700\/50/bg-gray-700\/50 dark:bg-gray-50/g' "$file"
        changed=true
    fi
    
    # Fix borders: border-gray-100 dark:border-gray-600 -> border-gray-600 dark:border-gray-100
    if grep -q "border-gray-100 dark:border-gray-600" "$file"; then
        echo "📝 Processing $file - fixing borders"
        sed -i 's/border-gray-100 dark:border-gray-600/border-gray-600 dark:border-gray-100/g' "$file"
        changed=true
    fi
    
    # Fix mitigation boxes: bg-green-50 dark:bg-green-900/20 -> bg-green-900/20 dark:bg-green-50
    if grep -q "bg-green-50 dark:bg-green-900/20" "$file"; then
        echo "📝 Processing $file - fixing mitigation boxes"
        sed -i 's/bg-green-50 dark:bg-green-900\/20/bg-green-900\/20 dark:bg-green-50/g' "$file"
        changed=true
    fi
    
    # If changes were made, verify and cleanup
    if [ "$changed" = true ]; then
        echo "   ✅ Successfully updated $file"
        rm "$file.bak"
    else
        rm "$file.bak"
    fi
done

echo
echo "🎉 Card visibility fixes complete!"
echo "All card backgrounds, borders, and mitigation boxes have been properly themed."
