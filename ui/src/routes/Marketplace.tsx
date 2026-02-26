'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AddProductForm from '@/components/marketplace/AddProductForm';
import FarmerProfile, {
  type FarmerContactInfo,
} from '@/components/marketplace/FarmerProfile';
import type { MarketplaceProduct } from '@/types/marketplace';
import ProductCard from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dummyMarketplaceProducts } from '@/dummy-data/products';
import { useMarketplaceDB } from '@/hooks/useMarketplaceDB';
import { Plus, Search, Store, UserPlus, RefreshCw } from 'lucide-react';

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
  const {
    isReady,
    error: dbError,
    getFarmerProfile,
    saveFarmerProfile,
    getAllProducts,
    addProduct,
    seedInitialProducts,
  } = useMarketplaceDB();

  const [farmerInfo, setFarmerInfo] = useState<FarmerContactInfo | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load data from IndexedDB
  useEffect(() => {
    console.log('🔄 useEffect triggered, isReady:', isReady);
    
    const loadData = async () => {
      console.log('📦 loadData started');
      setLoading(true);
      
      try {
        // If database is not ready, use dummy data as fallback
        if (!isReady) {
          console.log('⚠️ DB not ready, using dummy data as fallback');
          setProducts(dummyMarketplaceProducts);
          setLoading(false);
          return;
        }

        console.log('🌱 Seeding initial products...');
        // Seed initial products if needed
        await seedInitialProducts(dummyMarketplaceProducts);

        console.log('👤 Loading farmer profile...');
        // Load farmer profile
        const profile = await getFarmerProfile();
        console.log('Profile loaded:', profile);
        setFarmerInfo(profile);

        console.log('📦 Loading all products...');
        // Load all products
        const allProducts = await getAllProducts();
        console.log('Products loaded:', allProducts.length);
        
        // Sort by posted date (newest first)
        const sorted = allProducts.sort((a, b) => 
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
        setProducts(sorted);
      } catch (error) {
        console.error('❌ Failed to load marketplace data:', error);
        // Fallback to dummy data on error
        setProducts(dummyMarketplaceProducts);
      } finally {
        setLoading(false);
        console.log('✅ Loading complete');
      }
    };

    loadData();
  }, [isReady, getFarmerProfile, getAllProducts, seedInitialProducts]);

  const handleSaveFarmerInfo = async (info: FarmerContactInfo) => {
    console.log('💾 Attempting to save profile, isReady:', isReady);
    
    if (!isReady) {
      console.error('❌ Database not ready yet');
      alert('Database is still initializing. Please wait a moment and try again.');
      return;
    }

    setIsSaving(true);
    try {
      await saveFarmerProfile(info);
      console.log('✅ Profile saved successfully');
      setFarmerInfo(info);
      setIsProfileFormOpen(false);
    } catch (error) {
      console.error('❌ Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProduct = async (newProduct: MarketplaceProduct) => {
    if (!isReady) {
      alert('Database is still initializing. Please wait a moment and try again.');
      return;
    }

    if (farmerInfo) {
      try {
        const productWithFarmerInfo = {
          ...newProduct,
          farmerName: farmerInfo.name,
          farmerLocation: farmerInfo.location,
          farmerPhone: farmerInfo.phone,
          postedDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        };

        const newId = await addProduct(productWithFarmerInfo);
        console.log('✅ Product added with ID:', newId);

        // Refresh products list
        const allProducts = await getAllProducts();
        const sorted = allProducts.sort((a, b) => 
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
        setProducts(sorted);
        setIsFormOpen(false);
      } catch (error) {
        console.error('Failed to add product:', error);
        alert('Failed to add product. Please try again.');
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading marketplace...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (dbError) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-semibold mb-2">Database Error</p>
              <p className="text-sm text-muted-foreground mb-4">{dbError}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
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
          {farmerInfo ? (
            <FarmerProfile
              farmerInfo={farmerInfo}
              onSave={handleSaveFarmerInfo}
              // isSaving={isSaving}
            />
          ) : (
            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="p-6 text-center">
                <UserPlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold mb-2">Become a Seller</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your farmer profile to start selling your products to the community.
                </p>
                <Button 
                  onClick={() => setIsProfileFormOpen(true)}
                  className="w-full"
                  disabled={!isReady}
                >
                  {!isReady ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Farmer Profile
                    </>
                  )}
                </Button>
                {!isReady && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Please wait while database initializes...
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Add Product Button - Only show when farmerInfo exists */}
          {farmerInfo && (
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => setIsFormOpen(true)}
              disabled={!isReady}
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
                placeholder="Search products or farmers..."
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

        {/* Profile Creation Modal */}
        {isProfileFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50">
            <div className="bg-background w-full rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
              <FarmerProfile
                farmerInfo={null}
                onSave={handleSaveFarmerInfo}
                // isSaving={isSaving}
              />
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setIsProfileFormOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}