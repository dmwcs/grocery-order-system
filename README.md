# Coding Challenge - Grocery Order System

Hi team! This is my solution to the grocery order system coding challenge using Test-Driven Development.

## Live Demo

The system is deployed and ready to test:

**Base URL:** `https://i7y0qsammg.execute-api.ap-southeast-2.amazonaws.com`

**Available Endpoints:**
- `POST /products` - Create product
- `GET /products` - List all products
- `GET /products/{code}` - Get single product
- `PUT /products` - Update product
- `DELETE /products/{code}` - Delete product
- `POST /orders/calculate` - Calculate order

Feel free to test the API using curl, Postman, or any HTTP client. Sample requests are provided below.

## What I Built

A serverless grocery order management system with two main components:

**1. Product Management (Admin)**
- Admins can create, update, and delete products
- Each product supports multiple packaging options with bulk discounts
- Products are stored in DynamoDB

**2. Order Calculation (Customer)**
- Customers submit orders with product codes and quantities
- System automatically calculates the optimal package combination
- Minimizes total package count to reduce shipping costs
- Returns detailed price breakdown

**Example:** For an order of 10x Cheese (with options: 3 for $14.95 or 5 for $20.95):
- System chooses 2×5-packs = $41.90
- Instead of 3×3-packs + 1 single = $51.80

## Technology Stack

- **Backend**: Node.js 20.x + TypeScript
- **Framework**: Serverless Framework v4
- **Cloud**: AWS Lambda + DynamoDB + API Gateway
- **Testing**: Jest (38 tests: 23 unit + 15 integration)
- **Approach**: Test-Driven Development (TDD)

## Project Structure

```
src/
├── handlers/           # API endpoints (Lambda functions)
│   ├── products.ts    # Product CRUD (5 endpoints)
│   └── orders.ts      # Order calculation
├── services/          # Database operations
│   └── productService.ts
├── utils/             # Business logic
│   └── calculator.ts  # Package optimization (dynamic programming)
└── types/
    └── index.ts       # TypeScript types

tests/
├── unit/              # 23 unit tests (mocked)
└── integration/       # 15 integration tests (real API)
```

## Setup & Installation

```bash
# Install dependencies
npm install

# Configure AWS credentials
aws configure
```

## Running Tests

```bash
# All tests (38 tests)
npm test

# Unit tests only (fast, no AWS required)
npm run test:unit

# Integration tests (requires deployed API)
npm run test:integration
```

## Deployment

```bash
# Deploy to AWS
npx serverless deploy --stage dev

# Remove deployment
npx serverless remove --stage dev
```

After deployment, you'll get an API endpoint like:
`https://xxx.execute-api.ap-southeast-2.amazonaws.com`

## API Usage

### Admin: Manage Products

**Create Product**
```bash
curl -X POST https://i7y0qsammg.execute-api.ap-southeast-2.amazonaws.com/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CE",
    "name": "Cheese",
    "price": 5.95,
    "packaging": [
      {"quantity": 3, "price": 14.95},
      {"quantity": 5, "price": 20.95}
    ]
  }'
```

**Get Product**
```bash
curl https://i7y0qsammg.execute-api.ap-southeast-2.amazonaws.com/products/CE
```

**List All Products**
```bash
curl https://i7y0qsammg.execute-api.ap-southeast-2.amazonaws.com/products
```

**Update Product**
```bash
curl -X PUT https://i7y0qsammg.execute-api.ap-southeast-2.amazonaws.com/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CE",
    "name": "Cheese",
    "price": 6.95,
    "packaging": [{"quantity": 3, "price": 16.95}]
  }'
```

**Delete Product**
```bash
curl -X DELETE https://i7y0qsammg.execute-api.ap-southeast-2.amazonaws.com/products/CE
```

### Customer: Calculate Order

**Request:**
```bash
curl -X POST https://i7y0qsammg.execute-api.ap-southeast-2.amazonaws.com/orders/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"code": "CE", "quantity": 10},
      {"code": "HM", "quantity": 14},
      {"code": "SS", "quantity": 3}
    ]
  }'
```

**Response:**
```json
{
  "items": [
    {
      "code": "CE",
      "name": "Cheese",
      "quantity": 10,
      "totalPrice": 41.9,
      "packages": [
        {"packageSize": 5, "count": 2, "unitPrice": 20.95}
      ]
    },
    {
      "code": "HM",
      "name": "Ham",
      "quantity": 14,
      "totalPrice": 78.85,
      "packages": [
        {"packageSize": 8, "count": 1, "unitPrice": 40.95},
        {"packageSize": 5, "count": 1, "unitPrice": 29.95},
        {"packageSize": 1, "count": 1, "unitPrice": 7.95}
      ]
    },
    {
      "code": "SS",
      "name": "Soy Sauce",
      "quantity": 3,
      "totalPrice": 35.85,
      "packages": [
        {"packageSize": 1, "count": 3, "unitPrice": 11.95}
      ]
    }
  ],
  "totalPrice": 156.6
}
```

## Algorithm

The package optimization uses **dynamic programming** (similar to coin change problem):
- Time complexity: O(n × m)
- Always finds optimal solution (minimum packages)
- Handles edge cases (no packaging options, products not found)

## Test Coverage

✅ **38 tests passing**

**Unit Tests (23):**
- Calculator algorithm: 4 tests
- ProductService: 7 tests
- Product handlers: 7 tests
- Order handler: 5 tests

**Integration Tests (15):**
- Product CRUD: 6 tests
- Order calculation: 6 tests
- Packaging validation: 3 tests

## TDD Approach

Development followed strict TDD methodology:
1. Write failing tests first
2. Create stub implementations
3. Implement functionality to pass tests
4. Refactor while keeping tests green

## Sample Products

| Code | Name       | Unit Price | Packaging Options                           |
|------|------------|------------|---------------------------------------------|
| CE   | Cheese     | $5.95      | 3 for $14.95, 5 for $20.95                 |
| HM   | Ham        | $7.95      | 2 for $13.95, 5 for $29.95, 8 for $40.95   |
| SS   | Soy Sauce  | $11.95     | No packaging (sold individually)            |

---

**Built with:** TypeScript • AWS Lambda • DynamoDB • TDD • Serverless Framework
