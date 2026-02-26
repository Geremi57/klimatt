import EditProfileModal from '@/components/home/EditProfileModal';
import PreferredCrops from '@/components/home/PreferredCrops';
import ProfileDisplay from '@/components/home/ProfileDisplay';
import MainLayout from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePreferredCrops } from '@/hooks/usePreferredCrops';
import { useState } from 'react';

export interface FarmerContactInfo {
  name: string;
  phone: string;
  email: string;
  location: string;
}

// const defaultDate = new Date(Date.now() - 3600000).toLocaleTimeString();
export function Home() {
  // const [lastSync, setLastSync] = useState(defaultDate);
  // const [isSyncing, setIsSyncing] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { preferredCrops, addCrop, removeCrop, availableCrops } =
    usePreferredCrops();
  const [profile, setProfile, isProfileLoaded] =
    useLocalStorage<FarmerContactInfo | null>('farmerProfile', null);

  // const handleSync = () => {
  //   setIsSyncing(true);
  //   setTimeout(() => {
  //     setLastSync(new Date().toLocaleTimeString());
  //     setIsSyncing(false);
  //   }, 1500);
  // };

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
            Welcome back, Farmer {profile?.name || 'Guest'}
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
          {/* <Card className="border-primary/20">
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
          </Card> */}
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
