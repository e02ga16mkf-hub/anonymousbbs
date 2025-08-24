import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  showHomeIcon?: boolean;
  separator?: React.ReactNode;
  className?: string;
}

/**
 * パンくずリストコンポーネント
 */
export default function Breadcrumb({
  items,
  homeHref = '/',
  showHomeIcon = true,
  separator = <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />,
  className = '',
}: BreadcrumbProps) {
  // ホームアイテムを追加
  const allItems: BreadcrumbItem[] = showHomeIcon
    ? [{ label: 'ホーム', href: homeHref, icon: <Home className="w-4 h-4" /> }, ...items]
    : items;

  return (
    <nav className={`flex items-center text-sm text-gray-500 ${className}`}>
      <ol className="flex items-center flex-wrap">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && separator}
              
              {item.href && !isLast ? (
                <Link 
                  href={item.href}
                  className="flex items-center hover:text-blue-600 transition-colors"
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className={`flex items-center ${isLast ? 'font-medium text-gray-700' : ''}`}>
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
