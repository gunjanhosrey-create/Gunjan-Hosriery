import { supabase } from './supabase';
import type { Category, Product, Order, OrderItem, Inquiry, DashboardStats } from '@/types/index';

// Categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Products
export async function getProducts(limit?: number): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getNewArrivals(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_new_arrival', true)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getTrendingProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_trending', true)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// Orders
export async function createOrder(orderData: {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  order_items: OrderItem[];
}): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Admin functions
export async function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...productData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Inquiries
export async function createInquiry(inquiryData: Omit<Inquiry, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Inquiry> {
  const { data, error } = await supabase
    .from('inquiries')
    .insert(inquiryData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInquiries(): Promise<Inquiry[]> {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function updateInquiryStatus(id: string, status: 'new' | 'in_progress' | 'resolved'): Promise<Inquiry> {
  const { data, error } = await supabase
    .from('inquiries')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInquiry(id: string): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Dashboard Analytics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get orders data
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, status');

    if (ordersError) throw ordersError;

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
    const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;

    // Get inquiries data
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select('status');

    if (inquiriesError) throw inquiriesError;

    const totalInquiries = inquiries?.length || 0;
    const newInquiries = inquiries?.filter(i => i.status === 'new').length || 0;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalInquiries,
      newInquiries,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalInquiries: 0,
      newInquiries: 0,
    };
  }
}

export async function getRecentOrders(limit: number = 10): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
