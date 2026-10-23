#!/bin/bash

cd /workspaces/japoolsllc/arizonaweb/japoolsllc/public/assets

# Function to get size in bytes
get_size() {
    stat -c%s "$1" 2>/dev/null || echo "0"
}

# Function to format bytes
format_size() {
    numfmt --to=iec-i --suffix=B $1 2>/dev/null || printf "%sB" $1
}

echo "========== IMAGE OPTIMIZATION REPORT ==========="
echo ""

total_before=0
total_after=0

# Process JPG files
echo ">>> JPG OPTIMIZATION <<<"
for jpg in after_pool.jpg before_after.jpg before_pool.jpg cloud_reflection_pool.jpg ja_logo.jpg japoolsllc_pool_cleaning_service_phoenix_arizona.jpg japoolsllc_pool_cleaning_service_phoenix_arizona_02.jpg japoolsllc_pool_cleaning_service_phoenix_arizona_03.jpg japoolsllc_pool_cleaning_service_phoenix_arizona_04.jpg service_overview_board.jpg yelp_reviews.jpg; do
    if [ -f "$jpg" ]; then
        before=$(get_size "$jpg")
        total_before=$((total_before + before))
        
        # Optimize: strip EXIF, disable interlace, quality 82
        convert "$jpg" -strip -interlace None -quality 82 "$jpg.tmp"
        mv "$jpg.tmp" "$jpg"
        
        after=$(get_size "$jpg")
        total_after=$((total_after + after))
        
        saving=$(( (before - after) * 100 / before ))
        printf "%-50s %8s → %8s (%3d%% saved)\n" "$jpg" "$(format_size $before)" "$(format_size $after)" "$saving"
    fi
done

echo ""
echo ">>> PNG OPTIMIZATION & WEBP CONVERSION <<<"

for png in Japools.png Japools-transparent.png japoolsllc_pool_cleaning_service_phoenix_arizona_05.png; do
    if [ -f "$png" ]; then
        before=$(get_size "$png")
        total_before=$((total_before + before))
        
        # Optimize PNG (lossless)
        convert "$png" -strip -define png:compression-level=9 "$png.tmp"
        mv "$png.tmp" "$png"
        
        after=$(get_size "$png")
        total_after=$((total_after + after))
        
        saving=$(( (before - after) * 100 / before ))
        printf "%-50s %8s → %8s (%3d%% saved)\n" "$png (optimized)" "$(format_size $before)" "$(format_size $after)" "$saving"
        
        # Convert to WebP
        cwebp -q 80 -m 6 "$png" -o "${png%.png}.webp" 2>&1 | grep -v "^Reading" || true
        webp_size=$(get_size "${png%.png}.webp")
        webp_saving=$(( (before - webp_size) * 100 / before ))
        printf "%-50s %8s   WebP: %8s (%3d%% vs orig)\n" "${png%.png}.webp" "" "$(format_size $webp_size)" "$webp_saving"
    fi
done

echo ""
echo ">>> RESIZING LARGE GALLERY IMAGES <<<"

for jpg in japoolsllc_pool_cleaning_service_phoenix_arizona.jpg japoolsllc_pool_cleaning_service_phoenix_arizona_02.jpg japoolsllc_pool_cleaning_service_phoenix_arizona_03.jpg japoolsllc_pool_cleaning_service_phoenix_arizona_04.jpg; do
    if [ -f "$jpg" ]; then
        width=$(identify -format "%w" "$jpg")
        if [ "$width" -gt 1400 ]; then
            before=$(get_size "$jpg")
            total_before=$((total_before + before))
            
            convert "$jpg" -resize "1400x>" -strip -interlace None -quality 82 "$jpg.tmp"
            mv "$jpg.tmp" "$jpg"
            
            after=$(get_size "$jpg")
            total_after=$((total_after + after))
            
            new_width=$(identify -format "%w" "$jpg")
            saving=$(( (before - after) * 100 / before ))
            printf "%-50s %8s → %8s (%3d%% saved, resized %d→%dpx)\n" "$jpg (resized)" "$(format_size $before)" "$(format_size $after)" "$saving" "$width" "$new_width"
        fi
    fi
done

echo ""
echo "============================================"
echo "TOTAL: $(format_size $total_before) → $(format_size $total_after) ($(( (total_before - total_after) * 100 / total_before ))% saved)"
echo ""
echo "Final sizes:"
ls -lh *.jpg *.png *.webp 2>/dev/null | awk '{printf "  %-50s %10s\n", $9, $5}'

