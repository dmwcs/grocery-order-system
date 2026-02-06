import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createProductService } from '../services/productService'
import { Product } from '../types'

// Lazy loading - ProductService will be reused in Lambda container
let productService: ReturnType<typeof createProductService> | null = null

const getService = () => {
  if (!productService) {
    productService = createProductService(process.env.PRODUCTS_TABLE!)
  }
  return productService
}

// Create product
export const createProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const product: Product = JSON.parse(event.body || '{}')
    const result = await getService().createProduct(product)

    return {
      statusCode: 201,
      body: JSON.stringify(result),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

// Get single product
export const getProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const code = event.pathParameters?.code

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Code required' }),
      }
    }

    const product = await getService().getProduct(code)

    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(product),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

// List all products
export const listProducts = async (): Promise<APIGatewayProxyResult> => {
  try {
    const products = await getService().listProducts()

    return {
      statusCode: 200,
      body: JSON.stringify(products),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

// Update product
export const updateProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const product: Product = JSON.parse(event.body || '{}')
    const result = await getService().updateProduct(product)

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

// Delete product
export const deleteProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const code = event.pathParameters?.code

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Code required' }),
      }
    }

    await getService().deleteProduct(code)

    return {
      statusCode: 204,
      body: '',
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
