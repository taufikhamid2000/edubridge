#!/bin/bash

# Script to invert dark/light mode classes in React components
# This will swap light and dark theme classes throughout the codebase

echo "🔄 Starting dark/light mode inversion..."

# Create backup directory
echo "📁 Creating backup..."
cp -r src src_backup_$(date +%Y%m%d_%H%M%S)

# Function to swap classes in a file
swap_classes_in_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create temporary file
    local temp_file=$(mktemp)
    
    # Common color swaps - we'll do this in multiple passes to avoid conflicts
    # First, replace with temporary placeholders to avoid double-swapping
    
    # Background colors
    sed 's/bg-white dark:bg-gray-800/TEMP_BG_SWAP_1/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/bg-white dark:bg-gray-900/TEMP_BG_SWAP_2/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/bg-gray-50 dark:bg-gray-900/TEMP_BG_SWAP_3/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/bg-gray-100 dark:bg-gray-800/TEMP_BG_SWAP_4/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/bg-gray-200 dark:bg-gray-700/TEMP_BG_SWAP_5/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Text colors
    sed 's/text-gray-900 dark:text-white/TEMP_TEXT_SWAP_1/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/text-gray-800 dark:text-gray-200/TEMP_TEXT_SWAP_2/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/text-gray-700 dark:text-gray-300/TEMP_TEXT_SWAP_3/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/text-gray-600 dark:text-gray-400/TEMP_TEXT_SWAP_4/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/text-gray-500 dark:text-gray-400/TEMP_TEXT_SWAP_5/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Border colors
    sed 's/border-gray-200 dark:border-gray-700/TEMP_BORDER_SWAP_1/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/border-gray-300 dark:border-gray-600/TEMP_BORDER_SWAP_2/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Divide colors
    sed 's/divide-gray-200 dark:divide-gray-700/TEMP_DIVIDE_SWAP_1/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Hover states
    sed 's/hover:bg-gray-50 dark:hover:bg-gray-800/TEMP_HOVER_SWAP_1/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/hover:bg-gray-100 dark:hover:bg-gray-700/TEMP_HOVER_SWAP_2/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Placeholder colors
    sed 's/placeholder-gray-500 dark:placeholder-gray-400/TEMP_PLACEHOLDER_SWAP_1/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Focus ring colors
    sed 's/focus:ring-blue-500 dark:focus:ring-blue-400/TEMP_FOCUS_SWAP_1/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Now replace the temporary placeholders with swapped values
    
    # Background swaps
    sed 's/TEMP_BG_SWAP_1/bg-gray-800 dark:bg-white/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/TEMP_BG_SWAP_2/bg-gray-900 dark:bg-white/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/TEMP_BG_SWAP_3/bg-gray-900 dark:bg-gray-50/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/TEMP_BG_SWAP_4/bg-gray-800 dark:bg-gray-100/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/TEMP_BG_SWAP_5/bg-gray-700 dark:bg-gray-200/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Text swaps
    sed 's/TEMP_TEXT_SWAP_1/text-white dark:text-gray-900/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/TEMP_TEXT_SWAP_2/text-gray-200 dark:text-gray-800/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/TEMP_TEXT_SWAP_3/text-gray-300 dark:text-gray-700/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/TEMP_TEXT_SWAP_4/text-gray-400 dark:text-gray-600/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/TEMP_TEXT_SWAP_5/text-gray-400 dark:text-gray-500/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Border swaps
    sed 's/TEMP_BORDER_SWAP_1/border-gray-700 dark:border-gray-200/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/TEMP_BORDER_SWAP_2/border-gray-600 dark:border-gray-300/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Divide swaps
    sed 's/TEMP_DIVIDE_SWAP_1/divide-gray-700 dark:divide-gray-200/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Hover swaps
    sed 's/TEMP_HOVER_SWAP_1/hover:bg-gray-800 dark:hover:bg-gray-50/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    sed 's/TEMP_HOVER_SWAP_2/hover:bg-gray-700 dark:hover:bg-gray-100/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Placeholder swaps
    sed 's/TEMP_PLACEHOLDER_SWAP_1/placeholder-gray-400 dark:placeholder-gray-500/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Focus swaps
    sed 's/TEMP_FOCUS_SWAP_1/focus:ring-blue-400 dark:focus:ring-blue-500/g' "$file" > "$temp_file" && mv "$temp_file" "$file"
    
    # Clean up temp file if it exists
    [[ -f "$temp_file" ]] && rm "$temp_file"
}

# Find all TypeScript/React files and process them
echo "🔍 Finding files to process..."
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
    # Skip test files and node_modules
    if [[ "$file" != *"test"* && "$file" != *"spec"* && "$file" != *"node_modules"* ]]; then
        swap_classes_in_file "$file"
    fi
done

echo "✅ Class swapping complete!"
echo "📋 Summary:"
echo "   - Swapped light/dark background colors"
echo "   - Swapped light/dark text colors"
echo "   - Swapped light/dark border colors"
echo "   - Swapped light/dark hover states"
echo "   - Backup created: src_backup_$(date +%Y%m%d_%H%M%S)"
echo ""
echo "🔧 Next steps:"
echo "   1. Update theme defaults in core files"
echo "   2. Test the application"
echo "   3. Fix any remaining issues manually"
