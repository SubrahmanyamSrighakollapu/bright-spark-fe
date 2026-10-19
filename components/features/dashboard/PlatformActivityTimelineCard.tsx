'use client';

import React, { useState, useEffect } from 'react';
import { logService } from '@/services/logService';
import { ActivityLog } from '@/types/domain';
import { formatDate } from '@/utils/formatters';
import { Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const PlatformActivityTimelineCard: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    let isCancelled = false;
    logService
      .getActivityLogs('', 1, 5)
      .then((res) => {
        if (!isCancelled && res?.success && res?.data?.items) {
          setActivities(res.data.items);
        }
      })
      .catch((err) => {
        console.error('Failed to load activity logs:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Recent Platform Activity & Governance Audit
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time audit log stream derived from system activities
            </p>
          </div>
        </div>
        <Link
          href="/admin/logs/activity"
          className="text-xs font-bold text-indigo-600 hover:text-[#25594C] flex items-center gap-1 transition-colors"
        >
          <span>View Activity Logs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
          <p className="text-xs font-bold text-slate-700">No Recent Activity</p>
          <p className="text-xs text-slate-500">System event stream is idle.</p>
        </div>
      ) : (
        <div className="space-y-3 relative pl-3 border-l-2 border-slate-200 ml-2">
          {activities.map((act) => (
            <div key={act.id} className="relative group">
              <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white" />
              <div className="flex items-start justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900 leading-snug">{act.action}</p>
                  <p className="text-slate-500 text-[11px] font-medium mt-0.5">
                    User: <span className="font-mono text-slate-700 font-semibold">{act.actorId || act.actorName}</span> • Module: <span className="uppercase text-indigo-700 font-bold">{act.module}</span>
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {formatDate(act.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
