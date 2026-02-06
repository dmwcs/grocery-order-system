import { createProductService } from '../../src/services/productService'
import { Product } from '../../src/types'

// Mock DynamoDB
const mockSend = jest.fn()
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => ({})),
}))

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({ send: mockSend })),
  },
  PutCommand: jest.fn((params) => params),
  GetCommand: jest.fn((params) => params),
  ScanCommand: jest.fn((params) => params),
  UpdateCommand: jest.fn((params) => params),
  DeleteCommand: jest.fn((params) => params),
}))

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const service = createProductService('test-table')
      const product: Product = {
        code: 'CE',
        name: 'Cheese',
        price: 5.95,
        packaging: [{ quantity: 3, price: 14.95 }],
      }

      mockSend.mockResolvedValueOnce({})

      const result = await service.createProduct(product)

      expect(result).toEqual(product)
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledWith({
        TableName: 'test-table',
        Item: product,
      })
    })
  })

  describe('getProduct', () => {
    it('should return a product when it exists', async () => {
      const service = createProductService('test-table')
      const product: Product = {
        code: 'CE',
        name: 'Cheese',
        price: 5.95,
        packaging: [{ quantity: 3, price: 14.95 }],
      }

      mockSend.mockResolvedValueOnce({ Item: product })

      const result = await service.getProduct('CE')

      expect(result).toEqual(product)
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledWith({
        TableName: 'test-table',
        Key: { code: 'CE' },
      })
    })

    it('should return null when product does not exist', async () => {
      const service = createProductService('test-table')

      mockSend.mockResolvedValueOnce({})

      const result = await service.getProduct('NONEXISTENT')

      expect(result).toBeNull()
      expect(mockSend).toHaveBeenCalledTimes(1)
    })
  })

  describe('listProducts', () => {
    it('should return all products', async () => {
      const service = createProductService('test-table')
      const products: Product[] = [
        {
          code: 'CE',
          name: 'Cheese',
          price: 5.95,
          packaging: [{ quantity: 3, price: 14.95 }],
        },
        {
          code: 'SS',
          name: 'Strawberries',
          price: 11.95,
          packaging: [],
        },
      ]

      mockSend.mockResolvedValueOnce({ Items: products })

      const result = await service.listProducts()

      expect(result).toEqual(products)
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledWith({
        TableName: 'test-table',
      })
    })

    it('should return empty array when no products exist', async () => {
      const service = createProductService('test-table')

      mockSend.mockResolvedValueOnce({})

      const result = await service.listProducts()

      expect(result).toEqual([])
      expect(mockSend).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const service = createProductService('test-table')
      const updatedProduct: Product = {
        code: 'CE',
        name: 'Cheese',
        price: 6.95, // Updated price
        packaging: [{ quantity: 3, price: 16.95 }], // Updated packaging
      }

      mockSend.mockResolvedValueOnce({})

      const result = await service.updateProduct(updatedProduct)

      expect(result).toEqual(updatedProduct)
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledWith({
        TableName: 'test-table',
        Key: { code: 'CE' },
        UpdateExpression: 'SET #name = :name, price = :price, packaging = :packaging',
        ExpressionAttributeNames: { '#name': 'name' },
        ExpressionAttributeValues: {
          ':name': 'Cheese',
          ':price': 6.95,
          ':packaging': [{ quantity: 3, price: 16.95 }],
        },
      })
    })
  })

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      const service = createProductService('test-table')

      mockSend.mockResolvedValueOnce({})

      await service.deleteProduct('CE')

      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledWith({
        TableName: 'test-table',
        Key: { code: 'CE' },
      })
    })
  })
})
