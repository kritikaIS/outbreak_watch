import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Building2, User, AlertCircle } from "lucide-react";

interface LoginModalProps {
  children: React.ReactNode;
}

const LoginModal = ({ children }: LoginModalProps) => {
  const [clinicData, setClinicData] = useState({
    email: '',
    password: '',
    clinicName: '',
    licenseNumber: ''
  });

  const [publicData, setPublicData] = useState({
    email: '',
    password: ''
  });

  const handleClinicLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Authentication requires Supabase integration");
  };

  const handlePublicLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Authentication requires Supabase integration");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Secure Access
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">Supabase Integration Required</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Enable authentication by connecting to Supabase in the top-right corner.
          </p>
        </div>

        <Tabs defaultValue="clinic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clinic" className="gap-2">
              <Building2 className="w-4 h-4" />
              Clinic Login
            </TabsTrigger>
            <TabsTrigger value="public" className="gap-2">
              <User className="w-4 h-4" />
              Public Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clinic" className="space-y-4">
            <div className="text-center mb-4">
              <Badge variant="outline" className="gap-2">
                <Shield className="w-3 h-3" />
                Healthcare Professional Access
              </Badge>
            </div>
            
            <form onSubmit={handleClinicLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinicEmail">Professional Email</Label>
                <Input
                  id="clinicEmail"
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={clinicData.email}
                  onChange={(e) => setClinicData({...clinicData, email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicPassword">Password</Label>
                <Input
                  id="clinicPassword"
                  type="password"
                  value={clinicData.password}
                  onChange={(e) => setClinicData({...clinicData, password: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic/Hospital Name</Label>
                <Input
                  id="clinicName"
                  placeholder="General Hospital"
                  value={clinicData.clinicName}
                  onChange={(e) => setClinicData({...clinicData, clinicName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Medical License Number</Label>
                <Input
                  id="licenseNumber"
                  placeholder="License verification"
                  value={clinicData.licenseNumber}
                  onChange={(e) => setClinicData({...clinicData, licenseNumber: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <Building2 className="w-4 h-4" />
                Access Clinical Dashboard
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="public" className="space-y-4">
            <div className="text-center mb-4">
              <Badge variant="secondary" className="gap-2">
                <User className="w-3 h-3" />
                Public Health Reporting
              </Badge>
            </div>

            <form onSubmit={handlePublicLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="publicEmail">Email (Optional)</Label>
                <Input
                  id="publicEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={publicData.email}
                  onChange={(e) => setPublicData({...publicData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicPassword">Password (Optional)</Label>
                <Input
                  id="publicPassword"
                  type="password"
                  placeholder="For tracking your reports"
                  value={publicData.password}
                  onChange={(e) => setPublicData({...publicData, password: e.target.value})}
                />
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded border">
                Public reporting allows anonymous symptom submission to help track disease patterns in your community.
              </div>

              <Button type="submit" variant="secondary" className="w-full gap-2">
                <User className="w-4 h-4" />
                Continue as Public User
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;