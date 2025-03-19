   # sentiment_api/test_model.py
from model import SentimentModel

def test_sentiment_model():
       """Test the sentiment model with some example reviews"""
       try:
           model = SentimentModel()
           
           # Test some example reviews
           test_reviews = [
               {
                   "text": "This product is amazing! I absolutely love it and would recommend to everyone.",
                   "title": "Great product",
                   "recommend": True
               },
               {
                   "text": "Decent quality but not worth the price. I expected better.",
                   "title": "Not impressed",
                   "recommend": False
               },
               {
                   "text": "Average product, nothing special but does the job.",
                   "title": "It's okay",
                   "recommend": None
               }
           ]
           
           print("\nTesting individual review predictions:")
           for i, review in enumerate(test_reviews):
               rating = model.predict_rating(review["text"], review["title"], review["recommend"])
               print(f"Review {i+1}: {rating}/5 stars")
           
           print("\nTesting brand analysis:")
           metrics = model.analyze_brand_reviews(test_reviews)
           print("Brand metrics:")
           for key, value in metrics.items():
               print(f"  {key}: {value}")
           
           print("\nTest completed successfully!")
       except Exception as e:
           print(f"Test failed: {e}")

if __name__ == "__main__":
    test_sentiment_model()