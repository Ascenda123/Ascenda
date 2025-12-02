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
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 transition',
                    active
                        ? 'bg-primary text-primary-foreground shadow-[0_6px_16px_rgba(15,23,42,0.18)]'
                        : 'hover:text-foreground'
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
                'inline-flex items-center gap-2 rounded-full px-3 py-1 transition',
                active
                    ? 'bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(15,23,42,0.25)]'
                    : 'hover:text-foreground'
            )}
        >
            <span>{item.label}</span>
        </Link>
    );
};
