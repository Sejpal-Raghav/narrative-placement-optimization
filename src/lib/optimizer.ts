export interface EpisodeData {
  id: string;
  title: string;
  episode_number: number;
  duration_estimate: number;
  hook_strength: number;
  cliffhanger_intensity: number;
  tension_curve: number[];
  arc_position: 'setup' | 'rising' | 'climax' | 'resolution';
  pacing_flag: 'lull' | 'accelerating' | 'constant';
  llm_insights?: string;
}

export interface Placement {
  episodeId: string;
  timestamp: number; // 0 to 100 percentage
  action: 'ad_break' | 'paywall';
  projected_uplift: number;
  churn_risk: number;
}

/**
 * Derived signal: drop_off_risk
 * Inverse function of hook_strength and pacing_flag.
 * Weak hook + lull = higher modeled risk.
 */
export function calculateDropOffRisk(hookStrength: number, pacingFlag: string): number {
  let pacingMultiplier = 1.0;
  if (pacingFlag === 'lull') pacingMultiplier = 1.5;
  if (pacingFlag === 'accelerating') pacingMultiplier = 0.7;

  // Max risk is 100
  const risk = ((100 - hookStrength) * pacingMultiplier);
  return Math.min(100, Math.max(0, risk));
}

/**
 * Derived signal: monetization_readiness
 * Function of cliffhanger_intensity.
 * Right after a peak cliffhanger = highest willingness-to-continue/pay.
 */
export function calculateMonetizationReadiness(cliffhangerIntensity: number): number {
  // A simple linear map for now, though could be non-linear
  return cliffhangerIntensity;
}

/**
 * Placement optimizer logic
 * 
 * - Ad breaks: local tension peaks
 * - Paywalls: immediately after highest cliffhanger_intensity
 * - Constraint: don't place within 2 points of a drop_off_risk spike (handled via simple tension checking)
 */
export function optimizePlacements(
  episodes: Record<string, EpisodeData>,
  aggressiveness: number // 1 to 10
): Placement[] {
  const placements: Placement[] = [];
  // Higher aggressiveness tolerates higher drop-off risk
  const maxTolerableRisk = aggressiveness * 10; // agg=1 -> 10, agg=10 -> 100
  
  Object.values(episodes).forEach(ep => {
    const dropOffRisk = calculateDropOffRisk(ep.hook_strength, ep.pacing_flag);
    const monReadiness = calculateMonetizationReadiness(ep.cliffhanger_intensity);
    
    // Find points to place ads
    const curve = ep.tension_curve;
    let lastAdIndex = -5; // prevent back-to-back clustering
    
    for (let i = 1; i < curve.length - 1; i++) {
      const isPeak = curve[i] > curve[i - 1] && curve[i] >= curve[i + 1];
      
      // Higher aggressiveness lowers the tension required to place an ad
      const tensionThreshold = 95 - (aggressiveness * 5); // agg=1 -> 90, agg=5 -> 70, agg=10 -> 45
      const isHighTension = curve[i] >= tensionThreshold;
      
      if ((isPeak || isHighTension) && (i - lastAdIndex >= 2)) {
        
        // Only place if the episode's drop-off risk is tolerable (or if we're extremely aggressive)
        if (dropOffRisk <= maxTolerableRisk || aggressiveness >= 9) {
          placements.push({
            episodeId: ep.id,
            timestamp: i * 10, // 0 to 100 mapping for 10 points
            action: 'ad_break',
            projected_uplift: (curve[i] * aggressiveness) / 100,
            churn_risk: dropOffRisk * (aggressiveness / 10)
          });
          lastAdIndex = i;
        }
      }
    }

    // Paywalls
    // For demo purposes, we place a paywall at the END (100) if readiness is high
    const minReadinessRequired = 100 - (aggressiveness * 6); // agg=1 -> 94, agg=10 -> 40
    if (monReadiness >= minReadinessRequired) {
      placements.push({
        episodeId: ep.id,
        timestamp: 100,
        action: 'paywall',
        projected_uplift: (monReadiness * aggressiveness) / 50,
        churn_risk: dropOffRisk * 1.5 * (aggressiveness / 10)
      });
    }
  });

  return placements;
}
