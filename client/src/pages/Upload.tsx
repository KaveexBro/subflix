import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Upload, AlertCircle, CheckCircle, Loader2, Film, Tv } from 'lucide-react';
import { uploadSubtitle, getShowMetadata, getEpisodesByShow } from '@/lib/firestore';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { debounce } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function UploadPage() {
  const { user, userProfile } = useAuth();
  const [, navigate] = useLocation();

  if (!userProfile?.isUploader) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 py-12 px-4 container mx-auto max-w-2xl text-center">
          <Card className="bg-surface border-border p-12 flex flex-col items-center">
            <ShieldAlert className="w-16 h-16 text-primary mb-6" />
            <h1 className="text-3xl font-bold mb-4">Upload Restricted</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Only approved subtitle creators can upload subtitles. Please apply to become a creator first.
            </p>
            <Button size="lg" onClick={() => navigate('/apply-to-upload')}>
              Apply to Become a Creator
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState<{
    movieTitle: string;
    type: 'movie' | 'tv';
    season: string | number;
    episode: string | number;
    releaseYear: number;
    description: string;
    subtitleTitle: string;
    fileUrl: string;
    posterUrl: string;
  }>({
    movieTitle: '',
    type: 'movie',
    season: '',
    episode: '',
    releaseYear: new Date().getFullYear(),
    description: '',
    subtitleTitle: '',
    fileUrl: '',
    posterUrl: '',
  });

  const [existingSeasons, setExistingSeasons] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  // Debounced metadata fetch
  const fetchMetadata = React.useCallback(
    debounce(async (title: string) => {
      if (!title.trim()) return;

      setLoadingMetadata(true);
      try {
        const metadata = await getShowMetadata(title);
        if (metadata) {
          setFormData(prev => ({
            ...prev,
            type: metadata.type || 'movie',
            posterUrl: metadata.posterUrl || prev.posterUrl,
            releaseYear: metadata.releaseYear || prev.releaseYear,
            description: metadata.description || prev.description,
          }));
          toast.info(`Auto-filled details for "${title}"`);

          if (metadata.type === 'tv') {
            const episodes = await getEpisodesByShow(title);
            const seasons = Array.from(new Set(episodes.map(ep => ep.season!))).sort((a, b) => a - b);
            setExistingSeasons(seasons);
          }
        } else {
          setExistingSeasons([]);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      } finally {
        setLoadingMetadata(false);
      }
    }, 1000),
    []
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (name === 'releaseYear' || name === 'season' || name === 'episode')
        ? (value === '' ? '' : parseInt(value))
        : value,
    }));

    if (name === 'movieTitle') {
      fetchMetadata(value);
    }
  };

  const handleDescriptionChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subtitleTitle.trim()) {
      toast.error('Please enter a subtitle title');
      return;
    }

    if (!formData.fileUrl.trim()) {
      toast.error('Please enter the download link');
      return;
    }

    if (!formData.movieTitle.trim()) {
      toast.error('Please enter a movie title');
      return;
    }

    if (!user || !userProfile) {
      toast.error('User not authenticated');
      return;
    }

    setUploading(true);
    try {
      // Create subtitle record in Firestore
      const subtitleData: any = {
        title: formData.subtitleTitle,
        language: 'sinhala',
        type: formData.type,
        season: formData.type === 'tv' ? formData.season : null,
        episode: formData.type === 'tv' ? formData.episode : null,
        description: formData.description,
        fileUrl: formData.fileUrl,
        posterUrl: formData.posterUrl,
        fileName: formData.subtitleTitle.endsWith('.srt')
          ? formData.subtitleTitle
          : `${formData.subtitleTitle}.srt`,
        movieTitle: formData.movieTitle,
        releaseYear: formData.releaseYear,
        ratings: 0,
        totalRatings: 0,
        downloads: 0,
        isVerified: false,
        isEligibleForEarnings: false,
      };
      const subtitleId = await uploadSubtitle(
        user.uid,
        userProfile.uploaderName || userProfile.displayName,
        userProfile.photoURL,
        subtitleData
      );

      toast.success('Subtitle link added successfully!');
      setFormData({
        movieTitle: '',
        type: 'movie',
        season: '',
        episode: '',
        releaseYear: new Date().getFullYear(),
        description: '',
        subtitleTitle: '',
        fileUrl: '',
        posterUrl: '',
      });

      // Redirect to subtitle detail page
      setTimeout(() => {
        navigate(`/subtitle/${subtitleId}`);
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to add subtitle');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Upload Subtitle
            </h1>
            <p className="text-muted-foreground">
              Share your Sinhala subtitle with the community. Get ratings and earn rewards.
            </p>
          </div>

          {/* Info Card */}
          <Card className="bg-card border border-border p-6 mb-8">
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Quality Requirements</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure your subtitles are accurate, properly timed, and free of errors.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Earn Rewards</p>
                  <p className="text-sm text-muted-foreground">
                    Once you reach 100 ratings, you become eligible to earn from your subtitles.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Community Driven</p>
                  <p className="text-sm text-muted-foreground">
                    Your ratings and downloads help other creators improve their work.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Movie Title */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Movie/TV Show Title *
              </label>
              <Input
                type="text"
                name="movieTitle"
                value={formData.movieTitle}
                onChange={handleInputChange}
                placeholder="e.g., Inception, Game of Thrones"
                className="bg-card border-border"
                required
              />
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-4">
                Content Type *
              </label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'movie' | 'tv' }))}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2 cursor-pointer group">
                  <RadioGroupItem value="movie" id="movie" className="border-border text-primary" />
                  <Label htmlFor="movie" className="flex items-center gap-2 cursor-pointer text-foreground group-hover:text-primary transition-colors">
                    <Film className="w-4 h-4" />
                    Movie
                  </Label>
                </div>
                <div className="flex items-center space-x-2 cursor-pointer group">
                  <RadioGroupItem value="tv" id="tv" className="border-border text-primary" />
                  <Label htmlFor="tv" className="flex items-center gap-2 cursor-pointer text-foreground group-hover:text-primary transition-colors">
                    <Tv className="w-4 h-4" />
                    TV Series
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Season and Episode - Only for TV Series */}
            {formData.type === 'tv' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Season Number *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      name="season"
                      value={formData.season}
                      onChange={handleInputChange}
                      placeholder="e.g., 1"
                      min="1"
                      className="bg-card border-border flex-1"
                      required={formData.type === 'tv'}
                    />
                    {existingSeasons.length > 0 && (
                      <select
                        className="bg-card border border-border rounded-md px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                        value={formData.season}
                      >
                        <option value="">Seasons</option>
                        {existingSeasons.map(s => (
                          <option key={s} value={s}>S{s}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Episode Number *
                  </label>
                  <Input
                    type="number"
                    name="episode"
                    value={formData.episode}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    min="1"
                    className="bg-card border-border"
                    required={formData.type === 'tv'}
                  />
                </div>
              </div>
            )}

            {/* Poster URL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Poster Image URL (Optional)
              </label>
              <Input
                type="url"
                name="posterUrl"
                value={formData.posterUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/poster.jpg"
                className="bg-card border-border"
              />
            </div>

            {/* Release Year */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Release Year
              </label>
              <Input
                type="number"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear()}
                className="bg-card border-border"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Description *
              </label>
              <div className="rounded-md overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your subtitle (quality, special features, etc.)"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link', 'clean'],
                    ],
                  }}
                />
              </div>
            </div>

            {/* Subtitle Title */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Subtitle Name *
              </label>
              <Input
                type="text"
                name="subtitleTitle"
                value={formData.subtitleTitle}
                onChange={handleInputChange}
                placeholder="e.g., Inception Sinhala Subtitle"
                className="bg-card border-border"
                required
              />
            </div>

            {/* File URL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Download Link (Google Drive, etc.) *
              </label>
              <Input
                type="url"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/..."
                className="bg-card border-border"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={uploading}
              className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-6 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Adding Subtitle...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Add Subtitle Link
                </>
              )}
            </Button>
          </form>

          {/* Guidelines */}
          <Card className="bg-card border border-border p-6 mt-8">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Upload Guidelines
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>Ensure subtitles are properly synchronized with the video</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>Use correct Sinhala spelling and grammar</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>Include proper punctuation and formatting</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>Avoid copyrighted content in descriptions</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>One subtitle per upload (combine multiple if needed)</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
