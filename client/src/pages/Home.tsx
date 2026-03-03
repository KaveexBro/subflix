import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Upload, Star, Download, TrendingUp } from 'lucide-react';
import { getSubtitles, searchSubtitles } from '@/lib/firestore';
import { Subtitle } from '@/lib/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import { toast } from 'sonner';
import { debounce } from '@/lib/utils';

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-background to-surface py-12 md:py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Discover Sinhala Subtitles
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Browse thousands of high-quality Sinhala subtitles for movies and TV shows. Upload your own and earn rewards.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by movie title..."
                  value={searchTerm}
                  onChange={onSearchChange}
                  className="pl-10 h-12 bg-card border-border"
                />
              </div>
              <Button
                onClick={() => navigate('/upload')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 h-12 flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-amber-500 text-2xl font-bold">
                {subtitles.length}
              </div>
              <p className="text-sm text-muted-foreground">Subtitles Available</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-amber-500 text-2xl font-bold">
                {subtitles.filter((s) => s.isVerified).length}
              </div>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-amber-500 text-2xl font-bold">
                {subtitles.reduce((sum, s) => sum + s.downloads, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Downloads</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-amber-500 text-2xl font-bold">
                {subtitles.filter((s) => s.isEligibleForEarnings).length}
              </div>
              <p className="text-sm text-muted-foreground">Earning Creators</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subtitles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-lg p-4 animate-pulse"
                >
                  <div className="h-6 bg-surface rounded mb-4" />
                  <div className="h-4 bg-surface rounded mb-2" />
                  <div className="h-4 bg-surface rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredSubtitles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? 'No subtitles found' : 'No subtitles available yet'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => navigate('/upload')}
                  className="mt-4 bg-amber-500 hover:bg-amber-600"
                >
                  Be the first to upload
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubtitles.map((subtitle) => (
                <button
                  key={subtitle.id}
                  onClick={() => navigate(`/subtitle/${subtitle.id}`)}
                  className="subtitle-card text-left group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground group-hover:text-amber-500 transition-colors line-clamp-2">
                        {subtitle.movieTitle}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {subtitle.releaseYear}
                      </p>
                    </div>
                    {subtitle.isVerified && (
                      <div className="ml-2 px-2 py-1 bg-amber-500/10 rounded text-xs font-semibold text-amber-500">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {subtitle.description}
                  </p>

                  {/* Uploader Info */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                    {subtitle.uploaderPhotoURL && (
                      <img
                        src={subtitle.uploaderPhotoURL}
                        alt={subtitle.uploaderName}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {subtitle.uploaderName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(subtitle.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold text-foreground">
                        {subtitle.ratings.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">
                        {subtitle.downloads}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">
                        {subtitle.totalRatings}
                      </span>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(subtitle.fileSize)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
