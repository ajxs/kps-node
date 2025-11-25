import request from "supertest";
import { app } from "../server";

/**
 * Task API Integration Tests
 *
 * TODO: Implement tests for the Task API endpoints
 * This file provides a starting structure and examples
 */

describe("Task API Integration Tests", () => {
  beforeEach(async () => {
    // Clear all tasks before each test
    // This assumes candidates implement a way to clear tasks for testing
    await request(app).delete("/api/tasks/test-clear-all");
  });

  describe("GET /api/tasks", () => {
    it("should return an empty array initially", async () => {
      const response = await request(app).get("/api/tasks").expect(200);

      expect(response.body).toEqual([]);
    });

    it("should return tasks when they exist", async () => {
      // Create a test task first
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        priority: "high",
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      // Get all tasks
      const response = await request(app).get("/api/tasks").expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(createResponse.body.id);
      expect(response.body[0].title).toBe(taskData.title);
    });

    it("should filter tasks by status", async () => {
      // Create tasks with different statuses
      const pendingTask = await request(app)
        .post("/api/tasks")
        .send({
          title: "Pending Task",
          priority: "high",
        })
        .expect(201);

      // Note: Since we don't have update endpoint, tasks will remain in pending status
      // Filter by pending status
      const pendingResponse = await request(app)
        .get("/api/tasks?status=pending")
        .expect(200);

      expect(pendingResponse.body).toHaveLength(1);
      expect(pendingResponse.body[0].id).toBe(pendingTask.body.id);
    });

    it("should filter tasks by priority", async () => {
      // Create tasks with different priorities
      await request(app)
        .post("/api/tasks")
        .send({
          title: "High Priority Task",
          priority: "high",
        })
        .expect(201);

      await request(app)
        .post("/api/tasks")
        .send({
          title: "Low Priority Task",
          priority: "low",
        })
        .expect(201);

      // Filter by high priority
      const highPriorityResponse = await request(app)
        .get("/api/tasks?priority=high")
        .expect(200);

      expect(highPriorityResponse.body).toHaveLength(1);
      expect(highPriorityResponse.body[0].title).toBe("High Priority Task");

      // Filter by low priority
      const lowPriorityResponse = await request(app)
        .get("/api/tasks?priority=low")
        .expect(200);

      expect(lowPriorityResponse.body).toHaveLength(1);
      expect(lowPriorityResponse.body[0].title).toBe("Low Priority Task");
    });

    it("should sort tasks by priority then by createdAt", async () => {
      // Create tasks in specific order
      await request(app)
        .post("/api/tasks")
        .send({
          title: "Low Priority Task",
          priority: "low",
        })
        .expect(201);

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await request(app)
        .post("/api/tasks")
        .send({
          title: "High Priority Task",
          priority: "high",
        })
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 10));

      await request(app)
        .post("/api/tasks")
        .send({
          title: "Medium Priority Task",
          priority: "medium",
        })
        .expect(201);

      const response = await request(app).get("/api/tasks").expect(200);

      expect(response.body).toHaveLength(3);
      // Should be sorted by priority: high -> medium -> low
      expect(response.body[0].priority).toBe("high");
      expect(response.body[1].priority).toBe("medium");
      expect(response.body[2].priority).toBe("low");
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task with valid data", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        priority: "high",
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(typeof response.body.id).toBe("string");
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.priority).toBe(taskData.priority);
      expect(response.body.status).toBe("pending"); // Default status
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
      expect(new Date(response.body.dueDate)).toEqual(
        new Date(taskData.dueDate)
      );
    });

    it("should create task with minimal required data", async () => {
      const taskData = {
        title: "Minimal Task",
        priority: "medium",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe(taskData.title);
      expect(response.body.priority).toBe(taskData.priority);
      expect(response.body.status).toBe("pending");
      expect(response.body.description).toBeUndefined();
      expect(response.body.dueDate).toBeUndefined();
    });

    it("should return 400 when title is missing", async () => {
      const taskData = {
        priority: "high",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain("title");
    });

    it("should return 400 when title exceeds 100 characters", async () => {
      const taskData = {
        title: "a".repeat(101),
        priority: "high",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain("length");
    });

    it("should return 400 when description exceeds 500 characters", async () => {
      const taskData = {
        title: "Test Task",
        description: "a".repeat(501),
        priority: "high",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain("length");
    });

    it("should return 400 when priority is missing", async () => {
      const taskData = {
        title: "Test Task",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain("priority");
    });

    it("should return 400 for invalid priority value", async () => {
      const taskData = {
        title: "Test Task",
        priority: "invalid",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain("priority");
    });

    it("should return 400 for invalid date format", async () => {
      const taskData = {
        title: "Test Task",
        priority: "high",
        dueDate: "invalid-date",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain("dueDate");
    });
  });
});

// Helper functions for testing
const createTestTask = async (taskData: any) => {
  // TODO: Helper function to create a test task
  // Return the created task for use in other tests
};

const clearAllTasks = async () => {
  // TODO: Helper function to clear all tasks between tests
  // This ensures test isolation
};
