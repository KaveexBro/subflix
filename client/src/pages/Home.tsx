import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload } from 'lucide-react';
import { getSubtitles, searchSubtitles } from '@/lib/firestore';
import { Subtitle } from '@/lib/types';
import { debounce } from '@/lib/utils';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { Carousel } from '@/components/Carousel';
import SubtitleCard, { SubtitleCardSkeleton } from '@/components/SubtitleCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { userProfile } = useAuth();
  const [, navigate] = useLocation();
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSubtitles, setFilteredSubtitles] = useState<Subtitle[]>([]);

  // Load subtitles on mount
  useEffect(() => {
    loadSubtitles();
  }, []);

  const loadSubtitles = async () => {
    try {
      setLoading(true);
      const { subtitles: data } = await getSubtitles();
      setSubtitles(data);
      setFilteredSubtitles(data);
    } catch (error) {
      console.error('Error loading subtitles:', error);
      toast.error('Failed to load subtitles');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const handleSearch = debounce(async (term: string) => {
    if (!term.trim()) {
      setFilteredSubtitles(subtitles);
      return;
    }

    try {
      const results = await searchSubtitles(term);
      setFilteredSubtitles(results);
    } catch (error) {
      console.error('Error searching subtitles:', error);
      toast.error('Search failed');
    }
  }, 300);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleSearch(term);
  };

  // Helper to group by show title and include latest info
  const getUniqueShows = (subs: Subtitle[]) => {
    const seen = new Map<string, Subtitle>();

    subs.forEach(s => {
      if (s.type === 'tv') {
        const existing = seen.get(s.movieTitle);
        if (!existing) {
          seen.set(s.movieTitle, s);
        } else {
          // Keep the one with highest season/episode
          if ((s.season || 0) > (existing.season || 0) ||
              ((s.season || 0) === (existing.season || 0) && (s.episode || 0) > (existing.episode || 0))) {
            seen.set(s.movieTitle, s);
          }
        }
      }
    });

    return subs.filter(s => {
      if (s.type === 'tv') {
        if (seen.get(s.movieTitle)?.id === s.id) {
          return true;
        }
        return false;
      }
      return true;
    });
  };

  // Organize subtitles by categories
  const topRated = getUniqueShows([...subtitles].sort((a, b) => b.ratings - a.ratings))
    .slice(0, 20);

  const mostDownloaded = getUniqueShows([...subtitles].sort((a, b) => b.downloads - a.downloads))
    .slice(0, 20);

  const recentlyAdded = [...subtitles]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  const movies = subtitles.filter((s) => s.type === 'movie' || !s.type).slice(0, 20);
  const tvSeries = getUniqueShows(subtitles.filter((s) => s.type === 'tv')).slice(0, 20);

  const verifiedSubtitles = subtitles.filter((s) => s.isVerified).slice(0, 20);

  const handleSubtitleClick = (subtitle: Subtitle) => {
    if (subtitle.type === 'tv') {
      navigate(`/series/${encodeURIComponent(subtitle.movieTitle)}`);
    } else {
      navigate(`/subtitle/${subtitle.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="pt-0">
        {/* Hero Section */}
        {!searchTerm && (
          <div className="pb-12">
            <HeroSection
              subtitle={topRated[0]}
              onPlayClick={() => topRated[0] && handleSubtitleClick(topRated[0])}
              onInfoClick={() => topRated[0] && handleSubtitleClick(topRated[0])}
            />
          </div>
        )}

        {/* Search Section */}
        {searchTerm && (
          <div className="px-4 md:px-8 lg:px-12 py-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Search Results for "{searchTerm}"
              </h2>
              <p className="text-muted-foreground">
                Found {filteredSubtitles.length} subtitle{filteredSubtitles.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Search Bar - Always visible when not searching */}
        {!searchTerm && (
          <div className="px-4 md:px-8 lg:px-12 pb-12">
            <div className="flex gap-2 max-w-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by movie title..."
                  value={searchTerm}
                  onChange={onSearchChange}
                  className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button
                onClick={() => navigate('/upload')}
                className="bg-primary hover:bg-primary/80 text-white font-semibold px-6 h-12 flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            </div>
          </div>
        )}

        {/* Carousels Section */}
        {!searchTerm && !loading && (
          <div className="px-4 md:px-8 lg:px-12 space-y-12 pb-12 relative -mt-32 z-10">
            {topRated.length > 0 && (
              <Carousel
                title="Top Rated"
                subtitles={topRated}
                onSubtitleClick={(id) => {
                  const sub = topRated.find(s => s.id === id);
                  if (sub) handleSubtitleClick(sub);
                }}
                getLatestInfo={(id) => {
                  const sub = topRated.find(s => s.id === id);
                  return sub?.type === 'tv' ? `Latest: S${sub.season} E${sub.episode}` : undefined;
                }}
              />
            )}

            {mostDownloaded.length > 0 && (
              <Carousel
                title="Most Downloaded"
                subtitles={mostDownloaded}
                onSubtitleClick={(id) => {
                  const sub = mostDownloaded.find(s => s.id === id);
                  if (sub) handleSubtitleClick(sub);
                }}
                getLatestInfo={(id) => {
                  const sub = mostDownloaded.find(s => s.id === id);
                  return sub?.type === 'tv' ? `Latest: S${sub.season} E${sub.episode}` : undefined;
                }}
              />
            )}

            {recentlyAdded.length > 0 && (
              <Carousel
                title="Recently Added"
                subtitles={recentlyAdded}
                onSubtitleClick={(id) => {
                  const sub = recentlyAdded.find(s => s.id === id);
                  if (sub) navigate(`/subtitle/${id}`); // Keep direct navigation for episodes
                }}
              />
            )}

            {movies.length > 0 && (
              <Carousel
                title="Movies"
                subtitles={movies}
                onSubtitleClick={(id) => {
                  const sub = movies.find(s => s.id === id);
                  if (sub) handleSubtitleClick(sub);
                }}
              />
            )}

            {tvSeries.length > 0 && (
              <Carousel
                title="TV Series"
                subtitles={tvSeries}
                onSubtitleClick={(id) => {
                  const sub = tvSeries.find(s => s.id === id);
                  if (sub) handleSubtitleClick(sub);
                }}
                getLatestInfo={(id) => {
                  const sub = tvSeries.find(s => s.id === id);
                  return sub?.type === 'tv' ? `Latest: S${sub.season} E${sub.episode}` : undefined;
                }}
              />
            )}

            {verifiedSubtitles.length > 0 && (
              <Carousel
                title="Verified Subtitles"
                subtitles={verifiedSubtitles}
                onSubtitleClick={(id) => {
                  const sub = verifiedSubtitles.find(s => s.id === id);
                  if (sub) handleSubtitleClick(sub);
                }}
              />
            )}
          </div>
        )}

        {/* Search Results Grid */}
        {searchTerm && (
          <div className="px-4 md:px-8 lg:px-12 pb-12">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <SubtitleCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredSubtitles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No subtitles found for "{searchTerm}"
                </p>
                <Button
                  onClick={() => setSearchTerm('')}
                  className="bg-primary hover:bg-primary/80 text-white"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredSubtitles.map((subtitle) => (
                  <SubtitleCard
                    key={subtitle.id}
                    subtitle={subtitle}
                    onClick={() => handleSubtitleClick(subtitle)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {!searchTerm && loading && (
          <div className="px-4 md:px-8 lg:px-12 pb-12 relative -mt-32 z-10">
            <div className="space-y-12">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-48 mb-4 bg-white/10" />
                  <div className="flex gap-4 overflow-hidden">
                    {[...Array(6)].map((_, j) => (
                      <div key={j} className="w-48 lg:w-64 flex-shrink-0">
                        <SubtitleCardSkeleton />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchTerm && !loading && subtitles.length === 0 && (
          <div className="px-4 md:px-8 lg:px-12 py-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">
              No subtitles available yet
            </p>
            <Button
              onClick={() => navigate('/upload')}
              className="bg-primary hover:bg-primary/80 text-white"
            >
              Be the first to upload
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
