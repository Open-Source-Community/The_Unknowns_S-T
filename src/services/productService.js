import prisma from '../config/prisma.js';

export const getAllActiveProducts = async (skip = 0, take = 10) => {
    return await prisma.product.findMany({
        where: { isHidden: false },
        skip: parseInt(skip),
        take: parseInt(take),
        orderBy: { createdAt: 'desc' }
    });
};

export const createProduct = async (productData) => {
    return await prisma.product.create({
        data: productData
    });
};

export const updateProduct = async (id, updateData) => {
    const existingProduct = await prisma.product.findUnique({
        where: { id: parseInt(id) }
    });

    if (!existingProduct || existingProduct.isHidden) {
        throw new Error('Product not found or is currently hidden.');
    }

    return await prisma.product.update({
        where: { id: parseInt(id) },
        data: updateData
    });
};

export const softDeleteProduct = async (id) => {
    return await prisma.product.update({
        where: { id: parseInt(id) },
        data: { isHidden: true }
    });
};