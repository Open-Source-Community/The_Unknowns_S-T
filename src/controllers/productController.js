import * as productService from '../services/productService.js';

export const getAllProducts = async (req, res) => {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const take = Math.min(parseInt(req.query.take) || 10, 50);

        const products = await productService.getAllActiveProducts(skip, take);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, price, stock } = req.body;
        
        const sellerId = req.user.userId;

        if (!name || !price || !stock) {
            return res.status(400).json({ success: false, message: "Missing required fields: name, price, and stock are required." });
        }

        const newProduct = await productService.createProduct({
            name,
            price: parseFloat(price),
            stock: parseInt(stock || 0),
            sellerId: sellerId
        });

        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user; // Extracted from our secure JWT

        // 1. Fetch the product to check ownership
        const product = await productService.getProductById(id);
        
        if (!product || product.isHidden) {
            return res.status(404).json({ success: false, error: "Product not found." });
        }

        // 2. The Ownership Guard Clause
        if (product.sellerId !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: "Forbidden: You can only modify your own products." 
            });
        }

        const { name, category, price, stock } = req.body;
        const safeUpdateData = {};
        
        if (name !== undefined) safeUpdateData.name = name;
        if (category !== undefined) safeUpdateData.category = category;
        if (price !== undefined) {
            const parsedPrice = parseFloat(price);
            if (isNaN(parsedPrice)) return res.status(400).json({ success: false, error: "Price must be a valid number." });
            safeUpdateData.price = parsedPrice;
        }
        if (stock !== undefined) {
            const parsedStock = parseInt(stock);
            if (isNaN(parsedStock)) return res.status(400).json({ success: false, error: "Stock must be a valid number." });
            safeUpdateData.stock = parsedStock;
        }

        // 3. Proceed with update
        const updatedProduct = await productService.updateProduct(product, safeUpdateData);
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        // 1. Fetch the product to check ownership
        const product = await productService.getProductById(id);
        
        if (!product || product.isHidden) {
            return res.status(404).json({ success: false, error: "Product not found." });
        }

        // 2. The Ownership Guard Clause
        if (role !== 'Admin' && product.sellerId !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: "Forbidden: You can only delete your own products." 
            });
        }

        // 3. Proceed with deletion
        const deletedProduct = await productService.softDeleteProduct(product);
        res.status(200).json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
