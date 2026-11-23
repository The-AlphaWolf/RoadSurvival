import { GameClock } from './types';

/**
 * Initial game clock state starting at 06:00 AM, Day 1
 */
export function createInitialClock(): GameClock {
  return {
    day: 1,
    minute: 360, // 06:00 AM (6 * 60)
    totalElapsedMinutes: 0,
  };
}

/**
 * Formats clock time to 24-hour HH:MM format
 */
export function formatClockTime(minuteOfDay: number): string {
  const hours = Math.floor(minuteOfDay / 60) % 24;
  const mins = minuteOfDay % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export interface ClockAdvanceResult {
  newClock: GameClock;
  passedMinutes: number;
  midnightCrossed: boolean;
  daysPassed: number;
  isNovicePeriod: boolean;
}

/**
 * Advances the game clock by a set number of minutes.
 * Handles midnight crossing for talent recharge (00:00).
 */
export function advanceClock(clock: GameClock, minutesToAdvance: number): ClockAdvanceResult {
  if (minutesToAdvance <= 0) {
    return {
      newClock: { ...clock },
      passedMinutes: 0,
      midnightCrossed: false,
      daysPassed: 0,
      isNovicePeriod: clock.day <= 7,
    };
  }

  const prevTotalMinutes = (clock.day - 1) * 1440 + clock.minute;
  const newTotalMinutes = prevTotalMinutes + minutesToAdvance;

  const newDay = Math.floor(newTotalMinutes / 1440) + 1;
  const newMinute = newTotalMinutes % 1440;
  const daysPassed = newDay - clock.day;
  const midnightCrossed = daysPassed > 0 || (clock.minute < 1440 && newMinute < clock.minute);

  return {
    newClock: {
      day: newDay,
      minute: newMinute,
      totalElapsedMinutes: clock.totalElapsedMinutes + minutesToAdvance,
    },
    passedMinutes: minutesToAdvance,
    midnightCrossed,
    daysPassed,
    isNovicePeriod: newDay <= 7,
  };
}

/**
 * Checks if the 72-hour special upgrade charge is available or returns remaining hours
 */
export function getSpecialChargeStatus(
  currentTotalElapsedMinutes: number,
  cooldownUntilMinute: number
): { available: boolean; remainingHours: number } {
  if (cooldownUntilMinute <= currentTotalElapsedMinutes) {
    return { available: true, remainingHours: 0 };
  }
  const remainingMinutes = cooldownUntilMinute - currentTotalElapsedMinutes;
  const remainingHours = Math.ceil(remainingMinutes / 60);
  return { available: false, remainingHours };
}
