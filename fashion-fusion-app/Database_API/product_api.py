from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional  # Import Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware


# Database connection details
DATABASE_URL = "mysql+pymysql://root:PokemonDestroyer10000@127.0.0.1:3306/fashionfusion"
engine = create_engine(DATABASE_URL, pool_recycle=3600)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Product model
class Product(Base):
    __tablename__ = 'Product'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    price = Column(Float)
    specialPrice = Column(Float, nullable=True)  
    description = Column(String)
    url = Column(String(255))
    images = Column(String(255))
    categoryId = Column(Integer, ForeignKey('Category.id'))
    brandId = Column(Integer, ForeignKey('Brand.id'))
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

# Pydantic model for Product
class ProductOut(BaseModel):
    id: int
    name: str
    price: float
    specialPrice: Optional[float]
    description: str  # Make this field optional
    url: str
    images: str
    categoryId: int
    brandId: int
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True  # Enables reading data from ORM models

# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to fetch products from the database
def get_products_from_db(db: Session, search_query: str = ""):
    if search_query:
        return db.query(Product).filter(Product.name.like(f"%{search_query}%")).all()
    return db.query(Product).all()

app = FastAPI()

# Allow all origins (adjust as necessary for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify frontend's URL, e.g., ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/products/", response_model=List[ProductOut])
async def get_products(search_query: str = "", db: Session = Depends(get_db)):
    """
    Fetch a list of products from the database, optionally filtering by a search query.
    """
    try:
        products = get_products_from_db(db, search_query)
        if not products:
            raise HTTPException(status_code=404, detail="No products found")
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
