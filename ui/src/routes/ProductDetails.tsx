'use client';

import MainLayout from '@/components/layout/MainLayout';
import type { MarketplaceProduct } from '@/types/marketplace';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketplaceDB } from '@/hooks/useMarketplaceDB';
import { ArrowLeft, Check, Copy, MapPin, Phone, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

export default function ProductDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const productId = params.productId || '';
  
  const {
    isReady,
    getAllProducts,
  } = useMarketplaceDB();

  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!isReady) return;
      
      setLoading(true);
      try {
        const allProducts = await getAllProducts();
        const found = allProducts.find((p) => p.id === parseInt(productId));
        setProduct(found || null);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, getAllProducts, isReady]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center pb-20">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 pb-20">
          <p className="text-muted-foreground mb-2">Product not found</p>
          <p className="text-sm text-muted-foreground mb-4">Product ID: {productId}</p>
          <Button
            variant="outline"
            onClick={() => navigate('/marketplace')}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background pb-32">
        {/* Header with Back Button */}
        <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-primary-foreground/20 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex-1">Product Details</h1>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-4">
          {/* Product Image */}
          <div className="w-full h-64 bg-muted rounded-lg overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2212%22 fill=%22%239ca3af%22%3EImage not found%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>

          {/* Product Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <Badge variant="outline" className="mt-2">
                    {product.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price */}
              <div className="pb-4 border-b border-border">
                <p className="text-muted-foreground text-sm mb-1">Price</p>
                <p className="text-3xl font-bold text-primary">
                  {product.currency} {product.price.toLocaleString()}
                </p>
              </div>

              {/* Description */}
              <div>
                <p className="text-muted-foreground text-sm mb-2">
                  Description
                </p>
                <p className="text-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-muted-foreground text-sm mb-1">
                  Quantity Available
                </p>
                <p className="text-foreground font-medium">
                  {product.quantity}
                </p>
              </div>

              {/* Posted Date */}
              <div>
                <p className="text-muted-foreground text-sm mb-1">Posted</p>
                <p className="text-foreground">{product.postedDate}</p>
              </div>
            </CardContent>
          </Card>

          {/* Farmer Contact Information */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👨‍🌾 Farmer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Farmer Name */}
              <div>
                <p className="text-muted-foreground text-sm mb-1">
                  Farmer Name
                </p>
                <p className="text-foreground font-semibold text-lg">
                  {product.farmerName}
                </p>
              </div>

              {/* Location */}
              <div>
                <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location
                </p>
                <p className="text-foreground">{product.farmerLocation}</p>
              </div>

              {/* Phone */}
              <div>
                <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Phone
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${product.farmerPhone}`}
                    className="text-primary font-medium hover:underline flex-1"
                  >
                    {product.farmerPhone}
                  </a>
                  <button
                    onClick={() => handleCopy(product.farmerPhone, 'phone')}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <a href={`tel:${product.farmerPhone}`} className="flex-1">
                  <Button className="w-full gap-2" size="lg">
                    <Phone className="w-4 h-4" />
                    Call Farmer
                  </Button>
                </a>
                <a href={`sms:${product.farmerPhone}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="lg">
                    Message
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Share Product */}
          <Card>
            <CardContent className="pt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const text = `Check out this ${product.category.toLowerCase()}: ${product.name} for ${product.currency} ${product.price} from ${product.farmerName}. Contact: ${product.farmerPhone}`;
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: text,
                    });
                  } else {
                    handleCopy(text, 'share');
                  }
                }}
              >
                Share Product
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}