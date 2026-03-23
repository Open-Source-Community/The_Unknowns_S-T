import * as productService from '../services/productService.js';

export const getAllProducts = async (req, res) => {
    try {
        const { skip, take } = req.query;
        const products = await productService.getAllActiveProducts(skip, take);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, price, stock, seller_id } = req.body;
        
        if (!name || !price || !seller_id) {
            return res.status(400).json({ success: false, message: "Missing required fields: name, price, and seller_id are required." });
        }

        const newProduct = await productService.createProduct({
            name,
            price: parseFloat(price),
            stock: parseInt(stock || 0),
            sellerId: parseInt(seller_id) 
        });

        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Prevent updating restricted fields (handle both snake and camel case just in case)
        delete updateData.id;
        delete updateData.seller_id;
        delete updateData.sellerId;
        delete updateData.is_hidden;
        delete updateData.isHidden;

        if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);
        if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);

        const updatedProduct = await productService.updateProduct(id, updateData);
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await productService.softDeleteProduct(id);
        
        res.status(200).json({ 
            success: true, 
            message: "Product successfully hidden.",
            data: deletedProduct 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};