import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Trash2, 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  X,
  Users
} from 'lucide-react';

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

interface BloodRequestManagerProps {
  requests: BloodRequest[];
  onUpdateRequest: (request: BloodRequest) => void;
  onRemoveRequest: (requestId: number) => void;
}

export function BloodRequestManager({ requests, onUpdateRequest, onRemoveRequest }: BloodRequestManagerProps) {
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removeCount, setRemoveCount] = useState('');
  const [requestToRemove, setRequestToRemove] = useState<number | null>(null);

  const handleRemoveRequest = (request: BloodRequest) => {
    if (request.responses.length === 0) {
      // No responses, remove directly
      onRemoveRequest(request.id);
    } else if (request.responses.length === 1) {
      // Single response, remove directly with confirmation
      onRemoveRequest(request.id);
    } else {
      // Multiple responses, ask how many to remove
      setRequestToRemove(request.id);
      setShowRemoveDialog(true);
    }
  };

  const handleRemoveResponses = () => {
    if (requestToRemove && removeCount) {
      const request = requests.find(r => r.id === requestToRemove);
      if (request) {
        const numToRemove = parseInt(removeCount);
        if (numToRemove >= request.responses.length) {
          // Remove entire request if removing all responses
          onRemoveRequest(requestToRemove);
        } else {
          // Remove specified number of responses
          const updatedRequest = {
            ...request,
            responses: request.responses.slice(numToRemove)
          };
          onUpdateRequest(updatedRequest);
        }
      }
    }
    setShowRemoveDialog(false);
    setRemoveCount('');
    setRequestToRemove(null);
  };

  const handleAcceptDonor = (request: BloodRequest, responseId: number) => {
    const updatedRequest = {
      ...request,
      responses: request.responses.map(response =>
        response.id === responseId
          ? { ...response, status: 'accepted' as const }
          : response
      )
    };
    onUpdateRequest(updatedRequest);
  };

  const handleDeclineDonor = (request: BloodRequest, responseId: number) => {
    const updatedRequest = {
      ...request,
      responses: request.responses.filter(response => response.id !== responseId)
    };
    onUpdateRequest(updatedRequest);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Blood Request Management</h3>
          <p className="text-sm text-gray-600">
            Manage your active blood requests and donor responses
          </p>
        </div>
        <Badge variant="outline">
          {requests.filter(r => r.status === 'active').length} Active Requests
        </Badge>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant={getUrgencyColor(request.urgency)}>
                    {request.bloodType}
                  </Badge>
                  <div>
                    <CardTitle className="text-lg">
                      {request.units} units of {request.bloodType} blood
                    </CardTitle>
                    <CardDescription>
                      {request.patientInfo}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {request.urgency}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveRequest(request)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Posted {getTimeAgo(request.timestamp)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{request.responses.length} responses</span>
                </div>
              </div>
            </CardHeader>

            {request.responses.length > 0 && (
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Donor Responses</h4>
                  <div className="space-y-3">
                    {request.responses.map((response) => (
                      <div
                        key={response.id}
                        className={`p-4 rounded-lg border ${
                          response.status === 'accepted' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                              <User className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{response.donorName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {response.donorBloodType}
                                </Badge>
                                {response.status === 'accepted' && (
                                  <Badge variant="default" className="text-xs bg-green-600">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Accepted
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{response.donorPhone}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{response.distance} miles away</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{response.availability}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {response.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAcceptDonor(request, response.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeclineDonor(request, response.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-2">
                          Responded {getTimeAgo(response.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}

            {request.responses.length === 0 && (
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No donor responses yet. Notifications have been sent to all compatible donors in your area.
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
          </Card>
        ))}

        {requests.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Blood Requests</h3>
              <p className="text-gray-600 mb-4">
                You haven't posted any blood requests yet. Create your first request to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Remove Responses Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Responses</DialogTitle>
            <DialogDescription>
              This blood request has multiple donor responses. How many would you like to remove?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="removeCount">Number of responses to remove</Label>
              <Input
                id="removeCount"
                type="number"
                min="1"
                max={requestToRemove ? requests.find(r => r.id === requestToRemove)?.responses.length : 1}
                value={removeCount}
                onChange={(e) => setRemoveCount(e.target.value)}
                placeholder="Enter number"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRemoveDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemoveResponses}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={!removeCount}
              >
                Remove Responses
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}