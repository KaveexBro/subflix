import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Shield,
} from 'lucide-react';
import {
  getAllUsers,
  setUserAsAdmin,
  getSubtitles,
  updateSubtitle,
  deleteSubtitle,
  getCreatorEarnings,
} from '@/lib/firestore';
import { User, Subtitle, CreatorEarnings } from '@/lib/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function Admin() {
  const { userProfile } = useAuth();
  const [, navigate] = useLocation();

  const [users, setUsers] = useState<User[]>([]);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [earnings, setEarnings] = useState<CreatorEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (!userProfile?.isAdmin) {
      navigate('/');
      return;
    }
    loadAdminData();
  }, [userProfile]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersData, subtitlesData] = await Promise.all([
        getAllUsers(),
        getSubtitles(),
      ]);

      setUsers(usersData);
      setSubtitles(subtitlesData.subtitles);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAdmin = async (uid: string, isAdmin: boolean) => {
    try {
      await setUserAsAdmin(uid, isAdmin);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, isAdmin } : u))
      );
      toast.success(
        isAdmin ? 'User promoted to admin' : 'Admin privileges removed'
      );
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleVerifySubtitle = async (subtitleId: string) => {
    try {
      await updateSubtitle(subtitleId, { isVerified: true });
      setSubtitles((prev) =>
        prev.map((s) => (s.id === subtitleId ? { ...s, isVerified: true } : s))
      );
      toast.success('Subtitle verified');
    } catch (error) {
      toast.error('Failed to verify subtitle');
    }
  };

  const handleDeleteSubtitle = async (subtitleId: string) => {
    if (!window.confirm('Are you sure you want to delete this subtitle?')) {
      return;
    }

    try {
      await deleteSubtitle(subtitleId);
      setSubtitles((prev) => prev.filter((s) => s.id !== subtitleId));
      toast.success('Subtitle deleted');
    } catch (error) {
      toast.error('Failed to delete subtitle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const stats = {
    totalUsers: users.length,
    totalSubtitles: subtitles.length,
    verifiedSubtitles: subtitles.filter((s) => s.isVerified).length,
    totalDownloads: subtitles.reduce((sum, s) => sum + s.downloads, 0),
    adminUsers: users.filter((u) => u.isAdmin).length,
    proUsers: users.filter((u) => u.isPro).length,
  };

  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubtitles = subtitles.filter(
    (s) =>
      s.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.uploaderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, subtitles, and platform settings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </Card>

          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Subtitles</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalSubtitles}
                </p>
              </div>
              <FileText className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </Card>

          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Downloads</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalDownloads}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </Card>

          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Verified</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.verifiedSubtitles}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </Card>

          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Admin Users</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.adminUsers}
                </p>
              </div>
              <Shield className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </Card>

          <Card className="bg-card border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pro Users</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.proUsers}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-card border-border flex-1"
              />
            </div>

            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <Card className="bg-card border border-border p-8 text-center">
                  <p className="text-muted-foreground">No users found</p>
                </Card>
              ) : (
                filteredUsers.map((user) => (
                  <Card
                    key={user.uid}
                    className="bg-card border border-border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {user.photoURL && (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {user.displayName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {user.isAdmin && (
                              <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded border border-amber-500/30">
                                Admin
                              </span>
                            )}
                            {user.isPro && (
                              <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded border border-amber-500/30">
                                Pro
                              </span>
                            )}
                            <span className="text-xs px-2 py-1 bg-surface text-muted-foreground rounded">
                              {user.totalRatings} ratings
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          handleSetAdmin(user.uid, !user.isAdmin)
                        }
                        variant={user.isAdmin ? 'default' : 'outline'}
                        className={
                          user.isAdmin
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'border-border'
                        }
                      >
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Subtitles Tab */}
          <TabsContent value="subtitles" className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Search subtitles by title or uploader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-card border-border flex-1"
              />
            </div>

            <div className="space-y-4">
              {filteredSubtitles.length === 0 ? (
                <Card className="bg-card border border-border p-8 text-center">
                  <p className="text-muted-foreground">No subtitles found</p>
                </Card>
              ) : (
                filteredSubtitles.map((subtitle) => (
                  <Card
                    key={subtitle.id}
                    className="bg-card border border-border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-foreground">
                            {subtitle.movieTitle}
                          </h4>
                          {subtitle.isVerified && (
                            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded border border-green-500/30">
                              ✓ Verified
                            </span>
                          )}
                          {subtitle.isEligibleForEarnings && (
                            <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded border border-amber-500/30">
                              Earning
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Uploaded by {subtitle.uploaderName} on{' '}
                          {formatDate(subtitle.createdAt)}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{subtitle.downloads} downloads</span>
                          <span>{subtitle.totalRatings} ratings</span>
                          <span>⭐ {subtitle.ratings.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!subtitle.isVerified && (
                          <Button
                            onClick={() => handleVerifySubtitle(subtitle.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            Verify
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteSubtitle(subtitle.id)}
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Admin Contact Info */}
        <Card className="bg-amber-500/10 border border-amber-500/30 p-6 mt-8">
          <h3 className="font-bold text-amber-500 mb-2">Admin Contact</h3>
          <p className="text-amber-500/80">
            For subscription approvals and user management, contact:{' '}
            <span className="font-semibold">@KaveeshGimhan</span> on Telegram
          </p>
        </Card>
      </div>
    </div>
  );
}
