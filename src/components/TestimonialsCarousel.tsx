import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Star, Heart, Quote } from 'lucide-react';

interface Review {
  id: string;
  recipientName: string;
  hospitalName: string;
  donorRating: number;
  hospitalRating: number;
  donorReview: string;
  hospitalReview: string;
  bloodType: string;
  date: string;
  emergencyLevel: 'emergency' | 'urgent' | 'routine';
}

interface TestimonialsCarouselProps {
  donorId: string;
}

export function TestimonialsCarousel({ donorId }: TestimonialsCarouselProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock reviews data - in real app, this would come from API
  const mockReviews: Review[] = [
    {
      id: '1',
      recipientName: 'Sarah Johnson',
      hospitalName: 'City General Hospital',
      donorRating: 5,
      hospitalRating: 4,
      donorReview: 'The donor was incredibly compassionate and responded immediately to our emergency call. Their quick action saved my husband\'s life during his surgery.',
      hospitalReview: 'Professional staff, clean facilities, and excellent coordination during the emergency procedure.',
      bloodType: 'O+',
      date: '2024-01-15',
      emergencyLevel: 'emergency'
    },
    {
      id: '2',
      recipientName: 'Michael Chen',
      hospitalName: 'Metro Medical Center',
      donorRating: 5,
      hospitalRating: 5,
      donorReview: 'Amazing donor who went above and beyond. They even called to check on my recovery. True heroes exist!',
      hospitalReview: 'Outstanding medical team and state-of-the-art equipment. Felt safe and well-cared for throughout.',
      bloodType: 'A+',
      date: '2024-01-10',
      emergencyLevel: 'urgent'
    },
    {
      id: '3',
      recipientName: 'Emily Rodriguez',
      hospitalName: 'St. Mary\'s Hospital',
      donorRating: 4,
      hospitalRating: 4,
      donorReview: 'Very grateful for the donor\'s quick response. The donation helped me through a difficult surgery.',
      hospitalReview: 'Good hospital with caring staff. The blood transfusion process was smooth and professional.',
      bloodType: 'B+',
      date: '2024-01-08',
      emergencyLevel: 'routine'
    },
    {
      id: '4',
      recipientName: 'James Wilson',
      hospitalName: 'University Hospital',
      donorRating: 5,
      hospitalRating: 5,
      donorReview: 'This donor is an angel! Their blood donation during my emergency surgery saved my life. Forever grateful.',
      hospitalReview: 'Excellent hospital with top-notch emergency response team. Quick and efficient service.',
      bloodType: 'AB+',
      date: '2024-01-05',
      emergencyLevel: 'emergency'
    },
    {
      id: '5',
      recipientName: 'Lisa Thompson',
      hospitalName: 'Children\'s Medical Center',
      donorRating: 5,
      hospitalRating: 4,
      donorReview: 'Thank you for helping save my daughter. Your generous donation made all the difference in her recovery.',
      hospitalReview: 'Wonderful pediatric care team. They made a scary situation manageable for our family.',
      bloodType: 'O-',
      date: '2024-01-03',
      emergencyLevel: 'urgent'
    },
    {
      id: '6',
      recipientName: 'David Kumar',
      hospitalName: 'Regional Medical Center',
      donorRating: 4,
      hospitalRating: 5,
      donorReview: 'Great donor who responded quickly to our need. The donation process was seamless.',
      hospitalReview: 'Professional medical staff and excellent facilities. Highly recommend this hospital.',
      bloodType: 'A-',
      date: '2024-01-01',
      emergencyLevel: 'routine'
    }
  ];

  useEffect(() => {
    setReviews(mockReviews);
  }, [donorId]);

  useEffect(() => {
    if (reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [reviews.length]);

  const getEmergencyColor = (level: string) => {
    switch (level) {
      case 'emergency': return 'destructive';
      case 'urgent': return 'default';
      case 'routine': return 'secondary';
      default: return 'secondary';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (reviews.length === 0) {
    return null;
  }

  const visibleReviews = [
    reviews[currentIndex],
    reviews[(currentIndex + 1) % reviews.length],
    reviews[(currentIndex + 2) % reviews.length]
  ];

  return (
    <div className="w-full bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Heart className="w-6 h-6 text-red-600" />
          <h3 className="text-2xl font-bold text-gray-900">Patient Testimonials</h3>
          <Heart className="w-6 h-6 text-red-600" />
        </div>
        <p className="text-gray-600">Reviews from those whose lives you've touched</p>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ 
            transform: `translateX(-${(currentIndex % reviews.length) * 33.333}%)`,
            width: `${reviews.length * 33.333}%`
          }}
        >
          {reviews.map((review, index) => (
            <div key={review.id} className="w-1/3 px-2 flex-shrink-0">
              <Card className="h-full border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <Quote className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{review.recipientName}</h4>
                        <Badge variant={getEmergencyColor(review.emergencyLevel)} className="text-xs">
                          {review.emergencyLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{review.hospitalName}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="outline" className="text-xs">{review.bloodType}</Badge>
                        <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Donor Review */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-800">About You (Donor)</span>
                        <div className="flex space-x-1">
                          {renderStars(review.donorRating)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 italic">"{review.donorReview}"</p>
                    </div>

                    {/* Hospital Review */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">About Hospital</span>
                        <div className="flex space-x-1">
                          {renderStars(review.hospitalRating)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 italic">"{review.hospitalReview}"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Progress indicators */}
      <div className="flex justify-center space-x-2 mt-6">
        {reviews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-red-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{reviews.length}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {(reviews.reduce((acc, review) => acc + review.donorRating, 0) / reviews.length).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {reviews.filter(r => r.emergencyLevel === 'emergency').length}
          </div>
          <div className="text-sm text-gray-600">Emergency Saves</div>
        </div>
      </div>
    </div>
  );
}