'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Trash2, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CartItem from '@/components/shop/CartItem';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, calculateDeliveryCharge } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { items, customOrderDescription, clearCart, setCustomOrder } = useCartStore();

  const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);
  const deliveryCharge = calculateDeliveryCharge(5); // Default 5km, will be calculated properly at checkout
  const grandTotal = itemsTotal + deliveryCharge;

  const isEmpty = items.length === 0 && !customOrderDescription;

  return (
    <div className="px-4 py-4 pb-40">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Your Cart</h1>
          <p className="text-sm text-muted">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        {!isEmpty && (
          <button
            onClick={clearCart}
            className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {isEmpty ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-foreground">Your cart is empty</h2>
          <p className="text-muted mt-2">
            Add items from our shop to get started
          </p>
          <Link href="/shop">
            <Button className="mt-6">
              <ShoppingBag className="w-5 h-5" />
              Browse Products
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Cart Items */}
          {items.length > 0 && (
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
          )}

          {/* Custom Order */}
          {customOrderDescription && (
            <Card className="border-secondary/30 bg-secondary/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Custom Order Request</h3>
                  <p className="text-sm text-muted mt-1">{customOrderDescription}</p>
                </div>
                <button
                  onClick={() => setCustomOrder('')}
                  className="p-1 text-muted hover:text-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          )}

          {/* Add More Items */}
          <Link href="/shop">
            <Card className="flex items-center justify-center gap-2 text-primary hover:border-primary/50 transition-colors cursor-pointer">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-medium">Add More Items</span>
            </Card>
          </Link>
        </div>
      )}

      {/* Order Summary */}
      {!isEmpty && (
        <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4 z-40">
          <div className="max-w-lg mx-auto">
            <Card className="mb-3">
              <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Items Total</span>
                  <span className="text-foreground">{formatPrice(itemsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Delivery Charge (approx.)</span>
                  <span className="text-foreground">{formatPrice(deliveryCharge)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span className="text-foreground">Grand Total</span>
                  <span className="text-primary">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </Card>

            <Link href="/checkout">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
