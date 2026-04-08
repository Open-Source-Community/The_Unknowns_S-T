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
    
    beforeEach(() => {
        jest.resetAllMocks();
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

        // EDGE CASE 1: Empty Array
        it('should return an empty array if no products exist', async () => {
            prisma.product.findMany.mockResolvedValue([]);
            
            const result = await productService.getAllActiveProducts(0, 10);
            
            expect(result).toEqual([]);
            expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
        });
    });

    // getProductById Tests
    describe('getProductById', () => {
        it('should return a product when found', async () => {
            const mockProduct = { id: 1, name: 'Keyboard', price: 50 };
            prisma.product.findUnique.mockResolvedValue(mockProduct);

            const result = await productService.getProductById(1);

            expect(prisma.product.findUnique).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toEqual(mockProduct);
        });

        it('should return null when the product is not found', async () => {
            prisma.product.findUnique.mockResolvedValue(null);

            const result = await productService.getProductById(999);

            expect(prisma.product.findUnique).toHaveBeenCalledWith({
                where: { id: 999 }
            });
            expect(result).toBeNull();
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

        // EDGE CASE 2: mockRejectedValue
        it('should throw an error if the database query fails', async () => {
            const newProductData = { name: 'Monitor', price: 199.99, sellerId: 1 };
            const dbError = new Error('Database connection failed');
            
            // Simulating a Prisma crash
            prisma.product.create.mockRejectedValue(dbError);

            await expect(productService.createProduct(newProductData)).rejects.toThrow('Database connection failed');
            expect(prisma.product.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateProduct', () => {
        it('should update the product using the provided product object', async () => {
            const mockExistingProduct = { id: 1, name: 'Test Product', sellerId: 5 };
            const updateData = { price: 150 };

            prisma.product.update.mockResolvedValue({ ...mockExistingProduct, ...updateData });

            const result = await productService.updateProduct(mockExistingProduct, updateData);

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 1 }, 
                data: updateData
            });
            expect(result.price).toBe(150);
        });
    });

    describe('softDeleteProduct', () => {
        it('should set isHidden to true using the provided product object', async () => {
            const mockExistingProduct = { id: 1, sellerId: 5 };
            
            prisma.product.update.mockResolvedValue({ ...mockExistingProduct, isHidden: true });

            const result = await productService.softDeleteProduct(mockExistingProduct);

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { isHidden: true }
            });
            expect(result.isHidden).toBe(true);
        });
    });
});
