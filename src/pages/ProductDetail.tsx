import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star, ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="text-center">
          <h1 className="font-display text-3xl mb-4">Product Not Found</h1>
          <Link to="/products" className="text-accent hover:underline">Back to Products</Link>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
  };

  return (
    <main className="pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card overflow-hidden rounded-2xl"
          >
            <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            {product.badge && (
              <span className="inline-block w-fit px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                {product.badge}
              </span>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
            <p className="text-sm text-muted-foreground mb-6">Weight: {product.weight}</p>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl font-bold text-accent">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-foreground/70 hover:text-foreground">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold w-8 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="text-foreground/70 hover:text-foreground">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="w-full py-4 bg-accent text-accent-foreground font-semibold rounded-full text-lg flex items-center justify-center gap-3 animate-glow-pulse hover:shadow-[0_0_40px_hsl(43_85%_55%/0.5)] transition-shadow"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </motion.button>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
