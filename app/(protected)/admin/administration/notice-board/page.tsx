import React from 'react';
import { NoticeBoardManagerView } from '@/components/features/administration/NoticeBoardManagerView';

export const metadata = {
  title: 'Notice Board Manager | Bright Spark Admin',
  description: 'Create modal bulletin announcements and notice banners',
};

export default function NoticeBoardPage() {
  return <NoticeBoardManagerView />;
}
