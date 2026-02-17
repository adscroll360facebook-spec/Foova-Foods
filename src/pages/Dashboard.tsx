import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Package, MapPin, LogOut } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [orders, setOrders] = useState<Tables<"orders">[]>([]);
  const [tab, setTab] = useState<"profile" | "orders">("profile");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "" });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const load = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (p) { setProfile(p); setForm({ full_name: p.full_name || "", phone: p.phone || "", address: p.address || "" }); }
      const { data: o } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (o) setOrders(o);
    };
    load();
  }, [user, navigate]);

  const saveProfile = async () => {
    if (!user) return;
    await supabase.from("profiles").update(form).eq("user_id", user.id);
    setProfile({ ...profile!, ...form });
    setEditing(false);
  };

  const handleLogout = async () => { await signOut(); navigate("/"); };

  const tabs = [
    { key: "profile" as const, label: "Profile", icon: User },
    { key: "orders" as const, label: "Orders", icon: Package },
  ];

  return (
    <main className="pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-bold mb-8">
          My <span className="gold-text">Account</span>
        </motion.h1>

        <div className="flex gap-3 mb-8 flex-wrap">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${tab === t.key ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground/70"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-destructive/10 text-destructive ml-auto">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>

        {tab === "profile" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8">
            <h2 className="font-display text-2xl font-semibold mb-6">Profile Information</h2>
            {editing ? (
              <div className="space-y-4">
                {(["full_name", "phone", "address"] as const).map((field) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-foreground/80 block mb-1 capitalize">{field.replace("_", " ")}</label>
                    <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
                  </div>
                ))}
                <div className="flex gap-3">
                  <button onClick={saveProfile} className="px-6 py-2.5 bg-accent text-accent-foreground rounded-full font-medium">Save</button>
                  <button onClick={() => setEditing(false)} className="px-6 py-2.5 bg-secondary text-foreground rounded-full font-medium">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div><span className="text-muted-foreground text-sm">Email</span><p className="font-medium">{user?.email}</p></div>
                <div><span className="text-muted-foreground text-sm">Name</span><p className="font-medium">{profile?.full_name || "Not set"}</p></div>
                <div><span className="text-muted-foreground text-sm">Phone</span><p className="font-medium">{profile?.phone || "Not set"}</p></div>
                <div><span className="text-muted-foreground text-sm">Address</span><p className="font-medium">{profile?.address || "Not set"}</p></div>
                <button onClick={() => setEditing(true)} className="px-6 py-2.5 bg-accent text-accent-foreground rounded-full font-medium">Edit Profile</button>
              </div>
            )}
          </motion.div>
        )}

        {tab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {orders.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="glass-card p-6">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                        <p className="font-bold text-accent text-lg">₹{order.total}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === "delivered" ? "bg-primary/20 text-primary" : order.status === "cancelled" ? "bg-destructive/20 text-destructive" : "bg-accent/20 text-accent"}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
