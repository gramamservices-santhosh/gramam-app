'use client';

import { Plus, Minus, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useCartStore } from '@/store/cartStore';
import { CartItem as CartItemType } from '@/types';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { incrementQuantity, decrementQuantity, removeItem } = useCartStore();

  return (
    <Card className="flex items-center gap-3">
      {/* Product Image */}
      <div className="w-16 h-16 bg-border/50 rounded-xl flex items-center justify-center flex-shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <span className="text-2xl">📦</span>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground line-clamp-1">
          {item.name}
        </h3>
        <p className="text-xs text-muted">{item.unit}</p>
        <p className="text-primary font-bold text-sm mt-1">
          {formatPrice(item.total)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => decrementQuantity(item.productId)}
          className="w-8 h-8 rounded-lg bg-card border border-border text-foreground flex items-center justify-center hover:border-primary transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-foreground w-6 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => incrementQuantity(item.productId)}
          className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => removeItem(item.productId)}
        className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </Card>
  );
}
