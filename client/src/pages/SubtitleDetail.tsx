import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Download,
  Star,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Share2,
} from 'lucide-react';
import {
  getSubtitle,
  getSubtitleRatings,
  getUserRating,
  rateSubtitle,
  incrementSubtitleDownloads,
} from '@/lib/firestore';
import { Subtitle, SubtitleRating } from '@/lib/types';
import { formatDate, formatFileSize, isProSubscriptionActive } from '@/lib/utils';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

interface SubtitleDetailProps {
  params: {
    id: string;
  };
}

export default function SubtitleDetail() {
  const { user, userProfile } = useAuth();
  const [, navigate] = useLocation();
  const [subtitle, setSubtitle] = useState<Subtitle | null>(null);
  const [ratings, setRatings] = useState<SubtitleRating[]>([]);
  const [userRating, setUserRating] = useState<SubtitleRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [canDownload, setCanDownload] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingForm, setRatingForm] = useState({ rating: 5, review: '' });

  // Get subtitle ID from URL
  const subtitleId = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (subtitleId) {
      loadSubtitleData();
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [subtitleId, timerId]);

  const loadSubtitleData = async () => {
    try {
      setLoading(true);
      const subtitleData = await getSubtitle(subtitleId!);
      if (!subtitleData) {
        navigate('/404');
        return;
      }
      setSubtitle(subtitleData);

      // Load ratings
      const ratingsData = await getSubtitleRatings(subtitleId!);
      setRatings(ratingsData);

      // Load user's rating if exists
      if (user) {
        const userRatingData = await getUserRating(subtitleId!, user.uid);
        setUserRating(userRatingData || null);
      }
    } catch (error) {
      console.error('Error loading subtitle:', error);
      toast.error('Failed to load subtitle');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!subtitle) return;

    // Check if user is pro for fast download
    const isPro = isProSubscriptionActive(userProfile?.proExpiresAt || null);

    if (!isPro && !canDownload) {
      toast.info('Upgrade to Pro for instant downloads');
      setCountdown(10);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimerId(null);
            setCanDownload(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerId(timer);
      return;
    }

    try {
      setDownloading(true);

      // Open the external download link in a new tab
      window.open(subtitle.fileUrl, '_blank');

      // Increment download count
      await incrementSubtitleDownloads(subtitleId!);
      setSubtitle((prev) =>
        prev ? { ...prev, downloads: prev.downloads + 1 } : null
      );

      toast.success('Opening download link...');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to open download link');
    } finally {
      setDownloading(false);
    }
  };

  const handleRateSubtitle = async () => {
    if (!user || !subtitle) {
      toast.error('Please log in to rate');
      return;
    }

    try {
      setSubmittingRating(true);
      const ratingId = await rateSubtitle(
        subtitleId!,
        user.uid,
        ratingForm.rating,
        ratingForm.review
      );

      // Reload ratings
      await loadSubtitleData();
      setRatingForm({ rating: 5, review: '' });
      toast.success('Thank you for rating!');
    } catch (error) {
      console.error('Rating error:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!subtitle) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="bg-card border border-border p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-foreground font-semibold">Subtitle not found</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Cinematic Header */}
      <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full">
        {subtitle.posterUrl ? (
          <>
            <img
              src={subtitle.posterUrl}
              alt={subtitle.movieTitle}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#181818] to-[#141414]" />
        )}

        <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-12 lg:px-16 pb-12">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="absolute top-24 left-4 md:left-12 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
              {subtitle.movieTitle}
            </h1>

            <div className="flex items-center gap-4 text-white font-bold mb-6">
              <span className="text-[#46d369]">
                {Math.round(subtitle.ratings * 20)}% Match
              </span>
              <span>{subtitle.releaseYear}</span>
              <span className="border border-white/40 px-1 text-xs rounded-sm">
                {subtitle.ratings > 4.5 ? '18+' : '13+'}
              </span>
              <span className="border border-white/40 px-1 text-xs rounded-sm">
                HD
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleDownload}
                disabled={downloading || countdown > 0}
                className="bg-white hover:bg-white/80 text-black font-bold h-12 px-8 text-lg"
              >
                {downloading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : countdown > 0 ? (
                  `Wait ${countdown}s`
                ) : (
                  <>
                    <Download className="w-6 h-6 mr-2 fill-black" />
                    Download
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="bg-[#6d6d6eb3] hover:bg-[#6d6d6e66] border-none text-white font-bold h-12 px-8 text-lg"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied');
                }}
              >
                <Share2 className="w-6 h-6 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-12 lg:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-card border border-border p-8 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-border pb-4">
                About this Subtitle
              </h2>
              <div
                className="text-lg text-white/80 leading-relaxed prose prose-invert max-w-none prose-p:my-4 prose-headings:text-white prose-headings:font-bold prose-strong:text-white prose-a:text-primary hover:prose-a:underline"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(subtitle.description)
                }}
              />
            </div>

            {/* Uploader Info */}
            <Card className="bg-card border border-border p-6">
              <div className="flex items-center gap-4">
                {subtitle.uploaderPhotoURL && (
                  <img
                    src={subtitle.uploaderPhotoURL}
                    alt={subtitle.uploaderName}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {subtitle.uploaderName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded {formatDate(subtitle.createdAt)}
                  </p>
                </div>
                {subtitle.isEligibleForEarnings && (
                  <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30">
                    <span className="text-amber-500 text-xs font-semibold">
                      Earning Creator
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-card border border-border p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-2xl font-bold text-foreground">
                    {subtitle.ratings.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {subtitle.totalRatings} ratings
                </p>
              </Card>
              <Card className="bg-card border border-border p-4 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {subtitle.downloads}
                </div>
                <p className="text-xs text-muted-foreground">Downloads</p>
              </Card>
              {subtitle.fileSize && (
                <Card className="bg-card border border-border p-4 text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {formatFileSize(subtitle.fileSize)}
                  </div>
                  <p className="text-xs text-muted-foreground">File Size</p>
                </Card>
              )}
            </div>

            {/* Ratings Section */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Reviews ({ratings.length})
              </h2>

              {/* Rating Form */}
              {user && !userRating && (
                <Card className="bg-card border border-border p-6 mb-8">
                  <h3 className="font-semibold text-foreground mb-4">
                    Share Your Rating
                  </h3>

                  {/* Star Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setRatingForm((prev) => ({
                              ...prev,
                              rating: star,
                            }))
                          }
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= ratingForm.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Review (Optional)
                    </label>
                    <Textarea
                      value={ratingForm.review}
                      onChange={(e) =>
                        setRatingForm((prev) => ({
                          ...prev,
                          review: e.target.value,
                        }))
                      }
                      placeholder="Share your thoughts about this subtitle..."
                      rows={3}
                      className="bg-surface border-border resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleRateSubtitle}
                    disabled={submittingRating}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  >
                    {submittingRating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Rating'
                    )}
                  </Button>
                </Card>
              )}

              {/* Ratings List */}
              <div className="space-y-4">
                {ratings.length === 0 ? (
                  <Card className="bg-card border border-border p-6 text-center">
                    <p className="text-muted-foreground">
                      No ratings yet. Be the first to rate!
                    </p>
                  </Card>
                ) : (
                  ratings.map((rating) => (
                    <Card
                      key={rating.id}
                      className="bg-card border border-border p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(rating.createdAt)}
                        </p>
                      </div>
                      {rating.review && (
                        <p className="text-sm text-foreground">
                          {rating.review}
                        </p>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Subtitle Info
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Language</p>
                  <p className="font-medium text-foreground">Sinhala</p>
                </div>
                {subtitle.fileSize && (
                  <div>
                    <p className="text-muted-foreground">File Size</p>
                    <p className="font-medium text-foreground">
                      {formatFileSize(subtitle.fileSize)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium text-foreground">
                    {formatDate(subtitle.createdAt)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Pro Info */}
            {!isProSubscriptionActive(userProfile?.proExpiresAt || null) && (
              <Card className="bg-amber-500/10 border border-amber-500/30 p-6">
                <h3 className="font-semibold text-amber-500 mb-2">
                  Upgrade to Pro
                </h3>
                <p className="text-sm text-amber-500/80 mb-4">
                  Get faster downloads and ad-free experience
                </p>
                <Button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                >
                  Upgrade Now
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
