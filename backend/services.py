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
    if percentage_change == 0: return recipe_text
    
    lines = str(recipe_text).split('\n')
    new_lines = []
    for line in lines:
        if 'đường' in line.lower() or 'sugar' in line.lower() or 'ngọt' in line.lower():
            match = re.search(r'(\d+[\.,]?\d*)\s*(gram|g|ml)', line, re.IGNORECASE)
            if match:
                try:
                    old_sugar = float(match.group(1).replace(',', '.'))
                    new_sugar = old_sugar * (1 + percentage_change / 100)
                    # Create the new value string
                    new_val_str = f"{new_sugar:,.1f}"
                    if new_val_str.endswith('.0'):
                        new_val_str = new_val_str[:-2]
                        
                    # Replace the exact number in the string
                    replaced_line = line.replace(match.group(1), new_val_str)
                    
                    # Add a visual indicator to the line
                    direction = "Giảm" if percentage_change < 0 else "Tăng"
                    indicator = f" (🔄 {direction} {abs(percentage_change)}% theo vùng miền)"
                    line = replaced_line + indicator
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
    df_hn = df_data[(df_data['Vùng miền'] == "Hà Nội") & (df_data['Sản phẩm'] == cake_name)] if not df_data.empty and 'Sản phẩm' in df_data.columns else pd.DataFrame()
    mode_hn = df_hn['Muc_Do_Ngot'].mode()[0] if not df_hn.empty else 3
    recipe_hn = adjust_sugar_text(default_recipe_text, -15)
    msg_hn = "⚠️ Thị trường thích ăn nhạt: Giảm 15% lượng đường"
    
    # Da Nang Logic
    recipe_dn = adjust_sugar_text(default_recipe_text, 0)
    msg_dn = "✅ Vị trí cân bằng: Giữ nguyên vị gốc"
    
    # TP.HCM Logic
    df_hcm = df_data[(df_data['Vùng miền'] == "TP.HCM") & (df_data['Sản phẩm'] == cake_name)] if not df_data.empty and 'Sản phẩm' in df_data.columns else pd.DataFrame()
    mode_hcm = df_hcm['Muc_Do_Ngot'].mode()[0] if not df_hcm.empty else 4
    recipe_hcm = adjust_sugar_text(default_recipe_text, 8)
    msg_hcm = "🔥 Thị trường thích đậm vị: Tăng 8% lượng đường"
    
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

def get_feedback_heatmap(cake_name: str):
    matrix = {
        "Hà Nội": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
        "Đà Nẵng": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
        "TP.HCM": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    }
    
    # 1. Excel Data
    df_data = get_data_df()
    if not df_data.empty and 'Sản phẩm' in df_data.columns and 'Vùng miền' in df_data.columns:
        df_fb = df_data[df_data['Sản phẩm'] == cake_name]
        for _, row in df_fb.iterrows():
            region = row['Vùng miền']
            score = int(row['Muc_Do_Ngot'])
            if region in matrix and 1 <= score <= 5:
                matrix[region][score] += 1
                
    # 2. DB Data
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT region, score, COUNT(*) FROM feedbacks WHERE product_name = %s GROUP BY region, score", (cake_name,))
            rows = cursor.fetchall()
            for row in rows:
                region, score, count = row
                
                # Normalize region name
                if region == "TP. Hồ Chí Minh":
                    region = "TP.HCM"
                    
                score = int(score)
                if region in matrix and 1 <= score <= 5:
                    matrix[region][score] += int(count)
        except Exception as e:
            print(f"Error fetching heatmap from DB: {e}")
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            conn.close()
            
    return matrix

def get_trending_buys(region: str = None):
    trends = {}
    from collections import defaultdict
    co_matrix = defaultdict(lambda: defaultdict(int))
    
    excel_region = region
    if region == "TP. Hồ Chí Minh":
        excel_region = "TP.HCM"
        
    # 1. Fetch from Excel
    df_data = get_data_df()
    if not df_data.empty and 'Sản phẩm' in df_data.columns:
        if region and region != 'All' and 'Vùng miền' in df_data.columns:
            df_filtered = df_data[df_data['Vùng miền'] == excel_region]
        else:
            df_filtered = df_data
            
        counts = df_filtered['Sản phẩm'].value_counts()
        for cake, count in counts.items():
            trends[cake] = trends.get(cake, 0) + int(count)
            
        # Calculate co-occurrences
        if 'ORDER_ID' in df_filtered.columns:
            orders = df_filtered.groupby('ORDER_ID')['Sản phẩm'].apply(list)
            for items in orders:
                unique_items = list(set(items))
                for i in range(len(unique_items)):
                    for j in range(len(unique_items)):
                        if i != j:
                            co_matrix[unique_items[i]][unique_items[j]] += 1
            
    # 2. Fetch from DB
    conn = get_db_connection()
    images = {}
    if conn:
        try:
            cursor = conn.cursor()
            if region and region != 'All':
                cursor.execute("SELECT product_name, COUNT(*) FROM feedbacks WHERE region = %s GROUP BY product_name", (region,))
            else:
                cursor.execute("SELECT product_name, COUNT(*) FROM feedbacks GROUP BY product_name")
                
            rows = cursor.fetchall()
            for row in rows:
                cake = row[0]
                count = int(row[1])
                trends[cake] = trends.get(cake, 0) + count
                
            # Fetch images
            cursor.execute("SELECT name, image_path FROM products")
            prod_rows = cursor.fetchall()
            for r in prod_rows:
                images[r[0]] = r[1]
        except Exception as e:
            print(f"Error fetching trending from DB: {e}")
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            conn.close()
            
    # Sort by count descending
    sorted_trends = []
    for k, v in sorted(trends.items(), key=lambda x: x[1], reverse=True):
        # Determine bought_with
        bought_with = None
        if co_matrix[k]:
            bought_with = max(co_matrix[k].items(), key=lambda x: x[1])[0]
        
        sorted_trends.append({
            "product": k, 
            "buys": v, 
            "image": images.get(k),
            "bought_with": bought_with,
            "bought_with_image": images.get(bought_with) if bought_with else None
        })
        
    return sorted_trends

def get_combo_stats(region: str = None):
    from collections import defaultdict
    co_matrix = defaultdict(int)
    
    excel_region = region
    if region == "TP. Hồ Chí Minh":
        excel_region = "TP.HCM"
        
    df_data = get_data_df()
    if not df_data.empty and 'Sản phẩm' in df_data.columns and 'ORDER_ID' in df_data.columns:
        df_filtered = df_data
        if region and region != 'All' and 'Vùng miền' in df_data.columns:
            df_filtered = df_data[df_data['Vùng miền'] == excel_region]
            
        orders = df_filtered.groupby('ORDER_ID')['Sản phẩm'].apply(list)
        for items in orders:
            unique_items = sorted(list(set(items)))
            for i in range(len(unique_items)):
                for j in range(i+1, len(unique_items)):
                    pair = f"{unique_items[i]} + {unique_items[j]}"
                    co_matrix[pair] += 1
                    
    sorted_pairs = [{"pair": k, "count": v} for k, v in sorted(co_matrix.items(), key=lambda x: x[1], reverse=True)[:5]]
    return sorted_pairs

def get_regional_comparison(cake_name: str):
    regions_count = {"Hà Nội": 0, "Đà Nẵng": 0, "TP.HCM": 0}
    
    # Excel
    df_data = get_data_df()
    if not df_data.empty and 'Sản phẩm' in df_data.columns and 'Vùng miền' in df_data.columns:
        df_fb = df_data[df_data['Sản phẩm'] == cake_name]
        counts = df_fb['Vùng miền'].value_counts()
        for r, c in counts.items():
            if r in regions_count:
                regions_count[r] += int(c)
                
    # DB
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT region, COUNT(*) FROM feedbacks WHERE product_name = %s GROUP BY region", (cake_name,))
            for row in cursor.fetchall():
                r = row[0]
                if r == "TP. Hồ Chí Minh":
                    r = "TP.HCM"
                if r in regions_count:
                    regions_count[r] += int(row[1])
        except: pass
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            conn.close()
            
    return [{"region": k, "count": v} for k, v in regions_count.items()]

def get_experimental_performance():
    # Experimental products: those with total feedback < 50 or newly added
    # For simulation, we aggregate all feedback, and anything under 50 counts is experimental
    product_stats = {}
    
    df_data = get_data_df()
    if not df_data.empty and 'Sản phẩm' in df_data.columns:
        for cake in df_data['Sản phẩm'].unique():
            df_cake = df_data[df_data['Sản phẩm'] == cake]
            count = len(df_cake)
            avg = df_cake['Muc_Do_Ngot'].mean()
            product_stats[cake] = {"count": count, "sum_score": count * avg if count else 0}
            
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT product_name, COUNT(*), AVG(score) FROM feedbacks GROUP BY product_name")
            for row in cursor.fetchall():
                cake, count, avg = row[0], int(row[1]), float(row[2]) if row[2] else 3.0
                if cake not in product_stats:
                    product_stats[cake] = {"count": 0, "sum_score": 0}
                product_stats[cake]["count"] += count
                product_stats[cake]["sum_score"] += count * avg
        except: pass
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            conn.close()
            
    experimental = []
    for cake, stats in product_stats.items():
        if stats["count"] > 0 and stats["count"] <= 100: # Threshold for experimental
            avg_score = stats["sum_score"] / stats["count"]
            status = "Hài Lòng" if 2.8 <= avg_score <= 3.2 else "Cần Điều Chỉnh"
            experimental.append({
                "product": cake,
                "count": stats["count"],
                "avg_score": round(avg_score, 1),
                "status": status
            })
            
    return sorted(experimental, key=lambda x: x["count"], reverse=True)
