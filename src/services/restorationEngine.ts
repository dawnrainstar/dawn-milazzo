import { Region } from '../types';

export function calculateEcosystemScore(
  forest: number,
  soil: number,
  water: number,
  bio: number
): number {
  return Math.round((forest + soil + water + bio) / 4);
}

export function generateRecommendations(
  soil: number,
  water: number,
  bio: number,
  forest: number = 80,
  biome?: string
): string[] {
  const tasks: string[] = [];

  if (soil < 60) {
    tasks.push("Add compost and native mycorrhizal fungi to revive soil microbiomes");
  }
  if (soil < 45) {
    tasks.push("Deploy Root Crawlers to remediate heavy metal toxicity and soil compaction");
  }

  if (water < 60) {
    tasks.push("Restore stream habitat and riparian bio-filtration zones");
  }
  if (water < 45) {
    tasks.push("Deploy River Drones with bio-flocculant arrays to purge industrial run-off");
  }

  if (bio < 60) {
    tasks.push("Increase pollinator corridors and native flowering vegetative buffers");
  }
  if (bio < 45) {
    tasks.push("Establish automated acoustic wildlife sanctuaries with zero-human corridors");
  }

  if (forest < 60) {
    tasks.push("Dispatch Leaf Drones for high-density aerial seed bombing of native pioneer trees");
  }
  if (forest < 50) {
    tasks.push("Construct nurse-log micro-dams to prevent topsoil mudslides on clear-cut slopes");
  }

  // If healthy:
  if (tasks.length === 0) {
    tasks.push("Maintain old-growth protection protocols and expand contiguous wildlife corridors");
    tasks.push("Continue continuous satellite telemetry and periodic drone root-health sweeps");
  }

  return tasks;
}

export function getVitalityStatus(score: number): {
  label: 'PRISTINE / RESILIENT' | 'RECOVERING' | 'CRITICAL STRESS';
  color: string;
  textColor: string;
  badgeBg: string;
} {
  if (score >= 80) {
    return {
      label: 'PRISTINE / RESILIENT',
      color: '#10b981', // emerald-500
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/40 border-emerald-500/30'
    };
  }
  if (score >= 65) {
    return {
      label: 'RECOVERING',
      color: '#f59e0b', // amber-500
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-950/40 border-amber-500/30'
    };
  }
  return {
    label: 'CRITICAL STRESS',
    color: '#f43f5e', // rose-500
    textColor: 'text-rose-400',
    badgeBg: 'bg-rose-950/40 border-rose-500/30'
  };
}
