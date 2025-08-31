from fastapi import FastAPI, APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.sql import select, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Dict, Any
from database import engine, reviews_table, SessionLocal
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins; for production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Pydantic model for incoming review data
class Review(BaseModel):
    product_id: str
    username: str 
    stars: int
    review: str

class BrandReviewRequest(BaseModel):
    brand_id: str

# Helper function to get brand ID from product ID
# Helper function to get brand ID from product ID
async def get_brand_id_from_product(product_id: str) -> str:
    """
    Get the brand ID for a product from the Products API
    """
    try:
        # Make sure we're using the correct URL and endpoint
        response = requests.get(f"http://localhost:8001/products/{product_id}")
        
        # Add detailed logging
        print(f"Product API response for product {product_id}: Status {response.status_code}")
        if not response.ok:
            print(f"Error response content: {response.text}")
            # Return a default brand ID instead of failing
            return "1"  # Default brand ID as fallback
        
        product_data = response.json()
        print(f"Product data: {product_data}")
        
        # Extract brand_id safely
        brand_id = product_data.get("brandId")  # Note: it's brandId not brand_id
        if not brand_id:
            print(f"No brandId found in product data for product {product_id}")
            return "1"  # Default brand ID as fallback
            
        return str(brand_id)  # Convert to string to ensure consistency
    except Exception as e:
        print(f"Exception in get_brand_id_from_product: {str(e)}")
        return "1"  # Default brand ID as fallback

@app.get("/get-brand-for-product/{product_id}")
async def get_brand_for_product(product_id: str):
    """
    Get the brand ID for a specific product
    """
    try:
        # Add more logging
        print(f"Looking up brand for product {product_id}")
        
        # Use a direct DB query instead of an API call if possible
        # This is more reliable and avoids potential API issues
        with engine.connect() as conn:
            # Assuming you have a products table with brand_id
            # If not, keep using the API approach with better error handling
            query = "SELECT brand_id FROM products WHERE id = %s"
            result = conn.execute(query, (product_id,))
            row = result.fetchone()
            
            if row and row[0]:
                brand_id = row[0]
                return {"product_id": product_id, "brand_id": brand_id}
        
        # If DB query didn't work, try the API
        brand_id = await get_brand_id_from_product(product_id)
        
        if brand_id:
            return {"product_id": product_id, "brand_id": brand_id}
        else:
            # Return a 404 instead of 500 if product not found
            raise HTTPException(status_code=404, detail=f"No brand found for product {product_id}")
    except Exception as e:
        print(f"Error in get_brand_for_product: {str(e)}")
        # Return a default brand ID instead of failing
        # This is a fallback to prevent the entire system from failing
        return {"product_id": product_id, "brand_id": "1", "note": "Default brand due to error"}

@app.post("/add-review/")
async def add_review(review: Review):
    """
    Add a new review and update brand rankings
    """
    if review.stars < 1 or review.stars > 5:
        raise HTTPException(status_code=400, detail="Stars rating must be between 1 and 5")

    try:
        # First add the review to the database
        with engine.connect() as conn:
            insert_query = reviews_table.insert().values(
                product_id=review.product_id,
                username=review.username,
                stars=review.stars,
                review=review.review
            )
            conn.execute(insert_query)
            conn.commit()
        
        # Get the brand ID for this product
        brand_id = await get_brand_id_from_product(review.product_id)
        
        # Trigger brand ranking update
        if brand_id:
            try:
                # Format the review for sentiment analysis
                formatted_review = {
                    "text": review.review,
                    "title": "",
                    "recommend": review.stars >= 4  # Assume 4-5 stars means recommend
                }
                
                # Send to sentiment API
                sentiment_response = requests.post(
                    "http://localhost:8002/api/analyze-brand",
                    json={
                        "brand_id": brand_id,
                        "reviews": [formatted_review]
                    }
                )
                
                if sentiment_response.ok:
                    return {
                        "message": "Review added successfully and brand rankings updated!",
                        "brand_id": brand_id
                    }
                else:
                    return {
                        "message": "Review added successfully but failed to update brand rankings.",
                        "brand_id": brand_id
                    }
                    
            except Exception as e:
                return {
                    "message": "Review added successfully but failed to update brand rankings.",
                    "error": str(e),
                    "brand_id": brand_id
                }
        
        return {"message": "Review added successfully!"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding review: {str(e)}")

@app.get("/get-reviews/")
async def get_reviews(product_id: str):
    """
    Get all reviews for a specific product
    """
    try:
        with engine.connect() as conn:
            query = select(reviews_table).where(reviews_table.c.product_id == product_id)
            result = conn.execute(query).fetchall()
            reviews = [dict(row._mapping) for row in result]
            return {"reviews": reviews}
    except SQLAlchemyError as e:
        print(f"Error fetching reviews: {str(e)}")
        # Return empty reviews instead of an error
        return {"reviews": []}
    except Exception as e:
        print(f"Unexpected error fetching reviews: {str(e)}")
        return {"reviews": []}

@app.get("/get-all-reviews/")
async def get_all_reviews():
    """
    Get all reviews in the system
    """
    try:
        with engine.connect() as conn:
            query = select(reviews_table)
            result = conn.execute(query).fetchall()
            reviews = [dict(row._mapping) for row in result]
            return {"reviews": reviews, "count": len(reviews)}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/get-reviews-by-brand/{brand_id}")
async def get_reviews_by_brand(brand_id: str):
    """
    Get all reviews for products of a specific brand
    """
    try:
        # Get all products for this brand
        products_response = requests.get(f"http://localhost:8001/products-by-brand/{brand_id}")
        if not products_response.ok:
            raise HTTPException(status_code=500, detail=f"Failed to fetch products for brand: {brand_id}")
        
        products = products_response.json()
        if not products:
            return {"reviews": [], "count": 0}
        
        product_ids = [str(product['id']) for product in products]
        
        # Get reviews for all these products
        all_reviews = []
        with engine.connect() as conn:
            for product_id in product_ids:
                query = select(reviews_table).where(reviews_table.c.product_id == product_id)
                result = conn.execute(query).fetchall()
                product_reviews = [dict(row._mapping) for row in result]
                all_reviews.extend(product_reviews)
        
        return {"reviews": all_reviews, "count": len(all_reviews)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reviews: {str(e)}")

@app.post("/update-brand-rankings/")
async def update_brand_rankings(request: BrandReviewRequest):
    """
    Update brand rankings based on all reviews for that brand's products
    """
    try:
        # Get all reviews for this brand's products
        reviews_data = await get_reviews_by_brand(request.brand_id)
        all_reviews = reviews_data["reviews"]
        
        if not all_reviews:
            return {"message": f"No reviews found for brand {request.brand_id}"}
        
        # Format reviews for sentiment analysis
        formatted_reviews = []
        for review in all_reviews:
            formatted_reviews.append({
                "text": review["review"],
                "title": "",
                "recommend": review["stars"] >= 4  # Assume 4-5 stars means recommend
            })
        
        # Send to sentiment API for analysis
        sentiment_response = requests.post(
            "http://localhost:8002/api/analyze-brand",
            json={
                "brand_id": request.brand_id,
                "reviews": formatted_reviews
            }
        )
        
        if not sentiment_response.ok:
            raise HTTPException(
                status_code=500,
                detail=f"Sentiment API error: {sentiment_response.status_code}"
            )
        
        result = sentiment_response.json()
        return {
            "message": f"Successfully updated rankings for brand {request.brand_id}",
            "reviews_processed": len(formatted_reviews),
            "metrics": result["metrics"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating brand rankings: {str(e)}")

@app.get("/get-brand-for-product/{product_id}")
async def get_brand_for_product(product_id: str):
    """
    Get the brand ID for a specific product
    """
    try:
        brand_id = await get_brand_id_from_product(product_id)
        return {"product_id": product_id, "brand_id": brand_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-reviews-stats/")
async def get_reviews_stats():
    """
    Get statistics about reviews in the system
    """
    try:
        with engine.connect() as conn:
            # Total reviews count
            count_query = select(func.count()).select_from(reviews_table)
            total_count = conn.execute(count_query).scalar()
            
            # Average star rating
            avg_query = select(func.avg(reviews_table.c.stars)).select_from(reviews_table)
            avg_rating = conn.execute(avg_query).scalar() or 0
            
            # Distribution of ratings
            ratings_dist = {}
            for i in range(1, 6):
                rating_query = select(func.count()).select_from(reviews_table).where(reviews_table.c.stars == i)
                count = conn.execute(rating_query).scalar() or 0
                ratings_dist[str(i)] = count
            
            return {
                "total_reviews": total_count,
                "average_rating": round(float(avg_rating), 2),
                "ratings_distribution": ratings_dist
            }
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")