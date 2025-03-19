import requests
import csv
import os


RAPIDAPI_KEY = "4d793452c8msh6e43f3307f5cbd2p12f27fjsn73613c700c7f"


RAPIDAPI_HOST = "google-map-places.p.rapidapi.com"

def get_places_from_text_search(query, location=None, radius=None, opennow=None):
    
    url = f"https://{RAPIDAPI_HOST}/maps/api/place/textsearch/json"
    
    query_params = {
        "query": query,
        "language": "en",
        "region": "en"
    }
    if location:
        query_params["location"] = location
    if radius:
        query_params["radius"] = radius
    if opennow:
        query_params["opennow"] = opennow

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }

    try:
        response = requests.get(url, headers=headers, params=query_params)
        response.raise_for_status()

        data = response.json()
        if "results" in data and len(data["results"]) > 0:
            return data["results"]
        else:
            print("No results found for the given query.")
            return []
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return []

def get_place_details(place_id, store_name, csv_writer):
    
    url = f"https://{RAPIDAPI_HOST}/maps/api/place/details/json"

    query_params = {
        "place_id": place_id,
        "fields": "name,formatted_address,formatted_phone_number,website,opening_hours,reviews",
        "language": "en",
    }

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }

    try:
        response = requests.get(url, headers=headers, params=query_params)
        response.raise_for_status()

        data = response.json()
        if "result" in data:
            result = data["result"]
            address = result.get("formatted_address", "N/A")
            phone = result.get("formatted_phone_number", "N/A")
            website = result.get("website", "N/A")
            opening_hours = result.get("opening_hours", {}).get("weekday_text", [])
            reviews = result.get("reviews", [])

            print(f"\nDetails for {store_name}:")
            print(f"Address: {address}")
            print(f"Phone: {phone}")
            print(f"Website: {website}")
            print(f"Opening Hours: {', '.join(opening_hours)}")
            
            print("\nReviews:")
            for review in reviews:
                author = review.get("author_name", "Anonymous")
                rating = review.get("rating", "No rating")
                text = review.get("text", "No review text")
                time_desc = review.get("relative_time_description", "N/A")
                print(f"- {author} ({rating}): {text} [{time_desc}]")

                # Append the review to the CSV file
                csv_writer.writerow([
                    store_name, address, phone, website, ", ".join(opening_hours),
                    author, rating, text, time_desc
                ])
        else:
            print(f"No details found for place_id {place_id}.")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Set up the CSV file
    csv_file = "all_reviews.csv"
    file_exists = os.path.isfile(csv_file)
    
    with open(csv_file, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        
        # Write the CSV header only if the file is new
        if not file_exists:
            writer.writerow([
                "Store Name", "Address", "Phone Number", "Website", "Opening Hours",
                "Author Name", "Rating", "Review Text", "Time Description"
            ])

        # Use Text Search API
        query = input("Enter your query (e.g., 'restaurants in Sydney'): ")
        location = input("Enter location coordinates (latitude,longitude) or leave blank: ").strip()
        radius = input("Enter search radius in meters or leave blank: ").strip()
        opennow = input("Should the place be open now? (yes/no or leave blank): ").strip().lower()
        opennow = True if opennow == "yes" else None

        results = get_places_from_text_search(query, location if location else None, radius if radius else None, opennow)

        if results:
            for result in results:
                place_id = result.get("place_id")
                store_name = result.get("name", "Unknown")
                print(f"\nFetching details for: {store_name}")
                
                # Get details and append reviews to the CSV file
                if place_id:
                    get_place_details(place_id, store_name, writer)
                else:
                    print(f"Could not retrieve details for {store_name}.")
        else:
            print("No places found.")
    
    print(f"\nAll reviews saved to {csv_file}")
