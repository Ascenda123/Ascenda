import type { LucideIcon } from 'lucide-react';
import {
  Award,
  ClipboardCheck,
  LayoutDashboard,
  Search,
  Settings,
  UserCircle
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  matchers?: Array<(pathname: string) => boolean>;
  segment: 'home' | 'explore' | 'planner' | 'scholarships' | 'profile' | 'admin';
};

export type SectionNavItem = {
  label: string;
  href: string;
  matchParam?: { key: string; value: string };
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: LayoutDashboard,
    segment: 'home'
  },
  {
    label: 'Explore',
    href: '/university-search/search',
    icon: Search,
    segment: 'explore',
    matchers: [
      (pathname) => pathname.startsWith('/university-search'),
      (pathname) => pathname.startsWith('/matches'),
      (pathname) => pathname.startsWith('/course/'),
      (pathname) => pathname.startsWith('/shortlist')
    ]
  },
  {
    label: 'Applications',
    href: '/applications',
    icon: ClipboardCheck,
    segment: 'planner',
    matchers: [(pathname) => pathname.startsWith('/applications')]
  },
  {
    label: 'Scholarships',
    href: '/scholarships',
    icon: Award,
    segment: 'scholarships'
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: UserCircle,
    segment: 'profile'
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: Settings,
    segment: 'admin'
  }
];

export const EXPLORE_SECTION_ITEMS: SectionNavItem[] = [
  { label: 'Search', href: '/university-search/search' },
  { label: 'Results', href: '/university-search/results' },
  { label: 'Matches', href: '/matches' },
  { label: 'Shortlist', href: '/university-search/shortlist' }
];

export const PLANNER_SECTION_ITEMS: SectionNavItem[] = [
  { label: 'Applications', href: '/applications' },
  { label: 'Tasks', href: '/applications/tasks' }
];

export const PROFILE_SECTION_ITEMS: SectionNavItem[] = [
  { label: 'Overview', href: '/profile', matchParam: { key: 'step', value: 'personal' } },
  { label: 'Academics', href: '/profile?step=academics', matchParam: { key: 'step', value: 'academics' } },
  { label: 'Preferences', href: '/profile?step=preferences', matchParam: { key: 'step', value: 'preferences' } },
  { label: 'Aspirations', href: '/profile?step=aspirations', matchParam: { key: 'step', value: 'aspirations' } }
];

export const isNavActive = (item: NavItem, pathname: string) => {
  if (!pathname) return false;
  if (pathname === item.href) return true;
  if (pathname.startsWith(`${item.href}/`)) return true;
  return item.matchers?.some((matcher) => matcher(pathname)) ?? false;
};

export const filterNavByRole = (items: NavItem[], role: string | null | undefined) =>
  items.filter((item) => item.segment !== 'admin' || role === 'admin');
