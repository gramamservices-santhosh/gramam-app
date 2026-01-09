'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Plus, CreditCard, Banknote } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { formatPrice, calculateDeliveryCharge, generateOrderId } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, customOrderDescription, clearCart } = useCartStore();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(
    user?.addresses.find((a) => a.isDefault)?.id || user?.addresses[0]?.id || ''
  );

  // New address form
  const [newAddress, setNewAddress] = useState({
    village: '',
    street: '',
    landmark: '',
  });

  const selectedAddress = user?.addresses.find((a) => a.id === selectedAddressId);
  const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);
  const deliveryCharge = calculateDeliveryCharge(5); // Will be calculated based on actual distance
  const grandTotal = itemsTotal + deliveryCharge;

  const handleAddAddress = () => {
    // In production, save to Firestore
    showError('Please add address in profile settings');
    setShowAddressModal(false);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      showError('Please login to place order');
      router.push('/login');
      return;
    }

    if (!selectedAddress && items.length > 0) {
      showError('Please select a delivery address');
      return;
    }

    if (items.length === 0 && !customOrderDescription) {
      showError('Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      const orderId = generateOrderId();

      const order = {
        id: orderId,
        type: 'shopping' as const,
        userId: user.id,
        userName: user.name || 'Customer',
        userPhone: user.phone,
        userVillage: selectedAddress?.village || user.village || '',

        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
        })),
        itemsTotal,
        deliveryCharge,
        totalAmount: grandTotal,

        deliveryAddress: selectedAddress
          ? {
              village: selectedAddress.village,
              street: selectedAddress.street,
              landmark: selectedAddress.landmark,
            }
          : undefined,

        isCustomOrder: !!customOrderDescription,
        customOrderDescription: customOrderDescription || undefined,

        status: 'pending' as const,
        paymentMethod,
        paymentStatus: 'pending' as const,

        timeline: [
          {
            status: 'pending' as const,
            time: Timestamp.now(),
            note: 'Order placed',
          },
        ],

        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Save to Firestore
      await setDoc(doc(db, 'orders', orderId), order);

      // Clear cart
      clearCart();

      // Show success
      success('Order placed successfully!');

      // Navigate to order details
      router.push(`/orders/${orderId}`);
    } catch (err) {
      console.error('Error placing order:', err);
      showError('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="text-xl font-bold text-foreground">Checkout</h1>
      </div>

      <div className="space-y-4">
        {/* Delivery Address */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Delivery Address
            </h3>
            <button
              onClick={() => setShowAddressModal(true)}
              className="text-sm text-primary font-medium"
            >
              {selectedAddress ? 'Change' : 'Add'}
            </button>
          </div>

          {selectedAddress ? (
            <div className="bg-border/30 rounded-xl p-3">
              <p className="font-medium text-foreground">{selectedAddress.label}</p>
              <p className="text-sm text-muted mt-1">
                {selectedAddress.street}, {selectedAddress.village}
              </p>
              {selectedAddress.landmark && (
                <p className="text-sm text-muted">Near {selectedAddress.landmark}</p>
              )}
            </div>
          ) : user?.addresses && user.addresses.length > 0 ? (
            <div className="space-y-2">
              {user.addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-colors',
                    selectedAddressId === addr.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <p className="font-medium text-foreground">{addr.label}</p>
                  <p className="text-sm text-muted">
                    {addr.street}, {addr.village}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setShowAddressModal(true)}
              className="w-full border-2 border-dashed border-border rounded-xl p-4 text-center text-muted hover:border-primary/50 hover:text-foreground transition-colors"
            >
              <Plus className="w-5 h-5 mx-auto mb-1" />
              Add Delivery Address
            </button>
          )}
        </Card>

        {/* Order Items Summary */}
        <Card>
          <h3 className="font-semibold text-foreground mb-3">
            Order Items ({items.length})
          </h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-muted">
                  {item.name} x {item.quantity}
                </span>
                <span className="text-foreground">{formatPrice(item.total)}</span>
              </div>
            ))}
            {customOrderDescription && (
              <div className="text-sm text-muted pt-2 border-t border-border">
                <span className="font-medium text-secondary">Custom Request:</span>{' '}
                {customOrderDescription}
              </div>
            )}
          </div>
        </Card>

        {/* Payment Method */}
        <Card>
          <h3 className="font-semibold text-foreground mb-3">Payment Method</h3>
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod('cod')}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl border transition-colors',
                paymentMethod === 'cod'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Banknote className="w-5 h-5 text-success" />
              <div className="text-left">
                <p className="font-medium text-foreground">Cash on Delivery</p>
                <p className="text-xs text-muted">Pay when you receive</p>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('online')}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl border transition-colors',
                paymentMethod === 'online'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <CreditCard className="w-5 h-5 text-secondary" />
              <div className="text-left">
                <p className="font-medium text-foreground">Online Payment</p>
                <p className="text-xs text-muted">UPI, Cards, Net Banking</p>
              </div>
            </button>
          </div>
        </Card>
      </div>

      {/* Order Total & Place Order */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4 z-40">
        <div className="max-w-lg mx-auto">
          <Card className="mb-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Items Total</span>
                <span className="text-foreground">{formatPrice(itemsTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery Charge</span>
                <span className="text-foreground">{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handlePlaceOrder}
            isLoading={isLoading}
          >
            Place Order
          </Button>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add Address"
      >
        <div className="space-y-4">
          <Input
            label="Village/Town"
            placeholder="Enter village or town name"
            value={newAddress.village}
            onChange={(e) => setNewAddress({ ...newAddress, village: e.target.value })}
          />
          <Input
            label="Street Address"
            placeholder="House no., Street name"
            value={newAddress.street}
            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
          />
          <Input
            label="Landmark"
            placeholder="Near temple, school, etc."
            value={newAddress.landmark}
            onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
          />
          <Button className="w-full" onClick={handleAddAddress}>
            Save Address
          </Button>
        </div>
      </Modal>
    </div>
  );
}
