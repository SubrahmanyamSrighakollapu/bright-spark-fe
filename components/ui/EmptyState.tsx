'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  imageSrc?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  imageClassName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  description = 'There are no records available at the moment matching your criteria.',
  imageSrc = '/no-data-found.png',
  icon,
  action,
  className,
  imageClassName,
}) => {
  return (
    <div
      className={cn(
        'w-full py-10 px-6 flex flex-col items-center justify-center text-center bg-white border border-[#E5EAF1] rounded-2xl shadow-xs transition-all duration-300 animate-fadeIn',
        className
      )}
    >
      <div className="relative mb-3 flex items-center justify-center">
        {icon ? (
          <div className="w-16 h-16 rounded-2xl bg-blue-50/80 border border-blue-100 text-[#2F6F5E] flex items-center justify-center shadow-xs">
            {icon}
          </div>
        ) : (
          <div className="relative w-48 h-36 sm:w-56 sm:h-40 flex items-center justify-center">
            {/* Standard Global Empty State Illustration */}
            <img
              src={imageSrc}
              alt={title}
              className={cn(
                'max-w-full max-h-full object-contain filter drop-shadow-sm transition-transform duration-300 hover:scale-105',
                imageClassName
              )}
            />
          </div>
        )}
      </div>

      <h4 className="text-base font-extrabold text-[#0F172A] tracking-tight mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-[#64748B] max-w-md font-medium leading-relaxed mb-4">
          {description}
        </p>
      )}

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

