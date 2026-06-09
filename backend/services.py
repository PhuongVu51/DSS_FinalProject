import pandas as pd
import re
import os
import json
from database import get_db_connection

EXCEL_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data dss.xlsx")

def get_data_df():
    try:
        df = pd.read_excel(EXCEL_FILE, sheet_name="data")
        # Extract numeric values from 'Độ ngọt/Độ béo (1-5)'
        df['Muc_Do_Ngot'] = df['Độ ngọt/Độ béo (1-5)'].astype(str).str.extract(r'(\d+)').fillna(3).astype(int)
        return df
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return pd.DataFrame()

def get_recipe_df():
    try:
        return pd.read_excel(EXCEL_FILE, sheet_name="recipe")
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return pd.DataFrame()

def adjust_sugar_text(recipe_text, percentage_change):
    if pd.isna(recipe_text): return ""
    lines = str(recipe_text).split('\n')
    new_lines = []
    for line in lines:
        if 'đường' in line.lower():
            match = re.search(r'(\d+[\.,]?\d*)\s*(gram|g)', line, re.IGNORECASE)
            if match:
                try:
                    old_sugar = float(match.group(1).replace(',', '.'))
                    new_sugar = old_sugar * (1 + percentage_change / 100)
                    line = line.replace(match.group(1), f"{new_sugar:,.1f}")
                except: pass
        new_lines.append(line)
    return '\n'.join(new_lines)

def get_all_cakes():
    cakes = []
    
    # 1. Fetch from Excel
    df_recipe = get_recipe_df()
    if not df_recipe.empty and 'Product_name' in df_recipe.columns:
        cakes.extend(list(df_recipe['Product_name'].dropna().unique()))
        
    # 2. Fetch from MySQL
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM products")
            rows = cursor.fetchall()
            for row in rows:
                if row[0] not in cakes:
                    cakes.append(row[0])
        except Exception as e:
            print(f"Error fetching products from DB: {e}")
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            conn.close()
            
    if not cakes:
        cakes = ["Red Velvet"]
        
    return cakes

def get_recipe_text_from_db(cake_name: str):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT ingredients FROM products WHERE name = %s", (cake_name,))
            row = cursor.fetchone()
            if row and row[0]:
                ingredients_json = json.loads(row[0])
                lines = [f"{ing['mass']} gram {ing['name']}" for ing in ingredients_json]
                return "\n".join(lines)
        except Exception as e:
            print(f"Error fetching recipe from DB: {e}")
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            conn.close()
    return None

def optimize_recipe_for_regions(cake_name: str):
    df_data = get_data_df()
    df_recipe = get_recipe_df()
    
    default_recipe_text = "150 gram bột mì\n50 gram đường cát"
    
    db_recipe = get_recipe_text_from_db(cake_name)
    if db_recipe:
        default_recipe_text = db_recipe
    elif not df_recipe.empty:
        existing_recipe = df_recipe[(df_recipe['Product_name'] == cake_name) & (df_recipe['Adjustment_Note'].str.contains('3|Original', na=False, case=False))]
        if not existing_recipe.empty:
            default_recipe_text = existing_recipe['Recipe'].values[0]
            
    # Hanoi Logic
    df_hn = df_data[df_data['Vùng miền'] == "Hà Nội"] if not df_data.empty else pd.DataFrame()
    mode_hn = df_hn['Muc_Do_Ngot'].mode()[0] if not df_hn.empty else 3
    recipe_hn = adjust_sugar_text(default_recipe_text, -15) if mode_hn >= 4 else adjust_sugar_text(default_recipe_text, 0)
    msg_hn = "⚠️ Thị trường thích ăn nhạt: Giảm 15% đường" if mode_hn >= 4 else "Giữ nguyên"
    
    # Da Nang Logic
    recipe_dn = adjust_sugar_text(default_recipe_text, 0)
    msg_dn = "✅ Vị trí cân bằng: Giữ nguyên vị gốc"
    
    # TP.HCM Logic
    df_hcm = df_data[df_data['Vùng miền'] == "TP.HCM"] if not df_data.empty else pd.DataFrame()
    mode_hcm = df_hcm['Muc_Do_Ngot'].mode()[0] if not df_hcm.empty else 4
    recipe_hcm = adjust_sugar_text(default_recipe_text, 8) if mode_hcm < 4 else adjust_sugar_text(default_recipe_text, 0)
    msg_hcm = "🔥 Thị trường thích đậm vị: Tăng 8% đường" if mode_hcm < 4 else "Giữ nguyên"
    
    return {
        "original": default_recipe_text,
        "regions": {
            "hanoi": {
                "recipe": recipe_hn,
                "message": msg_hn
            },
            "danang": {
                "recipe": recipe_dn,
                "message": msg_dn
            },
            "hcm": {
                "recipe": recipe_hcm,
                "message": msg_hcm
            }
        }
    }

def get_feedback_stats(cake_name: str, region: str = None):
    scores_dict = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    
    # Normalize region for Excel
    excel_region = region
    if region == "TP. Hồ Chí Minh":
        excel_region = "TP.HCM"
    
    # 1. Fetch from Excel
    df_data = get_data_df()
    if not df_data.empty and 'Sản phẩm' in df_data.columns:
        df_fb = df_data[df_data['Sản phẩm'] == cake_name]
        if region and region != 'All':
            if 'Vùng miền' in df_fb.columns:
                df_fb = df_fb[df_fb['Vùng miền'] == excel_region]
                
        if not df_fb.empty:
            # We use the Muc_Do_Ngot column which is already parsed as int in get_data_df()
            fb_counts = df_fb['Muc_Do_Ngot'].value_counts().reset_index()
            for _, row in fb_counts.iterrows():
                s = int(row['Muc_Do_Ngot'])
                if s in scores_dict:
                    scores_dict[s] += int(row['count'])
                    
    # 2. Fetch from DB
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            if region and region != 'All':
                cursor.execute("SELECT score, COUNT(*) FROM feedbacks WHERE product_name = %s AND region = %s GROUP BY score", (cake_name, region))
            else:
                cursor.execute("SELECT score, COUNT(*) FROM feedbacks WHERE product_name = %s GROUP BY score", (cake_name,))
            rows = cursor.fetchall()
            for row in rows:
                s = int(row[0])
                if s in scores_dict:
                    scores_dict[s] += int(row[1])
        except Exception as e:
            print(f"Error fetching feedback from DB: {e}")
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            conn.close()

    # Map scores to labels
    labels = {
        1: "1 - Nhạt",
        2: "2 - Hơi Nhạt",
        3: "3 - Vừa Phải",
        4: "4 - Ngọt",
        5: "5 - Rất Ngọt"
    }
    
    result = []
    for s in range(1, 6):
        if scores_dict[s] > 0:
            result.append({"score": labels[s], "count": scores_dict[s]})
            
    return result
