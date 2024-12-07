'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Star, TrendingUp, ShoppingBag, Heart, Menu, X, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const featuredBrands = [
    { name: "Khaadi", image: "https://images.pexels.com/photos/5705080/pexels-photo-5705080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { name: "Gul Ahmed", image: "https://images.pexels.com/photos/5705090/pexels-photo-5705090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { name: "Sana Safinaz", image: "https://images.pexels.com/photos/12165038/pexels-photo-12165038.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-700">FashionFusion</h1>
            </div>
            <nav className="hidden md:flex space-x-4">
              <Link href="/" className="text-purple-700 hover:text-purple-900 font-semibold">Home</Link>
              <Link href="/product-search" className="text-gray-600 hover:text-purple-700">Search</Link>
              <Link href="/ai-brand-rankings" className="text-purple-700 hover:text-purple-900 font-semibold">Brand Rankings</Link>
              <Link href="/auth" className="text-gray-600 hover:text-purple-700">Login/Signup</Link>
              <a href="#featured-brands" className="text-gray-600 hover:text-purple-700">Featured Brands</a>
              <a href="#about" className="text-gray-600 hover:text-purple-700">About</a>
            </nav>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4">
              <nav className="flex flex-col space-y-2">
                <Link href="/" className="text-purple-700 hover:text-purple-900 font-semibold">Home</Link>
                <Link href="/product-search" className="text-gray-600 hover:text-purple-700">Search</Link>
                <Link href="/auth" className="text-gray-600 hover:text-purple-700">Login/Signup</Link>
                <a href="#featured-brands" className="text-gray-600 hover:text-purple-700">Featured Brands</a>
                <a href="#about" className="text-gray-600 hover:text-purple-700">About</a>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="relative bg-cover bg-center h-[calc(100vh-4rem)] flex items-center" style={{backgroundImage: 'url("https://images.pexels.com/photos/5705080/pexels-photo-5705080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")'}}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="container mx-auto px-4 z-10 text-white">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Discover Pakistani Fashion</h2>
            <p className="text-xl md:text-2xl mb-8">Find and review the latest trends in Pakistani fashion</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/search" className="flex-1">
                <Button className="w-full text-lg py-6" size="lg">
                  <Search className="mr-2 h-5 w-5" /> Search Products
                </Button>
              </Link>
              <Link href="#featured-brands" className="flex-1">
                <Button variant="outline" className="w-full text-lg py-6 bg-white text-purple-700 hover:bg-purple-100" size="lg">
                  <Star className="mr-2 h-5 w-5" /> Featured Brands
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="featured-brands" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-purple-700">Featured Brands</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredBrands.map((brand, index) => (
                <Card key={index} className="overflow-hidden">
                  <img src={brand.image} alt={brand.name} className="w-full h-64 object-cover" />
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{brand.name}</h3>
                    <Link href={`/product-search?brand=${encodeURIComponent(brand.name)}`}>
                      <Button variant="outline" className="w-full">View Products</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-r from-purple-100 to-pink-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-purple-700">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-xl font-semibold mb-2">Latest Trends</h3>
                  <p>Stay updated with the newest Pakistani fashion trends and styles.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
                  <p>Explore a vast collection of products from top Pakistani brands.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
                  <p>Read honest reviews from fashion enthusiasts like you.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="about" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-purple-700">About PakFashionReviews</h2>
            <p className="text-lg text-center max-w-3xl mx-auto mb-8">
              PakFashionReviews is your go-to platform for discovering and reviewing the latest trends in Pakistani fashion. 
              We bring together a curated selection of top brands, honest customer reviews, and expert insights to help you 
              make informed fashion choices.
            </p>
            <div className="text-center">
              <Link href="/search">
                <Button size="lg" className="text-lg py-6">Start Exploring</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-purple-600 to-pink-600 text-white mt-16">
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">About Us</h3>
        <p className="text-sm">We use AI to analyze customer reviews and rank Pakistani fashion brands, helping you make informed decisions.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
        <ul className="space-y-2">
          <li><Link href="/" className="text-sm hover:underline">Home</Link></li>
          <li><Link href="/search" className="text-sm hover:underline">Top Brands</Link></li>
          <li><Link href="/search" className="text-sm hover:underline">Latest Reviews</Link></li>
          <li><Link href="/search" className="text-sm hover:underline">Write a Review</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">AI-Powered Rankings</h3>
        <p className="text-sm">Our advanced AI analyzes thousands of customer reviews to provide unbiased brand rankings.</p>
        <div className="flex items-center mt-2">
          <Star className="w-5 h-5 fill-current text-yellow-400" />
          <Star className="w-5 h-5 fill-current text-yellow-400" />
          <Star className="w-5 h-5 fill-current text-yellow-400" />
          <Star className="w-5 h-5 fill-current text-yellow-400" />
          <Star className="w-5 h-5 fill-current text-yellow-400" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-gray-300"><Facebook /></a>
          <a href="#" className="hover:text-gray-300"><Twitter /></a>
          <a href="#" className="hover:text-gray-300"><Instagram /></a>
          <a href="#" className="hover:text-gray-300"><Linkedin /></a>
        </div>
      </div>
    </div>
    <div className="mt-8 pt-8 border-t border-white/10 text-center">
      <p className="text-sm">&copy; 2023 Pakistani Fashion Reviews. All rights reserved.</p>
    </div>
  </div>
</footer>
    </div>
  )
}
