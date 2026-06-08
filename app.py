# app.py
import streamlit as st
from login_page import show_login_page
from admin_page import show_admin_page
from customer_page import show_customer_page

st.set_page_config(
    page_title="Hệ Thống DSS Jolista", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# Khởi tạo Session State lưu trạng thái đăng nhập
if 'logged_in' not in st.session_state:
    st.session_state['logged_in'] = False
if 'user_role' not in st.session_state:
    st.session_state['user_role'] = None
if 'user_fullname' not in st.session_state:
    st.session_state['user_fullname'] = None

# ĐIỀU HƯỚNG GIAO DIỆN
if not st.session_state['logged_in']:
    show_login_page()
else:
    # Thanh Header đỉnh ứng dụng hiển thị thông tin Động từ CSDL tách bảng
    st.markdown(f"""
        <div style="background: white; padding: 15px 30px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border: 1px solid #f1f3f5;">
            <div style="font-weight: 700; color: #ff4b72; font-size: 20px; font-family: sans-serif;">🍰 JOLISTA INDUSTRIAL PANEL</div>
            <div style="font-size: 14px; color: #495057; font-family: sans-serif;">
                Tài khoản: <span style="font-weight: 700; color: #212529;">{st.session_state['user_fullname']}</span> | 
                Vai trò: <span style="color: #e0115f; font-weight: 700;">{st.session_state['user_role']}</span>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    with st.sidebar:
        st.markdown("### ⚙️ HỆ THỐNG")
        if st.button("🚪 ĐĂNG XUẤT", use_container_width=True):
            st.session_state['logged_in'] = False
            st.session_state['user_role'] = None
            st.session_state['user_fullname'] = None
            st.rerun()

    # Phân phối màn hình giao diện theo vai trò người dùng quét từ database
    if "Nhà Sản Xuất" in st.session_state['user_role']:
        show_admin_page()
    elif "Người Trải Nghiệm" in st.session_state['user_role']:
        show_customer_page()