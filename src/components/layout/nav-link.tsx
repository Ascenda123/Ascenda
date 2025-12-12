'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { isNavActive, type NavItem } from './navigation';

interface NavLinkProps {
    item: NavItem;
    mobile?: boolean;
}

export const NavLink = ({ item, mobile = false }: NavLinkProps) => {
    const pathname = usePathname();
    const active = isNavActive(item, pathname);

    if (mobile) {
        return (
            <Link
                href={item.href}
                className={cn(
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 border border-transparent transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    active
                        ? 'border border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-foreground/5 hover:text-foreground/90'
                )}
            >
                {item.label}
            </Link>
        );
    }

    return (
        <Link
            href={item.href}
            className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1 border border-transparent transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                active
                    ? 'border border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-foreground/5 hover:text-foreground'
            )}
        >
            <span>{item.label}</span>
        </Link>
    );
};
