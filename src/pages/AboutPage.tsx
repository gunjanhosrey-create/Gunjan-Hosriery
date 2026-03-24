import { Sparkles, Award, Users, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  const values = [
    {
      icon: Sparkles,
      title: 'Premium Quality',
      description: 'We source only the finest fabrics and materials for our collections',
    },
    {
      icon: Award,
      title: 'Expert Craftsmanship',
      description: 'Every piece is crafted with attention to detail and precision',
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Your satisfaction and style are our top priorities',
    },
    {
      icon: Heart,
      title: 'Sustainable Fashion',
      description: 'Committed to ethical and sustainable fashion practices',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Gunjan Hosiery</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Redefining luxury fashion with timeless elegance and contemporary style
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Founded with a passion for exceptional fashion, Gunjan Hosiery has become a
              destination for those who appreciate quality, style, and sophistication. Our
              journey began with a simple vision: to create clothing that makes people feel
              confident and beautiful.
            </p>
            <p>
              Today, we offer a curated collection of premium fashion for men, women, and
              children. From elegant Zara-style pieces to comfortable pogo sets, from luxury
              jacquard outfits to trendy streetwear, every item in our collection is
              carefully selected to meet the highest standards of quality and design.
            </p>
            <p>
              We believe that fashion is more than just clothing—it's a form of
              self-expression, a way to tell your story. That's why we're committed to
              providing not just products, but experiences that inspire and delight.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-4">
                    <value.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-muted-foreground mb-8">
            To make premium fashion accessible and enjoyable for everyone, while maintaining
            the highest standards of quality, sustainability, and customer service.
          </p>
          <div className="bg-primary text-primary-foreground p-8 rounded-lg">
            <p className="text-lg italic">
              "Fashion is about dressing according to what's fashionable. Style is more about
              being yourself." - Oscar de la Renta
            </p>
          </div>
        </div>
      </section>

      {/* Visit Us */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Visit Our Store</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Come experience our collection in person at our showroom.
          </p>
          <a
            href="https://maps.app.goo.gl/PcNNCtppvxUVdmdw8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Address by Map
          </a>
        </div>
      </section>

      {/* Live Map */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Find Us</h2>
          <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                        <iframe
   src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d690.0903945989136!2d80.42907341904298!3d26.3598059980356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1774350503673!5m2!1sen!2sin" 
   height="100%"
  width="100%"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Gunjan Hosiery Location"
></iframe>
          </div>
          <div className="text-center mt-6">
            <p className="text-muted-foreground mb-4">
              C-34, UPSIDC Industrial Area, Rooma, Chekeri Ward, Kanpur, Uttar Pradesh 209402, India
            </p>
            <a
              href="https://maps.app.goo.gl/PcNNCtppvxUVdmdw8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
