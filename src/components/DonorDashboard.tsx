import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Phone, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Activity,
  Award,
  Users,
  Bell,
  Siren,
  Star,
  Quote
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
  bloodType: string;
}

interface DonorDashboardProps {
  user: User;
  userProfile: UserProfile;
}

interface BloodRequest {
  id: number;
  hospitalName: string;
  bloodType: string;
  units: number;
  urgency: 'emergency' | 'urgent' | 'routine';
  distance: number;
  patientInfo: string;
  contactPerson: string;
  contactPhone: string;
  timestamp: Date;
  responded: boolean;
}

export function DonorDashboard({ user, userProfile }: DonorDashboardProps) {
  const [activeTab, setActiveTab] = useState('requests');
  const [nearbyRequests, setNearbyRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNearbyRequests();
  }, []);

  const fetchNearbyRequests = async () => {
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
        // Get user's responses from local storage to persist across refreshes
        const userResponses = JSON.parse(localStorage.getItem(`userResponses_${user.id}`) || '[]');
        
        const formattedRequests = requests.map(req => ({
          ...req,
          timestamp: new Date(req.timestamp),
          responded: userResponses.includes(req.id.toString())
        }));
        setNearbyRequests(formattedRequests);
      }
    } catch (error) {
      console.error('Error fetching nearby requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const [donorStats] = useState({
    totalDonations: 12,
    livesSaved: 36,
    nextEligibleDate: new Date('2024-03-15'),
    badgesEarned: ['Life Saver', 'Regular Donor', 'Emergency Hero']
  });

  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    // Load user points from localStorage
    const points = parseInt(localStorage.getItem(`userPoints_${user.id}`) || '0');
    setUserPoints(points);
  }, [user.id]);

  const handleRespond = async (requestId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-90bcf304/blood-requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          availability: 'Available now',
          // distance would be calculated based on geolocation in real app
        }),
      });

      if (response.ok) {
        // Update local state
        setNearbyRequests(prev =>
          prev.map(request =>
            request.id === requestId
              ? { ...request, responded: true }
              : request
          )
        );

        // Persist user's response in local storage
        const userResponses = JSON.parse(localStorage.getItem(`userResponses_${user.id}`) || '[]');
        if (!userResponses.includes(requestId.toString())) {
          userResponses.push(requestId.toString());
          localStorage.setItem(`userResponses_${user.id}`, JSON.stringify(userResponses));
          
          // Award points for donation
          const currentPoints = parseInt(localStorage.getItem(`userPoints_${user.id}`) || '0');
          const newPoints = currentPoints + 100; // 100 points per donation
          localStorage.setItem(`userPoints_${user.id}`, newPoints.toString());
          setUserPoints(newPoints);
        }
      }
    } catch (error) {
      console.error('Error responding to blood request:', error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'destructive';
      case 'urgent': return 'default';
      case 'routine': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  };

  const emergencyRequests = nearbyRequests.filter(req => req.urgency === 'emergency' && !req.responded);
  const availableRequests = nearbyRequests.filter(req => !req.responded);

  // Mock testimonials data
  const testimonials = [
    {
      id: 1,
      patientName: "Sarah M.",
      hospitalName: "City General Hospital", 
      donorName: "John D.",
      rating: 5,
      review: "The donor was incredibly quick to respond during my emergency. The hospital staff was professional and caring. I'm forever grateful for this life-saving service.",
      date: "2024-01-15"
    },
    {
      id: 2,
      patientName: "Michael R.",
      hospitalName: "Metro Medical Center",
      donorName: "Emily S.", 
      rating: 5,
      review: "Amazing experience! The donor arrived within 30 minutes and the hospital team was very organized. This platform truly saves lives.",
      date: "2024-01-20"
    },
    {
      id: 3,
      patientName: "Lisa K.",
      hospitalName: "Central Hospital",
      donorName: "David L.",
      rating: 4,
      review: "Professional service and compassionate care. The whole process was seamless during a very stressful time for our family.",
      date: "2024-01-25"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Emergency Alert Icon - Top Priority */}
      {emergencyRequests.length > 0 && (
        <div className="fixed top-20 right-6 z-50 animate-pulse">
          <div className="bg-red-600 text-white p-3 rounded-full shadow-lg border-4 border-red-200">
            <Siren className="w-8 h-8" />
          </div>
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {emergencyRequests.length}
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {userProfile.name}</h2>
            <p className="text-gray-600 mt-1">Thank you for being a life-saving donor</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">{donorStats.totalDonations}</div>
            <div className="text-sm text-gray-500">Total Donations</div>
          </div>
        </div>
      </div>

      {/* Emergency Alerts */}
      {emergencyRequests.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>EMERGENCY:</strong> {emergencyRequests.length} critical blood request{emergencyRequests.length > 1 ? 's' : ''} need your immediate attention!
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Requests</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              {emergencyRequests.length} emergency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lives Saved</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donorStats.livesSaved}</div>
            <p className="text-xs text-muted-foreground">
              Through your donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Donation</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.ceil((donorStats.nextEligibleDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d
            </div>
            <p className="text-xs text-muted-foreground">
              Until eligible again
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPoints}</div>
            <p className="text-xs text-muted-foreground">
              Available to redeem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Blood Requests</TabsTrigger>
          <TabsTrigger value="points">Redeem Points</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="history">Donation History</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Nearby Blood Requests</h3>
              <p className="text-sm text-gray-600">
                Blood requests matching your type within 10 miles
              </p>
            </div>
            <Badge variant="outline">
              {userProfile.bloodType} Blood Type
            </Badge>
          </div>

          <div className="space-y-4">
            {nearbyRequests.map((request) => (
              <Card key={request.id} className={`w-full ${request.urgency === 'emergency' ? 'border-red-200 bg-red-50' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant={getUrgencyColor(request.urgency)}>
                        {request.urgency.toUpperCase()}
                      </Badge>
                      <div>
                        <CardTitle className="text-lg">
                          {request.units} units of {request.bloodType} needed
                        </CardTitle>
                        <CardDescription>
                          {request.hospitalName} • {request.patientInfo}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        {request.distance} mi
                      </div>
                      <div className="text-xs text-gray-500">away</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Posted {getTimeAgo(request.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{request.contactPhone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{request.contactPerson}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {request.responded ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Responded
                        </Badge>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`tel:${request.contactPhone}`, '_self')}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRespond(request.id)}
                            className={`${
                              request.urgency === 'emergency'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            I Can Donate
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {nearbyRequests.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Available</h3>
                  <p className="text-gray-600">
                    There are currently no blood requests matching your type in your area.
                    Thank you for your willingness to help!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="points" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Redeem Reward Points</h3>
              <p className="text-sm text-gray-600">
                Use your reward points for free health checkups and hospital privileges
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600">{userPoints}</div>
              <div className="text-sm text-gray-500">Points Available</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span>Basic Health Checkup</span>
                </CardTitle>
                <CardDescription>
                  Complete blood test, blood pressure, and basic health screening
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-600">500 Points Required</p>
                    <p className="text-sm text-gray-600">Available at City General Hospital</p>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  disabled={userPoints < 500}
                  onClick={() => {
                    if (userPoints >= 500) {
                      const newPoints = userPoints - 500;
                      localStorage.setItem(`userPoints_${user.id}`, newPoints.toString());
                      setUserPoints(newPoints);
                      alert('Health checkup redeemed successfully! Contact City General Hospital to schedule.');
                    }
                  }}
                >
                  {userPoints >= 500 ? 'Redeem Now' : `Need ${500 - userPoints} more points`}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Comprehensive Health Screening</span>
                </CardTitle>
                <CardDescription>
                  ECG, X-Ray, full blood panel, and consultation with specialist
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-600">1000 Points Required</p>
                    <p className="text-sm text-gray-600">Available at Metro Medical Center</p>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  disabled={userPoints < 1000}
                  onClick={() => {
                    if (userPoints >= 1000) {
                      const newPoints = userPoints - 1000;
                      localStorage.setItem(`userPoints_${user.id}`, newPoints.toString());
                      setUserPoints(newPoints);
                      alert('Comprehensive screening redeemed successfully! Contact Metro Medical Center to schedule.');
                    }
                  }}
                >
                  {userPoints >= 1000 ? 'Redeem Now' : `Need ${1000 - userPoints} more points`}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>VIP Hospital Privileges</span>
                </CardTitle>
                <CardDescription>
                  Priority scheduling, private consultation rooms, and express services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-600">750 Points Required</p>
                    <p className="text-sm text-gray-600">Valid for 6 months at partner hospitals</p>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  disabled={userPoints < 750}
                  onClick={() => {
                    if (userPoints >= 750) {
                      const newPoints = userPoints - 750;
                      localStorage.setItem(`userPoints_${user.id}`, newPoints.toString());
                      setUserPoints(newPoints);
                      alert('VIP privileges activated successfully! Valid for 6 months at all partner hospitals.');
                    }
                  }}
                >
                  {userPoints >= 750 ? 'Redeem Now' : `Need ${750 - userPoints} more points`}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>Annual Health Package</span>
                </CardTitle>
                <CardDescription>
                  Complete annual health package with specialist consultations and tests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-600">2000 Points Required</p>
                    <p className="text-sm text-gray-600">Premium package worth $2000+</p>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  disabled={userPoints < 2000}
                  onClick={() => {
                    if (userPoints >= 2000) {
                      const newPoints = userPoints - 2000;
                      localStorage.setItem(`userPoints_${user.id}`, newPoints.toString());
                      setUserPoints(newPoints);
                      alert('Annual health package redeemed successfully! You will be contacted within 48 hours to schedule.');
                    }
                  }}
                >
                  {userPoints >= 2000 ? 'Redeem Now' : `Need ${2000 - userPoints} more points`}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How to Earn Points</CardTitle>
              <CardDescription>
                Ways to earn reward points through blood donations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span>Regular Blood Donation</span>
                  </div>
                  <Badge variant="outline">+100 points</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span>Emergency Blood Donation</span>
                  </div>
                  <Badge variant="destructive">+150 points</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Refer New Donor</span>
                  </div>
                  <Badge variant="outline">+50 points</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Patient Testimonials</h3>
              <p className="text-sm text-gray-600">
                Real stories from patients who received blood through our platform
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {testimonials.length} Reviews
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{testimonial.patientName}</CardTitle>
                        <CardDescription className="text-xs">
                          {testimonial.hospitalName}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="relative">
                    <Quote className="absolute -top-1 -left-1 w-4 h-4 text-gray-300" />
                    <p className="text-sm text-gray-700 leading-relaxed pl-4">
                      {testimonial.review}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Donor: <span className="font-medium text-gray-700">{testimonial.donorName}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(testimonial.date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-center text-lg text-red-800">
                💝 Your Impact Matters
              </CardTitle>
              <CardDescription className="text-center text-red-600">
                Every donation creates stories of hope and recovery. Thank you for being a hero!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">1,247</div>
                  <div className="text-sm text-gray-600">Lives Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">4.9</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">98%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>
                Your complete donation history and impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((donation) => (
                  <div key={donation} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                        <Heart className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Donation #{donation}</p>
                        <p className="text-sm text-gray-600">City General Hospital</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">1 unit donated</p>
                      <p className="text-xs text-gray-500">
                        {new Date(2024, 0, 15 - donation * 8).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Donor Profile</CardTitle>
              <CardDescription>
                Your donor information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-gray-900">{userProfile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Blood Type</label>
                  <p className="text-gray-900">{userProfile.bloodType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-gray-900">{userProfile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-gray-900">{userProfile.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-gray-900">{userProfile.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Member Since</label>
                  <p className="text-gray-900">January 2023</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>
                Recognition for your life-saving contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {donorStats.badgesEarned.map((badge, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <Award className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                    <h3 className="font-medium">{badge}</h3>
                    <p className="text-sm text-gray-600">Earned</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}