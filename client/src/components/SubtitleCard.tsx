import React from 'react';
import { Subtitle } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'wouter';

interface SubtitleCardProps {
  subtitle: Subtitle;
  onClick?: (id: string) => void;
  latestInfo?: string;
}

export const SubtitleCardSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0">
      <Skeleton className="w-full aspect-[2/3] rounded-md" />
      <Skeleton className="h-4 w-3/4 mt-2" />
      <Skeleton className="h-3 w-1/2 mt-1" />
    </div>
  );
};

const SubtitleCard: React.FC<SubtitleCardProps> = ({ subtitle, onClick, latestInfo }) => {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (onClick) {
      onClick(subtitle.id);
    } else {
      navigate(`/subtitle/${subtitle.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex-shrink-0 cursor-pointer group/card"
    >
      {/* Poster Card */}
      <div className="relative bg-[#181818] rounded-md overflow-hidden transition-all duration-300 group-hover/card:scale-110 group-hover/card:z-20 shadow-lg aspect-[2/3]">
        {/* Poster Image */}
        {subtitle.posterUrl ? (
          <img
            src={subtitle.posterUrl}
            alt={subtitle.movieTitle}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#e5091422] via-[#181818] to-[#181818] flex items-center justify-center">
            <div className="text-center px-4">
              <div className="text-3xl font-bold text-[#E50914] mb-2">
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
            <button className="bg-[#E50914] hover:bg-[#E50914]/80 text-white rounded-full p-2 transition-all duration-200">
              ▶
            </button>
            <div className="bg-black/60 px-2 py-1 rounded text-xs font-bold text-[#E50914]">
              {subtitle.ratings.toFixed(1)}⭐
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-foreground mb-1 line-clamp-2">
              {subtitle.movieTitle}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-[#46d369]">
                {Math.round(subtitle.ratings * 20)}% Match
              </span>
              <span className="text-[10px] text-white border border-white/40 px-1 rounded-sm">
                {subtitle.type === 'tv' ? 'TV' : 'Movie'}
              </span>
              {subtitle.type === 'tv' && (latestInfo || (subtitle.season && subtitle.episode)) && (
                <span className="text-[10px] text-white/80 font-bold uppercase">
                  {latestInfo ? latestInfo : `S${subtitle.season} E${subtitle.episode}`}
                </span>
              )}
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
  );
};

export default SubtitleCard;
