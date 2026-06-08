# login_page.py
import streamlit as st
from db_connect import get_db_connection

def show_login_page():
    st.markdown("""
        <style>
            #MainMenu {visibility: hidden;} footer {visibility: hidden;} header {visibility: hidden;}
            .stApp {background: #f8f9fa;}
            .login-container { display: flex; justify-content: center; align-items: center; height: 40vh; }
            .login-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); width: 400px; text-align: center; border: 1px solid #f1f3f5; }
            .login-card h2 { color: #ff4b72; font-family: 'Segoe UI', sans-serif; margin-bottom: 10px; font-weight: 700; }
            .login-card p { color: #868e96; font-size: 14px; margin-bottom: 5px; }
            
            div.stButton > button:first-child {
                background: linear-gradient(135deg, #ff4b72 0%, #e0115f 100%);
                color: white; border-radius: 12px; width: 100%; padding: 12px; font-size: 16px; font-weight: 600; border: none;
                box-shadow: 0 4px 15px rgba(255, 75, 114, 0.3); transition: all 0.3s ease;
            }
            div.stButton > button:first-child:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 75, 114, 0.4); color: white; }
        </style>
    """, unsafe_allow_html=True)

    st.markdown("""
        <div class="login-container">
            <div class="login-card">
                <h2>🍰 JOLISTA SYSTEM</h2>
                <p>Hệ Hỗ Trợ Ra Quyết Định R&D Menu Bánh</p>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    _, col_center, _ = st.columns([1, 1.2, 1])
    with col_center:
        username_input = st.text_input("Tên đăng nhập:", placeholder="Nhập tài khoản của bạn...")
        password_input = st.text_input("Mật khẩu:", type="password", placeholder="Nhập mật khẩu...")
        
        if st.button("XÁC NHẬN ĐĂNG NHẬP"):
            if username_input and password_input:
                conn = get_db_connection()
                if conn:
                    cursor = conn.cursor()
                    
                    # 1. Kiểm tra tài khoản trong bảng admins trước
                    query_admin = "SELECT role, fullname FROM admins WHERE username = %s AND password = %s"
                    cursor.execute(query_admin, (username_input, password_input))
                    result_admin = cursor.fetchone()
                    
                    if result_admin:
                        st.session_state['logged_in'] = True
                        st.session_state['user_role'] = result_admin[0]
                        st.session_state['user_fullname'] = result_admin[1]
                        st.success(f"Xin chào Admin: {result_admin[1]}!")
                        st.rerun()
                    else:
                        # 2. Nếu không có ở bảng admin, quét tiếp bảng customers
                        query_customer = "SELECT role, fullname FROM customers WHERE username = %s AND password = %s"
                        cursor.execute(query_customer, (username_input, password_input))
                        result_customer = cursor.fetchone()
                        
                        if result_customer:
                            st.session_state['logged_in'] = True
                            st.session_state['user_role'] = result_customer[0]
                            st.session_state['user_fullname'] = result_customer[1]
                            st.success(f"Xin chào quý khách: {result_customer[1]}!")
                            st.rerun()
                        else:
                            st.error("❌ Tài khoản hoặc mật khẩu không chính xác!")
                    
                    cursor.close()
                    conn.close()
            else:
                st.warning("Vui lòng điền đầy đủ thông tin đăng nhập!")