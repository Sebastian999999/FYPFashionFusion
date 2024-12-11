from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.sql import select
from sqlalchemy.exc import SQLAlchemyError
from database import engine, reviews_table
from fastapi import FastAPI
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

@app.post("/add-review/")
def add_review(review: Review):
    if review.stars < 1 or review.stars > 5:
        raise HTTPException(status_code=400, detail="Stars rating must be between 1 and 5")

    with engine.connect() as conn:
        insert_query = reviews_table.insert().values(
            product_id=review.product_id,
            username=review.username,
            stars=review.stars,
            review=review.review
        )
        conn.execute(insert_query)
        conn.commit()

    return {"message": "Review added successfully!"}

# GET endpoint to retrieve reviews by product_id
# GET endpoint to retrieve reviews by product_id
@app.get("/get-reviews/")
def get_reviews(product_id: str):
    try:
        with engine.connect() as conn:
            query = select(reviews_table).where(reviews_table.c.product_id == product_id)
            result = conn.execute(query).fetchall()
            reviews = [dict(row._mapping) for row in result]
            return {"reviews": reviews}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

