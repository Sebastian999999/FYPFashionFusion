'use client'

import { useRouter } from "next/router";
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Heart, ShoppingCart, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDocs , query , collection} from 'firebase/firestore';

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

export default function ProductPage({ params }: { params: { id: string } }) {
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
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
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/get-reviews/?product_id=${id}`);
        const data = await response.json();
        setReviews(data.reviews); // Assuming your FastAPI returns { reviews: [...] }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    if (id) {
      fetchReviews();
    }

    // Check if user is logged in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        alert("Current user email is : " + currentUser.email);
        // Fetch username from Firestore using email
        const fetchUsername = async () => {
          try {
            if (currentUser) {
              const userQuery = query(collection(db, 'Users'));
              const querySnapshot = await getDocs(userQuery);
        
              let found = false;
        
              querySnapshot.forEach((doc) => {
                if (doc.data().email === currentUser.email) {
                  setUsername(doc.data().username);
                  found = true;
                }
              });
        
              if (!found) {
                console.log("No user found with this email.");
              }
            }
          } catch (error) {
            console.error("Error fetching username from Firestore:", error);
          }
        };
        
        fetchUsername();
      } else {
        setUsername('');
      }
    });

    return () => unsubscribe();
  }, [id]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a review!");
      return;
    }
  
    try {
      const reviewData = {
        product_id: id,
        username: username,
        stars: reviewRating,
        review: reviewComment
      };
  
      const response = await fetch("http://127.0.0.1:8000/add-review/", {
        method: "POST",
        body: JSON.stringify(reviewData),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit review");
      }
  
      // Reset form
      setReviewRating(0);
      setReviewComment('');
      alert("Review submitted!");
  
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(`Error: ${error}`);
    }
  };
  

  if (!product) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <Link href="/product-search" className="flex items-center text-purple-700 hover:text-purple-900">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Search
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <img src={`/product_images/${product.image}`} alt={product.name} className="w-full h-auto rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold text-purple-700 mb-2">{product.name}</h1>
            <p className="text-xl text-pink-600 mb-4">Rs. {product.price}</p>
            <p className="text-gray-600 mb-4">{product.description}</p>
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
              />
            </div>
            <Button type="submit">Submit Review</Button>
          </form>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-purple-600 to-pink-600 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Pakistani Fashion Reviews. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
