import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { User, Subtitle } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Globe, Facebook, Youtube, Instagram, Twitter } from 'lucide-react';
import Header from '@/components/Header';
import SubtitleCard from '@/components/SubtitleCard';

export default function CreatorProfile() {
  const { userProfile: currentUserProfile } = useAuth();
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<User | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [loading, setLoading] = useState(true);

  // Get UID from URL
  const uid = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (uid) {
      loadCreatorData();
    }
  }, [uid]);

  const loadCreatorData = async () => {
    try {
      setLoading(true);
      // Fetch user profile
      const userRef = doc(db, 'users', uid!);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as User;
        setProfile(data);

        // Fetch their subtitles
        const subtitlesRef = collection(db, 'subtitles');
        const q = query(
          subtitlesRef,
          where('uploadedBy', '==', uid),
          orderBy('createdAt', 'desc')
        );
        const subSnap = await getDocs(q);
        const subs: Subtitle[] = [];
        subSnap.forEach(doc => {
          subs.push({ id: doc.id, ...doc.data() } as Subtitle);
        });
        setSubtitles(subs);
      } else {
        navigate('/404');
      }
    } catch (error) {
      console.error('Error loading creator profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Cover/Header area */}
      <div className="h-64 bg-gradient-to-r from-red-900 to-black relative">
        <div className="container mx-auto px-4 h-full relative">
          <Button
            variant="ghost"
            className="absolute top-24 left-4 text-white hover:bg-white/10"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-surface border-border p-6 text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={profile.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.uid}
                  alt={profile.uploaderName || profile.displayName}
                  className="w-32 h-32 rounded-full border-4 border-background shadow-xl"
                />
                {profile.isUploader && (
                  <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-background">
                    <Globe className="w-4 h-4" />
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-foreground">
                {profile.uploaderName || profile.displayName}
              </h1>

              {profile.isUploader && (
                <p className="text-primary text-sm font-bold uppercase tracking-wider mb-4">
                  Official Creator
                </p>
              )}

              {profile.bio && (
                <p className="text-muted-foreground text-sm italic mb-6">
                  "{profile.bio}"
                </p>
              )}

              {/* Social Links */}
              {profile.socialLinks && (
                <div className="flex justify-center gap-4 py-4 border-t border-border">
                  {/* Basic parsing of links for now */}
                  <a href={profile.socialLinks} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">{subtitles.length}</p>
                  <p className="text-xs text-muted-foreground uppercase">Subtitles</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{profile.totalRatings}</p>
                  <p className="text-xs text-muted-foreground uppercase">Ratings</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Subtitles */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                Created Subtitles
              </h2>
            </div>

            {subtitles.length === 0 ? (
              <Card className="bg-surface border-border p-12 text-center">
                <p className="text-muted-foreground">This creator hasn't uploaded any subtitles yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {subtitles.map(sub => (
                  <SubtitleCard key={sub.id} subtitle={sub} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
