import pymysql
import pandas as pd
import numpy as np

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
    'password': 'PokemonDestroyer10000',
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
    description TEXT NULL,
    url TEXT NULL,
    images TEXT NULL,
    categoryId INT NOT NULL,
    brandId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_row (name, price, specialPrice, categoryId, brandId, url(100), images(100))
);
"""

sql_check_duplicate = """
SELECT EXISTS(
    SELECT 1 FROM Product
    WHERE 
        name <=> %s AND
        price <=> %s AND
        specialPrice <=> %s AND
        description <=> %s AND
        categoryId <=> %s AND
        brandId <=> %s AND
        url <=> %s AND
        images <=> %s
) AS is_duplicate;
"""

sql_insert_product = """
INSERT INTO Product (name, price, specialPrice, description , url , images, categoryId, brandId)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
"""

# Function to insert data into the database
def insert_data(connection, data):
    try:
        with connection.cursor() as cursor:
            # Create the Product table if it doesn't exist
            cursor.execute(sql_create_table)
            
            for index, row in data.iterrows():
                try:
                    # Sample categoryId and brandId, adjust these values to your data
                    category_id = 1  # Replace with correct category ID
                    brand_id = 1     # Replace with correct brand ID

                    # Check for duplicates
                    cursor.execute(sql_check_duplicate, (
                        row['title'],
                        row['price'],
                        row['specialPrice'],
                        row['description'],
                        category_id,
                        brand_id,
                        row['url'],
                        row['images']
                    ))
                    is_duplicate = cursor.fetchone()[0]

                    if not is_duplicate:
                        # Insert only if the row is not a duplicate
                        cursor.execute(sql_insert_product, (
                            row['title'],  
                            row['price'],  
                            row['specialPrice'], 
                            row['description'] ,
                            row['url'],  
                            row['images'],  
                            category_id,  
                            brand_id  
                        ))

                except pymysql.MySQLError as e:
                    # Log the error and skip to the next row
                    print(f"Error inserting row {index}: {e}")
                    continue

        # Commit the transaction
        connection.commit()
        print("Data inserted successfully!")

    except Exception as e:
        print(f"An error occurred: {e}")
    
    finally:
        connection.close()
        print("Database connection closed.")

# Call the function to insert data into the database
try:
    insert_data(connection, csv_data_cleaned)
except Exception as e:
    print(f"Failed to insert data: {e}")
