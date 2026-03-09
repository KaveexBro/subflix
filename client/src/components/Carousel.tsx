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
              className="flex-shrink-0 w-32 md:w-40 lg:w-48 cursor-pointer group/card"
            >
              {/* Poster Card */}
              <div className="relative bg-[#181818] rounded-md overflow-hidden transition-all duration-300 group-hover/card:scale-110 group-hover/card:z-20 shadow-lg aspect-[2/3]">
                {/* Poster Image */}
                {subtitle.posterUrl ? (
                  <img
                    src={subtitle.posterUrl}
                    alt={subtitle.movieTitle}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e5091422] via-[#181818] to-[#181818] flex items-center justify-center">
                    <div className="text-center px-4">
                      <div className="text-2xl font-bold text-[#E50914] mb-1">▶</div>
                      <p className="text-[10px] md:text-xs font-bold text-white line-clamp-2">
                        {subtitle.movieTitle}
                      </p>
                    </div>
                  </div>
                )}

                {/* Hover Details */}
                <div className="absolute inset-0 bg-[#181818] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col pointer-events-none group-hover/card:pointer-events-auto">
                  {/* Miniature Poster at top of hover */}
                  <div className="aspect-[16/9] w-full relative">
                    {subtitle.posterUrl ? (
                      <img src={subtitle.posterUrl} className="w-full h-full object-cover object-top" alt="" />
                    ) : (
                      <div className="w-full h-full bg-[#333] flex items-center justify-center">▶</div>
                    )}
                    <div className="absolute bottom-2 left-2 text-[10px] font-bold text-white drop-shadow-md">
                      {subtitle.movieTitle}
                    </div>
                  </div>

                  {/* Info below hover image */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-1.5">
                        <button className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-gray-200 transition-colors">
                          <span className="text-black text-xs font-bold">▶</span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center border border-gray-500 rounded-full hover:border-white transition-colors">
                          <span className="text-white text-xs">+</span>
                        </button>
                      </div>
                      <div className="text-[#46d369] text-xs font-bold">
                        {Math.round(subtitle.ratings * 20)}% Match
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-white mb-1">
                      <span className="border border-gray-500 px-1 rounded-sm text-[8px]">
                        {subtitle.ratings > 4.5 ? '18+' : '13+'}
                      </span>
                      <span>{subtitle.releaseYear}</span>
                      <span className="border border-gray-500 px-1 rounded-sm text-[8px]">
                        {subtitle.type === 'tv' ? 'TV' : 'Movie'}
                      </span>
                      {subtitle.type === 'tv' && subtitle.season && (
                        <span className="text-[8px] text-white">
                          S{subtitle.season}:E{subtitle.episode}
                        </span>
                      )}
                      <span className="border border-gray-500 px-1 rounded-sm text-[8px]">HD</span>
                    </div>

                    <div className="text-[10px] text-gray-400 line-clamp-2">
                      {subtitle.description}
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
