'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export interface FarmerContactInfo {
  name: string;
  phone: string;
  email: string;
  location: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: FarmerContactInfo) => void;
  initialData?: FarmerContactInfo;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<FarmerContactInfo>(
    initialData || {
      name: '',
      phone: '',
      email: '',
      location: '',
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (formData.name && formData.phone && formData.email && formData.location) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  const isFormValid =
    formData.name.trim() &&
    formData.phone.trim() &&
    formData.email.trim() &&
    formData.location.trim();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-background w-full rounded-t-2xl p-4 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {initialData ? 'Update Profile' : 'Set Up Your Profile'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full"
            />
          </div>

          {/* Location Input */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">
              Location / Farm Area
            </label>
            <Input
              type="text"
              placeholder="e.g., Central Region, District"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full"
            />
          </div>

          {/* Phone Input */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="e.g., +234 123 456 7890"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full"
            />
          </div>

          {/* Info Text */}
          <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
            Your profile information will be saved locally and used when you post products on the marketplace.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="flex-1"
            >
              {initialData ? 'Update' : 'Save'} Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
