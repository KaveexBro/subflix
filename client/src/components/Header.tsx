import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Menu,
  X,
  Home,
  Upload,
  User,
  LogOut,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const Header: React.FC = () => {
  const { user, userProfile, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center cursor-pointer"
        >
          <span className="text-2xl md:text-3xl font-black text-[#E50914] tracking-tighter uppercase font-sans">
            SUBFLIX
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => navigate('/')}
            className="text-foreground hover:text-primary transition-colors text-sm font-semibold flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          {userProfile?.isUploader ? (
            <button
              onClick={() => navigate('/upload')}
              className="text-foreground hover:text-primary transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          ) : (
            <button
              onClick={() => navigate('/apply-to-upload')}
              className="text-foreground hover:text-primary transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Become a Creator
            </button>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center">
            {searchOpen ? (
              <Input
                placeholder="Search subtitles..."
                className="bg-card border-border w-48 text-sm"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-foreground hover:text-primary transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {userProfile?.photoURL && (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="hidden sm:inline text-sm font-semibold text-foreground">
                  {userProfile?.displayName?.split(' ')[0]}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className="cursor-pointer flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </DropdownMenuItem>

              {userProfile?.isPro && (
                <DropdownMenuItem className="cursor-default flex items-center gap-2 text-primary">
                  <span className="text-xs font-bold">★ PRO MEMBER</span>
                </DropdownMenuItem>
              )}

              {userProfile?.isAdmin && (
                <>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={() => navigate('/admin')}
                    className="cursor-pointer flex items-center gap-2 text-primary"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer flex items-center gap-2 text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-foreground hover:text-primary transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-md border-t border-border">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-foreground hover:bg-background rounded transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            {userProfile?.isUploader ? (
              <button
                onClick={() => {
                  navigate('/upload');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-foreground hover:bg-background rounded transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate('/apply-to-upload');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-foreground hover:bg-background rounded transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Become a Creator
              </button>
            )}
            <button
              onClick={() => {
                navigate('/profile');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-foreground hover:bg-background rounded transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </button>

            {userProfile?.isAdmin && (
              <button
                onClick={() => {
                  navigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-primary hover:bg-background rounded transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </button>
            )}

            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-destructive hover:bg-background rounded transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
