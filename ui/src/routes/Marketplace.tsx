'use client';

import MainLayout from '@/components/layout/MainLayout';
import AddProductForm from '@/components/marketplace/AddProductForm';
import FarmerProfile, {
  type FarmerContactInfo,
} from '@/components/marketplace/FarmerProfile';
import type { MarketplaceProduct } from '@/components/marketplace/ProductCard';
import ProductCard from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dummyMarketplaceProducts } from '@/dummy-data/products';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Plus, Search, Store } from 'lucide-react';
import { useEffect, useState } from 'react';

const productCategories = [
  'All',
  'Grains',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Livestock',
  'Seeds',
  'Other',
];

export default function MarketplacePage() {
  const [farmerInfo, setFarmerInfo] = useLocalStorage<FarmerContactInfo | null>(
    'farmerInfo',
    null,
  );
  const [products, setProducts] = useState<MarketplaceProduct[]>(
    dummyMarketplaceProducts,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  const handleSaveFarmerInfo = (info: FarmerContactInfo) => {
    setFarmerInfo(info);
  };

  const handleAddProduct = (newProduct: MarketplaceProduct) => {
    if (farmerInfo) {
      const productWithFarmerInfo = {
        ...newProduct,
        farmerName: farmerInfo.name,
        farmerLocation: farmerInfo.location,
        farmerPhone: farmerInfo.phone,
      };
      setProducts([productWithFarmerInfo, ...products]);
      setIsFormOpen(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isLoaded) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Farmer Marketplace</h1>
          </div>
          <p className="text-primary-foreground/90 text-sm">
            Buy directly from local farmers • Post your products
          </p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Farmer Profile Section */}
          {farmerInfo && (
            <FarmerProfile
              farmerInfo={farmerInfo}
              onSave={handleSaveFarmerInfo}
            />
          )}

          {!farmerInfo && (
            <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20 mb-4">
              <p className="text-sm text-muted-foreground mb-3">
                Set up your profile to start selling products
              </p>
            </div>
          )}

          {farmerInfo && (
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </Button>
          )}

          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {productCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full border-2 transition-all ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted border-border text-muted-foreground hover:border-primary'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Store className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-center">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'No products found matching your search'
                    : 'No products listed yet. Be the first to add one!'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Product Form Modal */}
        <AddProductForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddProduct}
        />
      </div>
    </MainLayout>
  );
}
