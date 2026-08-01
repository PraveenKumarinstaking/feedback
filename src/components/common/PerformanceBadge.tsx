import React from 'react';
import { getStatusColor } from '../../utils/calculations';

interface PerformanceBadgeProps {
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({ label, size = 'md' }) => {
  const { bg, text, border } = getStatusColor(label);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-bold'
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${bg} ${text} ${border} ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
};
