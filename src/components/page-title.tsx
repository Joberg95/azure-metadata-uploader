'use client';

import { usePathname } from 'next/navigation';

interface TitleConfig {
  title: string;
  description: string;
}

const routeTitles: Record<string, TitleConfig> = {
  '/dashboard/documents': {
    title: 'Content',
    description:
      'Here you can add, edit, copy or delete an existing document from Azure Manual sites.',
  },
  '/dashboard/projects': {
    title: 'Projects',
    description: 'Here you can create projects.',
  },
};

export default function PageTitle() {
  const pathname = usePathname();

  const matchingRoutes = Object.keys(routeTitles)
    .filter((route) => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length);

  const matchedRoute = matchingRoutes[0];
  const titleConfig = matchedRoute ? routeTitles[matchedRoute] : null;

  if (!titleConfig) {
    return null;
  }

  return (
    <div className='px-4 py-6'>
      <h1 className='text-2xl text-black'>{titleConfig.title}</h1>
      <p className='text-muted-foreground mt-1'>{titleConfig.description}</p>
    </div>
  );
}
