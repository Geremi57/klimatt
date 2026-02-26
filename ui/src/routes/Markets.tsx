import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MarketCard from '@/components/markets/MarketCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Filter, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ==================== TYPES ====================

interface MarketPrice {
  id: string;
  market: string;
  location: string;
  product: string;
  price: number;
  currency: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  lastUpdated: string;
  isStale: boolean;
}

interface PriceHistoryPoint {
  date: string;
  price: number;
}

interface SelectedMarketData {
  id: string;
  market: string;
  product: string;
  price: number;
  currency: string;
  unit: string;
}

// ==================== COMPONENT ====================

export default function MarketsPage() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  
  // Filter states
  const [selectedProduct, setSelectedProduct] = useState('All Products');
  const [selectedMarket, setSelectedMarket] = useState<SelectedMarketData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Get unique products from API data for filter
  const getUniqueProducts = (): string[] => {
    const products = prices.map(p => p.product);
    return ['All Products', ...new Set(products)].sort();
  };

  // Fetch data from API
  const fetchPrices = async () => {
    console.log('📡 Fetching market prices...');
    setLoading(true);
    setError(null);
    
    try {
      const farmerCommodities = ['maize', 'beans'];
      
      const response = await fetch(
        `http://localhost:8080/api/prices/latest?commodities=${farmerCommodities.join(',')}&markets=all`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Data received:', data);
      setPrices(data);
      setLastFetched(new Date());
    } catch (err) {
      console.error('❌ Error fetching prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prices');
      
      // Fallback mock data
      setPrices([
        {
          id: 'market-1',
          market: 'Central Market',
          location: 'Nairobi',
          product: 'Maize',
          price: 45.5,
          currency: 'KES',
          unit: 'kg',
          trend: 'up',
          trendPercent: 5,
          lastUpdated: '2 hours ago',
          isStale: false,
        },
        // ... other mock data
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch price history for selected market
  const fetchPriceHistory = async (marketName: string, productName: string) => {
    setHistoryLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/prices/history?market=${encodeURIComponent(marketName)}&commodity=${encodeURIComponent(productName)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      
      const data = await response.json();
      console.log('📊 Price history:', data);
      setPriceHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
      // Generate mock history as fallback
      generateMockHistory();
    } finally {
      setHistoryLoading(false);
    }
  };

  // Generate mock history for demo if API fails
  const generateMockHistory = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const mockHistory = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      mockHistory.push({
        date: months[monthIndex],
        price: 40 + Math.random() * 10
      });
    }
    setPriceHistory(mockHistory);
  };

  // Load on mount
  useEffect(() => {
    fetchPrices();
  }, []);

  // Handle view history
  const handleViewHistory = (marketId: string) => {
    const marketData = prices.find(p => p.id === marketId);
    if (marketData) {
      setSelectedMarket({
        id: marketData.id,
        market: marketData.market,
        product: marketData.product,
        price: marketData.price,
        currency: marketData.currency,
        unit: marketData.unit
      });
      fetchPriceHistory(marketData.market, marketData.product);
    }
  };

  // Filter prices based on selected product
  const filteredPrices = selectedProduct === 'All Products'
    ? prices
    : prices.filter(p => p.product === selectedProduct);

  const products = getUniqueProducts();

  // Calculate statistics from price history
  const getStats = () => {
    if (priceHistory.length === 0) {
      return { min: 0, max: 0, avg: 0, change: 0, changePercent: 0 };
    }
    
    const prices = priceHistory.map(h => h.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    const firstPrice = priceHistory[0]?.price || 0;
    const lastPrice = priceHistory[priceHistory.length - 1]?.price || 0;
    const change = lastPrice - firstPrice;
    const changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0;
    
    return { min, max, avg, change, changePercent };
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background">
          <div className="bg-primary text-primary-foreground px-4 py-8">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Market Prices</h1>
            </div>
            <p className="text-primary-foreground/90 text-sm">
              Loading prices from local markets...
            </p>
          </div>
          <div className="px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error && prices.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background">
          <div className="bg-primary text-primary-foreground px-4 py-8">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Market Prices</h1>
            </div>
          </div>
          <div className="px-4 py-6">
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              <p className="font-semibold">Error loading prices</p>
              <p className="text-sm mt-1">{error}</p>
              <Button onClick={fetchPrices} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
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
            Current prices from local markets
          </p>
          {lastFetched && (
            <p className="text-primary-foreground/70 text-xs mt-2">
              Last updated: {lastFetched.toLocaleString()}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-4">
          {/* Product Filter */}
          {products.length > 1 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4" />
                  <CardTitle className="text-base">Products</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {products.map((product) => (
                    <Button
                      key={product}
                      variant={selectedProduct === product ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                      className="text-xs"
                    >
                      {product}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button onClick={fetchPrices} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Price Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Available Markets</h2>
              <Badge variant="secondary">{filteredPrices.length}</Badge>
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
              <div className="text-center py-8 text-muted-foreground">
                No prices available for selected filters
              </div>
            )}
          </div>

          {/* Chart Modal */}
          {selectedMarket && (
            <div className="fixed inset-0 bg-black/50 flex items-end z-50">
              <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedMarket.product} Price History</h3>
                    <p className="text-sm text-muted-foreground">{selectedMarket.market}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMarket(null);
                      setPriceHistory([]);
                    }}
                  >
                    ✕
                  </Button>
                </div>

                {/* Current Price Summary */}
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-3xl font-bold text-primary">
                    {selectedMarket.currency} {selectedMarket.price.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      per {selectedMarket.unit}
                    </span>
                  </p>
                </div>

                {/* Price Chart */}
                {historyLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : priceHistory.length > 0 ? (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis 
                            dataKey="date" 
                            stroke="var(--color-muted-foreground)"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="var(--color-muted-foreground)"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `${selectedMarket.currency} ${value}`}
                          />
                         <Tooltip
  contentStyle={{
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px'
  }}
  formatter={(value: number | undefined) => {
    if (value === undefined) return ['N/A', 'Price'];
    return [
      `${selectedMarket?.currency || 'KES'} ${value.toFixed(2)}`,
      'Price'
    ];
  }}
/>
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="var(--color-primary)"
                            dot={{ fill: 'var(--color-primary)', r: 4 }}
                            activeDot={{ r: 6 }}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Statistics */}
                    {(() => {
                      const stats = getStats();
                      return (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Average (6 months)</p>
                            <p className="text-lg font-semibold">
                              {selectedMarket.currency} {stats.avg.toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Price Range</p>
                            <p className="text-lg font-semibold">
                              {selectedMarket.currency} {stats.min.toFixed(2)} - {stats.max.toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg col-span-2">
                            <p className="text-xs text-muted-foreground">6-Month Trend</p>
                            <div className="flex items-center gap-2">
                              {stats.change > 0 ? (
                                <>
                                  <TrendingUp className="w-4 h-4 text-accent" />
                                  <span className="text-accent font-semibold">
                                    +{stats.changePercent.toFixed(1)}% (↑ {selectedMarket.currency} {stats.change.toFixed(2)})
                                  </span>
                                </>
                              ) : stats.change < 0 ? (
                                <>
                                  <TrendingDown className="w-4 h-4 text-destructive" />
                                  <span className="text-destructive font-semibold">
                                    {stats.changePercent.toFixed(1)}% (↓ {selectedMarket.currency} {Math.abs(stats.change).toFixed(2)})
                                  </span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">Stable</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No historical data available
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedMarket(null);
                    setPriceHistory([]);
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