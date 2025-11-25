import {
  validateCreateTask,
  validateTaskQuery,
} from "../validation/taskValidation";

describe("Task Validation", () => {
  describe("validateCreateTask", () => {
    it("should pass validation for valid task data", () => {
      const validTask = {
        title: "Test Task",
        description: "Test Description",
        priority: "high",
        dueDate: new Date().toISOString(),
      };

      const result = validateCreateTask(validTask);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(validTask);
    });

    it("should pass validation for minimal valid task data", () => {
      const minimalTask = {
        title: "Test Task",
        priority: "medium",
      };

      const result = validateCreateTask(minimalTask);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(minimalTask);
    });

    it("should fail validation when title is missing", () => {
      const invalidTask = {
        priority: "high",
      };

      const result = validateCreateTask(invalidTask);
      expect(result.error).toBeDefined();
      expect(result.error!.details[0].message).toContain("title");
    });

    it("should fail validation when title exceeds 100 characters", () => {
      const invalidTask = {
        title: "a".repeat(101),
        priority: "high",
      };

      const result = validateCreateTask(invalidTask);
      expect(result.error).toBeDefined();
      expect(result.error!.details[0].message).toContain("length");
    });

    it("should fail validation when description exceeds 500 characters", () => {
      const invalidTask = {
        title: "Test Task",
        description: "a".repeat(501),
        priority: "high",
      };

      const result = validateCreateTask(invalidTask);
      expect(result.error).toBeDefined();
      expect(result.error!.details[0].message).toContain("length");
    });

    it("should fail validation when priority is missing", () => {
      const invalidTask = {
        title: "Test Task",
      };

      const result = validateCreateTask(invalidTask);
      expect(result.error).toBeDefined();
      expect(result.error!.details[0].message).toContain("priority");
    });

    it("should fail validation for invalid priority value", () => {
      const invalidTask = {
        title: "Test Task",
        priority: "invalid",
      };

      const result = validateCreateTask(invalidTask);
      expect(result.error).toBeDefined();
      expect(result.error!.details[0].message).toContain("priority");
    });

    it("should fail validation for invalid date format", () => {
      const invalidTask = {
        title: "Test Task",
        priority: "high",
        dueDate: "invalid-date",
      };

      const result = validateCreateTask(invalidTask);
      expect(result.error).toBeDefined();
      expect(result.error!.details[0].message).toContain("dueDate");
    });
  });

  describe("validateTaskQuery", () => {
    it("should pass validation for valid query parameters", () => {
      const queryParams = {
        status: "pending",
        priority: "high",
      };

      const result = validateTaskQuery(queryParams);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(queryParams);
    });

    it("should pass validation for empty query parameters", () => {
      const queryParams = {};

      const result = validateTaskQuery(queryParams);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(queryParams);
    });

    it("should fail validation for invalid status", () => {
      const queryParams = {
        status: "invalid-status",
      };

      const result = validateTaskQuery(queryParams);
      expect(result.error).toBeDefined();
      expect(result.error!.details[0].message).toContain("status");
    });

    it("should fail validation for invalid priority", () => {
      const queryParams = {
        priority: "invalid-priority",
      };

      const result = validateTaskQuery(queryParams);
      expect(result.error).toBeDefined();
      expect(result.error!.details[0].message).toContain("priority");
    });
  });
});
