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

export const getProductById = async (id) => {
    return await prisma.product.findUnique({
        where: { id: parseInt(id) }
    });
};

export const updateProduct = async (existingProduct, updateData) => {
    return await prisma.product.update({
        where: { id: existingProduct.id },
        data: updateData
    });
};

export const softDeleteProduct = async (existingProduct) => {
    return await prisma.product.update({
        where: { id: existingProduct.id },
        data: { isHidden: true }
    });
};
