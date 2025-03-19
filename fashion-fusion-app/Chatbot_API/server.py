# chatbot_api/server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import json
import http.client
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RapidAPI configuration
RAPIDAPI_KEY = "90dd642660msh19a117e02201491p1cb44bjsn1ee84cc6cf8b"
RAPIDAPI_HOST = "cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com"

# Store conversation history for each session
conversation_history = {}

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

def get_product_data():
    """Fetch product data from the database API"""
    try:
        response = requests.get("http://localhost:8001/products")
        if response.ok:
            return response.json()
        else:
            print(f"Failed to fetch products: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []

def get_brand_rankings():
    """Fetch brand rankings from the sentiment API"""
    try:
        response = requests.get("http://localhost:8002/api/brands/rankings")
        if response.ok:
            return response.json()
        else:
            print(f"Failed to fetch brand rankings: {response.status_code}")
            return {}
    except Exception as e:
        print(f"Error fetching brand rankings: {e}")
        return {}

def create_system_message():
    """Create a detailed system message with product and brand data"""
    products = get_product_data()
    brand_rankings = get_brand_rankings()
    
    # Create a mapping of brand IDs to names
    brand_names = {}
    for product in products:
        brand_id = product.get('brand_id')
        if brand_id and brand_id not in brand_names:
            brand_names[brand_id] = product.get('brand_name', f"Brand {brand_id}")
    
    # Create brand information section
    brand_info = ""
    for brand_id, metrics in brand_rankings.items():
        brand_name = brand_names.get(brand_id, f"Brand {brand_id}")
        brand_info += f"""
Brand: {brand_name}
Overall Score: {metrics.get('overallScore', 'N/A')}
Positive Reviews: {metrics.get('positiveScore', 'N/A')}%
Quality Score: {metrics.get('qualityEmotion', 'N/A')}
Style Score: {metrics.get('styleEmotion', 'N/A')}
Value Score: {metrics.get('valueEmotion', 'N/A')}
Service Score: {metrics.get('serviceEmotion', 'N/A')}
Total Reviews: {metrics.get('reviewCount', 'N/A')}
"""
    
    # Create product information (limit to avoid token limits)
    product_info = ""
    for product in products[:20]:  # Limit to 20 products to avoid token limits
        product_info += f"""
Product: {product.get('name', 'Unknown')}
Brand: {product.get('brand_name', 'Unknown')}
Category: {product.get('category', 'Unknown')}
Price: PKR {product.get('price', 'Unknown')}
"""
    
    system_message = f"""
You are a helpful assistant for FashionFusion, a fashion aggregator platform that brings together products from multiple Pakistani brands.

FashionFusion is NOT a traditional e-commerce platform - it does not sell products directly. Instead, it:
1. Aggregates products from different brands in one place
2. Allows users to compare products across brands
3. Provides brand rankings based on sentiment analysis of reviews
4. Monitors price changes over time
5. Lets users read and write reviews for products

Here are the top brands we track and their current rankings:
{brand_info}

Here are some of the products available on our platform:
{product_info}

Platform FAQs:
Q: What is FashionFusion?
A: FashionFusion is a fashion aggregator platform that brings together products from multiple Pakistani brands, allowing you to compare products, read reviews, and see brand rankings based on sentiment analysis.

Q: Does FashionFusion sell products directly?
A: No, FashionFusion is not an e-commerce store. We aggregate products from different brands and redirect you to the original brand website for purchases.

Q: How are brands ranked?
A: Brands are ranked based on sentiment analysis of customer reviews. We analyze factors like quality, style, value, and service to generate overall scores.

Focus on helping users find products, understand brand rankings, compare items, and make informed decisions.
"""
    return system_message

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_message: ChatMessage):
    try:
        session_id = chat_message.session_id or "default"
        
        # Get or initialize conversation history
        if session_id not in conversation_history:
            conversation_history[session_id] = [
                {"role": "system", "content": create_system_message()}
            ]
        
        # Add user message to history
        conversation_history[session_id].append(
            {"role": "user", "content": chat_message.message}
        )
        
        # Prepare the payload for RapidAPI
        payload = {
            "messages": conversation_history[session_id],
            "model": "gpt-4o",
            "max_tokens": 500,
            "temperature": 0.7
        }
        
        # Convert payload to JSON string
        payload_json = json.dumps(payload)
        
        # Create connection to RapidAPI
        conn = http.client.HTTPSConnection(RAPIDAPI_HOST)
        
        headers = {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST,
            'Content-Type': "application/json"
        }
        
        # Send request to RapidAPI
        conn.request("POST", "/v1/chat/completions", payload_json, headers)
        
        # Get response
        res = conn.getresponse()
        data = res.read()
        
        # Parse response
        response_data = json.loads(data.decode("utf-8"))
        
        # Extract assistant message
        if "choices" in response_data and len(response_data["choices"]) > 0:
            assistant_message = response_data["choices"][0]["message"]["content"]
            
            # Add assistant response to conversation history
            conversation_history[session_id].append(
                {"role": "assistant", "content": assistant_message}
            )
            
            # Limit conversation history to last 10 messages to avoid token limits
            if len(conversation_history[session_id]) > 12:  # system + 10 exchanges + new message
                # Keep system message and last 10 exchanges
                conversation_history[session_id] = [
                    conversation_history[session_id][0]
                ] + conversation_history[session_id][-10:]
            
            return {
                "response": assistant_message,
                "session_id": session_id
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to get response from API")
            
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return {
            "response": "I'm having trouble connecting to my knowledge base. Please try again later.",
            "session_id": chat_message.session_id or "default"
        }

@app.post("/refresh-knowledge-base")
async def refresh_knowledge_base():
    """Refresh the knowledge base with latest product data and brand rankings"""
    # Clear all conversation histories to force system message refresh
    conversation_history.clear()
    return {"status": "Knowledge base refreshed"}

@app.get("/health")
async def health_check():
    """Health check endpoint for the chatbot API"""
    return {"status": "healthy", "active_sessions": len(conversation_history)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)