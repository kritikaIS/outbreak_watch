import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, Eye } from "lucide-react";
import heroImage from "@/assets/medical-dashboard-hero.jpg";

const mockOutbreaks = [
  { location: "New York, USA", disease: "Influenza A", cases: 234, status: "monitoring", severity: "low" },
  { location: "London, UK", disease: "Norovirus", cases: 89, status: "outbreak", severity: "medium" },
  { location: "Tokyo, Japan", disease: "RSV", cases: 445, status: "outbreak", severity: "high" },
  { location: "Sydney, Australia", disease: "Measles", cases: 12, status: "contained", severity: "low" }
];

const OutbreakMap = () => {
  return (
    <Card className="medical-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Global Outbreak Map</h3>
        <Badge variant="outline" className="gap-2">
          <Eye className="w-4 h-4" />
          Live Monitoring
        </Badge>
      </div>

      <div className="relative">
        <div className="relative overflow-hidden rounded-lg border border-border">
          <img 
            src={heroImage} 
            alt="Global disease monitoring dashboard" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-primary">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm font-medium">Interactive Map Integration</p>
              <p className="text-xs text-muted-foreground">Connect to mapping service</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-foreground mb-3">Recent Outbreak Reports</h4>
          {mockOutbreaks.map((outbreak, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className={`status-indicator ${
                  outbreak.severity === 'high' ? 'status-danger' : 
                  outbreak.severity === 'medium' ? 'status-warning' : 'status-safe'
                }`}></div>
                <div>
                  <p className="font-medium text-sm">{outbreak.location}</p>
                  <p className="text-xs text-muted-foreground">{outbreak.disease}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{outbreak.cases} cases</p>
                <Badge variant={
                  outbreak.status === 'outbreak' ? 'destructive' : 
                  outbreak.status === 'monitoring' ? 'secondary' : 'outline'
                } className="text-xs">
                  {outbreak.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default OutbreakMap;