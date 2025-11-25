import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import {
  Task,
  CreateTaskRequest,
  GetTaskOptions,
  sortTasksByPriorityAndCreationTime,
} from "../types/task";
import { AppError } from "../middleware/errorHandler";

/**
 * Task Service - Business Logic Layer
 *
 * This service manages the in-memory task storage and business logic.
 * In a real application, this would interface with a database.
 *
 * TODO: Implement the service methods
 */

// In-memory storage (for this interview - normally you'd use a database)
const tasks: Task[] = [];

export class TaskService {
  static async getAllTasks(getTaskOptions?: GetTaskOptions): Promise<Task[]> {
    const { status, priority, title } = getTaskOptions ?? {};

    return tasks
      .filter((task) => {
        if (status && task.status !== status) {
          return false;
        }

        if (priority && task.priority !== priority) {
          return false;
        }

        if (title && task.title.toLowerCase() !== title.toLowerCase()) {
          return false;
        }

        return true;
      })
      .sort(sortTasksByPriorityAndCreationTime);
  }

  static async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const { title, description, priority, dueDate } = taskData;

    if (dueDate && dayjs(dueDate).isBefore()) {
      throw new AppError(
        "Due date cannot be in the past",
        "InvalidTaskError",
        400
      );
    }

    const tasksWithSameTitle = await this.getAllTasks({ title });
    if (tasksWithSameTitle.length > 0) {
      throw new AppError(
        "A task with the same title already exists",
        "InvalidTaskError",
        400
      );
    }

    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      priority,
      dueDate,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tasks.push(newTask);

    return newTask;
  }

  // Test helper method - clears all tasks for testing
  static async clearAllTasks(): Promise<void> {
    tasks.length = 0;
  }
}
