import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <span className="font-display text-xl font-bold gold-text">FOOVA</span>
            <span className="font-display text-xl font-light text-foreground ml-1">FOODS</span>
            <p className="text-muted-foreground text-sm mt-3">Premium dates, dry fruits & Ramadan Iftar Kits. Delivered fresh across Karnataka.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-muted-foreground text-sm hover:text-accent transition-colors">Home</Link>
              <Link to="/products" className="text-muted-foreground text-sm hover:text-accent transition-colors">Products</Link>
              <Link to="/cart" className="text-muted-foreground text-sm hover:text-accent transition-colors">Cart</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Contact</h4>
            <p className="text-muted-foreground text-sm">hello@foovafoods.com</p>
            <p className="text-muted-foreground text-sm">+91 98765 43210</p>
            <p className="text-muted-foreground text-sm">Karnataka, India</p>
          </div>
        </div>
        <div className="border-t border-border/30 pt-6 text-center">
          <p className="text-muted-foreground text-xs">© 2025 FOOVA FOODS LLP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
