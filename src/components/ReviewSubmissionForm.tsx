import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Star, Heart, CheckCircle, AlertCircle } from 'lucide-react';

interface ReviewSubmissionFormProps {
  onSubmitReview: (reviewData: ReviewData) => void;
  onClose: () => void;
}

interface ReviewData {
  patientName: string;
  hospitalName: string;
  donorName: string;
  hospitalRating: number;
  donorRating: number;
  hospitalReview: string;
  donorReview: string;
  overallExperience: string;
  recommendToOthers: boolean;
}

export function ReviewSubmissionForm({ onSubmitReview, onClose }: ReviewSubmissionFormProps) {
  const [formData, setFormData] = useState<ReviewData>({
    patientName: '',
    hospitalName: '',
    donorName: '',
    hospitalRating: 0,
    donorRating: 0,
    hospitalReview: '',
    donorReview: '',
    overallExperience: 'excellent',
    recommendToOthers: true
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = 'Hospital name is required';
    }
    if (!formData.donorName.trim()) {
      newErrors.donorName = 'Donor name is required';
    }
    if (formData.hospitalRating === 0) {
      newErrors.hospitalRating = 'Please rate the hospital';
    }
    if (formData.donorRating === 0) {
      newErrors.donorRating = 'Please rate the donor';
    }
    if (!formData.hospitalReview.trim()) {
      newErrors.hospitalReview = 'Hospital review is required';
    }
    if (!formData.donorReview.trim()) {
      newErrors.donorReview = 'Donor review is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Store review in localStorage for hospital to view
      const existingReviews = JSON.parse(localStorage.getItem('hospitalReviews') || '[]');
      const newReview = {
        id: Date.now(),
        ...formData,
        date: new Date().toISOString(),
        status: 'active',
        submittedBy: 'patient'
      };
      existingReviews.push(newReview);
      localStorage.setItem('hospitalReviews', JSON.stringify(existingReviews));

      // Notify parent component
      onSubmitReview(newReview);
      setSubmitted(true);

      // Trigger review count update
      window.dispatchEvent(new Event('reviewsUpdated'));

      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  const RatingStars = ({ 
    rating, 
    onRatingChange, 
    disabled = false 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void;
    disabled?: boolean;
  }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onRatingChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            } ${!disabled ? 'cursor-pointer' : 'cursor-default'}`}
          />
        </button>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Submitted!</h3>
            <p className="text-gray-600 mb-4">
              Thank you for sharing your experience. Your feedback helps us improve our services.
            </p>
            <div className="text-sm text-gray-500">
              This window will close automatically...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-red-600" />
            <span>Share Your Experience</span>
          </CardTitle>
          <CardDescription>
            Help us improve by sharing your experience with the hospital and donor
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Patient Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name (or Initials)
                </label>
                <Input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Enter patient name or initials"
                  className={errors.patientName ? 'border-red-300' : ''}
                />
                {errors.patientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>
                )}
              </div>
            </div>

            {/* Hospital Review */}
            <div className="space-y-4 border-t pt-6">
              <h4 className="font-medium text-gray-900">Hospital Experience</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Name
                </label>
                <Input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
                  placeholder="Enter hospital name"
                  className={errors.hospitalName ? 'border-red-300' : ''}
                />
                {errors.hospitalName && (
                  <p className="mt-1 text-sm text-red-600">{errors.hospitalName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Rating
                </label>
                <RatingStars
                  rating={formData.hospitalRating}
                  onRatingChange={(rating) => setFormData(prev => ({ ...prev, hospitalRating: rating }))}
                />
                {errors.hospitalRating && (
                  <p className="mt-1 text-sm text-red-600">{errors.hospitalRating}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Review
                </label>
                <Textarea
                  value={formData.hospitalReview}
                  onChange={(e) => setFormData(prev => ({ ...prev, hospitalReview: e.target.value }))}
                  placeholder="Share your experience with the hospital staff, facilities, and care received..."
                  rows={3}
                  className={errors.hospitalReview ? 'border-red-300' : ''}
                />
                {errors.hospitalReview && (
                  <p className="mt-1 text-sm text-red-600">{errors.hospitalReview}</p>
                )}
              </div>
            </div>

            {/* Donor Review */}
            <div className="space-y-4 border-t pt-6">
              <h4 className="font-medium text-gray-900">Donor Experience</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donor Name (or Initials)
                </label>
                <Input
                  type="text"
                  value={formData.donorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, donorName: e.target.value }))}
                  placeholder="Enter donor name or initials"
                  className={errors.donorName ? 'border-red-300' : ''}
                />
                {errors.donorName && (
                  <p className="mt-1 text-sm text-red-600">{errors.donorName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donor Rating
                </label>
                <RatingStars
                  rating={formData.donorRating}
                  onRatingChange={(rating) => setFormData(prev => ({ ...prev, donorRating: rating }))}
                />
                {errors.donorRating && (
                  <p className="mt-1 text-sm text-red-600">{errors.donorRating}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donor Review
                </label>
                <Textarea
                  value={formData.donorReview}
                  onChange={(e) => setFormData(prev => ({ ...prev, donorReview: e.target.value }))}
                  placeholder="Share your experience with the donor - response time, communication, compassion..."
                  rows={3}
                  className={errors.donorReview ? 'border-red-300' : ''}
                />
                {errors.donorReview && (
                  <p className="mt-1 text-sm text-red-600">{errors.donorReview}</p>
                )}
              </div>
            </div>

            {/* Overall Experience */}
            <div className="space-y-4 border-t pt-6">
              <h4 className="font-medium text-gray-900">Overall Experience</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How would you describe your overall experience?
                </label>
                <Select 
                  value={formData.overallExperience} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, overallExperience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent - Exceeded expectations</SelectItem>
                    <SelectItem value="good">Good - Met expectations</SelectItem>
                    <SelectItem value="average">Average - Satisfactory</SelectItem>
                    <SelectItem value="poor">Poor - Needs improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recommend"
                  checked={formData.recommendToOthers}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendToOthers: e.target.checked }))}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="recommend" className="text-sm text-gray-700">
                  I would recommend BloodConnect to others in need
                </label>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your review will be shared with the hospital to help improve their services. 
                Personal information will be kept confidential.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700"
              >
                Submit Review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}