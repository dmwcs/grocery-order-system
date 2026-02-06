import { APIGatewayProxyEvent } from 'aws-lambda'
import { createProduct, getProduct, listProducts, updateProduct, deleteProduct } from '../../src/handlers/products'
import { Product } from '../../src/types'

// Mock ProductService
const mockCreateProduct = jest.fn()
const mockGetProduct = jest.fn()
const mockListProducts = jest.fn()
const mockUpdateProduct = jest.fn()
const mockDeleteProduct = jest.fn()

jest.mock('../../src/services/productService', () => ({
  createProductService: jest.fn(() => ({
    createProduct: mockCreateProduct,
    getProduct: mockGetProduct,
    listProducts: mockListProducts,
    updateProduct: mockUpdateProduct,
    deleteProduct: mockDeleteProduct,
  })),
}))

describe('Product Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createProduct', () => {
    it('should create a product and return 201', async () => {
      const product: Product = {
        code: 'CE',
        name: 'Cheese',
        price: 5.95,
        packaging: [{ quantity: 3, price: 14.95 }],
      }

      mockCreateProduct.mockResolvedValueOnce(product)

      const event = {
        body: JSON.stringify(product),
      } as APIGatewayProxyEvent

      const result = await createProduct(event)

      expect(result.statusCode).toBe(201)
      expect(JSON.parse(result.body)).toEqual(product)
      expect(mockCreateProduct).toHaveBeenCalledWith(product)
    })

    it('should return 500 on error', async () => {
      mockCreateProduct.mockRejectedValueOnce(new Error('Database error'))

      const event = {
        body: JSON.stringify({ code: 'CE' }),
      } as APIGatewayProxyEvent

      const result = await createProduct(event)

      expect(result.statusCode).toBe(500)
      expect(JSON.parse(result.body)).toHaveProperty('error')
    })
  })

  describe('getProduct', () => {
    it('should get a product and return 200', async () => {
      const product: Product = {
        code: 'CE',
        name: 'Cheese',
        price: 5.95,
        packaging: [{ quantity: 3, price: 14.95 }],
      }

      mockGetProduct.mockResolvedValueOnce(product)

      const event = {
        pathParameters: { code: 'CE' },
      } as unknown as APIGatewayProxyEvent

      const result = await getProduct(event)

      expect(result.statusCode).toBe(200)
      expect(JSON.parse(result.body)).toEqual(product)
      expect(mockGetProduct).toHaveBeenCalledWith('CE')
    })

    it('should return 404 when product not found', async () => {
      mockGetProduct.mockResolvedValueOnce(null)

      const event = {
        pathParameters: { code: 'NONEXISTENT' },
      } as unknown as APIGatewayProxyEvent

      const result = await getProduct(event)

      expect(result.statusCode).toBe(404)
      expect(JSON.parse(result.body)).toHaveProperty('error')
    })

    it('should return 400 when code is missing', async () => {
      const event = {
        pathParameters: null,
      } as unknown as APIGatewayProxyEvent

      const result = await getProduct(event)

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body)).toHaveProperty('error')
    })
  })

  describe('listProducts', () => {
    it('should list all products and return 200', async () => {
      const products: Product[] = [
        { code: 'CE', name: 'Cheese', price: 5.95, packaging: [] },
        { code: 'SS', name: 'Soy Sauce', price: 11.95, packaging: [] },
      ]

      mockListProducts.mockResolvedValueOnce(products)

      const result = await listProducts()

      expect(result.statusCode).toBe(200)
      expect(JSON.parse(result.body)).toEqual(products)
      expect(mockListProducts).toHaveBeenCalled()
    })
  })

  describe('updateProduct', () => {
    it('should update a product and return 200', async () => {
      const product: Product = {
        code: 'CE',
        name: 'Cheese',
        price: 6.95,
        packaging: [{ quantity: 3, price: 16.95 }],
      }

      mockUpdateProduct.mockResolvedValueOnce(product)

      const event = {
        body: JSON.stringify(product),
      } as APIGatewayProxyEvent

      const result = await updateProduct(event)

      expect(result.statusCode).toBe(200)
      expect(JSON.parse(result.body)).toEqual(product)
      expect(mockUpdateProduct).toHaveBeenCalledWith(product)
    })
  })

  describe('deleteProduct', () => {
    it('should delete a product and return 204', async () => {
      mockDeleteProduct.mockResolvedValueOnce(undefined)

      const event = {
        pathParameters: { code: 'CE' },
      } as unknown as APIGatewayProxyEvent

      const result = await deleteProduct(event)

      expect(result.statusCode).toBe(204)
      expect(mockDeleteProduct).toHaveBeenCalledWith('CE')
    })

    it('should return 400 when code is missing', async () => {
      const event = {
        pathParameters: null,
      } as unknown as APIGatewayProxyEvent

      const result = await deleteProduct(event)

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body)).toHaveProperty('error')
    })
  })
})
