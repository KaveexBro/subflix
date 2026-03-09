import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Subtitle } from '@/lib/types';

interface CarouselProps {
  title: string;
  subtitles: Subtitle[];
  onSubtitleClick: (id: string) => void;
}

export function Carousel({ title, subtitles, onSubtitleClick }: CarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (subtitles.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 px-4 md:px-0">
        {title}
      </h2>

      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 md:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-2 md:gap-4 px-4 md:px-12 overflow-x-auto"
          style={{ scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {subtitles.map((subtitle) => (
            <div
              key={subtitle.id}
              onClick={() => onSubtitleClick(subtitle.id)}
              className="flex-shrink-0 w-40 md:w-48 lg:w-56 cursor-pointer group/card"
            >
              {/* Poster Card */}
              <div className="relative bg-gradient-to-b from-card to-card/50 rounded-lg overflow-hidden netflix-card-hover h-64 md:h-80">
                {/* Poster Image */}
                {subtitle.posterUrl ? (
                  <img
                    src={subtitle.posterUrl}
                    alt={subtitle.movieTitle}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-card/80 flex items-center justify-center">
                    <div className="text-center px-4">
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        ▶
                      </div>
                      <p className="text-sm font-semibold text-foreground line-clamp-2">
                        {subtitle.movieTitle}
                      </p>
                    </div>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <button className="bg-primary hover:bg-primary/80 text-white rounded-full p-2 transition-all duration-200">
                        ▶
                      </button>
                      <button className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all duration-200">
                        +
                      </button>
                    </div>
                    <div className="bg-black/60 px-2 py-1 rounded text-xs font-bold text-primary">
                      {subtitle.ratings.toFixed(1)}⭐
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-foreground mb-2 line-clamp-2">
                      {subtitle.movieTitle}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {subtitle.description}
                    </p>
                    <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{subtitle.releaseYear}</span>
                      <span>•</span>
                      <span>{subtitle.downloads} downloads</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title Below Card */}
              <p className="text-sm font-semibold text-foreground mt-2 line-clamp-1">
                {subtitle.movieTitle}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {subtitle.uploaderName}
              </p>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 md:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
