// src/components/providers/compare-provider.tsx
"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';

export interface CompareProduct {
  id: number | string;
  name: string;
  price: number;
  specialPrice?: number | null;
  description: string;
  image: string;
  brand?: string;
  category?: string;
  url?: string;
}

interface CompareContextType {
  compareProducts: CompareProduct[];
  addToCompare: (product: CompareProduct) => void;
  removeFromCompare: (productId: number | string) => void;
  clearCompare: () => void;
  isInCompare: (productId: number | string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareProducts, setCompareProducts] = useState<CompareProduct[]>([]);
  
  // Load compare products from localStorage on initial load
  useEffect(() => {
    const savedProducts = localStorage.getItem('compareProducts');
    if (savedProducts) {
      try {
        setCompareProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error('Failed to parse saved compare products', e);
      }
    }
  }, []);
  
  // Save to localStorage whenever compareProducts changes
  useEffect(() => {
    localStorage.setItem('compareProducts', JSON.stringify(compareProducts));
  }, [compareProducts]);
  
  const addToCompare = (product: CompareProduct) => {
    if (compareProducts.length >= 3) {
      alert('You can only compare up to 3 products. Please remove a product before adding a new one.');
      return;
    }
    
    if (!isInCompare(product.id)) {
      setCompareProducts(prev => [...prev, product]);
    }
  };
  
  const removeFromCompare = (productId: number | string) => {
    setCompareProducts(prev => prev.filter(p => p.id !== productId));
  };
  
  const clearCompare = () => {
    setCompareProducts([]);
  };
  
  const isInCompare = (productId: number | string) => {
    return compareProducts.some(p => p.id === productId);
  };
  
  return (
    <CompareContext.Provider 
      value={{ 
        compareProducts, 
        addToCompare, 
        removeFromCompare, 
        clearCompare, 
        isInCompare 
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};