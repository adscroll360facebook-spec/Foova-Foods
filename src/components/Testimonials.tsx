import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Ayesha Khan", text: "The Iftar Kit was absolutely divine! Every date was fresh and the packaging was so premium. My family loved it.", rating: 5 },
  { name: "Mohammed Ali", text: "Best Medjool dates I've ever had. FOOVA FOODS has set a new standard for quality in Ramadan essentials.", rating: 5 },
  { name: "Fatima Begum", text: "Ordered the Family Kit for our gathering. Everyone was impressed. Will definitely order again!", rating: 5 },
];

const Testimonials = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-medium tracking-[0.3em] uppercase text-sm mb-4">Testimonials</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            What Our <span className="gold-text">Customers Say</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-card p-8 hover-lift"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-foreground/80 leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-bold text-sm">{t.name[0]}</span>
                </div>
                <span className="font-semibold text-sm">{t.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
