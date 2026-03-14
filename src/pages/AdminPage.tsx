import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, LogOut, Lock, LayoutDashboard, Package, ShoppingBag, MessageSquare, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { 
  getCategories, 
  createProduct, 
  getProducts, 
  updateProduct, 
  deleteProduct,
  getDashboardStats,
  getRecentOrders,
  updateOrderStatus,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry
} from '@/db/api';
import { useAdmin } from '@/contexts/AdminContext';
import type { Category, Product, Order, Inquiry, DashboardStats } from '@/types/index';

export default function AdminPage() {
  const { isAuthenticated, login, logout } = useAdmin();
  const [loginPassword, setLoginPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalInquiries: 0,
    newInquiries: 0,
  });
  
  // UI states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    sizes: '',
    colors: '',
    stock_quantity: '',
    is_featured: false,
    is_new_arrival: false,
    is_trending: false,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesData, productsData, ordersData, inquiriesData, statsData] = await Promise.all([
          getCategories(),
          getProducts(),
          getRecentOrders(20),
          getInquiries(),
          getDashboardStats(),
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
        setOrders(ordersData);
        setInquiries(inquiriesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize to max 1080p
          const maxDimension = 1080;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                  type: 'image/webp',
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/webp',
            0.8
          );
        };
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      let uploadFile = file;

      // Check file size and compress if needed
      if (file.size > 1024 * 1024) {
        toast.info('Compressing image...');
        uploadFile = await compressImage(file);
      }

      // Generate unique filename
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      setUploadProgress(50);

      const { data, error } = await supabase.storage
        .from('app-9vao4wkqc8ht_product_images')
        .upload(fileName, uploadFile);

      if (error) throw error;

      setUploadProgress(75);

      const {
        data: { publicUrl },
      } = supabase.storage.from('app-9vao4wkqc8ht_product_images').getPublicUrl(data.path);

      setFormData({ ...formData, image_url: publicUrl });
      setUploadProgress(100);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug || !formData.price || !formData.image_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        price: Number.parseFloat(formData.price),
        category_id: formData.category_id || null,
        image_url: formData.image_url,
        additional_images: [],
        sizes: formData.sizes ? formData.sizes.split(',').map((s) => s.trim()) : [],
        colors: formData.colors ? formData.colors.split(',').map((c) => c.trim()) : [],
        stock_quantity: Number.parseInt(formData.stock_quantity) || 0,
        is_featured: formData.is_featured,
        is_new_arrival: formData.is_new_arrival,
        is_trending: formData.is_trending,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully!');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully!');
      }

      setDialogOpen(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        sizes: '',
        colors: '',
        stock_quantity: '',
        is_featured: false,
        is_new_arrival: false,
        is_trending: false,
      });

      // Reload products
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id || '',
      image_url: product.image_url,
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      stock_quantity: product.stock_quantity.toString(),
      is_featured: product.is_featured,
      is_new_arrival: product.is_new_arrival,
      is_trending: product.is_trending,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(productId);
      toast.success('Product deleted successfully!');
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: Order['status']) => {
    // Optimistically update the local order state so the UI updates instantly.
    const currentOrders = orders;
    const updatedOrders = currentOrders.map((order) =>
      order.id === orderId ? { ...order, status } : order
    );
    setOrders(updatedOrders);

    try {
      await updateOrderStatus(orderId, status);
      toast.success('Order status updated!');

      // Refresh stats from backend to keep dashboard analytics accurate.
      const statsData = await getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');

      // Revert local UI state on failure.
      setOrders(currentOrders);
    }
  };

  const handleInquiryStatusChange = async (inquiryId: string, status: Inquiry['status']) => {
    try {
      await updateInquiryStatus(inquiryId, status);
      toast.success('Inquiry status updated!');
      const inquiriesData = await getInquiries();
      setInquiries(inquiriesData);
      const statsData = await getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast.error('Failed to update inquiry status');
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      await deleteInquiry(inquiryId);
      toast.success('Inquiry deleted successfully!');
      const inquiriesData = await getInquiries();
      setInquiries(inquiriesData);
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(loginPassword)) {
      toast.success('Login successful!');
      setLoginPassword('');
    } else {
      toast.error('Invalid password');
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      sizes: '',
      colors: '',
      stock_quantity: '',
      is_featured: false,
      is_new_arrival: false,
      is_trending: false,
    });
    setDialogOpen(true);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Lock className="h-6 w-6" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-secondary py-12">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-4xl md:text-5xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Inquiries</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {stats.totalOrders} orders
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.pendingOrders} pending, {stats.completedOrders} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInquiries}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.newInquiries} new inquiries
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active products in catalog
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting processing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per order
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 10).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer_name}</div>
                              <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{order.order_items.length} items</TableCell>
                          <TableCell className="font-semibold">₹{order.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'completed' ? 'default' :
                              order.status === 'pending' ? 'secondary' :
                              order.status === 'processing' ? 'outline' : 'destructive'
                            }>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Products ({products.length})</CardTitle>
              </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>
                        {categories.find((c) => c.id === product.category_id)?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {product.is_featured && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Featured
                            </span>
                          )}
                          {product.is_new_arrival && (
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                              New
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Orders ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {order.customer_address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{order.customer_phone}</div>
                            {order.customer_email && (
                              <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>{order.order_items.length} items</div>
                            <div className="text-sm text-muted-foreground">
                              {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} units
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{order.total_amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleOrderStatusChange(order.id, value as Order['status'])}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const items = order.order_items.map(item => 
                                  `${item.product_name} (${item.size}, ${item.color}) x${item.quantity}`
                                ).join('\n');
                                alert(`Order Details:\n\n${items}\n\nTotal: ₹${order.total_amount.toFixed(2)}`);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Inquiries ({inquiries.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell className="font-medium">{inquiry.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">{inquiry.email}</div>
                            {inquiry.phone && (
                              <div className="text-sm text-muted-foreground">{inquiry.phone}</div>
                            )}
                          </TableCell>
                          <TableCell>{inquiry.subject || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="line-clamp-2 text-sm">{inquiry.message}</div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={inquiry.status}
                              onValueChange={(value) => handleInquiryStatusChange(inquiry.id, value as Inquiry['status'])}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteInquiry(inquiry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Product Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">Product Image *</Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading && (
                      <div className="space-y-1">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                    <Input
                      id="sizes"
                      value={formData.sizes}
                      onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="colors">Colors (comma-separated)</Label>
                    <Input
                      id="colors"
                      value={formData.colors}
                      onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                      placeholder="Black, White, Blue"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_featured: checked as boolean })
                      }
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new"
                      checked={formData.is_new_arrival}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_new_arrival: checked as boolean })
                      }
                    />
                    <Label htmlFor="new">New Arrival</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trending"
                      checked={formData.is_trending}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_trending: checked as boolean })
                      }
                    />
                    <Label htmlFor="trending">Trending</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading || uploading}>
                  {loading ? (editingProduct ? 'Updating...' : 'Creating...') : (editingProduct ? 'Update Product' : 'Create Product')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

