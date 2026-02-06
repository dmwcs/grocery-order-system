import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createProductService } from '../services/productService'
import { calculatePackaging } from '../utils/calculator'

// Lazy loading - ProductService will be reused in Lambda container
let productService: ReturnType<typeof createProductService> | null = null

const getService = () => {
  if (!productService) {
    productService = createProductService(process.env.PRODUCTS_TABLE!)
  }
  return productService
}

interface OrderItem {
  code: string
  quantity: number
}

interface OrderRequest {
  items: OrderItem[]
}

// Calculate order
export const calculateOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const request: OrderRequest = JSON.parse(event.body || '{}')

    // Validate request
    if (!request.items || !Array.isArray(request.items) || request.items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request: items array is required' }),
      }
    }

    const service = getService()
    const results = []
    let totalPrice = 0

    // Process each item in the order
    for (const item of request.items) {
      const product = await service.getProduct(item.code)

      if (!product) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: `Product not found: ${item.code}` }),
        }
      }

      // Calculate optimal packaging for this item
      const calculation = calculatePackaging(item.quantity, product.packaging, product.price)

      results.push({
        code: product.code,
        name: product.name,
        quantity: item.quantity,
        totalPrice: calculation.totalPrice,
        packages: calculation.packages,
      })

      totalPrice += calculation.totalPrice
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: results,
        totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
      }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
