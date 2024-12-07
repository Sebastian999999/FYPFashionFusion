'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Heart, ShoppingCart, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Define a Product interface
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  image: string;
  description: string;
}
// Simulated reviews data
const reviews = [
  { id: 1, user: "Amina", rating: 5, comment: "Absolutely gorgeous! The embroidery is exquisite." },
  { id: 2, user: "Fatima", rating: 4, comment: "Lovely suit, but the sizing runs a bit large." },
]

export default function ProductPage({ params }: { params: { id: string } }) {
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // In a real application, you would fetch the product data from an API
    // Here, we're using the data passed via query params
    setProduct({
      id: params.id,
      name: searchParams.get('name') ?? 'Default Name',
      brand: searchParams.get('brand') ?? 'Default Brand',
      category: searchParams.get('category') ?? 'Default Category',
      price: searchParams.get('price') ?? '0',
      image: searchParams.get('image') ?? '',
      description: "Beautifully crafted product featuring intricate designs. Perfect for various occasions.",
    })
  }, [params.id, searchParams])

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the review to your backend
    console.log('New review:', { rating: reviewRating, comment: reviewComment })
    // Reset form
    setReviewRating(0)
    setReviewComment('')
  }

  if (!product) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center text-purple-700 hover:text-purple-900">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Search
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <img src={product.image} alt={product.name} className="w-full h-auto rounded-lg shadow-lg" />
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
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
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
          {reviews.map(review => (
            <Card key={review.id} className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <p className="font-semibold mr-2">{review.user}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p>{review.comment}</p>
              </CardContent>
            </Card>
          ))}

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
          <p>&copy; 2023 Pakistani Fashion Reviews. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}