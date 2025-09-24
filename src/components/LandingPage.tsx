import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Heart, Users, MapPin, Clock, Shield, Bell, Activity, Hospital } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 bg-red-600 rounded-full">
                <Heart className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Blood<span className="text-red-600">Connect</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Revolutionary blood donation management platform connecting hospitals and donors in real-time. 
              Save lives faster with AI-powered matching and instant notifications.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Card className="w-full sm:w-80 hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <Hospital className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle>Hospital Portal</CardTitle>
                  <CardDescription>
                    Post blood requests and manage donor responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={onLogin}
                  >
                    Hospital Login
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={onSignup}
                  >
                    Register Hospital
                  </Button>
                </CardContent>
              </Card>

              <Card className="w-full sm:w-80 hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <Users className="w-12 h-12 text-red-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle>Donor Portal</CardTitle>
                  <CardDescription>
                    Find nearby blood requests and save lives
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={onLogin}
                  >
                    Donor Login
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={onSignup}
                  >
                    Register as Donor
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Life-Saving Features
            </h2>
            <p className="text-lg text-gray-600">
              Advanced technology meets compassionate care
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Clock className="w-12 h-12 text-green-600" />
                </div>
                <CardTitle>Real-Time Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Instant matching of blood types with available donors in your area
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <MapPin className="w-12 h-12 text-blue-600" />
                </div>
                <CardTitle>Location-Based</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Find the nearest donors to minimize transportation time
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Bell className="w-12 h-12 text-purple-600" />
                </div>
                <CardTitle>Smart Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automated alerts via SMS, email, and push notifications
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Shield className="w-12 h-12 text-red-600" />
                </div>
                <CardTitle>Verified Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Comprehensive donor verification and health screening
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Activity className="w-12 h-12 text-orange-600" />
                </div>
                <CardTitle>Live Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track donation status and blood inventory in real-time
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Users className="w-12 h-12 text-teal-600" />
                </div>
                <CardTitle>Community Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Build a strong community of regular donors and volunteers
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-red-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-red-100">Registered Donors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-red-100">Partner Hospitals</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-red-100">Lives Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5 min</div>
              <div className="text-red-100">Average Response Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Heart className="w-6 h-6 text-red-500" />
            <span className="text-xl font-semibold">BloodConnect</span>
          </div>
          <p className="text-gray-400">
            Connecting hearts, saving lives. Every drop counts.
          </p>
        </div>
      </footer>
    </div>
  );
}