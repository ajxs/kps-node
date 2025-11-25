import {
  isValidUUID,
  formatDate,
  calculateDaysDifference,
  isDateWithin24Hours,
} from "../utils/helpers";

describe("Utility Functions", () => {
  describe("isValidUUID", () => {
    it("should return true for valid UUID v4", () => {
      const validUUID = "123e4567-e89b-12d3-a456-426614174000";
      expect(isValidUUID(validUUID)).toBe(true);
    });

    it("should return false for invalid UUID", () => {
      const invalidUUIDs = [
        "invalid-uuid",
        "123",
        "",
        "123e4567-e89b-12d3-a456-42661417400", // Too short
        "123e4567-e89b-12d3-a456-426614174000-extra", // Too long
        "gggg4567-e89b-12d3-a456-426614174000", // Invalid characters
      ];

      invalidUUIDs.forEach((uuid) => {
        expect(isValidUUID(uuid)).toBe(false);
      });
    });
  });

  describe("formatDate", () => {
    it("should format date to ISO string", () => {
      const date = new Date("2024-01-01T12:00:00.000Z");
      const result = formatDate(date);
      expect(result).toBe("2024-01-01T12:00:00.000Z");
    });

    it("should handle different dates correctly", () => {
      const date = new Date("2023-12-25T23:59:59.999Z");
      const result = formatDate(date);
      expect(result).toBe("2023-12-25T23:59:59.999Z");
    });
  });

  describe("calculateDaysDifference", () => {
    it("should calculate difference between dates correctly", () => {
      const date1 = new Date("2024-01-01");
      const date2 = new Date("2024-01-03");

      const result = calculateDaysDifference(date1, date2);
      expect(result).toBe(2);
    });

    it("should return positive difference regardless of order", () => {
      const date1 = new Date("2024-01-05");
      const date2 = new Date("2024-01-01");

      const result = calculateDaysDifference(date1, date2);
      expect(result).toBe(4);
    });

    it("should return 0 for same date", () => {
      const date = new Date("2024-01-01");

      const result = calculateDaysDifference(date, date);
      expect(result).toBe(0);
    });

    it("should handle partial days correctly", () => {
      const date1 = new Date("2024-01-01T00:00:00");
      const date2 = new Date("2024-01-01T12:00:00"); // 12 hours later

      const result = calculateDaysDifference(date1, date2);
      expect(result).toBe(1); // Should round up to 1 day
    });
  });

  describe("isDateWithin24Hours", () => {
    it("should return true for date within 24 hours from now", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 12); // 12 hours from now

      const result = isDateWithin24Hours(futureDate);
      expect(result).toBe(true);
    });

    it("should return true for date exactly 24 hours from now", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 24); // Exactly 24 hours from now

      const result = isDateWithin24Hours(futureDate);
      expect(result).toBe(true);
    });

    it("should return false for date more than 24 hours from now", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 25); // 25 hours from now

      const result = isDateWithin24Hours(futureDate);
      expect(result).toBe(false);
    });

    it("should return false for past dates", () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // 1 hour ago

      const result = isDateWithin24Hours(pastDate);
      expect(result).toBe(false);
    });

    it("should return false for date exactly now", () => {
      const now = new Date();

      const result = isDateWithin24Hours(now);
      expect(result).toBe(false);
    });
  });
});
