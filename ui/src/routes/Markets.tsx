import MainLayout from '@/components/layout/MainLayout';
import MarketCard from '@/components/markets/MarketCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Filter } from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Mock market data
const marketPrices = [
  {
    id: 'market-1',
    market: 'Central Market',
    location: 'Nairobi',
    product: 'Maize',
    price: 45.5,
    currency: 'KES',
    unit: 'kg',
    trend: 'up' as const,
    trendPercent: 5,
    lastUpdated: '2 hours ago',
    isStale: false,
  },
  {
    id: 'market-2',
    market: 'Eastleigh Market',
    location: 'Nairobi',
    product: 'Maize',
    price: 44.0,
    currency: 'KES',
    unit: 'kg',
    trend: 'stable' as const,
    trendPercent: 0,
    lastUpdated: '3 hours ago',
    isStale: false,
  },
  {
    id: 'market-3',
    market: 'Regional Market',
    location: 'Kisii',
    product: 'Maize',
    price: 42.0,
    currency: 'KES',
    unit: 'kg',
    trend: 'down' as const,
    trendPercent: -2,
    lastUpdated: '5 hours ago',
    isStale: false,
  },
  {
    id: 'market-4',
    market: 'Farmer Cooperative',
    location: 'Eldoret',
    product: 'Wheat',
    price: 52.0,
    currency: 'KES',
    unit: 'kg',
    trend: 'up' as const,
    trendPercent: 3,
    lastUpdated: '4 hours ago',
    isStale: false,
  },
  {
    id: 'market-5',
    market: 'Border Market',
    location: 'Malaba',
    product: 'Beans',
    price: 85.0,
    currency: 'KES',
    unit: 'kg',
    trend: 'down' as const,
    trendPercent: -4,
    lastUpdated: 'Yesterday',
    isStale: true,
  },
];

// Mock chart data
const priceHistory = [
  { date: 'Mon', price: 43.0 },
  { date: 'Tue', price: 43.5 },
  { date: 'Wed', price: 44.0 },
  { date: 'Thu', price: 44.5 },
  { date: 'Fri', price: 45.0 },
  { date: 'Sat', price: 45.5 },
  { date: 'Sun', price: 45.5 },
];

const products = [
  'All Products',
  'Maize',
  'Wheat',
  'Beans',
  'Tomato',
  'Cabbage',
];

export default function MarketsPage() {
  const [selectedProduct, setSelectedProduct] = useState('Maize');
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  const filteredPrices =
    selectedProduct === 'All Products'
      ? marketPrices
      : marketPrices.filter((m) => m.product === selectedProduct);

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
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-4">
          {/* Product Filter */}
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
            </CardContent>
          </Card>

          {/* Price Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Available Markets</h2>
              <Badge variant="secondary">{filteredPrices.length}</Badge>
            </div>

            {filteredPrices.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onViewHistory={() => setSelectedMarket(market.id)}
              />
            ))}
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
