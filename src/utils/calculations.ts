import { Grade, PerformanceClassification, IQACInterpretation } from '../types';

export function calculateGrade(totalScore: number): { grade: Grade; performance: PerformanceClassification } {
  if (totalScore >= 68) {
    return { grade: 'A+', performance: 'Outstanding' };
  } else if (totalScore >= 60) {
    return { grade: 'A', performance: 'Excellent' };
  } else if (totalScore >= 52) {
    return { grade: 'B+', performance: 'Very Good' };
  } else if (totalScore >= 45) {
    return { grade: 'B', performance: 'Good' };
  } else if (totalScore >= 37) {
    return { grade: 'C', performance: 'Satisfactory' };
  } else {
    return { grade: 'D', performance: 'Needs Improvement' };
  }
}

export function calculateIQACInterpretation(percentage: number): IQACInterpretation {
  if (percentage >= 90) {
    return 'Excellent Performance';
  } else if (percentage >= 80) {
    return 'Very Good';
  } else if (percentage >= 70) {
    return 'Good';
  } else if (percentage >= 60) {
    return 'Satisfactory';
  } else {
    return 'Improvement Required';
  }
}

export function formatPercentage(num: number): number {
  return Math.round(num * 100) / 100;
}

export function formatRating(num: number): number {
  return Math.round(num * 100) / 100;
}

export function getStatusColor(gradeOrPerformance: string): { bg: string; text: string; border: string } {
  switch (gradeOrPerformance) {
    case 'A+':
    case 'Outstanding':
    case 'Excellent Performance':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'A':
    case 'Excellent':
    case 'Very Good':
    case 'Very Good Performance':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'B+':
    case 'Good':
    case 'Good Performance':
      return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' };
    case 'B':
    case 'Satisfactory':
    case 'Satisfactory Performance':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'C':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
    case 'D':
    case 'Needs Improvement':
    case 'Improvement Required':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  }
}
