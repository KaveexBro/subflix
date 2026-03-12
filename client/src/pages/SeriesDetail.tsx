import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { getEpisodesByShow } from '@/lib/firestore';
import { Subtitle } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Play, Info } from 'lucide-react';
import Header from '@/components/Header';
import { SubtitleCardSkeleton } from '@/components/SubtitleCard';

export default function SeriesDetail() {
  const [, navigate] = useLocation();
  const [episodes, setEpisodes] = useState<Subtitle[]>([]);
  const [loading, setLoading] = useState(true);

  // Get series title from URL
  const pathParts = window.location.pathname.split('/');
  const title = decodeURIComponent(pathParts[pathParts.length - 1]);

  useEffect(() => {
    if (title) {
      loadEpisodes();
    }
  }, [title]);

  const loadEpisodes = async () => {
    try {
      setLoading(true);
      const data = await getEpisodesByShow(title);
      setEpisodes(data);
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const seasons = Array.from(new Set(episodes.map(ep => ep.season!))).sort((a, b) => a - b);
  const [activeSeason, setActiveSeason] = useState<number | null>(null);

  useEffect(() => {
    if (seasons.length > 0 && activeSeason === null) {
      setActiveSeason(seasons[0]);
    }
  }, [seasons]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-64 bg-card rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => (
                <SubtitleCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showMetadata = episodes[0];

  return (
    <div className="min-h-screen bg-[#141414]">
      <Header />

      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        {showMetadata?.posterUrl ? (
          <>
            <img
              src={showMetadata.posterUrl}
              className="w-full h-full object-cover object-top"
              alt={title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-[#181818]" />
        )}

        <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 pb-12">
          <Button
            variant="ghost"
            className="w-fit mb-6 text-white hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-white/80 font-bold">
            <span className="text-[#46d369]">{Math.round((showMetadata?.ratings || 5) * 20)}% Match</span>
            <span>{showMetadata?.releaseYear}</span>
            <span className="border border-white/40 px-1 text-xs rounded-sm uppercase">TV Series</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Season Selector */}
        <div className="flex flex-wrap gap-4 mb-12 border-b border-white/10 pb-6">
          {seasons.map(season => (
            <button
              key={season}
              onClick={() => setActiveSeason(season)}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                activeSeason === season
                  ? 'bg-primary text-white shadow-lg scale-105'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Season {season}
            </button>
          ))}
        </div>

        {/* Episodes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {episodes
            .filter(ep => ep.season === activeSeason)
            .map(episode => (
              <Card
                key={episode.id}
                className="bg-[#181818] border-none overflow-hidden group hover:bg-[#282828] transition-colors cursor-pointer"
                onClick={() => navigate(`/subtitle/${episode.id}`)}
              >
                <div className="flex gap-4 p-4 items-center">
                  <div className="w-24 h-16 bg-[#333] rounded overflow-hidden relative flex-shrink-0">
                    {episode.posterUrl && (
                      <img src={episode.posterUrl} className="w-full h-full object-cover" alt="" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/0 transition-colors">
                      <Play className="w-6 h-6 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-white font-bold truncate">
                        S{String(episode.season).padStart(2, '0')} E{String(episode.episode).padStart(2, '0')}
                      </h3>
                      <span className="text-[#46d369] text-xs font-bold">
                        {episode.ratings.toFixed(1)}⭐
                      </span>
                    </div>
                    <p className="text-white/60 text-xs line-clamp-2">
                      {episode.uploaderName} • {new Date(episode.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {episodes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No episodes available for this show yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
