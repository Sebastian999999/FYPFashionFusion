from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Text
from sqlalchemy.orm import sessionmaker

# Database connection URL (update with your MySQL credentials)
DATABASE_URL = "mysql+pymysql://root:PokemonDestroyer10000@127.0.0.1:3306/fashionfusion"

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
metadata = MetaData()

# Define the reviews table
reviews_table = Table(
    "reviews",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("product_id", String(255), nullable=False),
    Column("username", String(255), nullable=False),
    Column("stars", Integer, nullable=False),
    Column("review", Text, nullable=False),
)

# Create the table if it doesn't exist
metadata.create_all(bind=engine)
