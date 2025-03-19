# sentiment_api/server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
from model import SentimentModel
from fastapi.middleware.cors import CORSMiddleware
import json
import requests
import os

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize sentiment model
try:
    model = SentimentModel()
except Exception as e:
    print(f"Error initializing model: {e}")
    print("Using mock data instead")
    model = None

# Load processed reviews
# In server.py - Add more debugging for processed reviews

# Load processed reviews
processed_reviews = {}
processed_reviews_path = "processed_reviews.json"  # Update this path if needed

if os.path.exists(processed_reviews_path):
    try:
        with open(processed_reviews_path, "r", encoding="utf-8") as f:
            processed_reviews = json.load(f)
        
        # Add more detailed logging
        total_reviews = sum(len(reviews) for reviews in processed_reviews.values())
        print(f"Loaded processed reviews for {len(processed_reviews)} brands with a total of {total_reviews} reviews")
        
        # Print a summary of each brand's reviews
        for brand_id, reviews in processed_reviews.items():
            print(f"Brand {brand_id}: {len(reviews)} reviews")
    except Exception as e:
        print(f"Error loading processed reviews: {e}")
        print(f"File path: {os.path.abspath(processed_reviews_path)}")
else:
    print(f"Warning: Processed reviews file not found at {os.path.abspath(processed_reviews_path)}")
    print("Using mock data instead")

class Review(BaseModel):
    text: str
    title: Optional[str] = ""
    recommend: Optional[bool] = None

class BrandReviewsRequest(BaseModel):
    brand_id: str
    reviews: List[Review]

@app.post("/api/analyze-brand")
async def analyze_brand(request: BrandReviewsRequest):
    """Analyze reviews for a brand and return sentiment metrics"""
    if not request.reviews:
        raise HTTPException(status_code=400, detail="No reviews provided")
    
    if model is None:
        # Return mock data if model failed to load
        return {
            "brand_id": request.brand_id,
            "metrics": get_mock_metrics(request.brand_id)
        }
    
    # Convert Pydantic models to dictionaries
    reviews_dict = [review.dict() for review in request.reviews]
    
    # Analyze reviews
    sentiment_metrics = model.analyze_brand_reviews(reviews_dict)
    
    return {
        "brand_id": request.brand_id,
        "metrics": sentiment_metrics
    }

@app.get("/api/brands/rankings")
async def get_brand_rankings():
    """Get brand rankings based on both processed reviews and database reviews"""
    if not processed_reviews:
        print("No processed reviews found, returning mock rankings")
        return get_mock_rankings()
    
    # Start with processed reviews
    combined_reviews = {brand_id: list(reviews) for brand_id, reviews in processed_reviews.items()}
    
    # Add reviews from database via Reviews API
    try:
        # Fetch all reviews from your Reviews API
        reviews_response = requests.get("http://localhost:8000/get-all-reviews/")
        if reviews_response.ok:
            db_reviews = reviews_response.json().get("reviews", [])
            print(f"Fetched {len(db_reviews)} reviews from database")
            
            # For each review, get the product's brand ID
            for review in db_reviews:
                try:
                    product_id = review.get("product_id")
                    brand_response = requests.get(f"http://localhost:8000/get-brand-for-product/{product_id}")
                    
                    if brand_response.ok:
                        brand_data = brand_response.json()
                        brand_id = brand_data.get("brand_id")
                        
                        if brand_id:
                            # Add this review to the combined reviews
                            if brand_id not in combined_reviews:
                                combined_reviews[brand_id] = []
                                
                            combined_reviews[brand_id].append({
                                "text": review.get("review", ""),
                                "recommend": review.get("stars", 0) >= 4
                            })
                except Exception as e:
                    print(f"Error processing review {review.get('id')}: {e}")
    except Exception as e:
        print(f"Error fetching database reviews: {e}")
    
    # Now analyze the combined reviews
    rankings = {}
    
    for brand_id, reviews in combined_reviews.items():
        if model is None:
            rankings[brand_id] = get_mock_metrics(brand_id)
        else:
            metrics = model.analyze_brand_reviews(reviews)
            # Update review count to reflect the actual number
            metrics["reviewCount"] = len(reviews)
            rankings[brand_id] = metrics
    
    return rankings

@app.get("/api/brands/mock-rankings")
async def get_mock_rankings():
    """Get mock rankings for the initial setup"""
    # Pre-defined mock data for initial display
    return {
        "1": get_mock_metrics("1"),  # Khaadi
        "2": get_mock_metrics("2"),  # Gul Ahmed
        "3": get_mock_metrics("3"),  # Sana Safinaz
        "4": get_mock_metrics("4"),  # Sapphire
        "5": get_mock_metrics("5"),  # Alkaram
    }

def get_mock_metrics(brand_id):
    """Return mock metrics for a brand"""
    # Different mock data for each brand
    mock_data = {
        "1": {  # Khaadi
            "overallScore": 8.7,
            "positiveScore": 75,
            "neutralScore": 20,
            "negativeScore": 5,
            "qualityEmotion": 8.9,
            "styleEmotion": 9.2,
            "valueEmotion": 8.1,
            "serviceEmotion": 8.6,
            "reviewCount": 120
        },
        "2": {  # Gul Ahmed
            "overallScore": 8.3,
            "positiveScore": 70,
            "neutralScore": 22,
            "negativeScore": 8,
            "qualityEmotion": 8.5,
            "styleEmotion": 8.7,
            "valueEmotion": 7.9,
            "serviceEmotion": 8.1,
            "reviewCount": 95
        },
        "3": {  # Sana Safinaz
            "overallScore": 8.9,
            "positiveScore": 80,
            "neutralScore": 15,
            "negativeScore": 5,
            "qualityEmotion": 9.1,
            "styleEmotion": 9.3,
            "valueEmotion": 8.4,
            "serviceEmotion": 8.8,
            "reviewCount": 110
        },
        "4": {  # Sapphire
            "overallScore": 8.1,
            "positiveScore": 68,
            "neutralScore": 24,
            "negativeScore": 8,
            "qualityEmotion": 8.3,
            "styleEmotion": 8.5,
            "valueEmotion": 7.8,
            "serviceEmotion": 7.8,
            "reviewCount": 85
        },
        "5": {  # Alkaram
            "overallScore": 8.5,
            "positiveScore": 72,
            "neutralScore": 21,
            "negativeScore": 7,
            "qualityEmotion": 8.7,
            "styleEmotion": 8.9,
            "valueEmotion": 8.2,
            "serviceEmotion": 8.2,
            "reviewCount": 100
        }
    }
    
    return mock_data.get(brand_id, mock_data["1"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)