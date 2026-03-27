import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Smartphone, Wallet, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { createOrder } from '@/db/api';
import type { OrderItem } from '@/types/index';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'whatsapp'>('whatsapp');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    upiId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (paymentMethod === 'upi' && !formData.upiId) {
      toast.error('Please enter your UPI ID');
      return;
    }

    setLoading(true);

    try {
      const orderItems: OrderItem[] = cart.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image_url,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        price: item.product.price,
      }));

      const order = await createOrder({
        customer_name: formData.name,
        customer_email: formData.email || null,
        customer_phone: formData.phone,
        customer_address: formData.address,
        payment_method: paymentMethod.toUpperCase(),
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        transaction_id: paymentMethod === 'cod' ? null : `TXN${Date.now()}`,
        total_amount: getCartTotal(),
        order_items: orderItems,
      });

      clearCart();

      // Handle different payment methods
      if (paymentMethod === 'upi') {
        toast.success('Order placed! Please complete UPI payment.');
        // Generate UPI payment link
        const upiUrl = `upi://pay?pa=${formData.upiId}&pn=Gunjan Hosiery&am=${getCartTotal()}&cu=INR&tn=Order ${order.id.slice(0, 8)}`;
        window.location.href = upiUrl;
        setTimeout(() => navigate('/'), 2000);
      } else if (paymentMethod === 'cod') {
        toast.success('Order placed! Cash on Delivery selected.');
        setTimeout(() => navigate('/'), 1500);
      } else {
        // WhatsApp order
        const message = `New Order #${order.id.slice(0, 8)}

Customer: ${formData.name}
Phone: ${formData.phone}
${formData.email ? `Email: ${formData.email}\n` : ''}
Address: ${formData.address}
Payment: WhatsApp Order

Items:
${cart
  .map(
    (item) =>
      `- ${item.product.name} (${item.selectedSize}, ${item.selectedColor}) x${item.quantity} - ₹${(item.product.price * item.quantity).toFixed(2)}`
  )
  .join('\n')}

Total: ₹${getCartTotal().toFixed(2)}`;

        const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
        toast.success('Order placed successfully!');
        window.open(whatsappUrl, '_blank');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="bg-secondary py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      rows={4}
                      required
                    />
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label>Payment Method *</Label>
                    <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                      <div className="space-y-3">
                        {/* UPI Payment */}
                        <div className="flex items-center space-x-3 border-2 border-border rounded-lg p-4 hover:border-primary transition-colors">
                          <RadioGroupItem value="upi" id="upi" />
                          <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                              <Smartphone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">UPI Payment</div>
                              <div className="text-sm text-muted-foreground">Pay via Google Pay, PhonePe, Paytm</div>
                            </div>
                          </Label>
                        </div>

                        {/* Cash on Delivery */}
                        <div className="flex items-center space-x-3 border-2 border-border rounded-lg p-4 hover:border-primary transition-colors">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                              <Truck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">Cash on Delivery</div>
                              <div className="text-sm text-muted-foreground">Pay when you receive</div>
                            </div>
                          </Label>
                        </div>

                        {/* WhatsApp Order */}
                        <div className="flex items-center space-x-3 border-2 border-border rounded-lg p-4 hover:border-primary transition-colors">
                          <RadioGroupItem value="whatsapp" id="whatsapp" />
                          <Label htmlFor="whatsapp" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                              <MessageCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">WhatsApp Order</div>
                              <div className="text-sm text-muted-foreground">Complete order via WhatsApp</div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* UPI ID Input (shown only when UPI is selected) */}
                  {paymentMethod === 'upi' && (
                    <div>
                      <Label htmlFor="upiId">UPI ID *</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        value={formData.upiId}
                        onChange={(e) =>
                          setFormData({ ...formData, upiId: e.target.value })
                        }
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter your UPI ID (e.g., 9876543210@paytm)
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {paymentMethod === 'upi' && <Smartphone className="mr-2 h-5 w-5" />}
                    {paymentMethod === 'cod' && <Truck className="mr-2 h-5 w-5" />}
                    {paymentMethod === 'whatsapp' && <MessageCircle className="mr-2 h-5 w-5" />}
                    {loading ? 'Processing...' : 
                      paymentMethod === 'upi' ? 'Pay with UPI' :
                      paymentMethod === 'cod' ? 'Place Order (COD)' :
                      'Place Order via WhatsApp'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex gap-3"
                    >
                      <div className="w-16 h-20 bg-secondary rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.selectedSize} | {item.selectedColor}
                        </p>
                        <p className="text-sm font-semibold">
                          ₹{item.product.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">₹{getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold">Free</span>
                    </div>
                    <div className="border-t border-border pt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-lg font-bold text-primary">
                          ₹{getCartTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
