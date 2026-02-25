import EditProfileModal from '@/components/home/EditProfileModal';
import PreferredCrops from '@/components/home/PreferredCrops';
import ProfileDisplay from '@/components/home/ProfileDisplay';
import MainLayout from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePreferredCrops } from '@/hooks/usePreferredCrops';
import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export interface FarmerContactInfo {
  name: string;
  phone: string;
  email: string;
  location: string;
}

const defaultDate = new Date(Date.now() - 3600000).toLocaleTimeString();
export function Home() {
  const [lastSync, setLastSync] = useState(defaultDate);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { preferredCrops, addCrop, removeCrop, availableCrops } =
    usePreferredCrops();
  const [profile, setProfile, isProfileLoaded] =
    useLocalStorage<FarmerContactInfo | null>('farmerProfile', null);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setLastSync(new Date().toLocaleTimeString());
      setIsSyncing(false);
    }, 1500);
  };

  const handleSaveProfile = (newProfile: FarmerContactInfo) => {
    setProfile(newProfile);
    setIsProfileModalOpen(false);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-linear-to-b from-secondary/30 to-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-8 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">FarmAssist</h1>
            <Badge
              variant="outline"
              className="bg-primary-foreground/20 border-primary-foreground/40"
            >
              v1.0
            </Badge>
          </div>
          <p className="text-primary-foreground/90 text-sm">
            Welcome back, Farmer John
          </p>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-4">
          {/* Profile Section */}
          {isProfileLoaded && (
            <>
              <ProfileDisplay
                profile={profile}
                onEdit={() => setIsProfileModalOpen(true)}
              />
              <PreferredCrops
                crops={preferredCrops}
                availableCrops={availableCrops}
                onAddCrop={addCrop}
                onRemoveCrop={removeCrop}
              />
            </>
          )}

          {/* Sync Status Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sync Status</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                  />
                  {isSyncing ? 'Syncing...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last updated</span>
                <span className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {lastSync}
                </span>
              </div>
              <div className="bg-secondary/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  Your data is up to date. All changes are synced.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Harvest Reminders */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Harvest Reminders</h2>

            {/* Upcoming Harvest - Wheat */}
            <Card className="mb-3 border-accent/20">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="bg-accent/20 p-2 rounded-lg mt-1">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      Wheat - Ready to Harvest
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      12 days remaining
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Harvest - Beans */}
            <Card className="mb-3 border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg mt-1">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      Beans - Almost Ready
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      5 days remaining
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: '90%' }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Harvest - Maize */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="bg-secondary/20 p-2 rounded-lg mt-1">
                    <Calendar className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      Maize - Approaching Maturity
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      25 days remaining
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full"
                    style={{ width: '40%' }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">3</p>
                  <p className="text-xs text-muted-foreground">Active Crops</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">8</p>
                  <p className="text-xs text-muted-foreground">Pest Records</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
          initialData={profile || undefined}
        />
      </div>
    </MainLayout>
  );
}
