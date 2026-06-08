# customer_page.py
import streamlit as st
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
import re

def run_apriori_for_location(df_location):
    if df_location.empty or df_location['ORDER_ID'].nunique() < 2: return pd.DataFrame()
    try:
        basket = (df_location.groupby(['ORDER_ID', 'Sản phẩm'])['Sản phẩm'].count().unstack().reset_index().fillna(0).set_index('ORDER_ID'))
        basket_sets = basket.map(lambda x: x > 0)
        frequent_itemsets = apriori(basket_sets, min_support=0.01, use_colnames=True)
        if frequent_itemsets.empty: return pd.DataFrame()
        return association_rules(frequent_itemsets, metric="confidence", min_threshold=0.01)
    except: return pd.DataFrame()

def show_customer_page():
    st.title("😋 GIAO DIỆN KHẢO SÁT VÀ GỢI Ý ĐƠN HÀNG")
    st.caption("Dành cho khách hàng trải nghiệm sản phẩm mới")
    st.markdown("---")
    
    try:
        df_data = pd.read_excel("data dss.xlsx", sheet_name="data")
        df_recipe = pd.read_excel("data dss.xlsx", sheet_name="recipe")
    except:
        st.error("Thiếu file cơ sở dữ liệu 'data dss.xlsx'. Hãy kiểm tra lại.")
        return

    st.header("📝 Gửi Đánh Giá Khẩu Vị Của Bạn")
    current_cust_name = st.session_state.get('user_fullname', 'Khách hàng ẩn danh')
    
    col1, col2 = st.columns(2)
    with col1:
        st.text_input("👤 Người thực hiện trải nghiệm:", value=current_cust_name, disabled=True)
        user_city = st.selectbox("📍 Bạn đang thưởng thức tại khu vực nào?", ["Hà Nội", "Đà Nẵng", "TP.HCM"])
    with col2:
        user_cake = st.selectbox("🍰 Chọn loại bánh bạn đang dùng thử:", list(df_recipe['Product_name'].unique()))
        user_taste = st.radio("📊 Đánh giá độ ngọt thực tế:", ["5 - Rất ngọt", "4 - Ngọt", "3 - Vừa", "2 - Hơi nhạt", "1 - Nhạt"], horizontal=True)
    
    if st.button("📤 Gửi phản hồi về hệ thống", type="primary"):
        last_order_id = df_data['ORDER_ID'].iloc[-1] if not df_data.empty else "DH000"
        try:
            order_num = int(re.search(r'(\d+)', str(last_order_id)).group(1)) + 1
            new_order_id = f"DH{order_num:03d}"
        except:
            new_order_id = f"DH{len(df_data)+1:03d}"
            
        new_row = {"ORDER_ID": new_order_id, "Tên": current_cust_name, "Sản phẩm": user_cake, "Vùng miền": user_city, "Độ ngọt/Độ béo (1-5)": user_taste}
        
        try:
            with pd.ExcelWriter("data dss.xlsx", mode='a', engine='openpyxl', if_sheet_exists='overlay') as writer:
                df_raw_data = pd.read_excel("data dss.xlsx", sheet_name="data")
                pd.concat([df_raw_data, pd.DataFrame([new_row])], ignore_index=True).to_excel(writer, sheet_name="data", index=False)
            st.balloons()
            st.success(f"🎉 Gửi phản hồi thành công! Dữ liệu đã được nạp vào mã phiếu {new_order_id}.")
            st.cache_data.clear()
        except:
            st.error("❌ Không thể ghi dữ liệu. Bạn hãy tắt file Excel 'data dss.xlsx' nếu đang mở nó bằng máy tính nhé!")
            
    st.markdown("---")
    st.header("🛍️ Gợi Ý Mua Kèm Theo Thị Hiếu Giỏ Hàng")
    df_local_basket = df_data[df_data['Vùng miền'] == user_city]
    rules_local = run_apriori_for_location(df_local_basket)
    
    if (rules_local is not None) and (not rules_local.empty):
        rules_local['antecedents_str'] = rules_local['antecedents'].apply(lambda x: ', '.join(list(x)))
        rules_local['consequents_str'] = rules_local['consequents'].apply(lambda x: ', '.join(list(x)))
        matched = rules_local[rules_local['antecedents_str'] == user_cake].sort_values(by='confidence', ascending=False)
        if not matched.empty:
            st.info(f"🧁 Khách hàng tại **{user_city}** khi mua bánh `{user_cake}` thường có xu hướng mua cùng món: **{matched.iloc[0]['consequents_str']}** (Độ tin cậy giỏ hàng phân tích từ thuật toán đạt: {round(matched.iloc[0]['confidence']*100, 1)}%)")