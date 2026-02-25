'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone } from 'lucide-react';

export interface FarmerContactInfo {
  name: string;
  phone: string;
  email: string;
  location: string;
}

interface ProfileDisplayProps {
  profile: FarmerContactInfo | null;
  onEdit: () => void;
}

export default function ProfileDisplay({ profile, onEdit }: ProfileDisplayProps) {
  if (!profile) {
    return (
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">👨‍🌾 Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Set up your profile to sell products on the marketplace and for other farmers to contact you.
          </p>
          <Button onClick={onEdit} className="w-full">
            Set Up Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">👨‍🌾 Your Profile</CardTitle>
          <Button size="sm" variant="outline" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Name */}
        <div>
          <p className="text-xs text-muted-foreground font-medium">Name</p>
          <p className="text-sm font-semibold">{profile.name}</p>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Location</p>
            <p className="text-sm">{profile.location}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-2">
          <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Phone</p>
            <p className="text-sm">{profile.phone}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-2">
          <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Email</p>
            <p className="text-sm break-all">{profile.email}</p>
          </div>
        </div>

        {/* Edit Button */}
        <Button
          onClick={onEdit}
          variant="outline"
          className="w-full mt-2"
          size="sm"
        >
          Update Profile
        </Button>
      </CardContent>
    </Card>
  );
}
