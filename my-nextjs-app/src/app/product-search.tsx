'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, Sparkles, Tag, Heart, Star, Facebook, Twitter, Instagram, Linkedin, Menu, X, User, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

// Simulated product data
const products = [
  { id: 1, name: "Embroidered Lawn Suit", brand: "Khaadi", category: "Women", price: 5000, image: "https://images.pexels.com/photos/11679854/pexels-photo-11679854.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  { id: 2, name: "Printed Kurta", brand: "Gul Ahmed", category: "Men", price: 3000, image: "https://images.pexels.com/photos/5705090/pexels-photo-5705090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  { id: 3, name: "Chiffon Dupatta", brand: "Sana Safinaz", category: "Women", price: 2000, image: "https://images.pexels.com/photos/12165038/pexels-photo-12165038.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  { id: 4, name: "Waistcoat", brand: "Amir Adnan", category: "Men", price: 7000, image: "https://images.pexels.com/photos/2897531/pexels-photo-2897531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  { id: 5, name: "Formal Shalwar Kameez", brand: "Junaid Jamshed", category: "Men", price: 6000, image: "https://images.pexels.com/photos/5705079/pexels-photo-5705079.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  { id: 6, name: "Bridal Lehenga", brand: "Elan", category: "Women", price: 50000, image: "https://images.pexels.com/photos/2950650/pexels-photo-2950650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
]

const categories = ["Women", "Men", "Kids", "Accessories"]
const brands = ["Khaadi", "Gul Ahmed", "Sana Safinaz", "Amir Adnan", "Junaid Jamshed", "Elan"]

export default function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [columns, setColumns] = useState(3)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumns(1)
      else if (window.innerWidth < 1024) setColumns(2)
      else setColumns(3)
    }
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  const filteredProducts = products.filter(product => 
    (searchTerm === "" || product.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategories.length === 0 || selectedCategories.includes(product.category)) &&
    (selectedBrands.length === 0 || selectedBrands.includes(product.brand)) &&
    (product.price >= priceRange[0] && product.price <= priceRange[1])
  )

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-700">PakFashionReviews</h1>
            </div>
            <nav className="hidden md:flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-purple-700">Home</a>
              <a href="#" className="text-gray-600 hover:text-purple-700">Categories</a>
              <a href="#" className="text-gray-600 hover:text-purple-700">Brands</a>
              <a href="#" className="text-gray-600 hover:text-purple-700">Reviews</a>
              <a href="#" className="text-gray-600 hover:text-purple-700">About</a>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User account</span>
              </Button>
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
                <span className="sr-only">Shopping bag</span>
              </Button>
            </div>
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
                <a href="#" className="text-gray-600 hover:text-purple-700">Home</a>
                <a href="#" className="text-gray-600 hover:text-purple-700">Categories</a>
                <a href="#" className="text-gray-600 hover:text-purple-700">Brands</a>
                <a href="#" className="text-gray-600 hover:text-purple-700">Reviews</a>
                <a href="#" className="text-gray-600 hover:text-purple-700">About</a>
              </nav>
              <div className="flex items-center space-x-4 mt-4">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User account</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="sr-only">Shopping bag</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="relative bg-cover bg-center h-96 mb-8" style={{backgroundImage: 'url("https://images.pexels.com/photos/5705080/pexels-photo-5705080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white p-4">
          <h2 className="text-5xl font-bold mb-4 text-center">Pakistani Fashion Search</h2>
          <p className="text-xl mb-8 text-center">Discover and review the latest trends in Pakistani fashion</p>
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/90 text-black placeholder-gray-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/4">
            <Card className="sticky top-4 bg-white/80 backdrop-blur-md">
              <CardContent className="p-4">
                <h2 className="text-2xl font-semibold mb-4 flex items-center text-purple-700">
                  <Filter className="mr-2" /> Filters
                </h2>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-pink-600">Categories</h3>
                  {categories.map(category => (
                    <div key={category} className="flex items-center mb-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <Label htmlFor={`category-${category}`} className="ml-2">{category}</Label>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-pink-600">Brands</h3>
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center mb-2">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => handleBrandChange(brand)}
                      />
                      <Label htmlFor={`brand-${brand}`} className="ml-2">{brand}</Label>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-pink-600">Price Range</h3>
                  <Slider
                    min={0}
                    max={50000}
                    step={1000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Rs. {priceRange[0]}</span>
                    <span>Rs. {priceRange[1]}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="w-full lg:w-3/4">
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '1.5rem',
              alignItems: 'start',
            }}>
              {filteredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="relative">
                    <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                    <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md">
                      <Heart className="w-6 h-6 text-pink-500" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 text-purple-700">{product.name}</h3>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <Tag className="w-4 h-4 mr-1" /> {product.brand}
                    </p>
                    <p className="font-bold text-pink-600">Rs. {product.price}</p>
                  </CardContent>
                  <CardFooter className="bg-gradient-to-r from-purple-500 to-pink-500 p-2">
                    <Link href={`/product/${product.id}`} className="w-full">
                      <Button 
                        className="w-full bg-transparent text-white hover:bg-white/10 transition-colors duration-300" 
                      >
                        <Sparkles className="w-4 h-4 mr-2" /> View Product
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>

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
                <li><a href="#" className="text-sm hover:underline">Home</a></li>
                <li><a href="#" className="text-sm hover:underline">Top Brands</a></li>
                <li><a href="#" className="text-sm hover:underline">Latest Reviews</a></li>
                <li><a href="#" className="text-sm hover:underline">Write a Review</a></li>
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