import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useState } from 'react';
import type { MarketplaceProduct } from '@/types/marketplace';

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: MarketplaceProduct) => void;
}

const productCategories = [
  'Grains',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Livestock',
  'Seeds',
  'Other',
];

export default function AddProductForm({
  isOpen,
  onClose,
  onSubmit,
}: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'KES',
    quantity: '',
    imageUrl: '',
    category: 'Grains',
  });

  const handleSubmit = () => {
    if (
      formData.name &&
      formData.description &&
      formData.price &&
      formData.quantity &&
      formData.imageUrl
    ) {
      const newProduct: MarketplaceProduct = {
        id: Math.floor(Math.random() * 100000),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        quantity: formData.quantity,
        imageUrl: formData.imageUrl,
        category: formData.category,
        farmerName: '', // Will be filled from farmer info
        farmerLocation: '',
        farmerPhone: '',
        postedDate: new Date().toLocaleDateString(),
      };
      onSubmit(newProduct);
      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'KES',
        quantity: '',
        imageUrl: '',
        category: 'Grains',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-background w-full rounded-t-2xl p-4 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Add New Product</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Product Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Product Name
            </label>
            <Input
              type="text"
              placeholder="e.g., Fresh Tomatoes, Maize"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Description
            </label>
            <textarea
              placeholder="Describe your product quality, type, etc."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-input border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-20 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {productCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price and Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Price
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full bg-input border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="KES">KES</option>
                <option value="UGX">UGX</option>
                <option value="TZS">TZS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Quantity Available
            </label>
            <Input
              type="text"
              placeholder="e.g., 50 kg, 100 bags, 10 tons"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Image URL
            </label>
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
            />
            {formData.imageUrl && (
              <div className="mt-2 w-full h-24 bg-muted rounded-lg overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.name ||
                !formData.description ||
                !formData.price ||
                !formData.quantity ||
                !formData.imageUrl
              }
              className="flex-1"
            >
              Add Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
