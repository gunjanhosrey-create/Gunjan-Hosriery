import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createInquiry } from '@/db/api';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      content: 'Fashion Street, Mumbai, India',
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 98765 43210',
    },
    {
      icon: Mail,
      title: 'Email Us',
      content: 'info@gunjanhosrey.com',
    },
  ];

  const handleWhatsApp = () => {
    const message = 'Hi! I would like to know more about your products.';
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await createInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject || null,
        message: formData.message,
      });

      toast.success('Thank you! Your inquiry has been submitted successfully.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We'd love to hear from you. Reach out for any questions or inquiries.
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((info) => (
            <Card key={info.title}>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-4">
                  <info.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{info.title}</h3>
                <p className="text-muted-foreground">{info.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  <Send className="mr-2 h-5 w-5" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp CTA */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Chat with Us on WhatsApp</h2>
              <p className="mb-6 text-primary-foreground/90">
                Get instant responses to your queries. Our team is ready to assist you with
                product information, orders, and more.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Start WhatsApp Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Business Hours */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Business Hours</h2>
            <div className="space-y-3 text-lg">
              <div className="flex justify-between">
                <span className="font-semibold">Monday - Saturday</span>
                <span className="text-muted-foreground">10:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Sunday</span>
                <span className="text-muted-foreground">11:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
