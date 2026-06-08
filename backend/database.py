import mysql.connector
from mysql.connector import Error

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
    except Error as e:
        print(f"❌ Lỗi kết nối MySQL XAMPP: {e}")
        return None
