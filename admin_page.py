# admin_page.py
import streamlit as st
import pandas as pd
import re

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

def show_admin_page():
    st.title(f"🏭 PHÂN HỆ QUẢN TRỊ R&D — {st.session_state.get('user_fullname', 'ADMIN')}")
    st.caption("Công cụ hỗ trợ phân tích thị hiếu khu vực và tinh chỉnh công thức sản xuất")
    st.markdown("---")
    
    try:
        df_data = pd.read_excel("data dss.xlsx", sheet_name="data")
        df_recipe = pd.read_excel("data dss.xlsx", sheet_name="recipe")
        df_data['Muc_Do_Ngot'] = df_data['Độ ngọt/Độ béo (1-5)'].astype(str).str.extract(r'(\d+)').fillna(3).astype(int)
    except Exception as e:
        st.error(f"Lỗi đọc file: Đảm bảo file 'data dss.xlsx' nằm chung thư mục và không bị mở bởi Excel. Chi tiết: {e}")
        return

    tab_create, tab_monitor = st.tabs(["🆕 Gợi ý & Điều chỉnh Công thức", "📊 Biểu đồ Giám sát Đánh giá"])
    
    with tab_create:
        st.header("⚙️ Phân tích và Tự động May đo Công thức")
        all_existing_cakes = list(df_recipe['Product_name'].unique()) if not df_recipe.empty else ["Red Velvet"]
        cake_name = st.selectbox("Chọn sản phẩm bánh cần phân tích:", all_existing_cakes)
        
        default_recipe_text = "150 gram bột mì\n50 gram đường cát"
        existing_recipe = df_recipe[(df_recipe['Product_name'] == cake_name) & (df_recipe['Adjustment_Note'].str.contains('3|Original', na=False, case=False))]
        if not existing_recipe.empty:
            default_recipe_text = existing_recipe['Recipe'].values[0]
            
        base_recipe = st.text_area("Công thức gốc tiêu chuẩn hiện tại:", value=default_recipe_text, height=140)
        
        st.subheader("📍 Đề xuất công thức tối ưu hóa theo khẩu vị vùng miền (Thuật toán DSS)")
        c1, c2, c3 = st.columns(3)
        with c1:
            st.markdown("**🏛️ Chi Nhánh Hà Nội**")
            df_hn = df_data[df_data['Vùng miền'] == "Hà Nội"]
            mode_hn = df_hn['Muc_Do_Ngot'].mode()[0] if not df_hn.empty else 3
            recipe_hn = adjust_sugar_text(base_recipe, -30) if mode_hn < 4 else adjust_sugar_text(base_recipe, 0)
            if mode_hn < 4: st.warning("⚠️ Thị trường thích ăn nhạt: Giảm 30% đường")
            st.text_area("Công thức Hà Nội:", value=recipe_hn, height=120, key="rec_hn")
        with c2:
            st.markdown("**🌊 Chi Nhánh Đà Nẵng**")
            st.info("✅ Vị trí cân bằng: Giữ nguyên vị gốc")
            st.text_area("Công thức Đà Nẵng:", value=adjust_sugar_text(base_recipe, 0), height=120, key="rec_dn")
        with c3:
            st.markdown("**🌴 Chi Nhánh TP.HCM**")
            df_hcm = df_data[df_data['Vùng miền'] == "TP.HCM"]
            mode_hcm = df_hcm['Muc_Do_Ngot'].mode()[0] if not df_hcm.empty else 4
            recipe_hcm = adjust_sugar_text(base_recipe, 20) if mode_hcm >= 4 else adjust_sugar_text(base_recipe, 0)
            if mode_hcm >= 4: st.success("🔥 Thị trường thích đậm vị: Tăng 20% đường")
            st.text_area("Công thức TP.HCM:", value=recipe_hcm, height=120, key="rec_hcm")

    with tab_monitor:
        st.header("📈 Thống kê ý kiến phản hồi thực tế")
        selected_monitor_cake = st.selectbox("Chọn sản phẩm kiểm tra biểu đồ khảo sát:", list(df_data['Sản phẩm'].unique()))
        df_fb = df_data[df_data['Sản phẩm'] == selected_monitor_cake]
        
        if df_fb.empty:
            st.warning("🔄 Chưa ghi nhận lượt đánh giá phản hồi nào từ người dùng cho sản phẩm này.")
        else:
            fb_counts = df_fb['Độ ngọt/Độ béo (1-5)'].value_counts().reset_index()
            fb_counts.columns = ['Mức độ đánh giá', 'Số lượng phiếu']
            st.bar_chart(data=fb_counts, x='Mức độ đánh giá', y='Số lượng phiếu', color="#ff4b72")