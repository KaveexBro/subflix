import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Crown,
  LogOut,
  Settings,
  Download,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import {
  getSubtitlesByUploader,
  getUserSubscription,
  createSubscription,
} from '@/lib/firestore';
import { Subtitle, Subscription } from '@/lib/types';
import {
  formatDate,
  formatCurrency,
  isProSubscriptionActive,
  isEligibleForEarnings,
} from '@/lib/utils';
import { toast } from 'sonner';

export default function Profile() {
  const { user, userProfile, logout } = useAuth();
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [subtitlesData, subscriptionData] = await Promise.all([
        getSubtitlesByUploader(user.uid),
        getUserSubscription(user.uid),
      ]);

      setSubtitles(subtitlesData);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePro = async () => {
    try {
      setUpgrading(true);
      // In production, this would integrate with Stripe or PayHere
      // For now, we'll create a manual subscription
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      await createSubscription(
        user!.uid,
        'pro',
        100, // LKR 100/month
        expiryDate,
        'manual' // In production, use 'stripe' or 'payhere'
      );

      toast.success('Pro subscription activated! Please contact @KaveeshGimhan to complete payment.');
      await loadProfileData();
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to upgrade subscription');
    } finally {
      setUpgrading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const isPro = isProSubscriptionActive(userProfile?.proExpiresAt || null);
  const totalEarnings = subtitles.reduce((sum, s) => {
    if (s.isEligibleForEarnings) {
      return sum + (s.totalRatings * 0.5 + s.downloads * 0.1);
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                My Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your account and subtitles
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-border"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* User Info Card */}
          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {userProfile?.photoURL && (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {userProfile?.displayName}
                  </p>
                  <p className="text-muted-foreground">
                    {userProfile?.email}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Member since {formatDate(userProfile?.createdAt || null)}
                  </p>
                </div>
              </div>
              {isPro && (
                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-amber-500 font-semibold text-sm">
                        PRO Member
                      </p>
                      <p className="text-xs text-amber-500/70">
                        Expires {formatDate(userProfile?.proExpiresAt || null)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="subscriptions">Subscription</TabsTrigger>
            <TabsTrigger value="subtitles">My Subtitles</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            {isPro ? (
              <Card className="bg-card border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground">
                    Pro Subscription Active
                  </h3>
                  <Crown className="w-6 h-6 text-amber-500" />
                </div>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Subscription Status
                    </p>
                    <p className="font-semibold text-foreground">Active</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Expires On
                    </p>
                    <p className="font-semibold text-foreground">
                      {formatDate(userProfile?.proExpiresAt || null)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Monthly Price
                    </p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(100)}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-amber-500 mb-2">
                    Pro Benefits
                  </h4>
                  <ul className="text-sm text-amber-500/80 space-y-1">
                    <li>✓ Ad-free experience</li>
                    <li>✓ Faster downloads</li>
                    <li>✓ Priority support</li>
                    <li>✓ Advanced analytics</li>
                  </ul>
                </div>

                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  onClick={handleUpgradePro}
                >
                  Renew Subscription
                </Button>
              </Card>
            ) : (
              <Card className="bg-card border border-border p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Upgrade to Pro
                </h3>
                <p className="text-muted-foreground mb-6">
                  Get unlimited access to all premium features and support the
                  community.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Ad-free Experience
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Browse without interruptions
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Faster Downloads
                      </p>
                      <p className="text-sm text-muted-foreground">
                        High-speed subtitle downloads
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Priority Support
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Get help faster
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Advanced Analytics
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Track your subtitle performance
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-lg p-4 mb-6">
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {formatCurrency(100)}
                  </p>
                  <p className="text-muted-foreground">per month</p>
                </div>

                <Button
                  onClick={handleUpgradePro}
                  disabled={upgrading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-6"
                >
                  {upgrading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="w-5 h-5 mr-2" />
                      Upgrade to Pro
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  After upgrade, please contact @KaveeshGimhan to complete payment
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Subtitles Tab */}
          <TabsContent value="subtitles" className="space-y-6">
            {subtitles.length === 0 ? (
              <Card className="bg-card border border-border p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't uploaded any subtitles yet
                </p>
                <Button className="bg-amber-500 hover:bg-amber-600">
                  Upload Your First Subtitle
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {subtitles.map((subtitle) => (
                  <Card
                    key={subtitle.id}
                    className="bg-card border border-border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground mb-1">
                          {subtitle.movieTitle}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {subtitle.description}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">
                              {subtitle.downloads} downloads
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">
                              {subtitle.totalRatings} ratings
                            </span>
                          </div>
                        </div>
                      </div>
                      {subtitle.isEligibleForEarnings && (
                        <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30 text-xs font-semibold text-amber-500">
                          Earning
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <Card className="bg-card border border-border p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Earnings Overview
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-surface border border-border rounded-lg p-4">
                  <p className="text-muted-foreground text-sm mb-1">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold text-amber-500">
                    {formatCurrency(totalEarnings)}
                  </p>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4">
                  <p className="text-muted-foreground text-sm mb-1">
                    Total Ratings
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {userProfile?.totalRatings || 0}
                  </p>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4">
                  <p className="text-muted-foreground text-sm mb-1">
                    Eligible Subtitles
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {subtitles.filter((s) => s.isEligibleForEarnings).length}
                  </p>
                </div>
              </div>

              {userProfile?.totalRatings && userProfile.totalRatings < 100 ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-amber-500 font-semibold mb-2">
                    Path to Earnings
                  </p>
                  <p className="text-sm text-amber-500/80 mb-3">
                    You need 100 ratings to become eligible for earnings.
                  </p>
                  <div className="w-full bg-amber-500/20 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (userProfile.totalRatings / 100) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-amber-500/70 mt-2">
                    {userProfile.totalRatings}/100 ratings
                  </p>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-amber-500 font-semibold">
                    ✓ You are eligible for earnings!
                  </p>
                  <p className="text-sm text-amber-500/80 mt-1">
                    Earn LKR 0.50 per rating and LKR 0.10 per download
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
