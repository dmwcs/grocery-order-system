import { Product } from '../types'

export const createProductService = (tableName: string) => {
  return {
    createProduct: async (product: Product): Promise<Product> => {
      throw new Error('Not implemented')
    },

    getProduct: async (code: string): Promise<Product | null> => {
      throw new Error('Not implemented')
    },

    listProducts: async (): Promise<Product[]> => {
      throw new Error('Not implemented')
    },

    updateProduct: async (product: Product): Promise<Product> => {
      throw new Error('Not implemented')
    },

    deleteProduct: async (code: string): Promise<void> => {
      throw new Error('Not implemented')
    },
  }
}
