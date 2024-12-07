import pymysql
import pandas as pd

# Load the CSV file
csv_path = 'product_data.csv'  # Update this path to the correct location if needed
data = pd.read_csv(csv_path)

# Clean the price column by removing the 'Rs.' symbol and converting it to decimal
data['price'] = data['price'].replace({'Rs.': '', ',': ''}, regex=True).astype(float)

# Set up the MySQL connection
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='1234',
    database='Fasih'
)

try:
    with connection.cursor() as cursor:
        # Insert a default category if none exists
        cursor.execute("SELECT COUNT(*) FROM Category")
        category_count = cursor.fetchone()[0]
        if category_count == 0:
            cursor.execute("INSERT INTO Category (categoryName, details) VALUES ('Default Category', 'Default category details')")
            connection.commit()

        # Insert a default brand if none exists
        cursor.execute("SELECT COUNT(*) FROM Brand")
        brand_count = cursor.fetchone()[0]
        if brand_count == 0:
            cursor.execute("INSERT INTO Brand (name, url, rating) VALUES ('Default Brand', 'http://example.com', 4.5)")
            connection.commit()

        # Retrieve the inserted categoryId and brandId
        cursor.execute("SELECT categoryid FROM Category LIMIT 1")
        category_id = cursor.fetchone()[0]

        cursor.execute("SELECT brandId FROM Brand LIMIT 1")
        brand_id = cursor.fetchone()[0]

        # Insert the CSV data into the Product table
        for index, row in data.iterrows():
            sql = """
            INSERT INTO Product (name, price, url, images, categoryId, brandId)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                row['title'],
                row['price'],
                row['image_link'],
                row['image_link'],  # Assuming the same link for images
                category_id,
                brand_id
            ))

    # Commit the transaction
    connection.commit()
    print("Data insertion complete.")

finally:
    # Close the connection
    connection.close()
