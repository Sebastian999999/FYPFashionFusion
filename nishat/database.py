import pymysql
import pandas as pd
import numpy as np
from datetime import datetime

# Load the CSV file (replace with your file path)
csv_file_path = "nishat_women.csv"

# Load the CSV into a DataFrame
csv_data = pd.read_csv(csv_file_path)

# Clean the 'money' column to split price and specialPrice
csv_data['money_split'] = csv_data['money'].str.replace('Rs. ', '').str.split(' ', n=1)

# Extract the 'price' and 'specialPrice' from the 'money' column
csv_data['price'] = csv_data['money_split'].apply(lambda x: x[0] if len(x) > 0 else None)
csv_data['specialPrice'] = csv_data['money_split'].apply(lambda x: x[1] if len(x) > 1 else None)

# Convert price and specialPrice to numeric, removing commas
csv_data['price'] = pd.to_numeric(csv_data['price'].str.replace(',', ''), errors='coerce')
csv_data['specialPrice'] = pd.to_numeric(csv_data['specialPrice'].str.replace(',', ''), errors='coerce')

# Drop unnecessary columns
csv_data_cleaned = csv_data.drop(columns=['money', 'money_split'])

# Replace NaN with None (which translates to NULL in MySQL)
csv_data_cleaned = csv_data_cleaned.replace({np.nan: None})

# Database connection details
db_config = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'much',
    'database': 'fashionfusion'
}

# Establish a connection to the MySQL database with error handling
try:
    connection = pymysql.connect(**db_config)
    print("Connected to the database successfully!")
except pymysql.MySQLError as e:
    print(f"Error connecting to the database: {e}")
    exit()

# SQL statements
sql_create_table = """
CREATE TABLE IF NOT EXISTS Product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NULL,
    specialPrice DECIMAL(10, 2) NULL,
    firstPrice DECIMAL(10, 2) NULL,
    previousPrice DECIMAL(10, 2) NULL,
    priceLastUpdated TIMESTAMP NULL,
    priceIncreased BOOLEAN DEFAULT FALSE,
    description TEXT NULL,
    url TEXT NULL,
    images TEXT NULL,
    categoryId INT NOT NULL,
    brandId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_row (name, categoryId, brandId, url(100), images(100))
);
"""

# SQL to check if product exists
sql_check_product = """
SELECT id, price, firstPrice FROM Product
WHERE url = %s
"""

# SQL to check for duplicates (based on name, URL, etc.)
sql_check_duplicate = """
SELECT EXISTS(
    SELECT 1 FROM Product
    WHERE 
        name <=> %s AND
        categoryId <=> %s AND
        brandId <=> %s AND
        url <=> %s
) AS is_duplicate;
"""

# SQL to insert a new product
sql_insert_product = """
INSERT INTO Product (
    name, price, specialPrice, firstPrice, description, url, images, 
    categoryId, brandId, priceLastUpdated
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

# SQL to update an existing product
sql_update_product = """
UPDATE Product 
SET 
    name = %s,
    previousPrice = price,
    price = %s,
    specialPrice = %s,
    priceLastUpdated = %s,
    priceIncreased = CASE WHEN %s > price THEN TRUE ELSE FALSE END,
    description = %s,
    images = %s,
    updatedAt = CURRENT_TIMESTAMP
WHERE id = %s
"""

# Function to insert or update data in the database
def insert_or_update_data(connection, data):
    try:
        with connection.cursor() as cursor:
            # Create the Product table if it doesn't exist
            cursor.execute(sql_create_table)
            
            for index, row in data.iterrows():
                try:
                    # Sample categoryId and brandId, adjust these values to your data
                    category_id = 1  # Replace with correct category ID
                    brand_id = 1     # Replace with correct brand ID
                    
                    # Check if the product already exists
                    cursor.execute("SELECT id, price, firstPrice FROM Product WHERE url = %s", (row['url'],))
                    existing_product = cursor.fetchone()
                    
                    # Current timestamp for updates
                    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    
                    if existing_product:
                        # Product exists, update it
                        product_id, current_price, first_price = existing_product
                        new_price = row['price']
                        
                        # Only update if price has changed
                        if float(current_price) != float(new_price):
                            # Update product with price change tracking
                            cursor.execute("""
                                UPDATE Product 
                                SET 
                                    name = %s,
                                    previousPrice = price,
                                    price = %s,
                                    specialPrice = %s,
                                    priceLastUpdated = %s,
                                    priceIncreased = CASE WHEN %s > price THEN TRUE ELSE FALSE END,
                                    description = %s,
                                    images = %s,
                                    updatedAt = CURRENT_TIMESTAMP
                                WHERE id = %s
                            """, (
                                row['title'],
                                new_price,
                                row['specialPrice'],
                                current_time,
                                new_price,  # For the priceIncreased comparison
                                row['description'],
                                row['images'],
                                product_id
                            ))
                            print(f"Updated product {row['title']} with price tracking. Old price: {current_price}, New price: {new_price}")
                        else:
                            # Price hasn't changed, just update other fields if needed
                            cursor.execute("""
                                UPDATE Product 
                                SET 
                                    name = %s,
                                    specialPrice = %s,
                                    description = %s,
                                    images = %s,
                                    updatedAt = CURRENT_TIMESTAMP
                                WHERE id = %s
                            """, (
                                row['title'],
                                row['specialPrice'],
                                row['description'],
                                row['images'],
                                product_id
                            ))
                            print(f"Updated product {row['title']} (no price change)")
                    else:
                        # New product, insert it
                        cursor.execute("""
                            INSERT INTO Product (
                                name, price, specialPrice, firstPrice, description, url, images, 
                                categoryId, brandId, priceLastUpdated
                            )
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            row['title'],
                            row['price'],
                            row['specialPrice'],
                            row['price'],  # firstPrice = initial price
                            row['description'],
                            row['url'],
                            row['images'],
                            category_id,
                            brand_id,
                            current_time  # priceLastUpdated
                        ))
                        print(f"Inserted new product: {row['title']} with initial price: {row['price']}")
                        
                except pymysql.MySQLError as e:
                    print(f"Error processing row {index}: {e}")
                    continue
                    
            # Commit the transaction
            connection.commit()
            print("Data inserted/updated successfully!")
            
    except Exception as e:
        print(f"An error occurred: {e}")
        
    finally:
        connection.close()
        print("Database connection closed.")



# Add function to update schema of existing table if needed
def update_existing_table_schema(connection):
    try:
        with connection.cursor() as cursor:
            # Check if the columns already exist
            cursor.execute("SHOW COLUMNS FROM Product LIKE 'firstPrice'")
            first_price_exists = cursor.fetchone() is not None
            
            cursor.execute("SHOW COLUMNS FROM Product LIKE 'previousPrice'")
            previous_price_exists = cursor.fetchone() is not None
            
            cursor.execute("SHOW COLUMNS FROM Product LIKE 'priceLastUpdated'")
            price_last_updated_exists = cursor.fetchone() is not None
            
            cursor.execute("SHOW COLUMNS FROM Product LIKE 'priceIncreased'")
            price_increased_exists = cursor.fetchone() is not None
            
            # Add columns if they don't exist
            if not first_price_exists:
                cursor.execute("ALTER TABLE Product ADD COLUMN firstPrice DECIMAL(10, 2) NULL")
                # Initialize firstPrice with current price for existing records
                cursor.execute("UPDATE Product SET firstPrice = price WHERE firstPrice IS NULL")
                print("Added firstPrice column and initialized with current price")
                
            if not previous_price_exists:
                cursor.execute("ALTER TABLE Product ADD COLUMN previousPrice DECIMAL(10, 2) NULL")
                print("Added previousPrice column")
                
            if not price_last_updated_exists:
                cursor.execute("ALTER TABLE Product ADD COLUMN priceLastUpdated TIMESTAMP NULL")
                # Initialize with current timestamp
                cursor.execute("UPDATE Product SET priceLastUpdated = NOW() WHERE priceLastUpdated IS NULL")
                print("Added priceLastUpdated column and initialized with current timestamp")
                
            if not price_increased_exists:
                cursor.execute("ALTER TABLE Product ADD COLUMN priceIncreased BOOLEAN DEFAULT FALSE")
                print("Added priceIncreased column")
                
            # Update the unique constraint if needed
            cursor.execute("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'Product' 
                AND INDEX_NAME = 'unique_row'
            """)
            
            if cursor.fetchone()[0] > 0:
                # Drop the old unique constraint
                cursor.execute("ALTER TABLE Product DROP INDEX unique_row")
                
            # Add the new unique constraint
            cursor.execute("""
                ALTER TABLE Product 
                ADD CONSTRAINT unique_row 
                UNIQUE KEY (name(100), categoryId, brandId, url(100), images(100))
            """)
            
            print("Updated table schema successfully")
            connection.commit()
            
    except pymysql.MySQLError as e:
        print(f"Error updating table schema: {e}")

# Main execution
try:
    # First update the table schema if needed
    update_existing_table_schema(connection)
    
    # Then insert or update the data
    insert_or_update_data(connection, csv_data_cleaned)
    
except Exception as e:
    print(f"Failed to process data: {e}")