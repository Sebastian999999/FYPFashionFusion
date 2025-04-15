// src/app/compare/page.tsx
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, X, Search, Menu, User2, ShoppingBag, LogOut } from 'lucide-react';
import { useCompare } from "@/components/providers/compare-provider";
import { useRouter } from 'next/navigation';
import { ChatHelp } from '@/components/chat-help'


export default function ComparePage() {
  const { compareProducts, removeFromCompare, clearCompare, addToCompare } = useCompare();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  
  // Wait for localStorage to load and then check if we need to redirect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Only redirect if still no products after loading
      if (compareProducts.length === 0) {
        router.push('/product-search');
      }
    }, 500); // Give localStorage time to load
    
    return () => clearTimeout(timer);
  }, [compareProducts, router]);
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // Use the correct search parameter that your API expects
      const response = await fetch(`http://localhost:8001/products/?search_query=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search products');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching products:', error);
      // If the specific search parameter doesn't work, try a generic fetch
      try {
        const response = await fetch(`http://localhost:8001/products/`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        // Filter products client-side if server-side search fails
        const filteredData = data.filter((product: any) => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filteredData);
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!isLoading && compareProducts.length === 0) {
    return <div>Redirecting...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-700">Compare Products</h1>
          <Button 
            variant="outline" 
            onClick={clearCompare}
            className="text-red-500 border-red-500 hover:bg-red-50"
          >
            Clear All
          </Button>
        </div>
        
        {compareProducts.length < 3 && (
          <div className="mb-8">
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Search for a product to compare..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? 'Searching...' : <Search className="h-4 w-4" />}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {searchResults.slice(0, 6).map((product: any) => (
                  <Card key={product.id} className="overflow-hidden">
                    <img 
                      src={`/product_images/${product.images?.split(',')[0]?.trim() || 'default.jpg'}`} 
                      alt={product.name} 
                      className="w-full h-40 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 truncate">{product.name}</h3>
                      <p className="text-purple-600 font-bold">
                        {product.specialPrice ? (
                          <>
                            <span className="line-through text-gray-400 mr-2">Rs. {product.price}</span>
                            Rs. {product.specialPrice}
                          </>
                        ) : (
                          <>Rs. {product.price}</>
                        )}
                      </p>
                      <Button 
                        className="w-full mt-3"
                        onClick={() => {
                          const productToAdd = {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            specialPrice: product.specialPrice,
                            description: product.description || 'No description available',
                            image: product.images?.split(',')[0]?.trim() || 'default.jpg',
                            brand: product.brand_name || '',
                            category: product.category_name || '',
                            url: product.url || '#'
                          };
                          addToCompare(productToAdd);
                          setSearchResults([]);
                          setSearchTerm('');
                        }}
                      >
                        Add to Compare
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {compareProducts.map((product) => (
            <Card key={product.id} className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500"
                onClick={() => removeFromCompare(product.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="aspect-square overflow-hidden">
                <img 
                  src={`/product_images/${product.image}`} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardContent className="p-4">
                <h2 className="text-xl font-bold text-purple-700 mb-2">{product.name}</h2>
                
                {product.brand && (
                  <div className="mb-2">
                    <span className="font-semibold">Brand:</span> {product.brand}
                  </div>
                )}
                
                {product.category && (
                  <div className="mb-2">
                    <span className="font-semibold">Category:</span> {product.category}
                  </div>
                )}
                
                <div className="mb-2">
                  <span className="font-semibold">Price:</span> 
                  <span className="text-purple-600 font-bold ml-2">
                    {product.specialPrice ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">Rs. {product.price}</span>
                        Rs. {product.specialPrice}
                      </>
                    ) : (
                      <>Rs. {product.price}</>
                    )}
                  </span>
                </div>
                
                <div className="mt-4">
                  <span className="font-semibold">Description:</span>
                  <p className="text-gray-600 mt-1">{product.description}</p>
                </div>
                
                <div className="mt-4">
                  <Link href={{
                    pathname: '/product',
                    query: {
                      id: product.id,
                      name: product.name,
                      brand: product.brand || 'Unknown Brand',
                      category: product.category || 'Unknown Category',
                      description: product.description || 'No description available',
                      price: product.specialPrice || product.price,
                      image: product.image,
                      url: product.url || '#'
                    }
                  }}>
                    <Button variant="outline" className="w-full">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {Array.from({ length: 3 - compareProducts.length }).map((_, index) => (
            <Card key={`empty-${index}`} className="border-dashed border-2 border-gray-300 flex items-center justify-center">
              <CardContent className="p-8 text-center text-gray-400">
                <div className="mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <p>Add a product to compare</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      
    </div>
  );
}