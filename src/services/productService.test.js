import { jest } from '@jest/globals';

// 1. Mock the Prisma Client BEFORE importing the service using the ESM mock function
jest.unstable_mockModule('../config/prisma.js', () => ({
    default: {
        product: {
            findMany: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        }
    }
}));

// 2. Dynamically import Prisma and the service AFTER the mock is registered
const { default: prisma } = await import('../config/prisma.js');
const productService = await import('./productService.js');

describe('Product Service', () => {
    // Clear mocks before each test so counts don't leak
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllActiveProducts', () => {
        it('should fetch only products where isHidden is false', async () => {
            const mockProducts = [
                { id: 1, name: 'Keyboard', isHidden: false },
                { id: 2, name: 'Mouse', isHidden: false }
            ];
            prisma.product.findMany.mockResolvedValue(mockProducts);

            const result = await productService.getAllActiveProducts(0, 10);

            expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
            expect(prisma.product.findMany).toHaveBeenCalledWith({
                where: { isHidden: false },
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual(mockProducts);
        });
    });

    describe('createProduct', () => {
        it('should create and return a new product', async () => {
            const newProductData = { name: 'Monitor', price: 199.99, sellerId: 1 };
            const createdProduct = { id: 3, ...newProductData, isHidden: false };
            
            prisma.product.create.mockResolvedValue(createdProduct);

            const result = await productService.createProduct(newProductData);

            expect(prisma.product.create).toHaveBeenCalledWith({
                data: newProductData
            });
            expect(result).toEqual(createdProduct);
        });
    });

    describe('updateProduct', () => {
        it('should throw an error if the product does not exist', async () => {
            prisma.product.findUnique.mockResolvedValue(null);

            await expect(productService.updateProduct(99, { price: 150 }))
                .rejects
                .toThrow('Product not found or is currently hidden.');
        });

        it('should throw an error if the product is hidden', async () => {
            prisma.product.findUnique.mockResolvedValue({ id: 1, isHidden: true });

            await expect(productService.updateProduct(1, { price: 150 }))
                .rejects
                .toThrow('Product not found or is currently hidden.');
        });

        it('should update the product if it exists and is active', async () => {
            prisma.product.findUnique.mockResolvedValue({ id: 1, isHidden: false });
            prisma.product.update.mockResolvedValue({ id: 1, price: 150, isHidden: false });

            const result = await productService.updateProduct(1, { price: 150 });

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { price: 150 }
            });
            expect(result.price).toBe(150);
        });
    });

    describe('softDeleteProduct', () => {
        it('should set isHidden to true', async () => {
            prisma.product.update.mockResolvedValue({ id: 1, isHidden: true });

            const result = await productService.softDeleteProduct(1);

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { isHidden: true }
            });
            expect(result.isHidden).toBe(true);
        });
    });
});