import * as uuid from "uuid";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

/**
 * Utility Helper Functions
 *
 * TODO: Implement any utility functions you need
 * This file is optional but might be useful for common operations
 */

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const formatDate = (date: Date): string => {
  // TODO: Implement date formatting if needed
  return date.toISOString();
};

export const calculateDaysDifference = (date1: Date, date2: Date): number => {
  // TODO: Implement date difference calculation
  // Might be useful for completion time calculations
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isDateWithin24Hours = (date: Date): boolean => {
  // TODO: Implement check if date is within 24 hours from now
  // Useful for priority scoring bonus
  const now = new Date();
  const timeDiff = date.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  return hoursDiff <= 24 && hoursDiff > 0;
};

// @Anthony: It's possible to create more concise versions of some of the
// utility functions.
export const calculateDaysDifferenceShorter = (date1: Date, date2: Date) =>
  Math.abs(Math.ceil(dayjs(date2).diff(date1, "day", true)));

export const isDateWithin24HoursShorter = (date: Date): boolean =>
  dayjs(date).isBetween(dayjs(), dayjs().add(24, "hours"), null, "(]");

export const isValidUUIDShorter = uuid.validate;
