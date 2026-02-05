import { CalculationResult, PackageBreakdown, PackagingOption } from "../types";

export const calculatePackaging = (
  quantity: number,
  packaging: PackagingOption[],
  unitPrice: number,
): CalculationResult => {
  if (packaging.length === 0) {
    return {
      totalPrice: quantity * unitPrice,
      packages: [{ packageSize: 1, count: quantity, unitPrice }],
    };
  }
  // Add single item as fallback option
  const allOptions = [...packaging, { quantity: 1, price: unitPrice }].sort(
    (a, b) => b.quantity - a.quantity,
  ); // Sort from largest to smallest

  // Dynamic Programming: dp[i] = minimum packages needed to reach quantity i
  const dp: number[] = new Array(quantity + 1).fill(Infinity);
  const parent: number[] = new Array(quantity + 1).fill(-1);
  dp[0] = 0;

  for (let i = 1; i <= quantity; i++) {
    for (const option of allOptions) {
      if (option.quantity <= i && dp[i - option.quantity] + 1 < dp[i]) {
        dp[i] = dp[i - option.quantity] + 1;
        parent[i] = option.quantity;
      }
    }
  }

  // Backtrack to find the packages used
  const usedPackages: Map<number, number> = new Map();
  let current = quantity;
  while (current > 0) {
    const packageSize = parent[current];
    usedPackages.set(packageSize, (usedPackages.get(packageSize) || 0) + 1);
    current -= packageSize;
  }

  // Build the result
  const packages: PackageBreakdown[] = [];
  let totalPrice = 0;

  usedPackages.forEach((count, packageSize) => {
    const option = allOptions.find((opt) => opt.quantity === packageSize)!;
    packages.push({
      packageSize,
      count,
      unitPrice: option.price,
    });
    totalPrice += count * option.price;
  });

  return {
    totalPrice,
    packages: packages.sort((a, b) => b.packageSize - a.packageSize),
  };
};
