import React from 'react';
import { Play, Info } from 'lucide-react';
import { Subtitle } from '@/lib/types';

interface HeroSectionProps {
  subtitle?: Subtitle;
  onPlayClick?: () => void;
  onInfoClick?: () => void;
}

export function HeroSection({ subtitle, onPlayClick, onInfoClick }: HeroSectionProps) {
  // Use a featured subtitle or create a default hero
  const featured = subtitle || {
    id: 'hero-default',
    movieTitle: 'Welcome to Subflix',
    description: 'Discover, share, and rate Sinhala subtitles from our community',
    ratings: 4.8,
    downloads: 0,
    uploaderName: 'Subflix',
    releaseYear: 2024,
    posterUrl: '',
  };

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden">
      {/* Background Image/Gradient */}
      <div className="absolute inset-0">
        {featured.posterUrl ? (
          <>
            <img
              src={featured.posterUrl}
              alt={featured.movieTitle}
              className="w-full h-full object-cover object-top"
            />
            {/* Netflix-style gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 via-card to-background">
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-12 lg:p-16">
        {/* Hero Content */}
        <div className="max-w-2xl">
          {/* Logo/Badge */}
          <div className="mb-4 flex items-center gap-2">
            <div className="text-4xl md:text-5xl font-black text-primary">▶</div>
            <span className="text-xs md:text-sm font-bold text-primary uppercase tracking-widest">
              Featured
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground mb-4 leading-tight">
            {featured.movieTitle}
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl line-clamp-3">
            {featured.description}
          </p>

          {/* Stats */}
          <div className="flex gap-6 mb-8 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">★</span>
              <span className="text-foreground font-semibold">
                {featured.ratings.toFixed(1)}
              </span>
              <span className="text-muted-foreground">Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">↓</span>
              <span className="text-foreground font-semibold">
                {featured.downloads.toLocaleString()}
              </span>
              <span className="text-muted-foreground">Downloads</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onPlayClick}
              className="bg-white hover:bg-white/80 text-black font-bold py-2 px-6 rounded transition-all duration-200 flex items-center gap-2 text-base md:text-lg"
            >
              <Play className="w-5 h-5 md:w-6 md:h-6 fill-black" />
              Download
            </button>
            <button
              onClick={onInfoClick}
              className="bg-[#6d6d6eb3] hover:bg-[#6d6d6e66] text-white font-bold py-2 px-6 rounded transition-all duration-200 flex items-center gap-2 text-base md:text-lg backdrop-blur-sm"
            >
              <Info className="w-5 h-5 md:w-6 md:h-6" />
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
