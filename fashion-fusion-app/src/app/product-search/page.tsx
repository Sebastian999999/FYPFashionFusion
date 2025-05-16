'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, TrendingUp, TrendingDown } from 'lucide-react'
import { ChatHelp } from "@/components/chat-help";
import { ProductCard } from "@/components/ui/product-card";

interface PriceChangeInfo {
  increased: boolean;
  previousPrice: number;
  percentChange: number;
  firstPrice?: number;
  lastUpdated?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  specialPrice?: number;
  description?: string;
  images: string;
  url?: string;
  categoryId: number;
  brandId: number;
  createdAt: Date;
  updatedAt: Date;
  priceChangeInfo?: PriceChangeInfo;
}

export default function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedBrands, setSelectedBrands] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [columns, setColumns] = useState(3)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  //const [error, setError] = useState<string | null>(null)
  const [productError, setProductError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [showPriceIncreased, setShowPriceIncreased] = useState(false)
  const [showPriceDecreased, setShowPriceDecreased] = useState(false)
  
  const productsPerPage = 30;
  const lastProductElementRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMoreProducts()) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const currentElement = lastProductElementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [displayedProducts, loadingMore]);

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

  // Re-fetch products when filters change
  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategories, selectedBrands, priceRange, showPriceIncreased, showPriceDecreased])

  // Function to check if there are more products to load
  const hasMoreProducts = () => {
    const filteredProducts = getFilteredProducts();
    return displayedProducts.length < filteredProducts.length;
  };

  // Filter products based on all criteria
  const getFilteredProducts = () => {
    return allProducts.filter(product => 
      (searchTerm === "" || product.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategories.length === 0 || selectedCategories.includes(product.categoryId)) &&
      (selectedBrands.length === 0 || selectedBrands.includes(product.brandId)) &&
      (product.price >= priceRange[0] && product.price <= priceRange[1]) &&
      (!showPriceIncreased || (product.priceChangeInfo && product.priceChangeInfo.increased)) &&
      (!showPriceDecreased || (product.priceChangeInfo && !product.priceChangeInfo.increased && product.priceChangeInfo.previousPrice))
    );
  };

  const loadMoreProducts = () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    
    // Get filtered products
    const filteredProducts = getFilteredProducts();
    
    // Calculate next page
    const nextPage = page + 1;
    const nextBatch = filteredProducts.slice(0, nextPage * productsPerPage);
    
    // Add a small delay to avoid UI freezing
    setTimeout(() => {
      setDisplayedProducts(nextBatch);
      setPage(nextPage);
      setLoadingMore(false);
    }, 300);
  };

  const fetchProducts = async () => {
    setLoading(true);
    //setError(null);
    setProductError(null);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search_query', searchTerm);
      }
      
      selectedCategories.forEach(catId => params.append('category_id', catId.toString()));
      selectedBrands.forEach(brandId => params.append('brand_id', brandId.toString()));
      
      if (priceRange[0] > 0) {
        params.append('price_min', priceRange[0].toString());
      }
      
      if (priceRange[1] < 50000) {
        params.append('price_max', priceRange[1].toString());
      }
      
      // Add price change filters
      if (showPriceIncreased && showPriceDecreased) {
        // If both are selected, show any price change
        params.append('has_price_change', 'true');
      } else if (showPriceIncreased) {
        params.append('price_increased', 'true');
      } else if (showPriceDecreased) {
        params.append('price_decreased', 'true');
      }
      
      // Log filter state and URL for debugging
      console.log('Filter state:', {
        searchTerm,
        selectedCategories,
        selectedBrands,
        priceRange,
        showPriceIncreased,
        showPriceDecreased
      });
      
      const url = `http://localhost:8001/products/?${params.toString()}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched data:', data);
      
      // Process the data for display
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsedData = data.map((product: any) => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
        images: product.images?.split(',')[0]?.trim() || 'default.jpg',
      }));
      
      setAllProducts(parsedData);
      setDisplayedProducts(parsedData.slice(0, productsPerPage));
      setPage(1); // Reset to first page
    } catch (err) {
      console.error('Error fetching products:', err);
      setProductError('An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8001/categories/')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories (silent):', err)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:8001/brands/')
      if (!response.ok) {
        throw new Error('Failed to fetch brands')
      }
      const data = await response.json()
      setBrands(data)
    } catch (err) {
console.error('Error fetching brands (silent):', err)
    }
  }

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
      
      <div className="relative bg-cover bg-center h-96 mb-8" style={{backgroundImage: 'url("https://images.pexels.com/photos/5705080/pexels-photo-5705080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white p-4">
          <h2 className="text-5xl font-bold mb-4 text-center">Fashion Search</h2>
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

                <div className="mb-6">
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

                {/* Price Change Filters */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-pink-600">Price Changes</h3>
                  <div className="flex items-center mb-2">
                    <Checkbox
                      id="price-increased"
                      checked={showPriceIncreased}
                      onCheckedChange={(checked) => {
                        setShowPriceIncreased(!!checked);
                        setPage(1); // Reset pagination
                      }}
                    />
                    <Label htmlFor="price-increased" className="ml-2 flex items-center">
                      <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                      Show Price Hiked
                    </Label>
                  </div>
                  <div className="flex items-center mb-2">
                    <Checkbox
                      id="price-decreased"
                      checked={showPriceDecreased}
                      onCheckedChange={(checked) => {
                        setShowPriceDecreased(!!checked);
                        setPage(1); // Reset pagination
                      }}
                    />
                    <Label htmlFor="price-decreased" className="ml-2 flex items-center">
                      <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                      Show Price Dropped
                    </Label>
                  </div>
                </div>

                <div className="mb-6">
                <h3 className="font-semibold mb-2 text-pink-600">Need Help?</h3>
                <ChatHelp 
                  question="I'm looking for formal wear around 5000 PKR. Can you recommend some options?"
                  buttonText="Get Recommendations"
                  variant="secondary"
                  className="w-full"
                />
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="w-full lg:w-3/4">
            {loading       && <p className="text-center">Loading products...</p>}
            {productError  && <p className="text-center text-red-500">{productError}</p>}
            
            {/* Display product count with price change info */}
            <div className="mb-4 text-gray-600">
              {displayedProducts.length} products found
              {showPriceIncreased && " with price increases"}
              {showPriceDecreased && " with price decreases"}
              {hasMoreProducts() && ` (showing ${displayedProducts.length} of ${getFilteredProducts().length})`}
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '1.5rem',
              alignItems: 'start',
            }}>
              {displayedProducts.map((product, index) => (
                <div key={product.id} className="min-w-0">
                  <ProductCard 
                    product={product}
                    brands={brands}
                    categories={categories}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
            
            {/* Loading more trigger element */}
            {hasMoreProducts() && (
              <div 
                ref={lastProductElementRef} 
                className="h-20 flex items-center justify-center mt-4"
              >
                {loadingMore ? (
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={loadMoreProducts}
                    className="bg-white"
                  >
                    Load More Products
                  </Button>
                )}
              </div>
            )}
            
            {/* End of results message */}
            {!hasMoreProducts() && displayedProducts.length > 0 && (
              <p className="text-center text-gray-500 py-4">
                End of results
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}