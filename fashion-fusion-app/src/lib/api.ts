// src/lib/api.ts

// Define types for better type safety
interface BrandRanking {
  overallScore: number;
  positiveScore: number;
  neutralScore: number;
  negativeScore: number;
  qualityEmotion: number;
  styleEmotion: number;
  valueEmotion: number;
  serviceEmotion: number;
  reviewCount: number;
}

interface BrandRankingsResponse {
  [brandId: string]: BrandRanking;
}

interface ReviewInput {
  text: string;
  title?: string;
  recommend?: boolean;
}

interface ReviewSubmission {
  text: string;
  title?: string;
  brandId: string;
  rating: number;
}

interface AnalyzeBrandResponse {
  brand_id: string;
  metrics: BrandRanking;
}

/**
 * Client for interacting with the sentiment analysis API
 */
export const SentimentAPI = {
  /**
   * Get brand rankings from the sentiment analysis API
   */
  // src/lib/api.ts - Updated getBrandRankings method

async getBrandRankings(): Promise<BrandRankingsResponse> {
  try {
    // First, try to get the rankings from the Google Maps reviews
    const response = await fetch('http://localhost:8002/api/brands/rankings');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if the response has actual data (not empty)
    const hasRealData = Object.keys(data).length > 0;
    
    if (hasRealData) {
      console.log("Using real Google Maps reviews for rankings");
      return data;
    } else {
      console.warn("The rankings API returned empty data, falling back to mock rankings");
      // If the API returned empty data, fall back to mock rankings
      const mockResponse = await fetch('http://localhost:8002/api/brands/mock-rankings');
      return await mockResponse.json();
    }
  } catch (error) {
    console.error('Error fetching brand rankings:', error);
    
    // Fall back to mock rankings if the API is unavailable
    try {
      console.warn("Falling back to mock rankings due to API error");
      const mockResponse = await fetch('http://localhost:8002/api/brands/mock-rankings');
      if (mockResponse.ok) {
        return await mockResponse.json();
      }
    } catch (fallbackError) {
      console.error('Error fetching mock rankings:', fallbackError);
    }
    
    // If both attempts fail, return empty rankings
    return {};
  }
},

  /**
   * Get ranking for a specific brand
   */
  async getBrandRanking(brandId: string): Promise<BrandRanking | null> {
    try {
      const rankings = await this.getBrandRankings();
      return rankings[brandId] || null;
    } catch (error) {
      console.error(`Error fetching ranking for brand ${brandId}:`, error);
      return null;
    }
  },
  
  /**
   * Analyze reviews for a specific brand
   */
  async analyzeBrandReviews(brandId: string, reviews: ReviewInput[]): Promise<AnalyzeBrandResponse> {
    try {
      const response = await fetch('http://localhost:8002/api/analyze-brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand_id: brandId,
          reviews: reviews
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing brand reviews:', error);
      throw error;
    }
  },

  /**
   * Map a brand name to its ID
   */
  getBrandIdFromName(brandName: string): string | null {
    if (!brandName) return null;
    
    const brandMap: {[key: string]: string} = {
      "Khaadi": "1",
      "Gul Ahmed": "2",
      "Sana Safinaz": "3",
      "Sapphire": "4",
      "Alkaram": "5"
    };
    
    // Check for exact match
    if (brandMap[brandName]) {
      return brandMap[brandName];
    }
    
    // Check for partial match
    for (const [key, value] of Object.entries(brandMap)) {
      if (brandName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return null;
  },

  /**
   * Submit a review and update brand rankings
   */
  async submitReviewAndUpdateRankings(review: ReviewSubmission): Promise<boolean> {
    try {
      // Validate inputs
      if (!review.text || !review.brandId) {
        console.error('Invalid review data: Missing required fields');
        return false;
      }
      
      // Send the review to the sentiment analysis API
      await this.analyzeBrandReviews(review.brandId, [{
        text: review.text,
        title: review.title || "",
        recommend: review.rating >= 4 // Assume 4-5 stars means recommend
      }]);
      
      return true;
    } catch (error) {
      console.error('Error submitting review for sentiment analysis:', error);
      return false;
    }
  },

  /**
   * Get mock metrics for a brand (for testing or fallback)
   */
  getMockMetricsForBrand(brandId: string): BrandRanking {
    const mockData: {[key: string]: BrandRanking} = {
      "1": {  // Khaadi
        overallScore: 8.7,
        positiveScore: 75,
        neutralScore: 20,
        negativeScore: 5,
        qualityEmotion: 8.9,
        styleEmotion: 9.2,
        valueEmotion: 8.1,
        serviceEmotion: 8.6,
        reviewCount: 120
      },
      "2": {  // Gul Ahmed
        overallScore: 8.3,
        positiveScore: 70,
        neutralScore: 22,
        negativeScore: 8,
        qualityEmotion: 8.5,
        styleEmotion: 8.7,
        valueEmotion: 7.9,
        serviceEmotion: 8.1,
        reviewCount: 95
      },
      "3": {  // Sana Safinaz
        overallScore: 8.9,
        positiveScore: 80,
        neutralScore: 15,
        negativeScore: 5,
        qualityEmotion: 9.1,
        styleEmotion: 9.3,
        valueEmotion: 8.4,
        serviceEmotion: 8.8,
        reviewCount: 110
      },
      "4": {  // Sapphire
        overallScore: 8.1,
        positiveScore: 68,
        neutralScore: 24,
        negativeScore: 8,
        qualityEmotion: 8.3,
        styleEmotion: 8.5,
        valueEmotion: 7.8,
        serviceEmotion: 7.8,
        reviewCount: 85
      },
      "5": {  // Alkaram
        overallScore: 8.5,
        positiveScore: 72,
        neutralScore: 21,
        negativeScore: 7,
        qualityEmotion: 8.7,
        styleEmotion: 8.9,
        valueEmotion: 8.2,
        serviceEmotion: 8.2,
        reviewCount: 100
      }
    };
    
    return mockData[brandId] || mockData["1"];
  }
};