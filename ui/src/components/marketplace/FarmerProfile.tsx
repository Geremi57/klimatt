import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export interface FarmerContactInfo {
  name: string;
  phone: string;
  email: string;
  location: string;
}

interface FarmerProfileProps {
  farmerInfo: FarmerContactInfo | null;
  onSave: (info: FarmerContactInfo) => void;
}

export default function FarmerProfile({
  farmerInfo,
  onSave,
}: FarmerProfileProps) {
  const [isEditing, setIsEditing] = useState(!farmerInfo);
  const [formData, setFormData] = useState<FarmerContactInfo>(
    farmerInfo || {
      name: '',
      phone: '',
      email: '',
      location: '',
    },
  );

  const handleSave = () => {
    if (
      formData.name &&
      formData.phone &&
      formData.email &&
      formData.location
    ) {
      onSave(formData);
      setIsEditing(false);
    }
  };

  if (!isEditing && farmerInfo) {
    return (
      <Card className="bg-secondary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">👨‍🌾 Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-medium">{farmerInfo.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{farmerInfo.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium text-sm break-all">{farmerInfo.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-medium">{farmerInfo.location}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="w-full mt-2"
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-accent/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Edit Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Full Name
          </label>
          <Input
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Phone Number
          </label>
          <Input
            type="tel"
            placeholder="Your phone number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="Your email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Location / Region
          </label>
          <Input
            type="text"
            placeholder="Your location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={
            !formData.name ||
            !formData.phone ||
            !formData.email ||
            !formData.location
          }
          className="w-full"
        >
          Save Profile
        </Button>
      </CardContent>
    </Card>
  );
}
