# login_page.py
import streamlit as st
from db_connect import get_db_connection

def show_login_page():
    # 1. Nhúng bộ CSS để làm sạch nền, tạo hiệu ứng kính mờ và ép kiểu chữ trắng
    st.markdown("""
        <style>
            /* Ẩn hoàn toàn thanh công cụ và footer của Streamlit */
            #MainMenu {visibility: hidden;} footer {visibility: hidden;} header {visibility: hidden;}
            
            /* Cài đặt ảnh nền phủ kín toàn bộ màn hình */
            .stApp {
                background: url('https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1920') no-repeat center center fixed !important;
                background-size: cover !important;
            }
            
            /* Tạo một lớp overlay tối mịn phía sau để làm nổi bật khung đăng nhập */
            .stApp::before {
                content: "";
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 0;
            }
            
            /* Cấu hình hiệu ứng Kính mờ (Glassmorphism) chuẩn cho khối chứa */
            .glass-card {
                background: rgba(255, 255, 255, 0.12) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 16px !important;
                padding: 30px 25px !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
                text-align: center;
                margin-top: 15vh; /* Đẩy khung xuống cách đỉnh màn hình một khoảng vừa vặn */
            }
            
            /* Định dạng tiêu đề hệ thống */
            .login-title {
                color: #ffffff !important;
                font-size: 26px !important;
                font-weight: 700 !important;
                margin-bottom: 2px !important;
            }
            .login-subtitle {
                color: #ffd166 !important; /* Tone màu vàng ấm áp */
                font-size: 13px !important;
                font-weight: 500 !important;
                margin-bottom: 20px !important;
            }
            
            /* Xóa bỏ hoàn toàn khung viền xám thô mặc định của st.form */
            [data-testid="stForm"] {
                background-color: transparent !important;
                border: none !important;
                padding: 0 !important;
                box-shadow: none !important;
            }
            
            /* Chuyển nhãn chữ (Tài khoản / Mật khẩu) sang màu trắng tinh, căn trái */
            .stTextInput label {
                color: #ffffff !important;
                font-weight: 500 !important;
                font-size: 13px !important;
                text-align: left !important;
                display: block !important;
            }
            
            /* Làm đẹp ô nhập liệu: Nền mờ trong suốt, chữ trắng */
            .stTextInput input {
                background-color: rgba(255, 255, 255, 0.18) !important;
                color: #ffffff !important;
                border: 1px solid rgba(255, 255, 255, 0.25) !important;
                border-radius: 8px !important;
                padding: 8px 12px !important;
            }
            .stTextInput input:focus {
                border-color: #ffd166 !important;
                box-shadow: 0 0 8px rgba(255, 209, 102, 0.4) !important;
            }
            
            /* Định dạng lại nút xác nhận đăng nhập màu xanh tươi, ôm vừa phom */
            .stButton button {
                width: 100% !important;
                background: #06d6a0 !important;
                color: #ffffff !important;
                font-weight: 600 !important;
                padding: 10px 0px !important;
                border: none !important;
                border-radius: 8px !important;
                margin-top: 10px !important;
                box-shadow: 0 4px 12px rgba(6, 214, 160, 0.3) !important;
            }
            .stButton button:hover {
                background: #05b88a !important;
            }
        </style>
    """, unsafe_allow_html=True)

    # 2. CHIA CỘT STREAMLIT: Ép thành phần vào giữa, thu gọn độ rộng (Giải quyết triệt để lỗi tràn dòng)
    col1, col2, col3 = st.columns([1, 1.8, 1]) # Tỉ lệ giúp cột giữa có độ rộng khoảng 380px-400px vô cùng cân đối
    
    with col2:
        # Bắt đầu bao bọc khối kính mờ bằng thẻ HTML div
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.markdown('<div class="login-title">Jolista System</div>', unsafe_allow_html=True)
        st.markdown('<div class="login-subtitle">Hệ Hỗ Trợ Ra Quyết Định R&D Menu Bánh</div>', unsafe_allow_html=True)
        
        # Đặt trực tiếp st.form vào bên trong khối này
        with st.form(key="login_interface_form"):
            username_input = st.text_input("Tài khoản", placeholder="Nhập mã nhân viên...")
            password_input = st.text_input("Mật khẩu", type="password", placeholder="••••••••")
            submit_button = st.form_submit_button(label="XÁC NHẬN ĐĂNG NHẬP")
            
        st.markdown('</div>', unsafe_allow_html=True) # Đóng thẻ div kính mờ
        
        # 3. Giữ nguyên toàn bộ logic kết nối cơ sở dữ liệu xử lý đăng nhập của bạn
        if submit_button:
            if username_input.strip() and password_input.strip():
                conn = get_db_connection()
                if conn:
                    cursor = conn.cursor()
                    
                    # Kiểm tra quyền ADMINS
                    query_admin = "SELECT role, fullname FROM admins WHERE username = %s AND password = %s"
                    cursor.execute(query_admin, (username_input, password_input))
                    result_admin = cursor.fetchone()
                    
                    if result_admin:
                        st.session_state['logged_in'] = True
                        st.session_state['user_role'] = result_admin[0]
                        st.session_state['user_fullname'] = result_admin[1]
                        st.rerun()
                    else:
                        # Kiểm tra quyền CUSTOMERS nếu không phải admin
                        query_customer = "SELECT role, fullname FROM customers WHERE username = %s AND password = %s"
                        cursor.execute(query_customer, (username_input, password_input))
                        result_customer = cursor.fetchone()
                        
                        if result_customer:
                            st.session_state['logged_in'] = True
                            st.session_state['user_role'] = result_customer[0]
                            st.session_state['user_fullname'] = result_customer[1]
                            st.rerun()
                        else:
                            st.error("❌ Tài khoản hoặc mật khẩu không chính xác!")
                    
                    cursor.close()
                    conn.close()
            else:
                st.warning("⚠️ Vui lòng điền đầy đủ thông tin!")