import type { Finding, FindingSeverity, StrengthLabel } from '../types/security';
import { getCharacterClassInfo } from './character-classes';
import {
  CRACK_TIME_ASSUMPTIONS,
  entropyBits,
  estimateCrackTime,
  type CrackTimeEstimate,
} from './entropy';
import { buildFindings } from './patterns';

const SEVERITY_RANK: Record<FindingSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  good: 3,
};

const SEVERITY_PENALTY: Record<FindingSeverity, number> = {
  critical: 50,
  warning: 15,
  info: 3,
  good: 0,
};

const ENTROPY_BIT_PENALTY: Record<FindingSeverity, number> = {
  critical: 30,
  warning: 8,
  info: 2,
  good: 0,
};

export interface AnalysisResult {
  length: number;
  characterClasses: number;
  entropyBits: number;
  effectiveEntropyBits: number;
  score: number;
  label: StrengthLabel;
  findings: Finding[];
  crackTimes: {
    online: CrackTimeEstimate;
    offline: CrackTimeEstimate;
    assumptions: string;
  };
  searchSpaceNote: string;
}

export function analyzePassword(value: string): AnalysisResult | null {
  if (value.length === 0) {
    return null;
  }

  const classInfo = getCharacterClassInfo(value);
  const baseEntropy = entropyBits(classInfo.estimatedPoolSize, value.length);
  const findings = buildFindings(value).sort(
    (first, second) => SEVERITY_RANK[first.severity] - SEVERITY_RANK[second.severity],
  );

  const isCommonPassword = findings.some((finding) => finding.id === 'common-password');
  const hasRepeatedPattern = findings.some((finding) => finding.id === 'repeated-pattern');
  const bitPenalty = findings.reduce(
    (total, finding) => total + ENTROPY_BIT_PENALTY[finding.severity],
    0,
  );
  const effectiveEntropyBits = isCommonPassword ? 0 : Math.max(0, baseEntropy - bitPenalty);

  let score =
    100 - findings.reduce((total, finding) => total + SEVERITY_PENALTY[finding.severity], 0);

  score = Math.min(score, entropyScoreCap(effectiveEntropyBits));

  if (value.length < 8) {
    score = Math.min(score, 25);
  }

  if (isCommonPassword) {
    score = 0;
  }

  if (hasRepeatedPattern) {
    score = Math.min(score, 35);
  }

  score = clamp(score, 0, 100);

  return {
    length: value.length,
    characterClasses: classInfo.classes,
    entropyBits: baseEntropy,
    effectiveEntropyBits,
    score,
    label: labelForScore(score, effectiveEntropyBits),
    findings,
    crackTimes: {
      online: estimateCrackTime(effectiveEntropyBits, CRACK_TIME_ASSUMPTIONS.online),
      offline: estimateCrackTime(effectiveEntropyBits, CRACK_TIME_ASSUMPTIONS.offline),
      assumptions:
        'Average time assumes 1,000 guesses per second online and 100 billion guesses per second offline. Real attackers, rate limits, and hardware vary, so these are estimates, not guarantees.',
    },
    searchSpaceNote:
      'Entropy is estimated from length and observed character classes, then reduced for detected patterns. It is an estimate, not proof of security.',
  };
}

export function labelForScore(score: number, entropy: number): StrengthLabel {
  if (score < 20) {
    return 'critical';
  }

  if (score < 40) {
    return 'weak';
  }

  if (score < 60) {
    return 'fair';
  }

  if (score < 80) {
    return 'good';
  }

  if (score < 90 || entropy < 80) {
    return 'strong';
  }

  return 'excellent';
}

function entropyScoreCap(entropy: number): number {
  if (entropy < 28) {
    return 25;
  }

  if (entropy < 40) {
    return 45;
  }

  if (entropy < 60) {
    return 70;
  }

  if (entropy < 80) {
    return 90;
  }

  return 100;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
