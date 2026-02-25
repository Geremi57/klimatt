import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketPrice {
  id: string;
  market: string;
  name: string;
  location: string;
  price: number;
  currency: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  lastUpdated: string;
  isStale: boolean;
}

interface MarketCardProps {
  market: MarketPrice;
  onViewHistory?: (marketId: string) => void;
}

export default function MarketCard({ market, onViewHistory }: MarketCardProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-accent';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`overflow-hidden ${market.isStale ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{market.market}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {market.location}
            </p>
            <span className="ml-2 text-sm text-muted-foreground">
    ({market.name})
  </span>
          </div>
          {market.isStale && <Badge variant="secondary">Offline</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Price per {market.unit}
            </p>
            <p className="text-2xl font-bold">
              {market.currency} {market.price.toFixed(2)}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 ${getTrendColor(market.trend)}`}
          >
            {getTrendIcon(market.trend)}
            <span className="text-sm font-medium">{market.trendPercent}%</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">
            Updated: {market.lastUpdated}
          </p>
        </div>

        {onViewHistory && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onViewHistory(market.id)}
          >
            View Price History
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
