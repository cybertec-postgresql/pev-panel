-- PostgreSQL Test Data for PEV Panel Testing
-- This script creates sample tables and inserts test data

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INTEGER,
    country VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total DECIMAL(10, 2),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2),
    category VARCHAR(50),
    stock INTEGER DEFAULT 0
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    price DECIMAL(10, 2)
);

-- Insert sample users (1000 users for realistic query plans)
INSERT INTO users (name, email, age, country)
SELECT
    'User ' || i,
    'user' || i || '@example.com',
    20 + (i % 50),
    CASE (i % 5)
        WHEN 0 THEN 'USA'
        WHEN 1 THEN 'Canada'
        WHEN 2 THEN 'UK'
        WHEN 3 THEN 'Germany'
        ELSE 'France'
    END
FROM generate_series(1, 1000) AS i;

-- Insert sample products (100 products)
INSERT INTO products (name, price, category, stock)
SELECT
    'Product ' || i,
    (10 + (i % 90))::DECIMAL(10, 2),
    CASE (i % 4)
        WHEN 0 THEN 'Electronics'
        WHEN 1 THEN 'Clothing'
        WHEN 2 THEN 'Books'
        ELSE 'Home & Garden'
    END,
    50 + (i % 200)
FROM generate_series(1, 100) AS i;

-- Insert sample orders (2000 orders)
INSERT INTO orders (user_id, total, status)
SELECT
    1 + (i % 1000),
    (20 + (i % 500))::DECIMAL(10, 2),
    CASE (i % 3)
        WHEN 0 THEN 'completed'
        WHEN 1 THEN 'pending'
        ELSE 'shipped'
    END
FROM generate_series(1, 2000) AS i;

-- Insert sample order items (5000 items)
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT
    1 + ((i - 1) % 2000),
    1 + (i % 100),
    1 + (i % 5),
    (10 + (i % 90))::DECIMAL(10, 2)
FROM generate_series(1, 5000) AS i;

-- Create indexes for better query plans
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Analyze tables for accurate query planning
ANALYZE users;
ANALYZE orders;
ANALYZE products;
ANALYZE order_items;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO testuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO testuser;
