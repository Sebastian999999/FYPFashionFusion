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

interface Product {
  id: number
  name: string
  price: number
  specialPrice: number | null
  url: string
  images: string
  categoryId: number
  brandId: number
  createdAt: string
  updatedAt: string
}

export default function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedBrands, setSelectedBrands] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [columns, setColumns] = useState(3)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([])

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

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [])

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching products...');
      const response = await fetch('http://localhost:8000/products/');
      console.log('Response:', response);
      if (!response.ok) {
        console.error('Response status:', response.status, response.statusText);
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      console.log('Fetched data:', data);

       // Parse dates in the fetched data
    const parsedData = data.map((product: Product) => ({
      ...product,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt),
    }));

    setProducts(parsedData);
    } catch (err) {
      setError('An error occurred while fetching products');
      console.error('Error during fetch:', err);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/categories/')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:8000/brands/')
      if (!response.ok) {
        throw new Error('Failed to fetch brands')
      }
      const data = await response.json()
      setBrands(data)
    } catch (err) {
      console.error('Error fetching brands:', err)
    }
  }

  const filteredProducts = products.filter(product => 
    (searchTerm === "" || product.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategories.length === 0 || selectedCategories.includes(product.categoryId)) &&
    (selectedBrands.length === 0 || selectedBrands.includes(product.brandId)) &&
    (product.price >= priceRange[0] && product.price <= priceRange[1])
  )

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    )
  }

  const handleBrandChange = (brandId: number) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) ? prev.filter(b => b !== brandId) : [...prev, brandId]
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
              <Link href="/" className="text-gray-600 hover:text-purple-700">Home</Link>
              <Link href="/product-search" className="text-purple-700 hover:text-purple-900 font-semibold">Search</Link>
              <Link href="/ai-brand-rankings" className="text-gray-600 hover:text-purple-700">Brand Rankings</Link>
              <Link href="/about" className="text-gray-600 hover:text-purple-700">About</Link>
              <Link href="/auth" className="text-gray-600 hover:text-purple-700">Login/Signup</Link>
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
                <Link href="/" className="text-gray-600 hover:text-purple-700">Home</Link>
                <Link href="/product-search" className="text-purple-700 hover:text-purple-900 font-semibold">Search</Link>
                <Link href="/ai-brand-rankings" className="text-gray-600 hover:text-purple-700">Brand Rankings</Link>
                <Link href="/about" className="text-gray-600 hover:text-purple-700">About</Link>
                <Link href="/auth" className="text-gray-600 hover:text-purple-700">Login/Signup</Link>
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
                    <div key={category.id} className="flex items-center mb-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryChange(category.id)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="ml-2">{category.name}</Label>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-pink-600">Brands</h3>
                  {brands.map(brand => (
                    <div key={brand.id} className="flex items-center mb-2">
                      <Checkbox
                        id={`brand-${brand.id}`}
                        checked={selectedBrands.includes(brand.id)}
                        onCheckedChange={() => handleBrandChange(brand.id)}
                      />
                      <Label htmlFor={`brand-${brand.id}`} className="ml-2">{brand.name}</Label>
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
            {loading && <p className="text-center">Loading products...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '1.5rem',
              alignItems: 'start',
            }}>
              {filteredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="relative">
                    <img src={product.images} alt={product.name} className="w-full h-64 object-cover" />
                    <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md">
                      <Heart className="w-6 h-6 text-pink-500" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 text-purple-700">{product.name}</h3>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <Tag className="w-4 h-4 mr-1" /> {brands.find(b => b.id === product.brandId)?.name}
                    </p>
                    <p className="font-bold text-pink-600">
                      {product.specialPrice ? (
                        <>
                          <span className="line-through text-gray-500 mr-2">Rs. {product.price}</span>
                          Rs. {product.specialPrice}
                        </>
                      ) : (
                        <>Rs. {product.price}</>
                      )}
                    </p>
                  </CardContent>
                  <CardFooter className="bg-gradient-to-r from-purple-500 to-pink-500 p-2">
                  <Link 
                    href={{
                      pathname: '/product', // Just use /product as you're not using a dynamic route anymore
                      query: {
                        id: product.id,
                        name: product.name,
                        brand: brands.find(b => b.id === product.brandId)?.name || 'Default Brand',
                        category: categories.find(c => c.id === product.categoryId)?.name || 'Default Category',
                        price: product.specialPrice || product.price,
                        image: product.images,
                      },
                    }} 
                    passHref
                  >
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