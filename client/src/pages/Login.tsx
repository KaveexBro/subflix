import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { Subtitles } from 'lucide-react';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Subtitles className="w-10 h-10 text-amber-500" />
            <h1 className="text-3xl font-bold text-foreground">Subflix</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Sinhala Subtitle Community
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Discover, share, and rate Sinhala subtitles
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome to Subflix
            </h2>
            <p className="text-muted-foreground text-sm">
              Sign in to access our collection of Sinhala subtitles and start sharing your own.
            </p>
          </div>

          {/* Login Button */}
          <GoogleLoginButton
            onSuccess={() => {
              navigate('/');
            }}
          />

          {/* Features */}
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div>
                <p className="text-foreground font-medium text-sm">
                  Browse Subtitles
                </p>
                <p className="text-muted-foreground text-xs">
                  Explore thousands of Sinhala subtitles
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div>
                <p className="text-foreground font-medium text-sm">
                  Upload & Share
                </p>
                <p className="text-muted-foreground text-xs">
                  Share your subtitle creations with the community
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div>
                <p className="text-foreground font-medium text-sm">
                  Earn Rewards
                </p>
                <p className="text-muted-foreground text-xs">
                  Get rewarded for quality subtitles
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-amber-500 hover:text-amber-600">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-amber-500 hover:text-amber-600">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
