import API from './api'; 

export const productService = {
    
  getSellerProducts: () => API.get('/products/my-products').then(res => res.data),
  
  
  createProduct: (data) => API.post('/products', data).then(res => res.data),
  
  
  updateProduct: (id, data) => API.put(`/products/${id}`, data).then(res => res.data),
  
  
  deleteProduct: (id) => API.delete(`/products/${id}`).then(res => res.data),
};