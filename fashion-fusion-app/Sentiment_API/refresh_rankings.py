# sentiment_api/refresh_rankings.py
import requests
import time
import schedule

def refresh_all_brand_rankings():
    """Refresh rankings for all brands"""
    brands = ["1", "2", "3", "4", "5"]  # Brand IDs
    
    for brand_id in brands:
        try:
            print(f"Refreshing rankings for brand {brand_id}...")
            response = requests.post(f"http://localhost:8000/update-brand-rankings/?brand_id={brand_id}")
            
            if response.ok:
                result = response.json()
                print(f"Successfully refreshed brand {brand_id} with {result.get('reviews_processed', 0)} reviews")
            else:
                print(f"Failed to refresh brand {brand_id}: {response.status_code} {response.text}")
        except Exception as e:
            print(f"Error refreshing brand {brand_id}: {str(e)}")
    
    print("Refresh completed")

def main():
    # Refresh immediately on startup
    refresh_all_brand_rankings()
    
    # Schedule to run daily at midnight
    schedule.every().day.at("00:00").do(refresh_all_brand_rankings)
    
    print("Ranking refresh scheduler started. Press Ctrl+C to exit.")
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        print("Scheduler stopped")

if __name__ == "__main__":
    main()