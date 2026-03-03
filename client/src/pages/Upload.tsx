import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { uploadSubtitle } from '@/lib/firestore';
import { validateSRTFile, extractSRTText, formatFileSize } from '@/lib/utils';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'sonner';

export default function UploadPage() {
  const { user, userProfile } = useAuth();
  const [, navigate] = useLocation();

  const [formData, setFormData] = useState({
    movieTitle: '',
    releaseYear: new Date().getFullYear(),
    description: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    if (!selectedFile.name.endsWith('.srt')) {
      setFileError('Only .srt files are supported');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File size must be less than 10MB');
      return;
    }

    // Validate SRT format
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!validateSRTFile(content)) {
        setFileError('Invalid SRT file format. Please check the file.');
        return;
      }
      setFile(selectedFile);
    };
    reader.readAsText(selectedFile);
  };

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

    if (!file) {
      toast.error('Please select a file');
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
      // Read file content
      const fileContent = await file.text();

      // Upload file to Firebase Storage
      const storageRef = ref(
        storage,
        `subtitles/${user.uid}/${Date.now()}_${file.name}`
      );
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // Extract text for search indexing (for future use)
      const textContent = extractSRTText(fileContent);
      // textContent can be used for full-text search indexing

      // Create subtitle record in Firestore
      const subtitleData: any = {
        title: file.name,
        language: 'sinhala',
        description: formData.description,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        duration: 0,
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

      toast.success('Subtitle uploaded successfully!');
      setFormData({
        movieTitle: '',
        releaseYear: new Date().getFullYear(),
        description: '',
      });
      setFile(null);

      // Redirect to subtitle detail page
      setTimeout(() => {
        navigate(`/subtitle/${subtitleId}`);
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload subtitle');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
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
              <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Quality Requirements</p>
                <p className="text-sm text-muted-foreground">
                  Ensure your subtitles are accurate, properly timed, and free of errors.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Earn Rewards</p>
                <p className="text-sm text-muted-foreground">
                  Once you reach 100 ratings, you become eligible to earn from your subtitles.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
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

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              SRT File *
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-amber-500/50 transition-colors">
              <input
                type="file"
                accept=".srt"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-foreground font-semibold mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">
                  Only .srt files (max 10MB)
                </p>
              </label>
            </div>

            {/* File Info */}
            {file && (
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-amber-500">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-sm text-amber-500/70">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* File Error */}
            {fileError && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-semibold">{fileError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={uploading || !file}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-6 rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload Subtitle
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
              <span className="text-amber-500 font-bold">•</span>
              <span>Ensure subtitles are properly synchronized with the video</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold">•</span>
              <span>Use correct Sinhala spelling and grammar</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold">•</span>
              <span>Include proper punctuation and formatting</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold">•</span>
              <span>Avoid copyrighted content in descriptions</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold">•</span>
              <span>One subtitle per upload (combine multiple if needed)</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
