'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Card from '@/components/ui/Card';
import ProductCard from '@/components/shop/ProductCard';
import CategoryList from '@/components/shop/CategoryList';
import { CATEGORIES, getProductsByCategory } from '@/constants/categories';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;

  const { items } = useCartStore();
  const cartTotal = items.reduce((sum, item) => sum + item.total, 0);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const category = CATEGORIES.find((c) => c.id === categoryId);
  const products = useMemo(() => getProductsByCategory(categoryId), [categoryId]);

  if (!category) {
    return (
      <div className="px-4 py-8 text-center">
        <span className="text-4xl">❓</span>
        <p className="text-muted mt-2">Category not found</p>
        <Link href="/shop" className="text-primary mt-4 inline-block">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/shop"
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {category.icon} {category.name}
          </h1>
          <p className="text-sm text-muted">{products.length} products</p>
        </div>
      </div>

      {/* Categories */}
      <div className="-mx-4 px-4 mb-4">
        <CategoryList />
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product, index) => (
            <ProductCard key={`${product.name}-${index}`} product={product} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <span className="text-4xl">📦</span>
          <p className="text-muted mt-2">No products in this category</p>
        </Card>
      )}

      {/* Cart Summary Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-40">
          <div className="max-w-lg mx-auto">
            <Link href="/cart">
              <Card className="bg-primary shadow-lg shadow-primary/25 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{cartCount} items</p>
                    <p className="text-white/80 text-sm">{formatPrice(cartTotal)}</p>
                  </div>
                </div>
                <span className="text-white font-medium">View Cart →</span>
              </Card>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
