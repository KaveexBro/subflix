import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export default function ApplyToUpload() {
  const { userProfile, user } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    uploaderName: userProfile?.uploaderName || userProfile?.displayName || '',
    whatsapp: userProfile?.whatsapp || '',
    telegram: userProfile?.telegram || '',
    bio: userProfile?.bio || '',
    socialLinks: userProfile?.socialLinks || '',
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  if (userProfile?.isUploader) {
    return (
      <div className="container max-w-2xl py-12 px-4">
        <Card className="bg-surface border-border text-center">
          <CardContent className="pt-10 flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">You are an Uploader!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for being part of our creator community. You can start sharing your subtitles now.
            </p>
            <Button onClick={() => navigate('/upload')}>
              Go to Upload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userProfile?.isPendingUploader) {
    return (
      <div className="container max-w-2xl py-12 px-4">
        <Card className="bg-surface border-border text-center">
          <CardContent className="pt-10 flex flex-col items-center">
            <Clock className="w-16 h-16 text-amber-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Application Pending</h1>
            <p className="text-muted-foreground mb-6">
              Your application to become an uploader is currently under review.
              We will contact you via WhatsApp or Telegram soon!
            </p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.uploaderName || !formData.whatsapp || !formData.telegram) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...formData,
        isPendingUploader: true,
        appliedAt: serverTimestamp(),
      });
      toast.success('Application submitted successfully!');
      // Refreshing profile will happen via AuthContext listener
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-12 px-4">
      <div className="mb-8 text-center">
        <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Become a Subtitle Creator</h1>
        <p className="text-muted-foreground">
          Join our community of subtitle creators. Fill out the form below and we'll get in touch!
        </p>
      </div>

      <Card className="bg-surface border-border">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Provide your details so we can verify your profile and contact you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="uploaderName">Creator Name *</Label>
              <Input
                id="uploaderName"
                placeholder="The name that will appear on your subtitles"
                value={formData.uploaderName}
                onChange={(e) => setFormData({ ...formData, uploaderName: e.target.value })}
                required
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Note: Your original Google account name will not be visible to others.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                <Input
                  id="whatsapp"
                  placeholder="e.g., +94712345678"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram Username *</Label>
                <Input
                  id="telegram"
                  placeholder="e.g., @username"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself or your experience with subtitles..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="bg-background min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialLinks">Social Media Links (Optional)</Label>
              <Input
                id="socialLinks"
                placeholder="Facebook, YouTube, or Blog links"
                value={formData.socialLinks}
                onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                className="bg-background"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By submitting, you agree that we may contact you via WhatsApp or Telegram.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
