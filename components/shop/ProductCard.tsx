'use client';

import { Plus, Minus } from 'lucide-react';
import Card from '@/components/ui/Card';
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

  return (
    <Card padding="sm" className="flex flex-col h-full">
      {/* Product Image */}
      <div className="relative aspect-square bg-border/50 rounded-xl mb-2 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
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
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-medium">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-muted mt-0.5">{product.unit}</p>
      </div>

      {/* Price and Add to Cart */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-primary font-bold">{formatPrice(product.price)}</span>

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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decrementQuantity(productId)}
                  className="w-7 h-7 rounded-lg bg-card border border-border text-foreground flex items-center justify-center hover:border-primary transition-colors"
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
    </Card>
  );
}
