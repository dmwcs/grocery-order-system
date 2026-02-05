export interface PackagingOption {
  quantity: number; // Package quantity, e.g. 3, 5, 8
  price: number; // Package price, e.g. 14.95
}

// Product (Part 1 + Part 2)
export interface Product {
  code: string; // Product code, e.g. "CE"
  name: string; // Product name, e.g. "Cheese"
  price: number; // Unit price, e.g. 5.95
  packaging: PackagingOption[]; // Packaging options
}

// Package breakdown (algorithm output)
export interface PackageBreakdown {
  packageSize: number; // Package size, e.g. 5
  count: number; // Count of packages, e.g. 2
  unitPrice: number; // Unit price per package, e.g. 20.95
}

// Calculation result (Part 3 core algorithm)
export interface CalculationResult {
  totalPrice: number; // Total price
  packages: PackageBreakdown[]; // Package details
}
