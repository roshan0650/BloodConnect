import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';

interface BloodRequestFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export function BloodRequestForm({ onSubmit, onClose }: BloodRequestFormProps) {
  const [formData, setFormData] = useState({
    bloodType: '',
    units: '',
    urgency: '',
    patientInfo: '',
    notes: '',
    contactPerson: '',
    contactPhone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      units: parseInt(formData.units)
    });
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'emergency', label: 'Emergency', description: 'Life-threatening - immediate need' },
    { value: 'urgent', label: 'Urgent', description: 'Surgery within 24 hours' },
    { value: 'routine', label: 'Routine', description: 'Scheduled procedure' }
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>New Blood Request</span>
          </DialogTitle>
          <DialogDescription>
            Submit a new blood request to notify available donors in your area.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type Required</Label>
              <Select
                value={formData.bloodType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {bloodTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      <Badge variant="outline" className="mr-2">{type}</Badge>
                      Blood Type {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="units">Number of Units</Label>
              <Input
                id="units"
                type="number"
                min="1"
                max="10"
                placeholder="1-10 units"
                value={formData.units}
                onChange={(e) => setFormData(prev => ({ ...prev, units: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Urgency Level</Label>
            <div className="grid gap-3">
              {urgencyLevels.map((level) => (
                <Card
                  key={level.value}
                  className={`cursor-pointer transition-all ${
                    formData.urgency === level.value
                      ? 'ring-2 ring-red-500 bg-red-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, urgency: level.value }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {level.value === 'emergency' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        {level.value === 'urgent' && <Clock className="w-4 h-4 text-orange-600" />}
                        {level.value === 'routine' && <Calendar className="w-4 h-4 text-blue-600" />}
                        <Badge
                          variant={
                            level.value === 'emergency' ? 'destructive' :
                            level.value === 'urgent' ? 'default' : 'secondary'
                          }
                        >
                          {level.label}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-600">{level.description}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientInfo">Patient Information</Label>
            <Input
              id="patientInfo"
              placeholder="Patient ID, procedure type, etc."
              value={formData.patientInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                placeholder="Dr. Smith, Nurse Johnson"
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Special requirements, location details, time constraints..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {formData.urgency === 'emergency' && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-red-800 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Emergency Request Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-red-700 space-y-1">
                <p>• This request will be sent to all compatible donors within a 25-mile radius</p>
                <p>• Notifications will be sent via SMS, email, and push notifications immediately</p>
                <p>• Hospital staff will be alerted to prepare for incoming donors</p>
                <p>• Blood bank reserves will be checked automatically</p>
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={!formData.bloodType || !formData.units || !formData.urgency}
            >
              Submit Blood Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}