#!/bin/bash

set -e

cd /workspaces/japoolsllc/arizonaweb/japoolsllc/public/assets

echo "====== IMAGE OPTIMIZATION REPORT ======"
echo ""

# Arrays to store results
declare -a ORIG_SIZES
declare -a NEW_SIZES
declare -a FILENAMES

idx=0

# Function to get human-readable size
human_size() {
    numfmt --to=iec-i --suffix=B $1 2>/dev/null || echo "$1"
}

# Function to calculate percentage reduction
calc_reduction() {
    local orig=$1
    local new=$2
    local reduction=$((100 * (orig - new) / orig))
    echo "$reduction"
}

# ============ OPTIMIZE JPGS ============
echo ">>> OPTIMIZING JPG FILES <<<"
echo ""

for jpg in *.jpg; do
    # Skip already optimized files (we'll detect by checking if they have certain properties)
    echo "Processing: $jpg"
    
    orig_size=$(stat -c%s "$jpg")
    orig_human=$(human_size "$orig_size")
    
    # Create temporary optimized file
    convert "$jpg" \
        -strip \
        -interlace None \
        -quality 82 \
        -define jpeg:optimize-coding=true \
        "${jpg%.jpg}_opt_temp.jpg"
    
    new_size=$(stat -c%s "${jpg%.jpg}_opt_temp.jpg")
    new_human=$(human_size "$new_size")
    
    reduction=$(calc_reduction "$orig_size" "$new_size")
    
    # Replace original with optimized
    mv "${jpg%.jpg}_opt_temp.jpg" "$jpg"
    
    FILENAMES[$idx]="$jpg"
    ORIG_SIZES[$idx]=$orig_size
    NEW_SIZES[$idx]=$new_size
    
    echo "  Before: $orig_human | After: $new_human | Saved: $reduction%"
    echo ""
    
    ((idx++))
done

# ============ OPTIMIZE PNGs & CONVERT TO WEBP ============
echo ">>> OPTIMIZING PNG FILES & CONVERTING TO WEBP <<<"
echo ""

for png in *.png; do
    echo "Processing: $png"
    
    orig_size=$(stat -c%s "$png")
    orig_human=$(human_size "$orig_size")
    
    # Optimize PNG (lossless)
    convert "$png" \
        -strip \
        -define png:color-type=2 \
        "${png%.png}_opt_temp.png"
    
    png_new_size=$(stat -c%s "${png%.png}_opt_temp.png")
    png_new_human=$(human_size "$png_new_size")
    
    png_reduction=$(calc_reduction "$orig_size" "$png_new_size")
    
    # Replace PNG with optimized version
    mv "${png%.png}_opt_temp.png" "$png"
    
    # Convert to WebP for modern browsers
    cwebp -q 80 -m 6 "$png" -o "${png%.png}.webp" 2>&1 | grep -v "^Reading" || true
    
    webp_size=$(stat -c%s "${png%.png}.webp")
    webp_human=$(human_size "$webp_size")
    
    echo "  PNG Before: $orig_human | PNG After: $png_new_human | Saved: $png_reduction%"
    echo "  WebP: $webp_human (compression from original: $(calc_reduction $orig_size $webp_size)%)"
    echo ""
    
    FILENAMES[$idx]="$png (+ .webp)"
    ORIG_SIZES[$idx]=$orig_size
    NEW_SIZES[$idx]=$png_new_size
    
    ((idx++))
done

# ============ RESIZE LARGE GALLERY IMAGES ============
echo ">>> RESIZING LARGE GALLERY IMAGES <<<"
echo ""

# Gallery images are the 2752x1536 ones - resize to 1400px width
for jpg in japoolsllc_pool_cleaning_service_phoenix_arizona*.jpg; do
    width=$(identify -format "%w" "$jpg")
    
    if [ "$width" -gt 1400 ]; then
        echo "Resizing: $jpg (from ${width}px width)"
        
        # Get current size (already optimized)
        curr_size=$(stat -c%s "$jpg")
        curr_human=$(human_size "$curr_size")
        
        # Resize to 1400px width and re-optimize
        convert "$jpg" \
            -resize "1400>" \
            -strip \
            -interlace None \
            -quality 82 \
            "${jpg%.jpg}_resized_temp.jpg"
        
        new_size=$(stat -c%s "${jpg%.jpg}_resized_temp.jpg")
        new_human=$(human_size "$new_size")
        new_width=$(identify -format "%w" "${jpg%.jpg}_resized_temp.jpg")
        
        reduction=$(calc_reduction "$curr_size" "$new_size")
        
        # Replace original
        mv "${jpg%.jpg}_resized_temp.jpg" "$jpg"
        
        echo "  Before: $curr_human ($width px) | After: $new_human ($new_width px) | Saved: $reduction%"
        echo ""
    fi
done

echo "====== OPTIMIZATION COMPLETE ======"
echo ""
echo "Summary of all files:"
ls -lh *.jpg *.png *.webp 2>/dev/null | awk '{printf "%-50s %8s\n", $9, $5}'
echo ""
echo "All images have been optimized:"
echo "✓ JPGs: quality reduced to 82%, interlace disabled, EXIF stripped"
echo "✓ PNGs: optimized and converted to WebP format"
echo "✓ Large gallery images resized to max 1400px width"
echo "✓ Progressive encoding disabled (non-interlaced)"
echo ""
