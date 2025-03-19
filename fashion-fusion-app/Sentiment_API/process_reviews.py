# sentiment_api/process_reviews.py
import pandas as pd
import os
import json

def map_store_to_brand(store_name):
    """Map Google Maps store names to your brand IDs"""
    # This mapping should be customized based on your specific brand names
    # Add more mappings as needed
    store_to_brand = {
        "Khaadi": "1",
        "Khaadi Clothing": "1",
        "Khaadi Store": "1",
        "Gul Ahmed": "2",
        "Gul Ahmed Ideas": "2",
        "Gul Ahmed Fashion": "2",
        "Sana Safinaz": "3",
        "Sapphire": "4",
        "Sapphire Pakistan": "4",
        "Alkaram": "5",
        "Alkaram Studio": "5"
    }
    
    # Try to find a match by checking if any key is contained in the store name
    for key, value in store_to_brand.items():
        if key.lower() in store_name.lower():
            return value
    
    # If no match is found
    print(f"No brand mapping found for store: {store_name}")
    return None

def process_google_reviews(csv_path="GoogleMaps/all_reviews.csv"):
    """Process Google Maps reviews and organize them by brand"""
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found!")
        return {}
    
    # Read the CSV file
    try:
        reviews_df = pd.read_csv(csv_path, encoding='utf-8')
        print(f"Successfully loaded {len(reviews_df)} reviews from {csv_path}")
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return {}
    
    # Group reviews by brand
    brand_reviews = {}
    
    for _, row in reviews_df.iterrows():
        store_name = row['Store Name']
        brand_id = map_store_to_brand(store_name)
        
        if not brand_id:
            continue
        
        review_text = row['Review Text']
        rating = row['Rating']
        
        # Skip if missing essential data
        if pd.isna(review_text) or pd.isna(rating):
            continue
        
        # Convert rating to float and check if it's valid
        try:
            rating_value = float(rating)
            if rating_value < 1 or rating_value > 5:
                continue
        except:
            continue
        
        # Create review object
        review = {
            "text": review_text,
            "title": f"Review for {store_name}",
            "recommend": rating_value >= 4  # Assume 4-5 stars means recommend
        }
        
        # Add to the appropriate brand
        if brand_id not in brand_reviews:
            brand_reviews[brand_id] = []
        
        brand_reviews[brand_id].append(review)
    
    # Save processed reviews to a JSON file for later use
    with open('processed_reviews.json', 'w', encoding='utf-8') as f:
        json.dump(brand_reviews, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\nReviews summary by brand:")
    for brand_id, reviews in brand_reviews.items():
        print(f"Brand {brand_id}: {len(reviews)} reviews")
    
    return brand_reviews

if __name__ == "__main__":
    # Process reviews from the CSV file
    brand_reviews = process_google_reviews()
    
    if brand_reviews:
        print("\nProcessed reviews saved to processed_reviews.json")
    else:
        print("\nNo reviews were processed. Please check your CSV file.")