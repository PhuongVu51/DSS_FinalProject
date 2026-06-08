from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import json
import uuid

from database import get_db_connection
import services

app = FastAPI(title="R&D OS Backend API")

# Configure CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Mount uploads directory for serving images
os.makedirs("uploads", exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

# ---- Models ----
class LoginRequest(BaseModel):
    username: str
    password: str

class FeedbackRequest(BaseModel):
    product_name: str
    customer_name: str
    region: str
    score: int

class LoginResponse(BaseModel):
    success: bool
    role: str
    fullname: str
    message: str

# ---- Endpoints ----

@app.get("/")
def read_root():
    return {"message": "Welcome to R&D OS API"}

@app.post("/api/auth/login", response_model=LoginResponse)
def login(request: LoginRequest):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        cursor = conn.cursor()
        
        # Check Admin
        query_admin = "SELECT role, fullname FROM admins WHERE username = %s AND password = %s"
        cursor.execute(query_admin, (request.username, request.password))
        result_admin = cursor.fetchone()
        
        if result_admin:
            return LoginResponse(
                success=True, 
                role=result_admin[0], 
                fullname=result_admin[1],
                message="Admin login successful"
            )
            
        # Check Customer
        query_customer = "SELECT role, fullname FROM customers WHERE username = %s AND password = %s"
        cursor.execute(query_customer, (request.username, request.password))
        result_customer = cursor.fetchone()
        
        if result_customer:
            return LoginResponse(
                success=True, 
                role=result_customer[0], 
                fullname=result_customer[1],
                message="Customer login successful"
            )
            
        raise HTTPException(status_code=401, detail="Invalid username or password")
        
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.get("/api/recipes", response_model=List[str])
def get_cakes():
    """Returns a list of all products/cakes."""
    return services.get_all_cakes()


@app.get("/api/recipes/{cake_name}/optimize")
def optimize_recipe(cake_name: str):
    """Returns the original recipe and localized optimization suggestions."""
    result = services.optimize_recipe_for_regions(cake_name)
    if not result:
        raise HTTPException(status_code=404, detail="Recipe not found or error occurred")
    return result


@app.get("/api/feedback/{cake_name}")
def get_feedback(cake_name: str):
    """Returns feedback statistics for the given cake."""
    stats = services.get_feedback_stats(cake_name)
    return {"cake": cake_name, "stats": stats}

@app.post("/api/feedback")
def submit_feedback(feedback: FeedbackRequest):
    """Saves a new customer feedback into the database."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        cursor = conn.cursor()
        query = "INSERT INTO feedbacks (product_name, customer_name, region, score) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (feedback.product_name, feedback.customer_name, feedback.region, feedback.score))
        conn.commit()
        return {"success": True, "message": "Feedback submitted successfully"}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if conn: conn.close()

@app.post("/api/products")
async def create_product(
    name: str = Form(...),
    ingredients: str = Form(...),
    image: UploadFile = File(None)
):
    """Creates a new product with an optional image upload."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        image_path = None
        if image:
            # Generate unique filename
            ext = os.path.splitext(image.filename)[1]
            filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join("uploads", filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                buffer.write(await image.read())
            
            image_path = f"/api/uploads/{filename}"

        cursor = conn.cursor()
        query = "INSERT INTO products (name, image_path, ingredients) VALUES (%s, %s, %s)"
        cursor.execute(query, (name, image_path, ingredients))
        conn.commit()
        
        return {"success": True, "message": "Product created successfully", "product_id": cursor.lastrowid}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if conn: conn.close()

