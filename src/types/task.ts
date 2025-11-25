/**
 * Task Management Types
 *
 * TODO: Complete the Task interface based on the requirements in README.md
 */

// @Anthony: The addition of 'as const' ensures these arrays are treated as
// immutable tuples of string literals, rather than a normal string array
// containing these specific values.
// Defining the values separately allows the values can be enumerated at runtime,
// allowing us to use them in the Joi schemas.
export const TaskStatusValues = [
  "pending",
  "in-progress",
  "completed",
] as const;

// @Anthony: The use of [number] here extracts the union of the types of the
// individual value array elements.
export type TaskStatus = (typeof TaskStatusValues)[number];

export const TaskPriorityValues = ["low", "medium", "high"] as const;

export type TaskPriority = (typeof TaskPriorityValues)[number];

export interface Task {
  id: string; // UUID
  title: string; // Required, max 100 chars
  description?: string; // Optional, max 500 chars
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date; // Optional
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: Date;
}

// @Anthony: I like using 'Partial' when defining 'optional parameter' types.
export type GetTaskOptions = Partial<{
  status: TaskStatus;
  priority: TaskPriority;
  title: string;
}>;

export function sortTasksByPriority(a: Task, b: Task): number {
  // Giving the priorities a numeric value allows them to be compared numerically.
  const prioritySortingMap: Record<TaskPriority, number> = {
    high: 1,
    medium: 2,
    low: 3,
  };

  return prioritySortingMap[a.priority] - prioritySortingMap[b.priority];
}

export function sortTasksByCreationTime(a: Task, b: Task): number {
  return a.createdAt.getTime() - b.createdAt.getTime();
}

export function sortTasksByPriorityAndCreationTime(a: Task, b: Task): number {
  // If the two tasks have equal priority, sortTasksByPriority returns 0.
  // In that case the tasks will be sorted by creation time.
  return sortTasksByPriority(a, b) || sortTasksByCreationTime(a, b);
}
