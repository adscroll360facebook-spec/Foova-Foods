import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Package, ShoppingCart, Users, Settings, Plus, Pencil, Trash2, X, LayoutDashboard, FileText } from "lucide-react";
import { toast } from "sonner";

type Product = Tables<"products">;
type Order = Tables<"orders">;

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "products" | "orders" | "content">("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [siteContent, setSiteContent] = useState<Tables<"site_content">[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: 0, original_price: 0, category: "General", badge: "", weight: "", image_url: "", in_stock: true,
  });
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentForm, setContentForm] = useState({ key: "", value: "", type: "text" });
  const [editingContent, setEditingContent] = useState<Tables<"site_content"> | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/login");
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [p, o, c] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("site_content").select("*").order("key"),
    ]);
    if (p.data) setProducts(p.data);
    if (o.data) setOrders(o.data);
    if (c.data) setSiteContent(c.data);
  };

  const handleSaveProduct = async () => {
    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: productForm.price,
      original_price: productForm.original_price || null,
      category: productForm.category,
      badge: productForm.badge || null,
      weight: productForm.weight || null,
      image_url: productForm.image_url || null,
      in_stock: productForm.in_stock,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Product added");
    }
    setShowProductModal(false);
    setEditingProduct(null);
    resetProductForm();
    loadData();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast.success("Product deleted");
    loadData();
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, description: p.description || "", price: p.price, original_price: p.original_price || 0,
      category: p.category, badge: p.badge || "", weight: p.weight || "", image_url: p.image_url || "", in_stock: p.in_stock ?? true,
    });
    setShowProductModal(true);
  };

  const resetProductForm = () => setProductForm({ name: "", description: "", price: 0, original_price: 0, category: "General", badge: "", weight: "", image_url: "", in_stock: true });

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    toast.success(`Order status updated to ${status}`);
    loadData();
  };

  const handleSaveContent = async () => {
    if (editingContent) {
      await supabase.from("site_content").update({ value: contentForm.value, type: contentForm.type }).eq("id", editingContent.id);
      toast.success("Content updated");
    } else {
      await supabase.from("site_content").insert({ key: contentForm.key, value: contentForm.value, type: contentForm.type });
      toast.success("Content added");
    }
    setShowContentModal(false);
    setEditingContent(null);
    setContentForm({ key: "", value: "", type: "text" });
    loadData();
  };

  const deleteContent = async (id: string) => {
    await supabase.from("site_content").delete().eq("id", id);
    toast.success("Content deleted");
    loadData();
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" /></div>;

  const stats = [
    { label: "Products", value: products.length, icon: Package, color: "text-accent" },
    { label: "Orders", value: orders.length, icon: ShoppingCart, color: "text-primary" },
    { label: "Revenue", value: `₹${orders.reduce((s, o) => s + Number(o.total), 0).toLocaleString()}`, icon: Users, color: "text-emerald-light" },
    { label: "Pending", value: orders.filter((o) => o.status === "pending").length, icon: Settings, color: "text-gold-muted" },
  ];

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { key: "products" as const, label: "Products", icon: Package },
    { key: "orders" as const, label: "Orders", icon: ShoppingCart },
    { key: "content" as const, label: "Content", icon: FileText },
  ];

  return (
    <main className="pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-bold mb-8">
          Admin <span className="gold-text">Dashboard</span>
        </motion.h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${tab === t.key ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground/70 hover:text-foreground"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                <s.icon className={`w-8 h-8 ${s.color} mb-3`} />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-muted-foreground text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Products */}
        {tab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-semibold">Manage Products</h2>
              <button onClick={() => { resetProductForm(); setEditingProduct(null); setShowProductModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-full font-medium text-sm">
                <Plus className="w-4 h-4" />Add Product
              </button>
            </div>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="glass-card p-4 flex items-center gap-4">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{p.name}</h3>
                    <p className="text-accent font-bold">₹{p.price} <span className="text-muted-foreground text-xs">{p.category}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.in_stock ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
                      {p.in_stock ? "In Stock" : "Out"}
                    </span>
                    <button onClick={() => openEditProduct(p)} className="p-2 hover:bg-secondary rounded-lg transition-colors"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-destructive" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6">Manage Orders</h2>
            {orders.length === 0 ? (
              <div className="glass-card p-8 text-center text-muted-foreground">No orders yet</div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="glass-card p-5">
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <p className="font-semibold">Order #{o.id.slice(0, 8)}</p>
                        <p className="text-accent font-bold text-lg">₹{o.total}</p>
                        <p className="text-muted-foreground text-sm">{o.payment_method?.toUpperCase()} • {new Date(o.created_at).toLocaleDateString()}</p>
                        {o.shipping_address && <p className="text-muted-foreground text-sm mt-1">📍 {o.shipping_address}</p>}
                        {o.phone && <p className="text-muted-foreground text-sm">📞 {o.phone}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {tab === "content" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-semibold">Site Content</h2>
              <button onClick={() => { setEditingContent(null); setContentForm({ key: "", value: "", type: "text" }); setShowContentModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-full font-medium text-sm">
                <Plus className="w-4 h-4" />Add Content
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Manage hero banners, offers text, and homepage content without coding.</p>
            <div className="space-y-3">
              {siteContent.map((c) => (
                <div key={c.id} className="glass-card p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{c.key}</p>
                    <p className="text-muted-foreground text-sm truncate">{c.value}</p>
                    <span className="text-xs text-accent">{c.type}</span>
                  </div>
                  <button onClick={() => { setEditingContent(c); setContentForm({ key: c.key, value: c.value || "", type: c.type || "text" }); setShowContentModal(true); }} className="p-2 hover:bg-secondary rounded-lg"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => deleteContent(c.id)} className="p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
                </div>
              ))}
              {siteContent.length === 0 && <div className="glass-card p-8 text-center text-muted-foreground">No content entries yet. Add hero banners, offers, and texts here.</div>}
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowProductModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-xl font-semibold">{editingProduct ? "Edit" : "Add"} Product</h3>
                <button onClick={() => setShowProductModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Name", key: "name", type: "text" },
                  { label: "Description", key: "description", type: "text" },
                  { label: "Price (₹)", key: "price", type: "number" },
                  { label: "Original Price", key: "original_price", type: "number" },
                  { label: "Category", key: "category", type: "text" },
                  { label: "Badge", key: "badge", type: "text" },
                  { label: "Weight", key: "weight", type: "text" },
                  { label: "Image URL", key: "image_url", type: "text" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-sm font-medium block mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      value={(productForm as any)[f.key]}
                      onChange={(e) => setProductForm({ ...productForm, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={productForm.in_stock} onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })} className="rounded" />
                  <label className="text-sm">In Stock</label>
                </div>
                <button onClick={handleSaveProduct} className="w-full py-3 bg-accent text-accent-foreground rounded-full font-semibold">
                  {editingProduct ? "Update" : "Add"} Product
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Content Modal */}
        {showContentModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowContentModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-xl font-semibold">{editingContent ? "Edit" : "Add"} Content</h3>
                <button onClick={() => setShowContentModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Key (e.g. hero_title, offer_banner)</label>
                  <input value={contentForm.key} onChange={(e) => setContentForm({ ...contentForm, key: e.target.value })} disabled={!!editingContent} className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Value</label>
                  <textarea value={contentForm.value} onChange={(e) => setContentForm({ ...contentForm, value: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Type</label>
                  <select value={contentForm.type} onChange={(e) => setContentForm({ ...contentForm, type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground">
                    <option value="text">Text</option>
                    <option value="image_url">Image URL</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
                <button onClick={handleSaveContent} className="w-full py-3 bg-accent text-accent-foreground rounded-full font-semibold">
                  {editingContent ? "Update" : "Add"} Content
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
