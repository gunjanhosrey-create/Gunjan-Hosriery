-- Insert initial categories
INSERT INTO categories (name, slug, description, display_order) VALUES
('Men', 'men', 'Fashion for men', 1),
('Women', 'women', 'Fashion for women', 2),
('Kids', 'kids', 'Fashion for kids', 3),
('Boys', 'boys', 'Fashion for boys', 4),
('Girls', 'girls', 'Fashion for girls', 5)
ON CONFLICT (slug) DO NOTHING;