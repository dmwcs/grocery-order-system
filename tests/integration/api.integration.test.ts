/**
 * Integration Tests for Grocery Order System API
 *
 * These tests run against the actual deployed API endpoints.
 * Make sure to set the API_URL environment variable before running.
 *
 * Usage: API_URL=https://your-api-url.com npm run test:integration
 */

import { Product, PackageBreakdown } from '../../src/types'

const API_URL = process.env.API_URL || 'https://i7y0qsammg.execute-api.ap-southeast-2.amazonaws.com'

interface OrderItem {
  code: string
  name: string
  quantity: number
  totalPrice: number
  packages: PackageBreakdown[]
}

interface OrderResponse {
  items: OrderItem[]
  totalPrice: number
}

describe('Grocery Order System - Integration Tests', () => {
  describe('Part 1: Product Management', () => {
    const testProduct = {
      code: 'TEST',
      name: 'Test Product',
      price: 9.99,
      packaging: [{ quantity: 2, price: 18.0 }],
    }

    afterAll(async () => {
      // Cleanup: delete test product
      try {
        await fetch(`${API_URL}/products/TEST`, { method: 'DELETE' })
      } catch (error) {
        // Ignore cleanup errors
      }
    })

    it('should create a new product', async () => {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testProduct),
      })

      expect(response.status).toBe(201)
      const data = await response.json() as Product
      expect(data.code).toBe('TEST')
      expect(data.name).toBe('Test Product')
      expect(data.price).toBe(9.99)
    })

    it('should retrieve a single product', async () => {
      const response = await fetch(`${API_URL}/products/CE`)

      expect(response.status).toBe(200)
      const data = await response.json() as Product
      expect(data.code).toBe('CE')
      expect(data.name).toBe('Cheese')
      expect(data.price).toBe(5.95)
      expect(data.packaging).toHaveLength(2)
    })

    it('should retrieve all products', async () => {
      const response = await fetch(`${API_URL}/products`)

      expect(response.status).toBe(200)
      const data = await response.json() as Product[]
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(3) // CE, HM, SS
    })

    it('should update a product', async () => {
      const updatedProduct = {
        ...testProduct,
        price: 10.99,
      }

      const response = await fetch(`${API_URL}/products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      })

      expect(response.status).toBe(200)
      const data = await response.json() as Product
      expect(data.price).toBe(10.99)
    })

    it('should delete a product', async () => {
      const response = await fetch(`${API_URL}/products/TEST`, {
        method: 'DELETE',
      })

      expect(response.status).toBe(204)

      // Verify deletion
      const getResponse = await fetch(`${API_URL}/products/TEST`)
      expect(getResponse.status).toBe(404)
    })

    it('should return 404 for non-existent product', async () => {
      const response = await fetch(`${API_URL}/products/NONEXISTENT`)
      expect(response.status).toBe(404)
    })
  })

  describe('Part 3: Order Calculation', () => {
    it('should calculate order for 10 CE (Cheese)', async () => {
      const order = {
        items: [{ code: 'CE', quantity: 10 }],
      }

      const response = await fetch(`${API_URL}/orders/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })

      expect(response.status).toBe(200)
      const data = await response.json() as OrderResponse

      expect(data.items).toHaveLength(1)
      expect(data.items[0].code).toBe('CE')
      expect(data.items[0].quantity).toBe(10)
      expect(data.items[0].totalPrice).toBe(41.9)

      // Should use 2 packages of 5
      expect(data.items[0].packages).toHaveLength(1)
      expect(data.items[0].packages[0].packageSize).toBe(5)
      expect(data.items[0].packages[0].count).toBe(2)
      expect(data.items[0].packages[0].unitPrice).toBe(20.95)

      expect(data.totalPrice).toBe(41.9)
    })

    it('should calculate order for 14 HM (Ham)', async () => {
      const order = {
        items: [{ code: 'HM', quantity: 14 }],
      }

      const response = await fetch(`${API_URL}/orders/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })

      expect(response.status).toBe(200)
      const data = await response.json() as OrderResponse

      expect(data.items).toHaveLength(1)
      expect(data.items[0].code).toBe('HM')
      expect(data.items[0].quantity).toBe(14)
      expect(data.items[0].totalPrice).toBe(78.85)

      // Should use 1x8 + 1x5 + 1x1
      expect(data.items[0].packages).toHaveLength(3)

      const packages = data.items[0].packages
      expect(packages.find((p) => p.packageSize === 8)?.count).toBe(1)
      expect(packages.find((p) => p.packageSize === 5)?.count).toBe(1)
      expect(packages.find((p) => p.packageSize === 1)?.count).toBe(1)

      expect(data.totalPrice).toBe(78.85)
    })

    it('should calculate order for 3 SS (Soy Sauce)', async () => {
      const order = {
        items: [{ code: 'SS', quantity: 3 }],
      }

      const response = await fetch(`${API_URL}/orders/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })

      expect(response.status).toBe(200)
      const data = await response.json() as OrderResponse

      expect(data.items).toHaveLength(1)
      expect(data.items[0].code).toBe('SS')
      expect(data.items[0].quantity).toBe(3)
      expect(data.items[0].totalPrice).toBe(35.85)

      // Should use 3 individual items
      expect(data.items[0].packages).toHaveLength(1)
      expect(data.items[0].packages[0].packageSize).toBe(1)
      expect(data.items[0].packages[0].count).toBe(3)
      expect(data.items[0].packages[0].unitPrice).toBe(11.95)

      expect(data.totalPrice).toBe(35.85)
    })

    it('should calculate complete order: 10 CE, 14 HM, 3 SS', async () => {
      const order = {
        items: [
          { code: 'CE', quantity: 10 },
          { code: 'HM', quantity: 14 },
          { code: 'SS', quantity: 3 },
        ],
      }

      const response = await fetch(`${API_URL}/orders/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })

      expect(response.status).toBe(200)
      const data = await response.json() as OrderResponse

      expect(data.items).toHaveLength(3)

      // Verify individual items
      const ce = data.items.find((item: OrderItem) => item.code === 'CE')
      expect(ce?.totalPrice).toBe(41.9)

      const hm = data.items.find((item: OrderItem) => item.code === 'HM')
      expect(hm?.totalPrice).toBe(78.85)

      const ss = data.items.find((item: OrderItem) => item.code === 'SS')
      expect(ss?.totalPrice).toBe(35.85)

      // Verify total
      expect(data.totalPrice).toBe(156.6)
    })

    it('should return 404 for invalid product code', async () => {
      const order = {
        items: [{ code: 'INVALID', quantity: 10 }],
      }

      const response = await fetch(`${API_URL}/orders/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })

      expect(response.status).toBe(404)
    })

    it('should return 400 for invalid request', async () => {
      const response = await fetch(`${API_URL}/orders/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      expect(response.status).toBe(400)
    })
  })

  describe('Part 2: Packaging Options Validation', () => {
    it('should verify Cheese (CE) has correct packaging options', async () => {
      const response = await fetch(`${API_URL}/products/CE`)
      const data = await response.json() as Product

      expect(data.packaging).toEqual(
        expect.arrayContaining([
          { quantity: 3, price: 14.95 },
          { quantity: 5, price: 20.95 },
        ])
      )
    })

    it('should verify Ham (HM) has correct packaging options', async () => {
      const response = await fetch(`${API_URL}/products/HM`)
      const data = await response.json() as Product

      expect(data.packaging).toEqual(
        expect.arrayContaining([
          { quantity: 2, price: 13.95 },
          { quantity: 5, price: 29.95 },
          { quantity: 8, price: 40.95 },
        ])
      )
    })

    it('should verify Soy Sauce (SS) has no packaging options', async () => {
      const response = await fetch(`${API_URL}/products/SS`)
      const data = await response.json() as Product

      expect(data.packaging).toEqual([])
    })
  })
})
