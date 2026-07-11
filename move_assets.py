import shutil
import os

source_dir = r"C:\Users\Srijan\.gemini\antigravity-ide\brain\a0687dba-a012-41e5-9f7a-e9e83edd598f"
target_dir = r"e:\Projects\SplitWise\frontend\public"

images = {
    "travel_cover_1783744078389.png": "travel_cover.png",
    "food_cover_1783744090353.png": "food_cover.png",
    "home_cover_1783744100521.png": "home_cover.png",
    "avatar_1_1783744109779.png": "avatar_1.png",
    "avatar_2_1783744118490.png": "avatar_2.png",
    "avatar_3_1783744134821.png": "avatar_3.png",
    "avatar_4_1783744143808.png": "avatar_4.png",
}

print("Moving image assets to frontend/public...")
for src, dst in images.items():
    src_path = os.path.join(source_dir, src)
    dst_path = os.path.join(target_dir, dst)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dst_path)
        print(f"✅ Copied {dst}")
    else:
        print(f"❌ Source not found: {src_path}")
