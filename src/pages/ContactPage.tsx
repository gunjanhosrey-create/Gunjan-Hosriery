import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createInquiry } from '@/db/api';

type ContactFormState = {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
};

const initialFormState: ContactFormState = {
  name: '',
  phone: '',
  email: '',
  subject: '',
  message: '',
};

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContactFormState>(initialFormState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWhatsApp = () => {
    const message = 'Hi! I would like to know more about your products.';
    const whatsappUrl = `https://wa.me/919170259644?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    console.log('FORM DATA:', payload);

    if (!payload.name || !payload.phone || !payload.message) {
      toast.error('Name, phone, and message are required');
      return;
    }

    try {
      setLoading(true);

      await createInquiry(payload);

      toast.success('Inquiry submitted successfully');

      const whatsappMessage = `Name: ${payload.name}
Phone: ${payload.phone}
Email: ${payload.email || 'N/A'}
Subject: ${payload.subject || 'N/A'}
Message: ${payload.message}`;

      window.open(
        `https://wa.me/919170259644?text=${encodeURIComponent(whatsappMessage)}`,
        '_blank'
      );

      setFormData(initialFormState);
    } catch (error: any) {
      console.error('SUPABASE ERROR:', error);
      toast.error(error?.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      content:
        'C-34, UPSIDC Industrial Area, Rooma, Chekeri Ward, Kanpur, Uttar Pradesh 209402',
      link: 'https://maps.app.goo.gl/PcNNCtppvxUVdmdw8',
      isExternal: true,
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 9170259644',
    },
    {
      icon: Mail,
      title: 'Email Us',
      content: 'gunjanhosrey@gmail.com',
      link: 'mailto:gunjanhosrey@gmail.com',
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-secondary py-20 text-center">
        <h1 className="mb-2 text-4xl font-bold">Get in Touch</h1>
        <p className="text-muted-foreground">We&apos;d love to hear from you.</p>
      </div>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {contactInfo.map((info) => (
            <Card key={info.title}>
              <CardContent className="pt-6 text-center">
                <info.icon className="mx-auto mb-4" />
                <h3 className="font-bold">{info.title}</h3>
                <p className="text-muted-foreground">{info.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto max-w-xl">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">Send Message</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                />

                <Input
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <Input
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <Input
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                />

                <Textarea
                  name="message"
                  placeholder="Message"
                  value={formData.message}
                  onChange={handleChange}
                />

                <Button type="submit" disabled={loading} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 text-center">
          <Button onClick={handleWhatsApp}>
            <MessageCircle className="mr-2" />
            WhatsApp Chat
          </Button>
        </div>
      </section>
    </div>
  );
}
