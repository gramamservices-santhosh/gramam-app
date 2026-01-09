'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { CATEGORIES, SAMPLE_PRODUCTS } from '@/constants/categories';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AdminProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Filter products
  const filteredProducts = SAMPLE_PRODUCTS.filter((product) => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (searchQuery) {
      return product.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted">Manage your product catalog</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-border/50 text-muted hover:text-foreground'
            )}
          >
            All Products
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                selectedCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-border/50 text-muted hover:text-foreground'
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => (
          <Card key={`${product.name}-${index}`}>
            <div className="aspect-square bg-border/30 rounded-xl mb-3 flex items-center justify-center">
              <span className="text-4xl">
                {product.category === 'groceries' && '🛒'}
                {product.category === 'vegetables' && '🥬'}
                {product.category === 'fruits' && '🍎'}
                {product.category === 'dairy' && '🥛'}
                {product.category === 'medicines' && '💊'}
                {product.category === 'snacks' && '🍪'}
                {product.category === 'household' && '🧹'}
                {product.category === 'meat' && '🍖'}
              </span>
            </div>
            <h3 className="font-medium text-foreground">{product.name}</h3>
            <p className="text-sm text-muted">{product.unit}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <Badge variant={product.inStock ? 'success' : 'danger'} size="sm">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-danger">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="text-center py-12">
          <span className="text-6xl">📦</span>
          <p className="text-foreground font-medium mt-4">No products found</p>
          <p className="text-sm text-muted mt-1">Try adjusting your filters</p>
        </Card>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Product"
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Product Name" placeholder="Enter product name" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" placeholder="0" />
            <Input label="Unit" placeholder="kg, L, pc" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Category
            </label>
            <select className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground">
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Product description..."
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted resize-none"
            rows={3}
          />
          <Button className="w-full">Add Product</Button>
        </div>
      </Modal>
    </div>
  );
}
