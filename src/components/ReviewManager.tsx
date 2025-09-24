import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ReviewSubmissionForm } from './ReviewSubmissionForm';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Star, 
  Heart, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle,
  TrendingUp,
  Users,
  Calendar,
  Quote
} from 'lucide-react';

interface ReviewManagerProps {
  userProfile: {
    id: string;
    name: string;
    userType: string;
  };
  onClose: () => void;
}

interface Review {
  id: number;
  patientName: string;
  hospitalName: string;
  donorName: string;
  hospitalRating: number;
  donorRating: number;
  hospitalReview: string;
  donorReview: string;
  overallExperience: 'excellent' | 'good' | 'average' | 'poor';
  recommendToOthers: boolean;
  date: string;
  status: 'active' | 'removed';
  submittedBy?: string;
}

export function ReviewManager({ userProfile, onClose }: ReviewManagerProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchTerm, ratingFilter, experienceFilter, activeTab]);

  const loadReviews = () => {
    const savedReviews = JSON.parse(localStorage.getItem('hospitalReviews') || '[]');
    const activeReviews = savedReviews.filter((review: Review) => review.status === 'active');
    setReviews(activeReviews);
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.hospitalReview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.donorReview.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by rating
    if (ratingFilter !== 'all') {
      const minRating = parseInt(ratingFilter);
      filtered = filtered.filter(review => 
        Math.max(review.hospitalRating, review.donorRating) >= minRating
      );
    }

    // Filter by experience
    if (experienceFilter !== 'all') {
      filtered = filtered.filter(review => review.overallExperience === experienceFilter);
    }

    // Filter by tab
    if (activeTab === 'recommended') {
      filtered = filtered.filter(review => review.recommendToOthers);
    } else if (activeTab === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    }

    setFilteredReviews(filtered);
  };

  const handleRemoveReview = (reviewId: number) => {
    if (userProfile.userType !== 'hospital') {
      alert('Only hospitals can remove reviews.');
      return;
    }

    const savedReviews = JSON.parse(localStorage.getItem('hospitalReviews') || '[]');
    const updatedReviews = savedReviews.map((review: Review) => 
      review.id === reviewId ? { ...review, status: 'removed' } : review
    );
    localStorage.setItem('hospitalReviews', JSON.stringify(updatedReviews));
    loadReviews();
    
    // Trigger review count update
    window.dispatchEvent(new Event('reviewsUpdated'));
  };

  const handleReviewSubmit = (reviewData: any) => {
    loadReviews();
    setShowReviewForm(false);
    
    // Trigger review count update
    window.dispatchEvent(new Event('reviewsUpdated'));
  };

  const calculateStats = () => {
    if (reviews.length === 0) {
      return {
        averageHospitalRating: 0,
        averageDonorRating: 0,
        totalReviews: 0,
        recommendationRate: 0,
        excellentCount: 0
      };
    }

    const totalHospitalRating = reviews.reduce((sum, review) => sum + review.hospitalRating, 0);
    const totalDonorRating = reviews.reduce((sum, review) => sum + review.donorRating, 0);
    const recommendCount = reviews.filter(review => review.recommendToOthers).length;
    const excellentCount = reviews.filter(review => review.overallExperience === 'excellent').length;

    return {
      averageHospitalRating: (totalHospitalRating / reviews.length).toFixed(1),
      averageDonorRating: (totalDonorRating / reviews.length).toFixed(1),
      totalReviews: reviews.length,
      recommendationRate: ((recommendCount / reviews.length) * 100).toFixed(0),
      excellentCount
    };
  };

  const stats = calculateStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review Management Center</h2>
              <p className="text-gray-600">Comprehensive review system for BloodConnect platform</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowReviewForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Review
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReviews}</div>
                <p className="text-xs text-gray-600">All platforms</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Hospital Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{stats.averageHospitalRating}</div>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <p className="text-xs text-gray-600">Average rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Donor Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{stats.averageDonorRating}</div>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <p className="text-xs text-gray-600">Average rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recommendationRate}%</div>
                <p className="text-xs text-gray-600">Would recommend</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Excellent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.excellentCount}</div>
                <p className="text-xs text-gray-600">Top rated experiences</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filters & Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search Reviews</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients, hospitals, donors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Rating</label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                      <SelectItem value="1">1+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Experience Level</label>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Experiences</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setRatingFilter('all');
                      setExperienceFilter('all');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredReviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {reviews.length === 0 ? 'No Reviews Yet' : 'No Matching Reviews'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {reviews.length === 0 
                        ? 'Reviews from patients will appear here to help improve services.'
                        : 'Try adjusting your filters to see more reviews.'
                      }
                    </p>
                    {reviews.length === 0 && (
                      <Button 
                        onClick={() => setShowReviewForm(true)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Add First Review
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <Card key={review.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <Heart className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{review.patientName}</CardTitle>
                              <CardDescription>
                                {review.hospitalName} • {new Date(review.date).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge 
                              variant={review.overallExperience === 'excellent' ? 'default' : 
                                     review.overallExperience === 'good' ? 'secondary' : 'outline'}
                              className={review.overallExperience === 'excellent' ? 'bg-green-600' : ''}
                            >
                              {review.overallExperience}
                            </Badge>
                            {review.recommendToOthers && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Recommends
                              </Badge>
                            )}
                            {userProfile.userType === 'hospital' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveReview(review.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Hospital Experience</h4>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.hospitalRating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="relative bg-gray-50 p-3 rounded-lg">
                              <Quote className="absolute top-2 left-2 w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-700 pl-6">{review.hospitalReview}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Donor: {review.donorName}</h4>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.donorRating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="relative bg-gray-50 p-3 rounded-lg">
                              <Quote className="absolute top-2 left-2 w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-700 pl-6">{review.donorReview}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{review.patientName}</p>
                            <p className="text-sm text-gray-600">{review.hospitalName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">
                              {((review.hospitalRating + review.donorRating) / 2).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommended" className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  These patients would recommend BloodConnect to others in need.
                </AlertDescription>
              </Alert>
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{review.patientName}</p>
                          <p className="text-sm text-gray-600">{review.hospitalName} • {review.donorName}</p>
                        </div>
                        <Badge className="bg-green-600">Recommended</Badge>
                      </div>
                      <p className="text-sm text-gray-700 italic">"{review.hospitalReview}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map(rating => {
                        const count = reviews.filter(r => 
                          Math.round((r.hospitalRating + r.donorRating) / 2) === rating
                        ).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 w-16">
                              <span className="text-sm">{rating}</span>
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Experience Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['excellent', 'good', 'average', 'poor'].map(experience => {
                        const count = reviews.filter(r => r.overallExperience === experience).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={experience} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className={`w-3 h-3 rounded-full ${
                                  experience === 'excellent' ? 'bg-green-500' :
                                  experience === 'good' ? 'bg-blue-500' :
                                  experience === 'average' ? 'bg-yellow-500' : 'bg-red-500'
                                }`} 
                              />
                              <span className="text-sm capitalize">{experience}</span>
                            </div>
                            <span className="text-sm font-medium">{count} ({percentage.toFixed(0)}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewSubmissionForm
          onSubmitReview={handleReviewSubmit}
          onClose={() => setShowReviewForm(false)}
        />
      )}
    </div>
  );
}