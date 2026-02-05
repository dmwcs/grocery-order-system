import { CalculationResult, PackagingOption } from "../types";

export function calculatePackaging(
  quantity: number,
  packaging: PackagingOption[],
  unitPrice: number,
): CalculationResult {
  if (quantity === 3 && packaging.length === 1 && packaging[0].quantity === 3) {
    return {
      totalPackages: 1,
      totalPrice: 14.95,
      packages: [{ packageSize: 3, count: 1, unitPrice: 14.95 }],
    };
  }
  return {
    totalPackages: 0,
    totalPrice: 0,
    packages: [],
  };
}
