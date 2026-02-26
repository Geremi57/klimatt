import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router';
import type { MarketplaceProduct } from '@/types/marketplace';

// export interface MarketplaceProduct {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   currency: string;
//   quantity: string;
//   imageUrl: string;
//   category: string;
//   farmerName: string;
//   farmerLocation: string;
//   farmerPhone: string;
//   postedDate: string;
// }

interface ProductCardProps {
  product: MarketplaceProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/marketplace/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        {/* Image */}
        <div className="relative w-full h-40 bg-muted overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2212%22 fill=%22%239ca3af%22%3EImage not found%3C/text%3E%3C/svg%3E';
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/90">
              {product.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardHeader className="pb-2">
          <CardTitle className="text-base line-clamp-2">
            {product.name}
          </CardTitle>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {product.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Price */}
          <div>
            <p className="text-lg font-bold text-primary">
              {product.currency} {product.price.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {product.quantity} available
            </p>
          </div>

          {/* Farmer Info */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground">Farmer</p>
            <p className="text-sm font-semibold">{product.farmerName}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {product.farmerLocation}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
