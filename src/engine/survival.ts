import { PlayerStats, PlayerTrait, SurvivalMeters } from './types';

export interface MeterTickParams {
  minutes: number;
  exertion: 'none' | 'light' | 'heavy';
  ambientTemperature: number; // in Celsius
  traits: PlayerTrait[];
  stats: PlayerStats;
}

export interface MeterTickResult {
  newMeters: SurvivalMeters;
  healthLost: number;
  warnings: string[];
  isDead: boolean;
  hallucinating: boolean;
}

/**
 * Ticks survival meters based on elapsed time, exertion, and traits.
 *
 * Rules:
 * - Thirst drops faster than Hunger (accelerated by heat and exertion).
 * - Energy is spent by actions, restored by resting/sleeping.
 * - Fatigue accumulates over time and activity; impairs stats if high.
 * - Physically average trait: exertion fatigue x1.2 until Str & End >= 14 (Qing Zhou starts 10/10).
 * - Calm under pressure: -30% sanity loss from horror/panic.
 * - When Hunger or Thirst hit 0, health drains progressively.
 * - When Health hits 0, player dies.
 */
export function tickSurvivalMeters(
  meters: SurvivalMeters,
  params: MeterTickParams
): MeterTickResult {
  const { minutes, exertion, ambientTemperature, traits, stats } = params;
  if (minutes <= 0) {
    return {
      newMeters: { ...meters },
      healthLost: 0,
      warnings: [],
      isDead: meters.health <= 0,
      hallucinating: meters.sanity < 30,
    };
  }

  const warnings: string[] = [];
  const hours = minutes / 60;

  // Multipliers based on exertion
  let exertionEnergyMult = 1.0;
  let exertionFatigueMult = 1.0;
  let exertionThirstMult = 1.0;
  let exertionHungerMult = 1.0;

  if (exertion === 'light') {
    exertionEnergyMult = 1.8;
    exertionFatigueMult = 1.5;
    exertionThirstMult = 1.4;
    exertionHungerMult = 1.2;
  } else if (exertion === 'heavy') {
    exertionEnergyMult = 3.5;
    exertionFatigueMult = 3.0;
    exertionThirstMult = 2.2;
    exertionHungerMult = 1.8;
  }

  // Trait: Physically Average penalty
  const isPhysicallyAverage =
    traits.includes('physically_average') && (stats.strength < 14 || stats.endurance < 14);
  if (isPhysicallyAverage && exertion !== 'none') {
    exertionFatigueMult *= 1.2;
    exertionEnergyMult *= 1.15;
  }

  // Heat accelerates thirst
  const heatMult = ambientTemperature > 30 ? 1 + (ambientTemperature - 30) * 0.05 : 1.0;

  // Base drop rates per hour
  // Thirst: ~2.5% per hour base (lasts ~40h without water)
  const thirstDrop = 2.5 * hours * exertionThirstMult * heatMult;
  // Hunger: ~1.5% per hour base (lasts ~66h without food)
  const hungerDrop = 1.5 * hours * exertionHungerMult;
  // Energy drop: ~2.0% per hour base
  const energyDrop = 2.0 * hours * exertionEnergyMult;
  // Fatigue gain: ~2.0% per hour base
  const fatigueGain = 2.0 * hours * exertionFatigueMult;

  let newThirst = Math.max(0, meters.thirst - thirstDrop);
  let newHunger = Math.max(0, meters.hunger - hungerDrop);
  let newEnergy = Math.max(0, meters.energy - energyDrop);
  let newFatigue = Math.min(100, meters.fatigue + fatigueGain);
  let newSanity = meters.sanity;
  let newHealth = meters.health;

  // Starvation and Dehydration damage
  let healthLost = 0;
  if (newThirst <= 0) {
    const dehydrationDamage = 5.0 * hours; // 5 HP per hour of total dehydration
    healthLost += dehydrationDamage;
    warnings.push('⚠️ Severe dehydration is rapidly destroying your health!');
  } else if (newThirst < 20) {
    warnings.push('💧 Parched: Thirst is dangerously low.');
  }

  if (newHunger <= 0) {
    const starvationDamage = 2.5 * hours; // 2.5 HP per hour of total starvation
    healthLost += starvationDamage;
    warnings.push('⚠️ Starvation is eating away at your health!');
  } else if (newHunger < 20) {
    warnings.push('🍖 Famished: Hunger is dangerously low.');
  }

  if (newFatigue > 80) {
    warnings.push('🥱 Exhaustion: Extreme fatigue is impairing your mind and body.');
  }

  newHealth = Math.max(0, newHealth - healthLost);

  // Body Temperature normalization towards 37°C
  let newTemp = meters.temperature;
  if (ambientTemperature < 10) {
    newTemp = Math.max(34.5, newTemp - 0.2 * hours);
    if (newTemp < 35.5) warnings.push('❄️ Hypothermia risk: Body temperature is dropping!');
  } else if (ambientTemperature > 38) {
    newTemp = Math.min(41.0, newTemp + 0.3 * hours);
    if (newTemp > 38.5) warnings.push('🔥 Heatstroke risk: Body temperature is dangerously high!');
  } else {
    // Normalizing back to 37.0
    if (newTemp < 37.0) newTemp = Math.min(37.0, newTemp + 0.5 * hours);
    if (newTemp > 37.0) newTemp = Math.max(37.0, newTemp - 0.5 * hours);
  }

  const hallucinating = newSanity < 30;
  if (hallucinating) {
    warnings.push('👁️ Hallucinations: Low sanity is warping your perception of reality.');
  }

  return {
    newMeters: {
      health: Math.round(newHealth * 10) / 10,
      maxHealth: meters.maxHealth,
      energy: Math.round(newEnergy * 10) / 10,
      hunger: Math.round(newHunger * 10) / 10,
      thirst: Math.round(newThirst * 10) / 10,
      fatigue: Math.round(newFatigue * 10) / 10,
      sanity: Math.round(newSanity * 10) / 10,
      temperature: Math.round(newTemp * 10) / 10,
    },
    healthLost: Math.round(healthLost * 10) / 10,
    warnings,
    isDead: newHealth <= 0,
    hallucinating,
  };
}

/**
 * Modifies sanity, applying the Calm Under Pressure trait if negative.
 */
export function applySanityDelta(
  currentSanity: number,
  delta: number,
  traits: PlayerTrait[]
): number {
  if (delta < 0 && traits.includes('calm_under_pressure')) {
    // -30% sanity loss from panic/horror
    delta = delta * 0.7;
  }
  return Math.min(100, Math.max(0, currentSanity + delta));
}
