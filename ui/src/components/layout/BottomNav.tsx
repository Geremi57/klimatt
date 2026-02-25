// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Home, Bug, TrendingUp, Calendar, BookOpen } from 'lucide-react';

// const navItems = [
//   { href: '/', icon: Home, label: 'Home', ariaLabel: 'Home' },
//   { href: '/pests', icon: Bug, label: 'Pests', ariaLabel: 'Pest Detection' },
//   { href: '/markets', icon: TrendingUp, label: 'Markets', ariaLabel: 'Market Prices' },
//   { href: '/calendar', icon: Calendar, label: 'Calendar', ariaLabel: 'Crop Calendar' },
//   { href: '/diary', icon: BookOpen, label: 'Diary', ariaLabel: 'Farm Diary' },
// ];

// export default function BottomNav() {
//   const pathname = usePathname();

//   return (
//     <nav
//       className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center h-20 safe-area-inset-bottom"
//       aria-label="Main navigation"
//     >
//       {navItems.map((item) => {
//         const Icon = item.icon;
//         const isActive = pathname === item.href;
//         return (
//           <Link
//             key={item.href}
//             href={item.href}
//             aria-label={item.ariaLabel}
//             aria-current={isActive ? 'page' : undefined}
//             className={`flex flex-col items-center justify-center gap-1 px-4 py-3 transition-colors ${
//               isActive
//                 ? 'text-primary'
//                 : 'text-muted-foreground hover:text-foreground'
//             }`}
//           >
//             <Icon className="w-6 h-6" strokeWidth={1.5} />
//             <span className="text-xs font-medium">{item.label}</span>
//           </Link>
//         );
//       })}
//     </nav>
//   );
// }

import { BookOpen, Bug, Calendar, Home, Store, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: Home, label: 'Home', ariaLabel: 'Home' },
  { to: '/pests', icon: Bug, label: 'Pests', ariaLabel: 'Pest Detection' },
  {
    to: '/markets',
    icon: TrendingUp,
    label: 'Markets',
    ariaLabel: 'Market Prices',
  },
  {
    to: '/marketplace',
    icon: Store,
    label: 'Marketplace',
    ariaLabel: 'Farmer Marketplace',
  },
  {
    to: '/calendar',
    icon: Calendar,
    label: 'Calendar',
    ariaLabel: 'Crop Calendar',
  },
  { to: '/diary', icon: BookOpen, label: 'Diary', ariaLabel: 'Farm Diary' },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center h-20 safe-area-inset-bottom"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.ariaLabel}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-3 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
            end={item.to === '/'} // ensures exact match for home
          >
            {() => (
              <>
                <Icon className="w-6 h-6" strokeWidth={1.5} />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
