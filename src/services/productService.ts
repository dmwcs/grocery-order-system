import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import { Product } from '../types'

export const createProductService = (tableName: string) => {
  const client = new DynamoDBClient({})
  const docClient = DynamoDBDocumentClient.from(client)

  return {
    createProduct: async (product: Product): Promise<Product> => {
      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: product,
        })
      )
      return product
    },

    getProduct: async (code: string): Promise<Product | null> => {
      const result = await docClient.send(
        new GetCommand({
          TableName: tableName,
          Key: { code },
        })
      )
      return (result.Item as Product) || null
    },

    listProducts: async (): Promise<Product[]> => {
      const result = await docClient.send(
        new ScanCommand({
          TableName: tableName,
        })
      )
      return (result.Items as Product[]) || []
    },

    updateProduct: async (product: Product): Promise<Product> => {
      await docClient.send(
        new UpdateCommand({
          TableName: tableName,
          Key: { code: product.code },
          UpdateExpression: 'SET #name = :name, price = :price, packaging = :packaging',
          ExpressionAttributeNames: {
            '#name': 'name',
          },
          ExpressionAttributeValues: {
            ':name': product.name,
            ':price': product.price,
            ':packaging': product.packaging,
          },
        })
      )
      return product
    },

    deleteProduct: async (code: string): Promise<void> => {
      await docClient.send(
        new DeleteCommand({
          TableName: tableName,
          Key: { code },
        })
      )
    },
  }
}
