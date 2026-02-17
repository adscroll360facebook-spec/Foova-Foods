import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUsers?.users?.some(u => u.email === "admin@gmail.com");

    if (adminExists) {
      return new Response(JSON.stringify({ message: "Admin already exists" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin user
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@gmail.com",
      password: "admin@123",
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });

    if (error) throw error;

    // Add admin role
    await supabaseAdmin.from("user_roles").insert({
      user_id: user.user.id,
      role: "admin",
    });

    // Seed products
    const products = [
      { name: "Ramadan Iftar Kit – Premium", description: "A luxurious curated selection of premium dates, dry fruits, and nuts.", price: 1499, original_price: 1999, category: "Iftar Kits", badge: "Best Seller", weight: "1.2 kg", rating: 4.9, reviews: 234 },
      { name: "Premium Medjool Dates", description: "Hand-picked, naturally sweet Medjool dates sourced from the finest farms.", price: 799, original_price: 999, category: "Dates", badge: "Ramadan Special", weight: "500g", rating: 4.8, reviews: 189 },
      { name: "Premium Mixed Nuts Collection", description: "A rich blend of almonds, cashews, pistachios, and walnuts.", price: 899, original_price: 1199, category: "Dry Fruits", weight: "500g", rating: 4.7, reviews: 156 },
      { name: "Ajwa Dates – Holy Medina", description: "Authentic Ajwa dates from Medina.", price: 1299, category: "Dates", badge: "Premium", weight: "250g", rating: 5.0, reviews: 98 },
      { name: "Family Iftar Kit", description: "A generous family-sized kit with dates, nuts, dried fruits.", price: 2499, original_price: 2999, category: "Iftar Kits", badge: "Family Pack", weight: "2.5 kg", rating: 4.8, reviews: 112 },
      { name: "Premium Roasted Cashews", description: "Perfectly roasted whole cashews with a light salt seasoning.", price: 699, category: "Dry Fruits", weight: "500g", rating: 4.6, reviews: 201 },
    ];

    await supabaseAdmin.from("products").insert(products);

    return new Response(JSON.stringify({ message: "Admin and products created", userId: user.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
