import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Hospital, Users, MapPin, Phone, Mail } from 'lucide-react';

interface AuthModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onAuth: (email: string, password: string, type: 'hospital' | 'donor', isSignup?: boolean, userData?: any) => Promise<void>;
}

export function AuthModal({ mode, onClose, onAuth }: AuthModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    bloodType: '',
    hospitalLicense: '',
    emergencyContact: '',
    userType: 'donor' as 'hospital' | 'donor'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = mode === 'signup' ? {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        ...(formData.userType === 'donor' ? {
          bloodType: formData.bloodType,
          emergencyContact: formData.emergencyContact
        } : {
          hospitalLicense: formData.hospitalLicense
        })
      } : {};

      await onAuth(
        formData.email, 
        formData.password, 
        formData.userType, 
        mode === 'signup',
        userData
      );
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {formData.userType === 'hospital' ? (
              <Hospital className="w-5 h-5 text-blue-600" />
            ) : (
              <Users className="w-5 h-5 text-red-600" />
            )}
            <span>
              {mode === 'login' ? 'Sign In' : 'Register'} to BloodConnect
            </span>
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? `Welcome back! Please sign in to your account.`
              : `Join BloodConnect and help save lives.`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="userType">Account Type</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value: 'hospital' | 'donor') => setFormData(prev => ({ ...prev, userType: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">Blood Donor</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  {formData.userType === 'hospital' ? 'Hospital Name' : 'Full Name'}
                </Label>
                <Input
                  id="name"
                  placeholder={formData.userType === 'hospital' ? 'City General Hospital' : 'John Doe'}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address, City, State"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>

              {formData.userType === 'donor' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select
                      value={formData.bloodType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Emergency contact name and phone"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {formData.userType === 'hospital' && (
                <div className="space-y-2">
                  <Label htmlFor="hospitalLicense">Hospital License Number</Label>
                  <Input
                    id="hospitalLicense"
                    placeholder="Hospital license/registration number"
                    value={formData.hospitalLicense}
                    onChange={(e) => setFormData(prev => ({ ...prev, hospitalLicense: e.target.value }))}
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          {mode === 'signup' && formData.userType === 'donor' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-800">Donor Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-blue-700 space-y-1">
                <p>• Must be 18-65 years old and weigh at least 110 lbs</p>
                <p>• Wait 56 days between whole blood donations</p>
                <p>• Must be in good health and feeling well</p>
                <p>• Bring valid ID and emergency contact information</p>
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className={`flex-1 ${formData.userType === 'hospital' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
              disabled={loading}
            >
              {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Register')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}