'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavigationItem } from '@/config/navigation';
import { IconRenderer } from './IconRenderer';
import { cn } from '@/utils/cn';

export interface SidebarItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isCollapsed,
  onNavigate,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasChildren = !!(item.children && item.children.length > 0);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if child route is active
  const isChildActive = useCallback(
    (child: NavigationItem) => {
      if (!child.path) return false;
      const [cleanPath, childQuery = ''] = child.path.split('?');
      const requiredParams = new URLSearchParams(childQuery);
      const queryMatches = Array.from(requiredParams.entries()).every(
        ([key, value]) => searchParams.get(key) === value
      );

      if (pathname === cleanPath) {
        if (childQuery) return queryMatches;

        const matchingQuerySibling = item.children?.some((sibling) => {
          if (!sibling.path || sibling.id === child.id) return false;
          const [siblingPath, siblingQuery = ''] = sibling.path.split('?');
          if (siblingPath !== cleanPath || !siblingQuery) return false;
          return Array.from(new URLSearchParams(siblingQuery).entries()).every(
            ([key, value]) => searchParams.get(key) === value
          );
        });
        return !matchingQuerySibling;
      }

      if (cleanPath !== '/dashboard' && pathname.startsWith(`${cleanPath}/`)) {
        const hasMoreSpecificSiblingMatch = item.children?.some((sibling) => {
          if (!sibling.path || sibling.id === child.id) return false;
          const siblingCleanPath = sibling.path.split('?')[0];
          return (
            siblingCleanPath.length > cleanPath.length &&
            (pathname === siblingCleanPath || pathname.startsWith(`${siblingCleanPath}/`))
          );
        });
        return !hasMoreSpecificSiblingMatch;
      }

      return false;
    },
    [pathname, searchParams, item.children]
  );

  const isParentActive = !!(hasChildren && item.children?.some(isChildActive));
  const isDirectActive = item.path
    ? pathname === item.path.split('?')[0]
    : false;
  const isActive = isDirectActive || isParentActive;

  // Expanded Accordion State
  const [userToggled, setUserToggled] = useState<boolean | null>(null);
  const isOpen = userToggled !== null ? userToggled : isParentActive;

  // Collapsed Flyout States
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [flyoutTop, setFlyoutTop] = useState(0);

  const calculateFlyoutPosition = useCallback(() => {
    if (buttonRef.current && isCollapsed && hasChildren) {
      const rect = buttonRef.current.getBoundingClientRect();
      const childrenCount = item.children?.length || 0;
      const estimatedHeight = Math.min(childrenCount * 36 + 48, window.innerHeight - 32);
      let top = rect.top;

      if (top + estimatedHeight > window.innerHeight - 16) {
        top = Math.max(16, window.innerHeight - estimatedHeight - 16);
      }
      setFlyoutTop(top);
    }
  }, [isCollapsed, hasChildren, item.children]);

  const isFlyoutOpen = isCollapsed && hasChildren && (isHovered || isPinned);

  useEffect(() => {
    if (isFlyoutOpen) {
      calculateFlyoutPosition();
    }
  }, [isFlyoutOpen, calculateFlyoutPosition]);

  // Reset flyout state on uncollapse or state change
  useEffect(() => {
    if (!isCollapsed && (isPinned || isHovered)) {
      setIsPinned(false);
      setIsHovered(false);
    }
  }, [isCollapsed, isPinned, isHovered]);

  // Click Outside & Escape Key Listener
  useEffect(() => {
    if (!isCollapsed) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        flyoutRef.current &&
        !flyoutRef.current.contains(event.target as Node)
      ) {
        setIsPinned(false);
        setIsHovered(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPinned(false);
        setIsHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCollapsed]);

  const handleParentClick = (e: React.MouseEvent) => {
    if (isCollapsed) {
      e.preventDefault();
      setIsPinned((prev) => !prev);
    } else {
      setUserToggled(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (isCollapsed && hasChildren) {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed && hasChildren && !isPinned) {
      hoverTimerRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 150);
    }
  };

  // Render Leaf Item (no children)
  if (!hasChildren && item.path) {
    return (
      <div className="relative group">
        <Link
          href={item.path}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 select-none cursor-pointer',
            isCollapsed ? 'justify-center px-0' : '',
            isActive
              ? 'bg-blue-50/80 text-[var(--primary)] font-bold border-l-3 border-[var(--secondary)] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          )}
        >
          <IconRenderer
            name={item.iconName}
            className={cn('w-4 h-4 shrink-0', isActive ? 'text-[var(--primary)]' : 'text-slate-400')}
          />
          {!isCollapsed && <span className="truncate">{item.label}</span>}
          {item.badge && !isCollapsed && (
            <span className="ml-auto px-1.5 py-0.2 bg-blue-100 text-[var(--primary)] text-[10px] font-bold rounded-full">
              {item.badge}
            </span>
          )}
        </Link>

        {/* Collapsed Tooltip for Leaf Item */}
        {isCollapsed && (
          <div className="fixed left-[78px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-800">
            {item.label}
          </div>
        )}
      </div>
    );
  }

  // Render Parent Item with Children (Accordion in expanded, Desktop Flyout in collapsed)
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleParentClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-haspopup="true"
        aria-expanded={isCollapsed ? isFlyoutOpen : isOpen}
        aria-controls={hasChildren ? `flyout-${item.id}` : undefined}
        className={cn(
          'w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 select-none cursor-pointer text-left',
          isCollapsed ? 'justify-center px-0' : '',
          isActive
            ? 'bg-blue-50/80 text-[var(--primary)] font-bold border-l-3 border-[var(--secondary)] shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
        )}
      >
        <div className="flex items-center gap-3">
          <IconRenderer
            name={item.iconName}
            className={cn(
              'w-4 h-4 shrink-0',
              isActive ? 'text-[var(--primary)]' : 'text-slate-400'
            )}
          />
          {!isCollapsed && <span className="truncate">{item.label}</span>}
        </div>

        {!isCollapsed && (
          <div className="shrink-0 text-slate-400">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </div>
        )}
      </button>

      {/* Desktop Flyout Submenu for Collapsed Mode */}
      {isFlyoutOpen && (
        <div
          ref={flyoutRef}
          style={{ top: `${flyoutTop}px` }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="menu"
          id={`flyout-${item.id}`}
          className="fixed left-[78px] w-60 bg-white border border-slate-200 rounded-[var(--radius-xl)] shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* Header */}
          <div className="px-3.5 py-2 flex items-center justify-between border-b border-slate-100 mb-1">
            <div className="flex items-center gap-2">
              <IconRenderer name={item.iconName} className="w-4 h-4 text-[var(--primary)] shrink-0" />
              <span className="font-bold text-xs text-slate-900 truncate">{item.label}</span>
            </div>
            {item.children && (
              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                {item.children.length}
              </span>
            )}
          </div>

          {/* Child Items */}
          <div className="max-h-[calc(100vh-140px)] overflow-y-auto space-y-0.5 px-1.5 no-scrollbar">
            {item.children?.map((child) => {
              const isChildItemActive = isChildActive(child);
              return (
                <Link
                  key={child.id}
                  href={child.path || '#'}
                  onClick={() => {
                    setIsPinned(false);
                    setIsHovered(false);
                    onNavigate?.();
                  }}
                  role="menuitem"
                  className={cn(
                    'flex items-center justify-between px-3 py-2 text-xs rounded-md transition-colors select-none cursor-pointer',
                    isChildItemActive
                      ? 'bg-blue-50 text-[var(--primary)] font-bold border-l-2 border-[var(--primary)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <span className="truncate">{child.label}</span>
                  {child.badge && (
                    <span className="ml-2 px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                      {child.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Expanded Accordion Submenu */}
      {!isCollapsed && isOpen && (
        <div className="mt-1 ml-4 pl-3 border-l border-slate-200/80 space-y-1">
          {item.children?.map((child) => {
            const isChildItemActive = isChildActive(child);
            return (
              <Link
                key={child.id}
                href={child.path || '#'}
                onClick={onNavigate}
                className={cn(
                  'block px-3 py-2 rounded-md text-xs transition-colors select-none cursor-pointer',
                  isChildItemActive
                    ? 'bg-blue-50 text-[var(--primary)] font-bold border-l-2 border-[var(--primary)]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
