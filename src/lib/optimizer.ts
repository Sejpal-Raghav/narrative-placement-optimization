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
  const riskThreshold = 80 - (aggressiveness * 5); // higher aggressiveness ignores risk
  
  Object.values(episodes).forEach(ep => {
    const dropOffRisk = calculateDropOffRisk(ep.hook_strength, ep.pacing_flag);
    const monReadiness = calculateMonetizationReadiness(ep.cliffhanger_intensity);
    
    // Find local peaks in tension curve for ad breaks
    const curve = ep.tension_curve;
    for (let i = 1; i < curve.length - 1; i++) {
      if (curve[i] > curve[i - 1] && curve[i] > curve[i + 1]) {
        
        // constraint check: if general episode drop off risk is too high, skip ads unless aggressive
        if (dropOffRisk < riskThreshold || aggressiveness > 7) {
          placements.push({
            episodeId: ep.id,
            timestamp: i * 10, // 0 to 100 mapping for 10 points
            action: 'ad_break',
            projected_uplift: (curve[i] * aggressiveness) / 100,
            churn_risk: dropOffRisk * (aggressiveness / 10)
          });
        }
      }
    }

    // Paywalls
    // For demo purposes, we place a paywall at the END (100) if readiness is high
    if (monReadiness > (80 - aggressiveness * 5)) {
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
