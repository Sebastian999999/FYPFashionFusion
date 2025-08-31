import mysql.connector
import pandas as pd
from mysql.connector import Error

# Load CSV data
file_path = '/mnt/data/nishat_women.csv'
csv_data = pd.read_csv('nishat_women.csv')

# Database connection setup
try:
    
    db_connection = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="PokemonDestroyer10000",
    database="fashionfusion",
    auth_plugin='mysql_native_password'
)
    cursor = db_connection.cursor()
    print("Database connection successful!")
except Error as err:
    print(f"Error: Could not connect to the database. {err}")
    exit()

# Function to extract price and special price from the money column
# Function to extract price and special price from the money column
def extract_prices(money_str):
    # Remove any non-numeric characters like 'Rs.' and commas
    cleaned_money_str = money_str.replace('Rs.', '').replace('PKR', '').replace(',', '').strip()
    prices = cleaned_money_str.split(' ')

    # Convert the cleaned price values to floats
    price = float(prices[0]) if len(prices) > 0 and prices[0].isdigit() else None
    special_price = float(prices[1]) if len(prices) > 1 and prices[1].isdigit() else None

    return price, special_price


# Insert data into the Product table
try:
    for index, row in csv_data.iterrows():
        title = row['title']
        description = row['description']
        price, special_price = extract_prices(row['money'])
        url = row['url']
        images = row['images']

        # Insert product into the Product table
        insert_query = """
        INSERT INTO Product (name, price, specialPrice, url, images, description, categoryId, brandId)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            title,
            price,
            special_price,
            url,
            images,
            description,
            None,  # Assuming no category information is available
            None   # Assuming no brand information is available
        ))
        db_connection.commit()
        print(f"Inserted product: {title} into the database")

except Error as e:
    print(f"Error inserting data into the database: {e}")

finally:
    # Close the database connection
    cursor.close()
    db_connection.close()
    print("Database connection closed.")
