'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Plus, 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Sprout,
  Beaker,
  Tractor,
  Warehouse,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

// ==================== TYPES ====================

type StockCategory = 'seeds' | 'fertilizer' | 'harvest' | 'supplies' | 'pesticides';
type StockUnit = 'kg' | 'g' | 'liters' | 'bags' | 'pieces' | 'tons';

interface StockItem {
  id: number;
  name: string;
  category: StockCategory;
  quantity: number;
  unit: StockUnit;
  minThreshold: number;
  price?: number;
  supplier?: string;
  dateAdded: string;
  expiryDate?: string;
  notes?: string;
  location?: string;
}

// ==================== MOCK DATA ====================

const mockStockItems: StockItem[] = [
  {
    id: 1,
    name: 'Maize Seeds (Hybrid)',
    category: 'seeds',
    quantity: 50,
    unit: 'kg',
    minThreshold: 20,
    price: 450,
    supplier: 'Kenya Seed Company',
    dateAdded: '2026-01-15',
    expiryDate: '2026-12-31',
    location: 'Barn A',
  },
  {
    id: 2,
    name: 'DAP Fertilizer',
    category: 'fertilizer',
    quantity: 120,
    unit: 'kg',
    minThreshold: 50,
    price: 65,
    supplier: 'Yara',
    dateAdded: '2026-02-10',
    location: 'Shed 2',
  },
  {
    id: 3,
    name: 'Harvested Maize',
    category: 'harvest',
    quantity: 2500,
    unit: 'kg',
    minThreshold: 500,
    price: 45,
    dateAdded: '2026-03-01',
    location: 'Grain Store',
  },
  {
    id: 4,
    name: 'Roundup Herbicide',
    category: 'pesticides',
    quantity: 15,
    unit: 'liters',
    minThreshold: 5,
    price: 1200,
    supplier: 'Bayer',
    dateAdded: '2026-01-20',
    expiryDate: '2026-10-15',
    location: 'Chemical Store',
  },
  {
    id: 5,
    name: 'Bean Seeds',
    category: 'seeds',
    quantity: 30,
    unit: 'kg',
    minThreshold: 15,
    price: 280,
    supplier: 'Local Co-op',
    dateAdded: '2026-02-05',
    expiryDate: '2026-11-30',
    location: 'Barn A',
  },
  {
    id: 6,
    name: 'Harvested Beans',
    category: 'harvest',
    quantity: 800,
    unit: 'kg',
    minThreshold: 200,
    price: 85,
    dateAdded: '2026-03-10',
    location: 'Grain Store',
  },
];

// ==================== HELPER FUNCTIONS ====================

const getCategoryIcon = (category: StockCategory) => {
  switch (category) {
    case 'seeds':
      return <Sprout className="w-5 h-5" />;
    case 'fertilizer':
      return <Beaker className="w-5 h-5" />;
    case 'harvest':
      return <Warehouse className="w-5 h-5" />;
    case 'supplies':
      return <Tractor className="w-5 h-5" />;
    case 'pesticides':
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <Package className="w-5 h-5" />;
  }
};

const getCategoryColor = (category: StockCategory) => {
  switch (category) {
    case 'seeds':
      return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
    case 'fertilizer':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
    case 'harvest':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
    case 'supplies':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400';
    case 'pesticides':
      return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};

const getStockStatus = (item: StockItem) => {
  if (item.quantity === 0) return { label: 'Out of Stock', color: 'bg-red-500', icon: '⚠️' };
  if (item.quantity <= item.minThreshold) return { label: 'Low Stock', color: 'bg-orange-500', icon: '🔔' };
  return { label: 'In Stock', color: 'bg-green-500', icon: '✅' };
};

const formatCurrency = (amount?: number) => {
  if (!amount) return 'N/A';
  return `KES ${amount.toLocaleString()}`;
};

// ==================== MAIN COMPONENT ====================

export default function StockPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>(mockStockItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StockCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'seeds' as StockCategory,
    quantity: '',
    unit: 'kg' as StockUnit,
    minThreshold: '',
    price: '',
    supplier: '',
    dateAdded: new Date().toISOString().split('T')[0],
    expiryDate: '',
    notes: '',
    location: '',
  });

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let filtered = stockItems;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.supplier?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [stockItems, selectedCategory, searchQuery, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const totalItems = stockItems.length;
    const totalValue = stockItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const lowStock = stockItems.filter(item => item.quantity <= item.minThreshold).length;
    const outOfStock = stockItems.filter(item => item.quantity === 0).length;
    const categories = new Set(stockItems.map(item => item.category)).size;

    return {
      totalItems,
      totalValue,
      lowStock,
      outOfStock,
      categories,
    };
  }, [stockItems]);

  const handleAddItem = () => {
    if (formData.name && formData.quantity && formData.minThreshold) {
      const newItem: StockItem = {
        id: Math.max(...stockItems.map(i => i.id), 0) + 1,
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        minThreshold: parseFloat(formData.minThreshold),
        price: formData.price ? parseFloat(formData.price) : undefined,
        supplier: formData.supplier || undefined,
        dateAdded: formData.dateAdded,
        expiryDate: formData.expiryDate || undefined,
        notes: formData.notes || undefined,
        location: formData.location || undefined,
      };

      setStockItems([newItem, ...stockItems]);
      resetForm();
      setIsModalOpen(false);
    }
  };

 

  const updateStockItem = (id: number, updates: Partial<StockItem>) => {
    setStockItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteStockItem = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setStockItems(prev => prev.filter(item => item.id !== id));
      if (expandedItem === id) setExpandedItem(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'seeds',
      quantity: '',
      unit: 'kg',
      minThreshold: '',
      price: '',
      supplier: '',
      dateAdded: new Date().toISOString().split('T')[0],
      expiryDate: '',
      notes: '',
      location: '',
    });
  };

  const categories: { value: StockCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Items' },
    { value: 'seeds', label: 'Seeds' },
    { value: 'fertilizer', label: 'Fertilizer' },
    { value: 'harvest', label: 'Harvest' },
    { value: 'pesticides', label: 'Pesticides' },
    { value: 'supplies', label: 'Supplies' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/10 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Stock Keeping</h1>
          </div>
          <p className="text-primary-foreground/90 text-sm">
            Track your farm inventory • Seeds • Fertilizer • Harvest
          </p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{stats.categories}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Stock Value</p>
                <p className="text-base font-bold truncate">
                  {formatCurrency(stats.totalValue)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              className="flex-1 gap-2"
              size="lg"
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-5 h-5" />
              Add Item
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => {/* Export functionality */}}
            >
              <Download className="w-5 h-5" />
              Export
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search items, suppliers, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value as typeof selectedCategory)}
                    className={cn(
                      "whitespace-nowrap px-4 py-2 rounded-full border-2 transition-all text-sm",
                      selectedCategory === cat.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm bg-transparent border rounded px-2 py-1"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="quantity">Sort by Quantity</option>
                    <option value="price">Sort by Price</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="h-8 w-8"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>
                <Badge variant="secondary">
                  {filteredItems.length} items
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stock Items List */}
          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const status = getStockStatus(item);
                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "cursor-pointer hover:shadow-md transition-all",
                      expandedItem === item.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          getCategoryColor(item.category)
                        )}>
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <CardTitle className="text-sm font-semibold line-clamp-1">
                              {item.name}
                            </CardTitle>
                            <Badge className={cn(
                              "text-xs",
                              status.color
                            )}>
                              {status.icon} {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-medium">
                              {item.quantity} {item.unit}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{item.category}</span>
                            {item.location && (
                              <>
                                <span>•</span>
                                <span>{item.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {expandedItem === item.id && (
                      <CardContent className="p-4 pt-2 border-t border-border/50">
                        <div className="space-y-4">
                          {/* Stock Level Indicator */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Stock Level</span>
                              <span className="font-medium">
                                {item.quantity} {item.unit} / Min: {item.minThreshold} {item.unit}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={cn(
                                  "h-2 rounded-full",
                                  item.quantity === 0 ? 'bg-red-500' :
                                  item.quantity <= item.minThreshold ? 'bg-orange-500' : 'bg-green-500'
                                )}
                                style={{
                                  width: `${Math.min((item.quantity / (item.minThreshold * 2)) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>

                          {/* Quick Add Buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStockItem(item.id, { quantity: item.quantity + 10 });
                              }}
                            >
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Add 10
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.quantity >= 10) {
                                  updateStockItem(item.id, { quantity: item.quantity - 10 });
                                }
                              }}
                            >
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Remove 10
                            </Button>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {item.price && (
                              <div>
                                <p className="text-xs text-muted-foreground">Price</p>
                                <p className="font-medium">{formatCurrency(item.price)}/{item.unit}</p>
                              </div>
                            )}
                            {item.supplier && (
                              <div>
                                <p className="text-xs text-muted-foreground">Supplier</p>
                                <p className="font-medium truncate">{item.supplier}</p>
                              </div>
                            )}
                            {item.expiryDate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Expiry Date</p>
                                <p className="font-medium">{item.expiryDate}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground">Added</p>
                              <p className="font-medium">{item.dateAdded}</p>
                            </div>
                          </div>

                          {item.notes && (
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Notes</p>
                              <p className="text-sm">{item.notes}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteStockItem(item.id);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-center">No items found</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {searchQuery ? 'Try a different search' : 'Add your first stock item'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Add/Edit Item Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50">
            <div className="bg-background w-full rounded-t-2xl p-4 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-background pt-2">
                <h2 className="text-lg font-bold">Add Stock Item</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Item Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Hybrid Maize Seeds"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as StockCategory })}
                    className="w-full p-2 rounded-lg border bg-background"
                  >
                    <option value="seeds">Seeds</option>
                    <option value="fertilizer">Fertilizer</option>
                    <option value="harvest">Harvest</option>
                    <option value="pesticides">Pesticides</option>
                    <option value="supplies">Supplies</option>
                  </select>
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Quantity *
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value as StockUnit })}
                      className="w-full p-2 rounded-lg border bg-background"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="liters">liters</option>
                      <option value="bags">bags</option>
                      <option value="pieces">pieces</option>
                      <option value="tons">tons</option>
                    </select>
                  </div>
                </div>

                {/* Min Threshold */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Minimum Threshold *
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll be alerted when stock falls below this amount
                  </p>
                </div>

                {/* Price and Supplier */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Price (KES)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Supplier
                    </label>
                    <Input
                      type="text"
                      placeholder="Supplier name"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    />
                  </div>
                </div>

                {/* Location and Expiry */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Location
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Barn A"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Expiry Date
                    </label>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Notes
                  </label>
                  <textarea
                    placeholder="Additional notes about this item..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-3 rounded-lg border bg-background min-h-[80px] text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 sticky bottom-0 bg-background pb-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsModalOpen(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    disabled={!formData.name || !formData.quantity || !formData.minThreshold}
                    className="flex-1"
                  >
                    Add Item
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}