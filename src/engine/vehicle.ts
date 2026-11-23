import {
  UpgradePathKey,
  UpgradePathState,
  VehicleComponent,
  VehicleComponentKey,
  VehicleState,
} from './types';
import { UPGRADE_PATHS_LIST, VEHICLE_COMPONENTS_LIST, VEHICLE_EVOLUTIONS } from './constants';

/**
 * Creates the initial Common Van on Day 1 (Survival Guide §8, Clarification C8)
 * Starts with all 12 components at Common rarity, 100% durability, and full fuel.
 */
export function createInitialVehicle(): VehicleState {
  const components = {} as Record<VehicleComponentKey, VehicleComponent>;

  for (const key of VEHICLE_COMPONENTS_LIST) {
    components[key] = {
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      rarity: 'common',
      durability: 100,
      isUpgraded: false,
    };
  }

  const upgradePaths = {} as Record<UpgradePathKey, UpgradePathState>;

  for (const { key, name } of UPGRADE_PATHS_LIST) {
    upgradePaths[key] = {
      key,
      name,
      activated: false,
      locked: false,
      level: 0,
      offSlotLevel: 0,
    };
  }

  return {
    name: 'Common Van',
    stage: 'common_van',
    durability: 100,
    fuel: 100,
    maxFuel: 100,
    fuelConsumptionRate: 0.2, // ~0.2 units per minute of driving
    wear: 0,
    components,
    upgradePaths,
    activePathsCount: 0,
    lockedPathsCount: 0,
  };
}

/**
 * Activates an upgrade path using an available upgrade point (Clarification C8)
 */
export function activateUpgradePath(
  vehicle: VehicleState,
  pathKey: UpgradePathKey
): VehicleState {
  const path = vehicle.upgradePaths[pathKey];
  if (!path) throw new Error(`Unknown upgrade path: ${pathKey}`);
  if (path.locked) throw new Error(`Path ${path.name} is permanently locked!`);
  if (path.activated) throw new Error(`Path ${path.name} is already activated.`);
  if (vehicle.activePathsCount >= 12) throw new Error('Maximum of 12 paths already activated.');

  const newActiveCount = vehicle.activePathsCount + 1;
  const newUpgradePaths = {
    ...vehicle.upgradePaths,
    [pathKey]: {
      ...path,
      activated: true,
      level: 1,
    },
  };

  // If 12th path activated, lock the remaining 3 paths permanently
  let newLockedCount = vehicle.lockedPathsCount;
  if (newActiveCount === 12) {
    for (const key of Object.keys(newUpgradePaths) as UpgradePathKey[]) {
      const p = newUpgradePaths[key]!;
      if (!p.activated && !p.locked) {
        newUpgradePaths[key] = { ...p, locked: true };
        newLockedCount += 1;
      }
    }
  }

  return {
    ...vehicle,
    upgradePaths: newUpgradePaths,
    activePathsCount: newActiveCount,
    lockedPathsCount: newLockedCount,
  };
}

/**
 * Advances vehicle evolution stage if player level reaches milestones (Clarification C9)
 */
export function checkVehicleEvolution(currentLevel: number, vehicle: VehicleState): VehicleState {
  let highestStage = vehicle.stage;

  for (const evo of VEHICLE_EVOLUTIONS) {
    if (currentLevel >= evo.minLevel) {
      highestStage = evo.stage;
    }
  }

  if (highestStage !== vehicle.stage) {
    const evoInfo = VEHICLE_EVOLUTIONS.find((e) => e.stage === highestStage)!;
    return {
      ...vehicle,
      stage: highestStage,
      name: evoInfo.name,
    };
  }

  return vehicle;
}
