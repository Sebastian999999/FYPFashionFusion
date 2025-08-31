/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { ChatHelp } from "@/components/chat-help";
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { CompareButton } from "@/components/ui/compare-button";
import { Star, Heart, ShoppingCart, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, getDocs, query, collection, where } from 'firebase/firestore';
import { SentimentAPI } from '@/lib/api';

const firebaseConfig = {
  apiKey: "AIzaSyDlLplE7VlgZnIjBSz4Raup8jF_OsFMqGE",
  authDomain: "fypfashionfusion.firebaseapp.com",
  projectId: "fypfashionfusion",
  storageBucket: "fypfashionfusion.firebasestorage.app",
  messagingSenderId: "704360142609",
  appId: "1:704360142609:web:f71b16b0f211dde1b81eb0",
  measurementId: "G-B2Y77JTHBX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Define a Product interface
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  url: string;
  price: string;
  image: string;
  description: string;
}

export default function ProductPage() {
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]) // State for reviews
  const [user, setUser] = useState<any>(null) // State for logged-in user
  const [username, setUsername] = useState<string>('') // State for the logged-in user's username
  const searchParams = useSearchParams()

  const id = searchParams.get('id');
  const name = searchParams.get('name');
  const brand = searchParams.get('brand');
  const price = searchParams.get('price');
  const image = searchParams.get('image');
  const category = searchParams.get('category');
  const description = searchParams.get('description');
  const url = searchParams.get('url');
  const [product, setProduct] = useState<Product | null>(null);

  // Fetch reviews function
  const fetchReviews = async () => {
    try {
      if (!id) return;
      
      console.log(`Fetching reviews for product ${id}`);
      const response = await fetch(`http://localhost:8000/get-reviews/?product_id=${id}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
        // Still set reviews to empty array to avoid undefined errors
        setReviews([]);
        return;
      }
      
      const data = await response.json();
      console.log('Reviews data:', data);
      
      // Handle the case where data.reviews is undefined or null
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      // Set reviews to empty array to avoid undefined errors
      setReviews([]);
    }
  };
  
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the review
    if (reviewRating === 0) {
      alert("Please select a rating!");
      return;
    }
    
    if (reviewComment.trim() === '') {
      alert("Please write a review comment!");
      return;
    }
    
    if (!user) {
      alert("Please log in to submit a review!");
      return;
    }
    
    // Use username from state, or fallback to a default if it's empty
    const effectiveUsername = username || 
                             (user.email ? user.email.split('@')[0] : "Anonymous");
  
    try {
      console.log("Submitting review:", {
        product_id: id,
        username: effectiveUsername,
        stars: reviewRating,
        review: reviewComment
      });
      
      const reviewData = {
        product_id: id,
        username: effectiveUsername,
        stars: reviewRating,
        review: reviewComment
      };
  
      // Submit the review to your Reviews API
      const response = await fetch("http://localhost:8000/add-review/", {
        method: "POST",
        body: JSON.stringify(reviewData),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      console.log("Review submission response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit review");
      }
  
      // After successfully adding the review, update brand rankings
      if (product && product.brand) {
        const brandId = SentimentAPI.getBrandIdFromName(product.brand);
        
        if (brandId) {
          try {
            await SentimentAPI.submitReviewAndUpdateRankings({
              text: reviewComment,
              brandId: brandId,
              rating: reviewRating
            });
            
            console.log("Brand rankings updated successfully");
          } catch (updateError) {
            console.error("Failed to update brand rankings:", updateError);
            // Continue execution - don't block the user if this fails
          }
        }
      }
  
      // Reset form
      setReviewRating(0);
      setReviewComment('');
      alert("Review submitted successfully!");
  
      // Add the new review to the local state to show it immediately
      const newReview = {
        id: Date.now().toString(), // Temporary ID
        product_id: id,
        username: effectiveUsername,
        stars: reviewRating,
        review: reviewComment,
        created_at: new Date().toISOString()
      };
      
      setReviews(prevReviews => [newReview, ...prevReviews]);
  
      // Optionally refresh reviews from server
      fetchReviews();
  
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(`Error submitting review: ${error}`);
    }
  };

  useEffect(() => {
    if (id && name && brand && price && image) {
      setProduct({
        id: id as string,
        name: name as string,
        brand: brand as string,
        category: category as string || "Default Category",
        url: url as string,
        price: price as string,
        image: image as string,
        description: description as string,
      });
    }
  
    // Fetch reviews from FastAPI
    if (id) {
      fetchReviews();
    }
  
    // Check if user is logged in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Set a default username based on email immediately
        if (currentUser.email) {
          const defaultUsername = currentUser.email.split('@')[0];
          setUsername(defaultUsername);
          console.log("Using default username:", defaultUsername);
        } else if (currentUser.displayName) {
          setUsername(currentUser.displayName);
        } else {
          setUsername("User" + currentUser.uid.substring(0, 5));
        }
        
        // Then try to fetch the proper username from Firestore
        const fetchUsername = async () => {
          try {
            if (currentUser.email) {
              try {
                // Try querying by email first
                const userQuery = query(
                  collection(db, 'Users'),
                  where('email', '==', currentUser.email)
                );
                
                const querySnapshot = await getDocs(userQuery);
                
                if (!querySnapshot.empty) {
                  const userDoc = querySnapshot.docs[0];
                  setUsername(userDoc.data().username);
                  console.log("Username found:", userDoc.data().username);
                } else {
                  console.log("No user found with email:", currentUser.email);
                  
                  // Try fetching all users as a fallback (not recommended for production)
                  console.log("Attempting to fetch all users...");
                  const allUsersQuery = query(collection(db, 'Users'));
                  const allUsersSnapshot = await getDocs(allUsersQuery);
                  
                  console.log(`Found ${allUsersSnapshot.size} total users`);
                  
                  let found = false;
                  allUsersSnapshot.forEach((doc) => {
                    console.log("Checking user:", doc.id, doc.data().email);
                    if (doc.data().email === currentUser.email) {
                      setUsername(doc.data().username);
                      found = true;
                      console.log("Username found in full collection:", doc.data().username);
                    }
                  });
                  
                  if (!found) {
                    console.log("User not found in full collection either.");
                  }
                }
              } catch (queryError) {
                console.error("Error with where query:", queryError);
                // Fallback to full collection query
                console.log("Falling back to full collection query");
                const allUsersQuery = query(collection(db, 'Users'));
                const allUsersSnapshot = await getDocs(allUsersQuery);
                
                let found = false;
                allUsersSnapshot.forEach((doc) => {
                  if (doc.data().email === currentUser.email) {
                    setUsername(doc.data().username);
                    found = true;
                  }
                });
                
                if (!found) {
                  console.log("No user found with this email.");
                }
              }
            }
          } catch (error) {
            console.error("Error fetching username from Firestore:", error);
            // We already set a fallback username above
          }
        };
        
        fetchUsername();
      } else {
        setUsername('');
      }
    });
  
    return () => unsubscribe();
  }, [id, name, brand, price, image, category, description, url]);

  if (!product) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <img src={`/product_images/${product.image}`} alt={product.name} className="w-full h-auto rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold text-purple-700 mb-2">{product.name}</h1>
            <p className="text-xl text-pink-600 mb-4">Rs. {product.price}</p>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="mt-4">
            <ChatHelp 
              question={`Tell me more about ${product.name} by ${product.brand}`}
              buttonText="Ask about this product"
            />
          </div>
            <div className="flex items-center mb-4">
              <p className="font-semibold mr-2">Brand:</p>
              <p>{product.brand}</p>
            </div>
            <div className="flex items-center mb-6">
              <p className="font-semibold mr-2">Category:</p>
              <p>{product.category}</p>
            </div>
            <div className="flex space-x-4 mb-8">
              <Button className="flex-1">
                <Link href={product.url} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Link>
              </Button>
              <Button variant="outline" className="flex-1">
                <Heart className="w-5 h-5 mr-2" />
                Add to Wishlist
              </Button>

              <CompareButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: parseFloat(product.price),
                  description: product.description,
                  image: product.image,
                  brand: product.brand,
                  category: product.category,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <p className="font-semibold mr-2">{review.username}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < review.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p>{review.review}</p>
                </CardContent>
              </Card>
            ))
          )}

          <h3 className="text-xl font-bold text-purple-700 mt-8 mb-4">Add Your Review</h3>
          {user ? (
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`w-8 h-8 ${reviewRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="w-full h-full fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                <Textarea
                  id="comment"
                  value={reviewComment}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewComment(e.target.value)}
                  rows={4}
                  placeholder="Write your review here..."
                  className="w-full"
                  required
                />
              </div>
              <Button type="submit" disabled={reviewRating === 0 || reviewComment.trim() === ''}>
                Submit Review
              </Button>
              
            </form>
          ) : (
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-gray-700">Please log in to submit a review.</p>
              <Link href="/login">
                <Button className="mt-2">Log In</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}