import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { uploadSubtitle } from '@/lib/firestore';
import { toast } from 'sonner';
import Header from '@/components/Header';

export default function UploadPage() {
  const { user, userProfile } = useAuth();
  const [, navigate] = useLocation();

  const [formData, setFormData] = useState({
    movieTitle: '',
    releaseYear: new Date().getFullYear(),
    description: '',
    subtitleTitle: '',
    fileUrl: '',
  });

  const [uploading, setUploading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'releaseYear' ? parseInt(value) : value,
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
        description: formData.description,
        fileUrl: formData.fileUrl,
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
        userProfile.displayName,
        userProfile.photoURL,
        subtitleData
      );

      toast.success('Subtitle link added successfully!');
      setFormData({
        movieTitle: '',
        releaseYear: new Date().getFullYear(),
        description: '',
        subtitleTitle: '',
        fileUrl: '',
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
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your subtitle (quality, special features, etc.)"
                rows={4}
                className="bg-card border-border resize-none"
              />
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
