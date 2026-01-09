'use client';

import { Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product | Omit<Product, 'id' | 'createdAt'> & { id?: string };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, incrementQuantity, decrementQuantity } = useCartStore();

  const productId = product.id || product.name;
  const cartItem = items.find((item) => item.productId === productId);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addItem({
      productId,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      groceries: '🛒',
      vegetables: '🥬',
      fruits: '🍎',
      dairy: '🥛',
      medicines: '💊',
      snacks: '🍪',
      household: '🧹',
      meat: '🍖',
    };
    return icons[category] || '📦';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-3 flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square bg-background rounded-lg mb-3 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span className="text-3xl">{getCategoryIcon(product.category)}</span>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
            <span className="text-xs font-medium text-muted">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 mb-2">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
          {product.name}
        </h3>
        <p className="text-xs text-muted mt-1">{product.unit}</p>
      </div>

      {/* Price and Add to Cart */}
      <div className="flex items-center justify-between">
        <span className="text-primary font-semibold text-sm">{formatPrice(product.price)}</span>

        {product.inStock && (
          <>
            {quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => decrementQuantity(productId)}
                  className="w-7 h-7 rounded-lg bg-background border border-border text-foreground flex items-center justify-center hover:border-primary/50 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-medium text-foreground w-5 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => incrementQuantity(productId)}
                  className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
