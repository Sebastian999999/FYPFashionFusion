// src/components/ui/product-card.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Calendar, Tag, Heart, Sparkles } from 'lucide-react';
import { CompareButton } from "@/components/ui/compare-button";

interface PriceChangeInfo {
  increased: boolean;
  previousPrice: number;
  percentChange: number;
  firstPrice?: number;
  lastUpdated?: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    specialPrice?: number;
    description?: string;
    images: string;
    url?: string;
    categoryId: number;
    brandId: number;
    priceChangeInfo?: PriceChangeInfo;
  };
  brands: Brand[];
  categories: Category[];
}

export function ProductCard({ product, brands, categories }: ProductCardProps) {
  // State to track if the image failed to load
  const [imageError, setImageError] = useState(false);
  
  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'today';
      } else if (diffDays === 1) {
        return 'yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
      }
    } catch (e) {
      return dateString.split('T')[0]; // Fallback to YYYY-MM-DD format
    }
  };

  return (
    <Card className="overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="relative h-64">
        {imageError ? (
          // Display a placeholder if the image failed to load
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        ) : (
          // Try to load the actual image
          <img 
            src={`/product_images/${product.images}`} 
            alt={product.name} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Price change badge */}
        {product.priceChangeInfo && (
          <div className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded ${
            product.priceChangeInfo.increased ? 'bg-red-500' : 'bg-green-500'
          }`}>
            {product.priceChangeInfo.increased ? 'Price Hiked' : 'Price Dropped'}
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md">
          <Heart className="w-6 h-6 text-pink-500" />
        </div>
      </div>
      
      <CardContent className="p-4">
      <h3 className="font-semibold text-lg mb-2 text-purple-700 line-clamp-2">
  {product.name}
</h3>
        
        {/* Price change details */}
        {product.priceChangeInfo && (
          <div className={`mb-2 ${
            product.priceChangeInfo.increased ? 'text-red-500' : 'text-green-500'
          }`}>
            <div className="flex items-center text-xs font-semibold">
              {product.priceChangeInfo.increased ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>
                {product.priceChangeInfo.increased ? 'Increased' : 'Decreased'} by {Math.round(product.priceChangeInfo.percentChange)}%
              </span>
            </div>
            
            {product.priceChangeInfo.lastUpdated && (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatLastUpdated(product.priceChangeInfo.lastUpdated)}</span>
              </div>
            )}
          </div>
        )}
        
        <p className="font-bold text-pink-600 min-w-0">
          <Tag className="w-4 h-4 mr-1" /> {brands.find(b => b.id === product.brandId)?.name || 'Unknown Brand'}
        </p>
        
        <p className="font-bold text-pink-600">
          {/* Show previous price if price increased */}
          {product.priceChangeInfo && product.priceChangeInfo.increased && (
            <span className="line-through text-gray-500 mr-2">
              Rs. {product.priceChangeInfo.previousPrice.toFixed(2)}
            </span>
          )}
          
          {/* Regular/Special price display */}
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
        <Link className='w-full'
          href={{
            pathname: '/product',
            query: {
              id: product.id,
              name: product.name,
              brand: brands.find(b => b.id === product.brandId)?.name || 'Default Brand',
              category: categories.find(c => c.id === product.categoryId)?.name || 'Default Category',
              description: product.description,
              price: product.specialPrice || product.price,
              image: product.images,
              url: product.url,
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

        <CompareButton 
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            specialPrice: product.specialPrice,
            description: product.description || 'No description available',
            image: product.images,
            brand: brands.find(b => b.id === product.brandId)?.name || 'Default Brand',
            category: categories.find(c => c.id === product.categoryId)?.name || 'Default Category',
          }}
          variant="ghost"
          className="ml-2 bg-transparent text-white hover:bg-white/10"
        />
      </CardFooter>
    </Card>
  );
}