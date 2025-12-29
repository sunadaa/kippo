import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Clock, Heart } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const links = [
    { path: '/', label: '検索', icon: Search },
    { path: '/history', label: '履歴', icon: Clock },
    { path: '/favorites', label: 'お気に入り', icon: Heart },
  ];

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary">
            吉方位神社仏閣プランナー
          </Link>
          
          <div className="flex gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

