# sentiment_api/model.py
import pickle
import re
import numpy as np
from scipy.sparse import hstack
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import os

# Download NLTK data
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('punkt_tab')

class SentimentModel:
       def __init__(self, model_path="xgb_model.pkl", vectorizer_path="count_vectorizer.pkl"):
           """Initialize the sentiment model with your trained model from Kaggle"""
           # Initialize stemmer and stopwords
           self.ps = PorterStemmer()
           self.stop_words = set(stopwords.words('english'))
           
           # Load the model and vectorizer
           try:
               with open(model_path, 'rb') as f:
                   self.model = pickle.load(f)
                   
               with open(vectorizer_path, 'rb') as f:
                   self.vectorizer = pickle.load(f)
               
               print("Model and vectorizer loaded successfully!")
           except FileNotFoundError as e:
               print(f"Error: {e}")
               print("Please make sure you've downloaded the model files from Kaggle and placed them in this directory.")
               raise
       
       def preprocess_text(self, text):
           """Preprocess text for sentiment analysis"""
           if not isinstance(text, str):
               text = ""
           
           # Clean text
           clean = re.sub('[^a-zA-Z]', ' ', text)
           clean = clean.lower()
           
           # Tokenize
           tokens = word_tokenize(clean)
           
           # Remove stopwords and stem
           stemmed = [self.ps.stem(word) for word in tokens if word not in self.stop_words]
           
           # Join tokens back to string
           return ' '.join(stemmed)
       
       def predict_rating(self, text, title="", recommend=True):
           """Predict rating (1-5) for a given review"""
           # Combine title and text
           combined_text = f"{title} {text}"
           
           # Preprocess
           processed_text = self.preprocess_text(combined_text)
           
           # Transform with vectorizer
           text_features = self.vectorizer.transform([processed_text])
           
           # Add recommendation feature
           recommend_value = 1 if recommend else 0
           recommend_feature = np.array([recommend_value]).reshape(1, -1)
           
           # Combine features
           features = hstack([text_features, recommend_feature])
           
           # Predict (returns 0-4, add 1 to get 1-5 rating)
           prediction = self.model.predict(features)
           return int(prediction[0] + 1)
       
       def analyze_brand_reviews(self, reviews):
           """Analyze a list of reviews for a brand and return sentiment metrics"""
           if not reviews:
               return self._empty_sentiment_metrics()
           
           ratings = []
           for review in reviews:
               text = review.get('text', '')
               title = review.get('title', '')
               recommend = review.get('recommend', True)
               
               if not text:  # Skip empty reviews
                   continue
               
               rating = self.predict_rating(text, title, recommend)
               ratings.append(rating)
           
           if not ratings:
               return self._empty_sentiment_metrics()
           
           # Calculate metrics
           return self._calculate_sentiment_metrics(ratings)
       
       def _empty_sentiment_metrics(self):
           """Return empty sentiment metrics structure"""
           return {
               "overallScore": 0,
               "positiveScore": 0,
               "neutralScore": 0,
               "negativeScore": 0,
               "qualityEmotion": 0,
               "styleEmotion": 0,
               "valueEmotion": 0,
               "serviceEmotion": 0,
               "reviewCount": 0
           }
       
       def _calculate_sentiment_metrics(self, ratings):
           """Calculate sentiment metrics from a list of ratings"""
           total = len(ratings)
           avg_rating = sum(ratings) / total
           
           # Count ratings by category
           positive = sum(1 for r in ratings if r >= 4)
           negative = sum(1 for r in ratings if r <= 2)
           neutral = sum(1 for r in ratings if r == 3)
           
           # Calculate percentages
           positive_pct = (positive / total) * 100
           neutral_pct = (neutral / total) * 100
           negative_pct = (negative / total) * 100
           
           # Generate emotion scores (simulate different aspects)
           # In a real implementation, you'd analyze text for specific aspects
           base_score = avg_rating
           quality_score = min(5, base_score * 1.05)
           style_score = min(5, base_score * 1.1)
           value_score = max(1, base_score * 0.95)
           service_score = base_score
           
           return {
               "overallScore": avg_rating * 2,  # Scale to 0-10
               "positiveScore": positive_pct,
               "neutralScore": neutral_pct,
               "negativeScore": negative_pct,
               "qualityEmotion": quality_score * 2,  # Scale to 0-10
               "styleEmotion": style_score * 2,
               "valueEmotion": value_score * 2,
               "serviceEmotion": service_score * 2,
               "reviewCount": total
           }