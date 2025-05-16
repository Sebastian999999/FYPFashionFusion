from fastapi import FastAPI, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
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
    
    # Price monitoring fields
    firstPrice = Column(Float, nullable=True)
    previousPrice = Column(Float, nullable=True)
    priceLastUpdated = Column(DateTime, nullable=True)
    priceIncreased = Column(Boolean, default=False)
    
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

# Pydantic model for price change information
class PriceChangeInfo(BaseModel):
    increased: bool
    previousPrice: float
    percentChange: float
    firstPrice: Optional[float] = None
    lastUpdated: Optional[datetime] = None

# Pydantic model for Product
class ProductOut(BaseModel):
    id: int
    name: str
    price: float
    specialPrice: Optional[float] = None
    description: Optional[str] = None
    url: Optional[str] = None
    images: str
    categoryId: int
    brandId: int
    createdAt: datetime
    updatedAt: datetime
    priceChangeInfo: Optional[PriceChangeInfo] = None

    class Config:
        from_attributes = True  # Enables reading data from ORM models

# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI()

# Allow all origins (adjust as necessary for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify frontend's URL, e.g., ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add a dedicated endpoint for products with price changes
@app.get("/products/price-changes/", response_model=List[ProductOut])
async def get_price_changes(
    days: Optional[int] = Query(30),
    increased_only: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get products that have had price changes in the specified time period.
    """
    try:
        # Start with base query for products with price changes
        query = db.query(Product).filter(Product.previousPrice.isnot(None))
        
        # Filter by price increase/decrease if specified
        if increased_only is not None:
            query = query.filter(Product.priceIncreased == increased_only)
        
        # Get products
        products = query.all()
        
        # Transform to include price change info
        response_products = []
        for product in products:
            product_dict = {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "specialPrice": product.specialPrice,
                "description": product.description,
                "url": product.url,
                "images": product.images,
                "categoryId": product.categoryId,
                "brandId": product.brandId,
                "createdAt": product.createdAt,
                "updatedAt": product.updatedAt,
                "priceChangeInfo": None
            }
            
            # Only include products with price changes
            if product.previousPrice is not None and product.price != product.previousPrice:
                if product.priceIncreased:
                    # Price increased
                    percent_change = ((product.price - product.previousPrice) / product.previousPrice) * 100
                    product_dict["priceChangeInfo"] = {
                        "increased": True,
                        "previousPrice": product.previousPrice,
                        "percentChange": percent_change,
                        "firstPrice": product.firstPrice,
                        "lastUpdated": product.priceLastUpdated
                    }
                else:
                    # Price decreased
                    percent_change = ((product.previousPrice - product.price) / product.previousPrice) * 100
                    product_dict["priceChangeInfo"] = {
                        "increased": False,
                        "previousPrice": product.previousPrice,
                        "percentChange": percent_change,
                        "firstPrice": product.firstPrice,
                        "lastUpdated": product.priceLastUpdated
                    }
                
                response_products.append(product_dict)
        
        return response_products
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/products-by-brand/{brand_id}")
async def get_products_by_brand(brand_id: int, db: Session = Depends(get_db)):
    """
    Fetch products by brand ID from the database.
    """
    try:
        products = db.query(Product).filter(Product.brandId == brand_id).all()
        if not products:
            raise HTTPException(status_code=404, detail=f"No products found for brand ID {brand_id}")
        
        # Transform products to include price change info
        response_products = []
        for product in products:
            product_dict = {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "specialPrice": product.specialPrice,
                "description": product.description,
                "url": product.url,
                "images": product.images,
                "categoryId": product.categoryId,
                "brandId": product.brandId,
                "createdAt": product.createdAt,
                "updatedAt": product.updatedAt,
                "priceChangeInfo": None
            }
            
            # Add price change information if available
            if hasattr(product, 'previousPrice') and product.previousPrice is not None and product.price != product.previousPrice:
                if hasattr(product, 'priceIncreased') and product.priceIncreased:
                    # Price increased
                    percent_change = ((product.price - product.previousPrice) / product.previousPrice) * 100
                    product_dict["priceChangeInfo"] = {
                        "increased": True,
                        "previousPrice": product.previousPrice,
                        "percentChange": percent_change,
                        "firstPrice": product.firstPrice if hasattr(product, 'firstPrice') else None,
                        "lastUpdated": product.priceLastUpdated if hasattr(product, 'priceLastUpdated') else None
                    }
                else:
                    # Price decreased
                    percent_change = ((product.previousPrice - product.price) / product.previousPrice) * 100
                    product_dict["priceChangeInfo"] = {
                        "increased": False,
                        "previousPrice": product.previousPrice,
                        "percentChange": percent_change,
                        "firstPrice": product.firstPrice if hasattr(product, 'firstPrice') else None,
                        "lastUpdated": product.priceLastUpdated if hasattr(product, 'priceLastUpdated') else None
                    }
            
            response_products.append(product_dict)
        
        return response_products
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/products/", response_model=List[ProductOut])
async def get_products(
    search_query: str = "", 
    category_id: Optional[List[int]] = Query(None),
    brand_id: Optional[List[int]] = Query(None),
    price_min: Optional[float] = Query(None),
    price_max: Optional[float] = Query(None),
    price_increased: Optional[bool] = Query(None),
    price_decreased: Optional[bool] = Query(None),
    has_price_change: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Fetch a list of products from the database with optional filtering.
    """
    # Log request parameters for debugging
    print(f"API Request Parameters:")
    print(f"  search_query: {search_query}")
    print(f"  category_id: {category_id}")
    print(f"  brand_id: {brand_id}")
    print(f"  price_min: {price_min}")
    print(f"  price_max: {price_max}")
    print(f"  price_increased: {price_increased}")
    print(f"  price_decreased: {price_decreased}")
    print(f"  has_price_change: {has_price_change}")
    
    try:
        # Start with base query
        query = db.query(Product)
        
        # Apply filters
        if search_query:
            query = query.filter(Product.name.like(f"%{search_query}%"))
        if category_id:
            query = query.filter(Product.categoryId.in_(category_id))
        if brand_id:
            query = query.filter(Product.brandId.in_(brand_id))
        if price_min is not None:
            query = query.filter(Product.price >= price_min)
        if price_max is not None:
            query = query.filter(Product.price <= price_max)
            
        # Price change filters
        if has_price_change:
            # Show any products with price changes
            query = query.filter(Product.previousPrice.isnot(None))
        elif price_increased:
            # Show only price increases
            query = query.filter(Product.priceIncreased == True)
            query = query.filter(Product.previousPrice.isnot(None))
        elif price_decreased:
            # Show only price decreases
            query = query.filter(Product.priceIncreased == False)
            query = query.filter(Product.previousPrice.isnot(None))
        
        # Execute query
        products = query.all()
        
        if not products:
            # Return empty list instead of 404 error for empty results
            return []
        
        # Transform products to include price change info
        response_products = []
        for product in products:
            product_dict = {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "specialPrice": product.specialPrice,
                "description": product.description,
                "url": product.url,
                "images": product.images,
                "categoryId": product.categoryId,
                "brandId": product.brandId,
                "createdAt": product.createdAt,
                "updatedAt": product.updatedAt,
                "priceChangeInfo": None
            }
            
            # Add price change information if available
            if hasattr(product, 'previousPrice') and product.previousPrice is not None and product.price != product.previousPrice:
                if hasattr(product, 'priceIncreased') and product.priceIncreased:
                    # Price increased
                    percent_change = ((product.price - product.previousPrice) / product.previousPrice) * 100
                    product_dict["priceChangeInfo"] = {
                        "increased": True,
                        "previousPrice": product.previousPrice,
                        "percentChange": percent_change,
                        "firstPrice": product.firstPrice if hasattr(product, 'firstPrice') else None,
                        "lastUpdated": product.priceLastUpdated if hasattr(product, 'priceLastUpdated') else None
                    }
                else:
                    # Price decreased
                    percent_change = ((product.previousPrice - product.price) / product.previousPrice) * 100
                    product_dict["priceChangeInfo"] = {
                        "increased": False,
                        "previousPrice": product.previousPrice,
                        "percentChange": percent_change,
                        "firstPrice": product.firstPrice if hasattr(product, 'firstPrice') else None,
                        "lastUpdated": product.priceLastUpdated if hasattr(product, 'priceLastUpdated') else None
                    }
            
            response_products.append(product_dict)
        
        return response_products
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
@app.get("/products/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    try:
        # Try to convert to int if it's a numeric string
        product_id_int = int(product_id) if product_id.isdigit() else None
        
        # Query the product
        if product_id_int is not None:
            product = db.query(Product).filter(Product.id == product_id_int).first()
        else:
            # Handle non-numeric IDs if needed
            product = db.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Create response with price change info
        response = {
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "specialPrice": product.specialPrice,
            "description": product.description,
            "url": product.url,
            "images": product.images,
            "categoryId": product.categoryId,
            "brandId": product.brandId,
            "createdAt": product.createdAt,
            "updatedAt": product.updatedAt,
            "priceChangeInfo": None
        }
        
        # Add price change information if available
        if hasattr(product, 'previousPrice') and product.previousPrice is not None and product.price != product.previousPrice:
            if hasattr(product, 'priceIncreased') and product.priceIncreased:
                # Price increased
                percent_change = ((product.price - product.previousPrice) / product.previousPrice) * 100
                response["priceChangeInfo"] = {
                    "increased": True,
                    "previousPrice": product.previousPrice,
                    "percentChange": percent_change,
                    "firstPrice": product.firstPrice if hasattr(product, 'firstPrice') else None,
                    "lastUpdated": product.priceLastUpdated if hasattr(product, 'priceLastUpdated') else None
                }
            else:
                # Price decreased
                percent_change = ((product.previousPrice - product.price) / product.previousPrice) * 100
                response["priceChangeInfo"] = {
                    "increased": False,
                    "previousPrice": product.previousPrice,
                    "percentChange": percent_change,
                    "firstPrice": product.firstPrice if hasattr(product, 'firstPrice') else None,
                    "lastUpdated": product.priceLastUpdated if hasattr(product, 'priceLastUpdated') else None
                }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")