import { PackagingOption } from "../../src/types";
import { calculatePackaging } from "../../src/utils/calculator";

describe("calculatePackaging", () => {
  it("should handle just one package", () => {
    const packaging: PackagingOption[] = [{ quantity: 3, price: 14.95 }];
    const res = calculatePackaging(3, packaging, 5.95);

    expect(res.totalPrice).toBe(14.95);
    expect(res.packages).toEqual([
      { packageSize: 3, count: 1, unitPrice: 14.95 }, // 1 package of 3 items at $14.95
    ]);
  });

  it("should handle 3 SS (no packaging options)", () => {
    const packaging: PackagingOption[] = [];

    const result = calculatePackaging(3, packaging, 11.95);

    expect(result.totalPrice).toBe(35.85);
    expect(result.packages).toEqual([
      { packageSize: 1, count: 3, unitPrice: 11.95 },
    ]);
  });

  // Test: Multiple same packages
  it("should handle 10 CE (2 packages of 5)", () => {
    const packaging: PackagingOption[] = [
      { quantity: 5, price: 20.95 },
      { quantity: 3, price: 14.95 },
    ];

    const result = calculatePackaging(10, packaging, 5.95);

    expect(result.totalPrice).toBe(41.9);
    expect(result.packages).toEqual([
      { packageSize: 5, count: 2, unitPrice: 20.95 },
    ]);
  });

  it("should handle 14 HM (mixed packages)", () => {
    const packaging: PackagingOption[] = [
      { quantity: 2, price: 13.95 },
      { quantity: 5, price: 29.95 },
      { quantity: 8, price: 40.95 },
    ];

    const result = calculatePackaging(14, packaging, 7.95);

    expect(result.totalPrice).toBe(78.85);
    expect(result.packages).toEqual([
      { packageSize: 8, count: 1, unitPrice: 40.95 },
      { packageSize: 5, count: 1, unitPrice: 29.95 },
      { packageSize: 1, count: 1, unitPrice: 7.95 },
    ]);
  });
});
