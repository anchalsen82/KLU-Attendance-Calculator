import {
  AppSettings,
  AttendanceStatus,
  CalculationMode,
  COMPONENT_CONFIGS,
  ComponentMetric,
  ComponentType,
  SemesterMetric,
  Subject,
  SubjectMetric,
} from '../types/attendance';

export const COMPONENT_KEYS: ComponentType[] = ['lecture', 'practical', 'tutorial', 'skill', 'tcbr'];

/**
 * Computes safe bunks and recovery classes needed.
 * @param attended Classes attended
 * @param conducted Classes conducted
 * @param target Target attendance percentage (e.g. 75, 80, 85)
 */
export function calculateBunksAndRecovery(
  attended: number,
  conducted: number,
  target: number
): { safeBunks: number; recoveryNeeded: number; percentage: number } {
  if (conducted <= 0) {
    return { safeBunks: 0, recoveryNeeded: 0, percentage: 0 };
  }

  // Clamped percentage
  const actualAttended = Math.min(attended, conducted);
  const percentage = (actualAttended / conducted) * 100;

  if (percentage >= target) {
    // Current attendance is at or above target
    // Formula: floor((100 * A - T * C) / T)
    const bunks = Math.floor((100 * actualAttended - target * conducted) / target);
    return {
      safeBunks: Math.max(0, bunks),
      recoveryNeeded: 0,
      percentage,
    };
  } else {
    // Current attendance is below target
    // Formula: ceil((T * C - 100 * A) / (100 - T))
    if (target >= 100) {
      return {
        safeBunks: 0,
        recoveryNeeded: 999, // Impossible to achieve 100% if missed any
        percentage,
      };
    }
    const recovery = Math.ceil((target * conducted - 100 * actualAttended) / (100 - target));
    return {
      safeBunks: 0,
      recoveryNeeded: Math.max(1, recovery),
      percentage,
    };
  }
}

/**
 * Determines status category based on target threshold
 */
export function determineStatus(
  percentage: number,
  target: number,
  conducted: number
): AttendanceStatus {
  if (conducted <= 0) return 'unrecorded';
  if (percentage >= target) return 'safe';
  // Warning zone is within 5 percentage points below target
  if (percentage >= Math.max(0, target - 5)) return 'warning';
  return 'critical';
}

/**
 * Calculates metrics for an individual subject
 */
export function calculateSubjectMetric(subject: Subject, settings: AppSettings): SubjectMetric {
  const target = subject.targetPercentage ?? settings.targetPercentage;
  const weights = settings.weights;
  const mode = settings.calculationMode;

  let totalConducted = 0;
  let totalAttended = 0;
  let weightedAttendedSum = 0;
  let weightedConductedSum = 0;

  let compAverageWeightedSum = 0;
  let compTotalWeight = 0;

  const componentMetrics: Record<ComponentType, ComponentMetric> = {} as Record<
    ComponentType,
    ComponentMetric
  >;

  COMPONENT_KEYS.forEach((key) => {
    const compData = subject.components[key];
    const isEnabled = compData?.enabled ?? true;
    const rawConducted = isEnabled ? Math.max(0, compData?.conducted || 0) : 0;
    const rawAttended = isEnabled ? Math.max(0, Math.min(rawConducted, compData?.attended || 0)) : 0;
    const weight = compData?.weight ?? weights[key] ?? COMPONENT_CONFIGS[key].defaultWeight;

    const { safeBunks, recoveryNeeded, percentage: compPct } = calculateBunksAndRecovery(
      rawAttended,
      rawConducted,
      target
    );

    const compStatus = determineStatus(compPct, target, rawConducted);

    componentMetrics[key] = {
      type: key,
      label: COMPONENT_CONFIGS[key].label,
      shortLabel: COMPONENT_CONFIGS[key].shortLabel,
      conducted: rawConducted,
      attended: rawAttended,
      weight,
      percentage: Number(compPct.toFixed(2)),
      safeBunks,
      recoveryNeeded,
      status: compStatus,
    };

    if (rawConducted > 0) {
      totalConducted += rawConducted;
      totalAttended += rawAttended;
      weightedAttendedSum += rawAttended * weight;
      weightedConductedSum += rawConducted * weight;

      compAverageWeightedSum += compPct * weight;
      compTotalWeight += weight;
    }
  });

  const hasClasses = totalConducted > 0;
  let overallPercentage = 0;

  if (hasClasses) {
    if (mode === 'weighted_hours') {
      overallPercentage = weightedConductedSum > 0 ? (weightedAttendedSum / weightedConductedSum) * 100 : 0;
    } else if (mode === 'component_average') {
      overallPercentage = compTotalWeight > 0 ? compAverageWeightedSum / compTotalWeight : 0;
    } else {
      // unweighted simple
      overallPercentage = (totalAttended / totalConducted) * 100;
    }
  }

  overallPercentage = Number(overallPercentage.toFixed(2));
  const status = determineStatus(overallPercentage, target, totalConducted);
  const differenceFromTarget = Number((overallPercentage - target).toFixed(2));

  // Overall safe bunks and recovery based on unweighted total (standard student metric)
  const { safeBunks, recoveryNeeded } = calculateBunksAndRecovery(
    totalAttended,
    totalConducted,
    target
  );

  return {
    subject,
    conductedTotal: totalConducted,
    attendedTotal: totalAttended,
    percentage: overallPercentage,
    status,
    targetPercentage: target,
    differenceFromTarget,
    safeBunks,
    recoveryNeeded,
    components: componentMetrics,
    hasClasses,
  };
}

/**
 * Calculates global semester metrics across all subjects
 */
export function calculateSemesterMetric(
  subjects: Subject[],
  settings: AppSettings
): SemesterMetric {
  const subjectMetrics = subjects.map((sub) => calculateSubjectMetric(sub, settings));

  let totalConducted = 0;
  let totalAttended = 0;
  let safeCount = 0;
  let warningCount = 0;
  let criticalCount = 0;
  let activeSubjectsCount = 0;

  subjectMetrics.forEach((m) => {
    totalConducted += m.conductedTotal;
    totalAttended += m.attendedTotal;

    if (m.hasClasses) {
      activeSubjectsCount++;
      if (m.status === 'safe') safeCount++;
      else if (m.status === 'warning') warningCount++;
      else if (m.status === 'critical') criticalCount++;
    }
  });

  const overallPercentage =
    totalConducted > 0 ? Number(((totalAttended / totalConducted) * 100).toFixed(2)) : 0;

  const target = settings.targetPercentage;
  const status = determineStatus(overallPercentage, target, totalConducted);
  const differenceFromTarget = Number((overallPercentage - target).toFixed(2));

  const { safeBunks: overallSafeBunks, recoveryNeeded: overallRecoveryNeeded } =
    calculateBunksAndRecovery(totalAttended, totalConducted, target);

  return {
    totalSubjects: subjects.length,
    activeSubjectsCount,
    totalConducted,
    totalAttended,
    overallPercentage,
    targetPercentage: target,
    differenceFromTarget,
    status,
    overallSafeBunks,
    overallRecoveryNeeded,
    safeCount,
    warningCount,
    criticalCount,
    subjectMetrics,
  };
}

/**
 * Attendance forecast simulation for remaining classes and planned absences
 */
export interface ForecastResult {
  projectedConducted: number;
  projectedAttended: number;
  projectedPercentage: number;
  projectedStatus: AttendanceStatus;
  percentageChange: number;
  maxAllowableBunksFromRemaining: number;
  isTargetMet: boolean;
}

export function simulateAttendanceForecast(
  currentAttended: number,
  currentConducted: number,
  remainingClasses: number,
  plannedBunks: number,
  targetPercentage: number
): ForecastResult {
  const safePlannedBunks = Math.min(Math.max(0, plannedBunks), remainingClasses);
  const additionalAttended = Math.max(0, remainingClasses - safePlannedBunks);

  const projectedConducted = currentConducted + remainingClasses;
  const projectedAttended = currentAttended + additionalAttended;

  const currentPct = currentConducted > 0 ? (currentAttended / currentConducted) * 100 : 0;
  const projectedPercentage =
    projectedConducted > 0 ? Number(((projectedAttended / projectedConducted) * 100).toFixed(2)) : 0;

  const percentageChange = Number((projectedPercentage - currentPct).toFixed(2));
  const projectedStatus = determineStatus(projectedPercentage, targetPercentage, projectedConducted);

  // Maximum bunks from remaining classes to still achieve target:
  // (currentAttended + remainingClasses - B) / (currentConducted + remainingClasses) >= target / 100
  // currentAttended + remainingClasses - B >= (target / 100) * (currentConducted + remainingClasses)
  // B <= currentAttended + remainingClasses - (target / 100) * (currentConducted + remainingClasses)
  const maxPossibleAttended = currentAttended + remainingClasses;
  const targetRequired = (targetPercentage / 100) * projectedConducted;
  const allowableBunksRaw = Math.floor(maxPossibleAttended - targetRequired);
  const maxAllowableBunksFromRemaining = Math.max(
    0,
    Math.min(remainingClasses, allowableBunksRaw)
  );

  return {
    projectedConducted,
    projectedAttended,
    projectedPercentage,
    projectedStatus,
    percentageChange,
    maxAllowableBunksFromRemaining,
    isTargetMet: projectedPercentage >= targetPercentage,
  };
}
