import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BloodRequestForm } from './BloodRequestForm';
import { BloodRequestManager } from './BloodRequestManager';
import { ReviewSubmissionForm } from './ReviewSubmissionForm';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { 
  Plus, 
  Activity, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Star,
  Trash2,
  Eye,
  MessageSquare,
  Heart
} from 'lucide-react';

interface User {
  id: string;
  email: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  userType: string;
  phone: string;
  address: string;
}

interface HospitalDashboardProps {
  user: User;
  userProfile: UserProfile;
}

interface BloodRequest {
  id: number;
  bloodType: string;
  units: number;
  urgency: 'emergency' | 'urgent' | 'routine';
  patientInfo: string;
  timestamp: Date;
  status: 'active' | 'fulfilled' | 'cancelled';
  responses: DonorResponse[];
}

interface DonorResponse {
  id: number;
  donorId: number;
  donorName: string;
  donorPhone: string;
  donorBloodType: string;
  distance: number;
  availability: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined';
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
  overallExperience: string;
  recommendToOthers: boolean;
  date: string;
  status: 'active' | 'removed';
}

export function HospitalDashboard({ user, userProfile }: HospitalDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBloodRequests();
    loadReviews();
  }, []);

  const loadReviews = () => {
    const savedReviews = JSON.parse(localStorage.getItem('hospitalReviews') || '[]');
    setReviews(savedReviews.filter((review: Review) => review.status === 'active'));
  };

  const handleRemoveReview = (reviewId: number) => {
    const savedReviews = JSON.parse(localStorage.getItem('hospitalReviews') || '[]');
    const updatedReviews = savedReviews.map((review: Review) => 
      review.id === reviewId ? { ...review, status: 'removed' } : review
    );
    localStorage.setItem('hospitalReviews', JSON.stringify(updatedReviews));
    loadReviews(); // Refresh the displayed reviews
  };

  const handleReviewSubmit = (reviewData: any) => {
    console.log('Review submitted:', reviewData);
    loadReviews(); // Refresh reviews after submission
  };

  const fetchBloodRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-90bcf304/blood-requests`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const requests = await response.json();
        const formattedRequests = requests.map(req => ({
          ...req,
          timestamp: new Date(req.timestamp),
          responses: req.responses.map(resp => ({
            ...resp,
            timestamp: new Date(resp.timestamp)
          }))
        }));
        setBloodRequests(formattedRequests);
      }
    } catch (error) {
      console.error('Error fetching blood requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBloodRequest = async (requestData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-90bcf304/blood-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        await fetchBloodRequests(); // Refresh the list
        setShowRequestForm(false);
      } else {
        console.error('Failed to create blood request');
      }
    } catch (error) {
      console.error('Error creating blood request:', error);
    }
  };

  const updateBloodRequest = async (updatedRequest: BloodRequest) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-90bcf304/blood-requests/${updatedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updatedRequest),
      });

      if (response.ok) {
        setBloodRequests(prev => 
          prev.map(req => req.id === updatedRequest.id ? updatedRequest : req)
        );
      }
    } catch (error) {
      console.error('Error updating blood request:', error);
    }
  };

  const removeBloodRequest = async (requestId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-90bcf304/blood-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        setBloodRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Error removing blood request:', error);
    }
  };

  const activeRequests = bloodRequests.filter(req => req.status === 'active');
  const totalResponses = bloodRequests.reduce((sum, req) => sum + req.responses.length, 0);
  const emergencyRequests = bloodRequests.filter(req => req.urgency === 'emergency' && req.status === 'active');
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.hospitalRating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {userProfile.name}</h2>
            <p className="text-gray-600 mt-1">Hospital Management Dashboard</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowReviewForm(true)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Add Review
            </Button>
            <Button 
              onClick={() => setShowRequestForm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Blood Request
            </Button>
          </div>
        </div>
      </div>

      {/* Emergency Alerts */}
      {emergencyRequests.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You have {emergencyRequests.length} emergency blood request{emergencyRequests.length > 1 ? 's' : ''} that need immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              {emergencyRequests.length} emergency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donor Responses</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              Across all requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 min</div>
            <p className="text-xs text-muted-foreground">
              +15% faster than avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hospital Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating}</div>
            <p className="text-xs text-muted-foreground">
              {reviews.length} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.3%</div>
            <p className="text-xs text-muted-foreground">
              Fulfilled requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Blood Requests</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="inventory">Blood Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Blood Requests</CardTitle>
              <CardDescription>
                Your most recent blood requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bloodRequests.slice(0, 3).map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge 
                        variant={
                          request.urgency === 'emergency' ? 'destructive' : 
                          request.urgency === 'urgent' ? 'default' : 'secondary'
                        }
                      >
                        {request.bloodType}
                      </Badge>
                      <div>
                        <p className="font-medium">{request.units} units needed</p>
                        <p className="text-sm text-gray-600">{request.patientInfo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {request.responses.length} responses
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <BloodRequestManager
            requests={bloodRequests}
            onUpdateRequest={updateBloodRequest}
            onRemoveRequest={removeBloodRequest}
          />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Patient Reviews</h3>
              <p className="text-sm text-gray-600">
                Feedback from patients who received blood through our platform
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{averageRating}</span>
              <span className="text-gray-500">({reviews.length} reviews)</span>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Reviews from patients will appear here to help you improve your services.
                  </p>
                  <Button 
                    onClick={() => setShowReviewForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Sample Review
                  </Button>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{review.patientName}</CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(review.date).toLocaleDateString()} • Donor: {review.donorName}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium">Hospital:</span>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveReview(review.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Hospital Experience</h4>
                      <p className="text-sm text-gray-700">{review.hospitalReview}</p>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Donor Experience</h4>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">Donor Rating:</span>
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
                      <p className="text-sm text-gray-700">{review.donorReview}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <Badge 
                        variant={review.overallExperience === 'excellent' ? 'default' : 
                               review.overallExperience === 'good' ? 'secondary' : 'outline'}
                        className={review.overallExperience === 'excellent' ? 'bg-green-600' : ''}
                      >
                        {review.overallExperience}
                      </Badge>
                      {review.recommendToOthers && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Recommends BloodConnect</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Blood Inventory</CardTitle>
              <CardDescription>
                Available blood units by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bloodType => (
                  <div key={bloodType} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{bloodType}</div>
                    <div className="text-lg font-semibold">{Math.floor(Math.random() * 20) + 5}</div>
                    <div className="text-xs text-gray-500">units available</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Blood request and donation analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Most Requested Blood Types</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>O-</span>
                        <span>35%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>A+</span>
                        <span>28%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>O+</span>
                        <span>22%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Response Times</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Average</span>
                        <span>4.2 min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Emergency</span>
                        <span>2.1 min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Routine</span>
                        <span>8.5 min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Blood Request Form Modal */}
      {showRequestForm && (
        <BloodRequestForm
          onSubmit={addBloodRequest}
          onClose={() => setShowRequestForm(false)}
        />
      )}

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