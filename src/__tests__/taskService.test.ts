import dayjs from "dayjs";
import { TaskService } from "../services/taskService";
import { CreateTaskRequest } from "../types/task";

/**
 * Task Service Unit Tests
 *
 * TODO: Implement unit tests for the TaskService class
 * These tests should focus on the business logic without HTTP concerns
 */

describe("TaskService", () => {
  beforeEach(async () => {
    // Clear tasks before each test to ensure test isolation
    // Candidates will need to implement a method to clear tasks or handle this
    jest.clearAllMocks();

    await TaskService.clearAllTasks();
  });

  describe("createTask", () => {
    it("should raise an exception if provided a due date in the past", async () => {
      const taskData: CreateTaskRequest = {
        title: "Test Task with Past Due Date",
        priority: "medium",
        dueDate: dayjs().subtract(1, "day").toDate(),
      };

      await expect(TaskService.createTask(taskData)).rejects.toMatchObject({
        message: "Due date cannot be in the past",
        code: "InvalidTaskError",
        statusCode: 400,
      });
    });

    it("should raise an exception if a task with the same title already exists", async () => {
      const taskData: CreateTaskRequest = {
        title: "Unique Task Title",
        priority: "high",
      };

      await TaskService.createTask(taskData);

      await expect(TaskService.createTask(taskData)).rejects.toMatchObject({
        message: "A task with the same title already exists",
        code: "InvalidTaskError",
        statusCode: 400,
      });
    });

    it("should create a task with all required properties", async () => {
      const taskData: CreateTaskRequest = {
        title: "Test Task",
        description: "Test Description",
        priority: "high",
        dueDate: dayjs().add(1, "day").toDate(),
      };

      const result = await TaskService.createTask(taskData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("string");
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.title).toBe(taskData.title);
      expect(result.description).toBe(taskData.description);
      expect(result.priority).toBe(taskData.priority);
      expect(result.status).toBe("pending"); // Default status
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.dueDate).toEqual(taskData.dueDate);
    });

    it("should create task with only required fields", async () => {
      const taskData: CreateTaskRequest = {
        title: "Minimal Task",
        priority: "low",
      };

      const result = await TaskService.createTask(taskData);

      expect(result.title).toBe(taskData.title);
      expect(result.priority).toBe(taskData.priority);
      expect(result.status).toBe("pending");
      expect(result.description).toBeUndefined();
      expect(result.dueDate).toBeUndefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should generate unique IDs for different tasks", async () => {
      const taskData1: CreateTaskRequest = {
        title: "Task 1",
        priority: "high",
      };

      const taskData2: CreateTaskRequest = {
        title: "Task 2",
        priority: "medium",
      };

      const result1 = await TaskService.createTask(taskData1);
      const result2 = await TaskService.createTask(taskData2);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe("getAllTasks", () => {
    it("should return empty array when no tasks exist", async () => {
      const result = await TaskService.getAllTasks();
      expect(result).toEqual([]);
    });

    it("should return all tasks when no filters applied", async () => {
      // Create test tasks
      const task1 = await TaskService.createTask({
        title: "Task 1",
        priority: "high",
      });
      const task2 = await TaskService.createTask({
        title: "Task 2",
        priority: "low",
      });

      const result = await TaskService.getAllTasks();
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toContain(task1.id);
      expect(result.map((t) => t.id)).toContain(task2.id);
    });

    it("should filter tasks by status", async () => {
      // Create tasks - they will all have pending status by default
      const task1 = await TaskService.createTask({
        title: "Pending Task 1",
        priority: "high",
      });

      const task2 = await TaskService.createTask({
        title: "Pending Task 2",
        priority: "medium",
      });

      const pendingTasks = await TaskService.getAllTasks({ status: "pending" });

      expect(pendingTasks).toHaveLength(2);
      expect(pendingTasks.map((t) => t.id)).toContain(task1.id);
      expect(pendingTasks.map((t) => t.id)).toContain(task2.id);
    });

    it("should filter tasks by priority", async () => {
      await TaskService.createTask({
        title: "High Priority Task",
        priority: "high",
      });

      await TaskService.createTask({
        title: "Low Priority Task",
        priority: "low",
      });

      const highPriorityTasks = await TaskService.getAllTasks({
        priority: "high",
      });
      const lowPriorityTasks = await TaskService.getAllTasks({
        priority: "low",
      });

      expect(highPriorityTasks).toHaveLength(1);
      expect(highPriorityTasks[0].title).toBe("High Priority Task");
      expect(lowPriorityTasks).toHaveLength(1);
      expect(lowPriorityTasks[0].title).toBe("Low Priority Task");
    });

    it("should sort tasks by priority then by createdAt", async () => {
      // Create tasks with different priorities
      const lowTask = await TaskService.createTask({
        title: "Low Priority Task",
        priority: "low",
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const highTask = await TaskService.createTask({
        title: "High Priority Task",
        priority: "high",
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const mediumTask = await TaskService.createTask({
        title: "Medium Priority Task",
        priority: "medium",
      });

      const result = await TaskService.getAllTasks();

      expect(result).toHaveLength(3);
      // Should be sorted by priority: high -> medium -> low
      expect(result[0].priority).toBe("high");
      expect(result[1].priority).toBe("medium");
      expect(result[2].priority).toBe("low");
    });
  });
});
