import { useState, useEffect } from 'react'; // Add useEffect
import MainLayout from '@/components/layout/MainLayout';
import MarketCard from '@/components/markets/MarketCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Filter, RefreshCw } from 'lucide-react'; // Add RefreshCw
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePreferredCrops } from '@/hooks/usePreferredCrops';

// ==================== TYPES ====================

interface MarketPrice {
  id: string;
  market: string;
  location: string;
  name: string;
  price: number;
  currency: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  lastUpdated: string;
  isStale: boolean;
}

// ==================== COMPONENT ====================

export default function MarketsPage() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Filter states
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const { preferredCrops, availableCrops } = usePreferredCrops();
  const [selectedProducts, setSelectedProducts] =
    useState<string[]>(preferredCrops);
  const [products] = useState<string[]>(availableCrops);

  // // Get unique products from API data for filter
  // const getUniqueProducts = () => {
  //   const products = prices.map((p) => {
  //     // Extract product name from market or location (you might need to adjust this)
  //     // For now, we'll use a placeholder logic
  //     if (p.market.includes('Maize')) return 'Maize';
  //     if (p.market.includes('Beans')) return 'Beans';
  //     if (p.market.includes('Wheat')) return 'Wheat';
  //     return 'Other';
  //   });
  //   return ['All Products', ...new Set(products)];
  // };

  // Mock chart data (keep this for now, you can replace with real history later)
  const priceHistory = [
    { date: 'Mon', price: 43.0 },
    { date: 'Tue', price: 43.5 },
    { date: 'Wed', price: 44.0 },
    { date: 'Thu', price: 44.5 },
    { date: 'Fri', price: 45.0 },
    { date: 'Sat', price: 45.5 },
    { date: 'Sun', price: 45.5 },
  ];

  // Fetch data from API
  const fetchPrices = async () => {
    console.log('📡 Fetching market prices...');
    setLoading(true);
    setError(null);

    try {
      // The farmer's crops - customize this based on user preferences
      const farmerCommodities = ['maize', 'beans'];

      const response = await fetch(
        `http://localhost:8080/api/prices/latest?commodities=${farmerCommodities.join(',')}&markets=all`,
      );

      console.log('📥 Response status:', response.status);

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

      // For development, fallback to mock data if API fails
      console.log('⚠️ Using mock data as fallback');
      setPrices([
        {
          id: 'market-1',
          market: 'Central Market',
          location: 'Nairobi',
          name: 'Maize',
          price: 45.5,
          currency: 'KES',
          unit: 'kg',
          trend: 'up',
          trendPercent: 5,
          lastUpdated: '2 hours ago',
          isStale: false,
        },
        {
          id: 'market-2',
          market: 'Eastleigh Market',
          location: 'Nairobi',
          name: 'Maize',
          price: 44.0,
          currency: 'KES',
          unit: 'kg',
          trend: 'stable',
          trendPercent: 0,
          lastUpdated: '3 hours ago',
          isStale: false,
        },
        {
          id: 'market-3',
          market: 'Regional Market',
          location: 'Kisii',
          name: 'Maize',
          price: 42.0,
          currency: 'KES',
          unit: 'kg',
          trend: 'down',
          trendPercent: -2,
          lastUpdated: '5 hours ago',
          isStale: false,
        },
        {
          id: 'market-4',
          market: 'Farmer Cooperative',
          location: 'Eldoret',
          name: 'Wheat',
          price: 52.0,
          currency: 'KES',
          unit: 'kg',
          trend: 'up',
          trendPercent: 3,
          lastUpdated: '4 hours ago',
          isStale: false,
        },
        {
          id: 'market-5',
          market: 'Border Market',
          location: 'Malaba',
          name: 'Beans',
          price: 85.0,
          currency: 'KES',
          unit: 'kg',
          trend: 'down',
          trendPercent: -4,
          lastUpdated: 'Yesterday',
          isStale: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // const extractProductFromMarket = (market: string): string => {
  //   const marketLower = market.toLowerCase();
  //   if (marketLower.includes('maize')) return 'Maize';
  //   if (marketLower.includes('bean')) return 'Beans';
  //   if (marketLower.includes('wheat')) return 'Wheat';
  //   if (marketLower.includes('cassava')) return 'Cassava';
  //   if (marketLower.includes('sorghum')) return 'Sorghum';
  //   return 'Other';
  // };

  // Load on mount
  useEffect(() => {
    fetchPrices();
  }, []);

  // Filter prices based on selected product
  const filteredPrices = selectedProducts.includes('All Products')
    ? prices
    : prices.filter((p) => {
        // This is a simple filter - you might want to adjust based on your data structure
        const pI = selectedProducts.findIndex(
          (pr) => pr.toLowerCase() === p.name.toLowerCase(),
        );
        const productName = pI >= 0 ? p.name.toLowerCase() : '';
        return (
          p.market.toLowerCase().includes(productName) ||
          p.location.toLowerCase().includes(productName)
        );
      });

  // const products = getUniqueProducts();

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
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-muted animate-pulse rounded-lg"
                />
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
          {/* Product Filter - Only show if we have products */}
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
                  {products.map((product, i) => (
                    <Button
                      key={`${product}-${i}`}
                      variant={
                        selectedProducts.findIndex(
                          (p) => p.toLowerCase() == product.toLowerCase(),
                        ) >= 0
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setSelectedProducts((prevSt) => {
                          const pI = prevSt.findIndex(
                            (p) => p.toLowerCase() === product.toLowerCase(),
                          );
                          if (pI >= 0)
                            return prevSt.filter(
                              (p) => p.toLowerCase() !== product.toLowerCase(),
                            );
                          else return [...prevSt, product];
                        })
                      }
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
                  onViewHistory={() => setSelectedMarket(market.id)}
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
                  <h3 className="font-semibold">Price Trend</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMarket(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceHistory}>
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
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Min</p>
                    <p className="font-semibold">43.0</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Avg</p>
                    <p className="font-semibold">44.4</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Max</p>
                    <p className="font-semibold">45.5</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedMarket(null)}
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
