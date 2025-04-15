// src/app/price-trends/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/ui/product-card"
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function PriceTrendsPage() {
  const [recentIncreases, setRecentIncreases] = useState([])
  const [recentDecreases, setRecentDecreases] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState(7) // 7 days by default
  
  useEffect(() => {
    const fetchPriceChanges = async () => {
      try {
        setLoading(true)
        
        // Fetch price increases
        const increaseResponse = await fetch(
          `http://localhost:8001/products/price-changes/?days=${timeframe}&increased_only=true`
        )
        const increaseData = await increaseResponse.json()
        setRecentIncreases(increaseData)
        
        // Fetch price decreases
        const decreaseResponse = await fetch(
          `http://localhost:8001/products/price-changes/?days=${timeframe}&increased_only=false`
        )
        const decreaseData = await decreaseResponse.json()
        // Filter out increases to get only decreases
        const onlyDecreases = decreaseData.filter(
          product => product.priceChangeInfo && !product.priceChangeInfo.increased
        )
        setRecentDecreases(onlyDecreases)
      } catch (error) {
        console.error('Error fetching price changes:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPriceChanges()
  }, [timeframe])
  
  const timeframeOptions = [
    { value: 1, label: '24 hours' },
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 90, label: '3 months' }
  ]
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-purple-700">Price Trends</h1>
      <p className="text-gray-600 mb-8">
        Track recent price changes in Pakistani fashion products
      </p>
      
      {/* Timeframe selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {timeframeOptions.map(option => (
          <Button
            key={option.value}
            variant={timeframe === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* Price increases section */}
          <Card className="mb-8">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center text-red-600">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Price Increases
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentIncreases.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recentIncreases.slice(0, 8).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No price increases found in the last {timeframe} {timeframe === 1 ? 'day' : 'days'}.
                </p>
              )}