import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalPrice,
          currency: "INR",
          items: items.map(item => ({
             id: item.product.id,
             name: item.product.name,
             price: item.product.price,
             quantity: item.quantity
          })), 
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      
      const orderData = await response.json();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Foova Feast Studio",
        description: "Transaction",
        order_id: orderData.id, 
        handler: async function (response: any) {
          const verifyRes = await fetch("http://localhost:5000/api/verify-payment", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }),
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.status === 'success') {
             toast({
               title: "Payment Successful",
               description: "Thank you for your order!",
             });
          } else {
             toast({
               variant: "destructive",
               title: "Payment Failed",
               description: "Signature verification failed.",
             });
          }
        },
        prefill: {
          name: "User Name", // You can get this from AuthContext if available
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#D4AF37", // Matching your gold/accent color
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();

    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  if (items.length === 0) {
    return (
      <main className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold mb-3">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">Explore our premium collection and add items</p>
          <Link to="/products">
            <button className="px-8 py-3 bg-accent text-accent-foreground rounded-full font-semibold">
              Browse Products
            </button>
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold mb-8"
        >
          Your <span className="gold-text">Cart</span> ({totalItems})
        </motion.h1>

        <div className="space-y-4 mb-8">
          {items.map((item, i) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 md:p-6 flex items-center gap-4 md:gap-6"
            >
              <img src={item.product.image} alt={item.product.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl" />
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg truncate">{item.product.name}</h3>
                <p className="text-accent font-bold">₹{item.product.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <p className="font-bold text-lg hidden sm:block">₹{item.product.price * item.quantity}</p>
              <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg text-muted-foreground">Total</span>
            <span className="text-3xl font-bold gold-text">₹{totalPrice}</span>
          </div>
          <button 
            onClick={handleCheckout}
            className="w-full py-4 bg-accent text-accent-foreground font-semibold rounded-full text-lg animate-glow-pulse hover:shadow-[0_0_40px_hsl(43_85%_55%/0.5)] transition-shadow"
          >
            Proceed to Checkout
          </button>
          <p className="text-center text-muted-foreground text-sm mt-4">Cash on Delivery available</p>
        </motion.div>
      </div>
    </main>
  );
};

export default Cart;
