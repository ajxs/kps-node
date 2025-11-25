import Joi from "joi";
import { TaskPriorityValues, TaskStatusValues } from "../types/task";

/**
 * Task Validation Schemas
 */

export const PrioritySchema = Joi.string().valid(...TaskPriorityValues);

export const StatusSchema = Joi.string().valid(...TaskStatusValues);

export const createTaskSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().max(500).optional(),
  priority: PrioritySchema.required(),
  dueDate: Joi.string().isoDate().optional(),
}).unknown(false); // Reject unknown fields

export const taskQuerySchema = Joi.object({
  status: StatusSchema.optional(),
  priority: PrioritySchema.optional(),
}).unknown(false); // Reject unknown query params

// Validation helper functions
export const validateCreateTask = (data: unknown) => {
  return createTaskSchema.validate(data);
};

export const validateTaskQuery = (data: unknown) => {
  return taskQuerySchema.validate(data);
};
