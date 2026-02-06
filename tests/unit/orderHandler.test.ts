import { APIGatewayProxyEvent } from 'aws-lambda'
import { calculateOrder } from '../../src/handlers/orders'
import { Product } from '../../src/types'

// Mock ProductService
const mockGetProduct = jest.fn()

jest.mock('../../src/services/productService', () => ({
  createProductService: jest.fn(() => ({
    getProduct: mockGetProduct,
  })),
}))

// Mock calculator
jest.mock('../../src/utils/calculator', () => ({
  calculatePackaging: jest.fn(),
}))

// Import the mocked function after the mock is set up
import { calculatePackaging } from '../../src/utils/calculator'
const mockCalculatePackaging = calculatePackaging as jest.MockedFunction<typeof calculatePackaging>

describe('Order Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('calculateOrder', () => {
    it('should calculate order for single item', async () => {
      const product: Product = {
        code: 'CE',
        name: 'Cheese',
        price: 5.95,
        packaging: [
          { quantity: 3, price: 14.95 },
          { quantity: 5, price: 20.95 },
        ],
      }

      mockGetProduct.mockResolvedValueOnce(product)
      mockCalculatePackaging.mockReturnValueOnce({
        totalPrice: 41.9,
        packages: [{ packageSize: 5, count: 2, unitPrice: 20.95 }],
      })

      const event = {
        body: JSON.stringify({
          items: [{ code: 'CE', quantity: 10 }],
        }),
      } as APIGatewayProxyEvent

      const result = await calculateOrder(event)

      expect(result.statusCode).toBe(200)
      const body = JSON.parse(result.body)
      expect(body).toHaveProperty('items')
      expect(body.items).toHaveLength(1)
      expect(body.items[0].code).toBe('CE')
      expect(body.items[0].totalPrice).toBe(41.9)
      expect(mockGetProduct).toHaveBeenCalledWith('CE')
      expect(mockCalculatePackaging).toHaveBeenCalledWith(10, product.packaging, product.price)
    })

    it('should calculate order for multiple items', async () => {
      const cheese: Product = {
        code: 'CE',
        name: 'Cheese',
        price: 5.95,
        packaging: [{ quantity: 3, price: 14.95 }],
      }

      const ham: Product = {
        code: 'HM',
        name: 'Ham',
        price: 7.95,
        packaging: [{ quantity: 5, price: 29.95 }],
      }

      mockGetProduct.mockResolvedValueOnce(cheese).mockResolvedValueOnce(ham)
      mockCalculatePackaging
        .mockReturnValueOnce({
          totalPrice: 14.95,
          packages: [{ packageSize: 3, count: 1, unitPrice: 14.95 }],
        })
        .mockReturnValueOnce({
          totalPrice: 29.95,
          packages: [{ packageSize: 5, count: 1, unitPrice: 29.95 }],
        })

      const event = {
        body: JSON.stringify({
          items: [
            { code: 'CE', quantity: 3 },
            { code: 'HM', quantity: 5 },
          ],
        }),
      } as APIGatewayProxyEvent

      const result = await calculateOrder(event)

      expect(result.statusCode).toBe(200)
      const body = JSON.parse(result.body)
      expect(body.items).toHaveLength(2)
      expect(body.totalPrice).toBe(44.9)
    })

    it('should return 404 when product not found', async () => {
      mockGetProduct.mockResolvedValueOnce(null)

      const event = {
        body: JSON.stringify({
          items: [{ code: 'INVALID', quantity: 10 }],
        }),
      } as APIGatewayProxyEvent

      const result = await calculateOrder(event)

      expect(result.statusCode).toBe(404)
      expect(JSON.parse(result.body)).toHaveProperty('error')
    })

    it('should return 400 when request body is invalid', async () => {
      const event = {
        body: JSON.stringify({}),
      } as APIGatewayProxyEvent

      const result = await calculateOrder(event)

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body)).toHaveProperty('error')
    })

    it('should return 500 on internal error', async () => {
      mockGetProduct.mockRejectedValueOnce(new Error('Database error'))

      const event = {
        body: JSON.stringify({
          items: [{ code: 'CE', quantity: 10 }],
        }),
      } as APIGatewayProxyEvent

      const result = await calculateOrder(event)

      expect(result.statusCode).toBe(500)
      expect(JSON.parse(result.body)).toHaveProperty('error')
    })
  })
})
