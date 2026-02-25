// ui/src/routes/Markets.tsx
import MainLayout from '@/components/layout/MainLayout';
import MarketCard from '@/components/markets/MarketCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Filter, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Types matching your Go backend CSV structure
interface Location {
  lat: number;
  long: number;
}

interface Commodity {
  id: number;
  name: string;
  price: number;
  currency: string;
  price_flag: string;
  price_type: string;
  unit: string;
  date: string;
  commodity_id: number;
}

interface FoodCategory {
  name: string;
  foods: Commodity[];
}

interface Market {
  name: string;
  location: Location;
  food_categories: FoodCategory[];
  admin1: string; // region (e.g., "Coast", "Eastern", "Nairobi")
  admin2: string; // county (e.g., "Mombasa", "Marsabit", "Nairobi")
}

// Transformed market price for display
interface MarketPrice {
  id: string;
  market: string;
  location: string;
  product: string;
  category: string;
  price: number;
  currency: string;
  unit: string;
  priceType: string; // "Wholesale" or "Retail"
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  lastUpdated: string;
  isStale: boolean;
  date: string;
  commodityId: number;
  marketId: number;
}

// Price history point
interface PriceHistoryPoint {
  date: string;
  price: number;
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedProduct, setSelectedProduct] = useState<string>('All Products');
  const [selectedPriceType, setSelectedPriceType] = useState<string>('All');
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [selectedMarketData, setSelectedMarketData] = useState<{
    market: string;
    product: string;
    history: PriceHistoryPoint[];
  } | null>(null);
  
  const [products, setProducts] = useState<string[]>(['All Products']);
  const priceTypes = ['All', 'Wholesale', 'Retail'];

  // Check if price data is more than 30 days old
  const isDateStale = (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    return date < thirtyDaysAgo;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Extract base commodity name (remove parentheses)
  const getBaseCommodityName = (fullName: string): string => {
    // Remove anything in parentheses and trim
    return fullName.replace(/\s*\([^)]*\)/g, '').trim();
  };

  // Generate a simple trend based on price history
  const calculateTrend = (prices: number[]): { trend: 'up' | 'down' | 'stable'; percent: number } => {
    if (prices.length < 2) return { trend: 'stable', percent: 0 };
    
    const oldest = prices[0];
    const newest = prices[prices.length - 1];
    
    if (newest > oldest) {
      const percent = ((newest - oldest) / oldest) * 100;
      return { trend: 'up', percent: Number(percent.toFixed(1)) };
    } else if (newest < oldest) {
      const percent = ((oldest - newest) / oldest) * 100;
      return { trend: 'down', percent: Number(percent.toFixed(1)) };
    }
    return { trend: 'stable', percent: 0 };
  };

  // Transform market data to flat list of prices
  const transformMarketData = (markets: Market[]): MarketPrice[] => {
    const prices: MarketPrice[] = [];
    
    // Group prices by market and base product to calculate trends
    const priceGroups: Record<string, number[]> = {};
    
    markets.forEach(market => {
      market.food_categories.forEach(category => {
        category.foods.forEach(food => {
          const baseName = getBaseCommodityName(food.name);
          const key = `${market.name}-${baseName}-${food.price_type}`;
          if (!priceGroups[key]) {
            priceGroups[key] = [];
          }
          priceGroups[key].push(Number(food.price)); // Ensure price is a number
        });
      });
    });

    // Create price entries with trends
    markets.forEach(market => {
      market.food_categories.forEach(category => {
        category.foods.forEach(food => {
          const baseName = getBaseCommodityName(food.name);
          const key = `${market.name}-${baseName}-${food.price_type}`;
          const trend = calculateTrend(priceGroups[key] || [Number(food.price)]);
          
          prices.push({
            id: `${market.name}-${food.commodity_id}-${food.price_type}-${Date.now()}-${Math.random()}`,
            market: market.name,
            location: `${market.admin2}, ${market.admin1}`,
            product: food.name,
            category: category.name,
            price: Number(food.price), // Ensure price is a number
            currency: food.currency,
            unit: food.unit,
            priceType: food.price_type,
            trend: trend.trend,
            trendPercent: trend.percent,
            lastUpdated: formatDate(food.date),
            isStale: isDateStale(food.date),
            date: food.date,
            commodityId: food.commodity_id,
            marketId: market.name ? parseInt(market.name) || 0 : 0
          });
        });
      });
    });

    return prices;
  };

  // Generate price history for a specific market and product
  const generatePriceHistory = (marketName: string, productName: string): PriceHistoryPoint[] => {
    const marketPrice = marketPrices.find(
      mp => mp.market === marketName && mp.product === productName
    );
    
    if (!marketPrice) return [];
    
    const basePrice = marketPrice.price;
    const history: PriceHistoryPoint[] = [];
    const dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    dates.forEach((date) => {
      const variation = (Math.random() * 0.1 - 0.05) * basePrice;
      const price = Number((basePrice + variation).toFixed(2));
      history.push({ date, price });
    });
    
    return history;
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/markets');
      if (!response.ok) throw new Error('Failed to fetch markets');
      const data = await response.json();
      setMarkets(data);
      
      // Transform data for display
      const prices = transformMarketData(data);
      setMarketPrices(prices);
      
      // Extract unique products (using base names for filtering)
      const uniqueProducts = ['All Products', 
        ...new Set(prices.map(p => getBaseCommodityName(p.product)))]
        .sort();
      setProducts(uniqueProducts);
      
      console.log(`Loaded ${prices.length} price entries from ${data.length} markets`);
      // Log first few prices to debug
      console.log('Sample prices:', prices.slice(0, 3));
      
    } catch (err) {
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (marketId: string) => {
    const priceEntry = marketPrices.find(p => p.id === marketId);
    if (priceEntry) {
      setSelectedMarket(marketId);
      setSelectedMarketData({
        market: priceEntry.market,
        product: priceEntry.product,
        history: generatePriceHistory(priceEntry.market, priceEntry.product)
      });
    }
  };

  // Apply filters
  const filteredPrices = marketPrices.filter((price) => {
    // Product filter
    if (selectedProduct !== 'All Products') {
      const baseName = getBaseCommodityName(price.product);
      if (baseName !== selectedProduct) return false;
    }
    
    // Price type filter
    if (selectedPriceType !== 'All' && price.priceType !== selectedPriceType) return false;
    
    return true;
  });

  // Calculate stats for selected market
  const calculateStats = () => {
    if (!selectedMarketData?.history.length) return { min: 0, avg: 0, max: 0 };
    
    const prices = selectedMarketData.history.map(h => h.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    return {
      min: min.toFixed(1),
      avg: avg.toFixed(1),
      max: max.toFixed(1)
    };
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading market data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Market Prices</h1>
          </div>
          <p className="text-primary-foreground/90 text-sm">
            Current prices from {markets.length} markets across Kenya
          </p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4" />
                <CardTitle className="text-base">Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Product Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Product</label>
                  <div className="flex flex-wrap gap-2">
                    {products.map((product) => (
                      <Button
                        key={product}
                        variant={
                          selectedProduct === product ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                        className="text-xs"
                      >
                        {product}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Type Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Type</label>
                  <div className="flex flex-wrap gap-2">
                    {priceTypes.map((type) => (
                      <Button
                        key={type}
                        variant={
                          selectedPriceType === type ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setSelectedPriceType(type)}
                        className="text-xs"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Available Prices</h2>
              <Badge variant="secondary">{filteredPrices.length} entries</Badge>
            </div>

            {filteredPrices.length > 0 ? (
              filteredPrices.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  onViewHistory={() => handleViewHistory(market.id)}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">No prices found for selected filters</p>
              </div>
            )}
          </div>

          {/* Chart Modal */}
          {selectedMarket && selectedMarketData && (
            <div className="fixed inset-0 bg-black/50 flex items-end z-50">
              <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedMarketData.product}</h3>
                    <p className="text-sm text-muted-foreground">{selectedMarketData.market}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMarket(null);
                      setSelectedMarketData(null);
                    }}
                  >
                    ✕
                  </Button>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedMarketData.history}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="var(--color-muted-foreground)"
                      />
                      <YAxis stroke="var(--color-muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="var(--color-primary)"
                        dot={{ fill: 'var(--color-primary)' }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(() => {
                    const stats = calculateStats();
                    return (
                      <>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Min</p>
                          <p className="font-semibold">KES {stats.min}</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Avg</p>
                          <p className="font-semibold">KES {stats.avg}</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Max</p>
                          <p className="font-semibold">KES {stats.max}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedMarket(null);
                    setSelectedMarketData(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}