import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, Subtitles, LogOut, Settings, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header: React.FC = () => {
  const { user, userProfile, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Subtitles className="w-6 h-6 text-amber-500" />
            <span className="text-xl font-bold text-foreground hidden sm:inline">
              Subflix
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="text-foreground hover:text-amber-500 transition-colors font-medium"
            >
              Browse
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="text-foreground hover:text-amber-500 transition-colors font-medium"
            >
              Upload
            </button>
            {userProfile?.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="text-foreground hover:text-amber-500 transition-colors font-medium flex items-center gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Admin
              </button>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Pro Badge */}
            {userProfile?.isPro && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-amber-500">PRO</span>
              </div>
            )}

            {/* Desktop User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-auto px-2 py-1"
                >
                  {userProfile?.photoURL && (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-foreground hidden sm:inline">
                    {userProfile?.displayName?.split(' ')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground">
                    {userProfile?.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userProfile?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                {userProfile?.isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-surface rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-border space-y-2">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-surface rounded-lg transition-colors"
            >
              Browse
            </button>
            <button
              onClick={() => {
                navigate('/upload');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-surface rounded-lg transition-colors"
            >
              Upload
            </button>
            {userProfile?.isAdmin && (
              <button
                onClick={() => {
                  navigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-foreground hover:bg-surface rounded-lg transition-colors flex items-center gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Admin
              </button>
            )}
            <button
              onClick={() => {
                navigate('/profile');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-surface rounded-lg transition-colors"
            >
              Profile
            </button>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-surface rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
