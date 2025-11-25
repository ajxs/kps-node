import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import {
  TaskStatus,
  TaskPriority,
  CreateTaskRequest,
  GetTaskOptions,
} from "../types/task";
import { TaskService } from "../services/taskService";
import {
  createTaskSchema,
  PrioritySchema,
  StatusSchema,
} from "../validation/taskValidation";
import { createError } from "../middleware/errorHandler";

async function parseGetAllTasksQueryParameters(
  req: Request
): Promise<GetTaskOptions> {
  // Validation errors raised by Joi will be caught by the calling controller.
  // Using Async validation is slightly more efficient, as the runtime
  // can serve another concurrent request while waiting for validation.
  const statusQueryParameter = await StatusSchema.validateAsync(
    Array.isArray(req.query.status) ? req.query.status[0] : req.query.status
  );

  const priorityQueryParameter = await PrioritySchema.validateAsync(
    Array.isArray(req.query.priority)
      ? req.query.priority[0]
      : req.query.priority
  );

  return {
    status: statusQueryParameter as TaskStatus | undefined,
    priority: priorityQueryParameter as TaskPriority | undefined,
  };
}

export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // @Anthony: I really like that Express V5 automatically forwards async errors
  // to the next error handler, and that we don't need top-level try/catch blocks
  // anymore.
  try {
    const getAllTasksOptions = await parseGetAllTasksQueryParameters(req);

    const results = await TaskService.getAllTasks(getAllTasksOptions);

    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newTaskRequestData: CreateTaskRequest =
      await createTaskSchema.validateAsync(req.body);

    const newTask = await TaskService.createTask(newTaskRequestData);

    res.status(201).json(newTask);
  } catch (error) {
    if (Joi.isError(error)) {
      return next(createError(error.message, "RequestValidationError", 400));
    }

    next(error);
  }
};

export async function deleteAllTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await TaskService.clearAllTasks();
    res.status(200).end();
  } catch (error) {
    next(error);
  }
}
