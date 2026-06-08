# db_connect.py
import mysql.connector
import streamlit as st

def get_db_connection():
    """Hàm tạo và trả về kết nối tới cơ sở dữ liệu MySQL trên XAMPP"""
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="jolista_db"
        )
        return conn
    except mysql.connector.Error as e:
        st.error(f"❌ Lỗi kết nối MySQL XAMPP: {e}")
        st.info("💡 Hướng dẫn: Bạn đã bật 'Apache' và 'MySQL' trong XAMPP Control Panel chưa?")
        return None