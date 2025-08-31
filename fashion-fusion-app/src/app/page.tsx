'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Star, TrendingUp, ShoppingBag, Heart } from 'lucide-react'

export default function HomePage() {
  const featuredBrands = [
    { name: "Khaadi", image: "https://images.pexels.com/photos/5705080/pexels-photo-5705080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { name: "Gul Ahmed", image: "https://images.pexels.com/photos/5705090/pexels-photo-5705090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { name: "Sana Safinaz", image: "https://images.pexels.com/photos/12165038/pexels-photo-12165038.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      
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
            <h2 className="text-3xl font-bold text-center mb-8 text-purple-700">About FashionFusion Reviews</h2>
            <p className="text-lg text-center max-w-3xl mx-auto mb-8">
              FashionFusion is your go-to platform for discovering and reviewing the latest trends in Pakistani fashion. 
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
    </div>
  )
}
