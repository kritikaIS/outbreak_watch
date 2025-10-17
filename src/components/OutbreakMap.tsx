import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye } from "lucide-react";
import heroImage from "@/assets/medical-dashboard-hero.jpg";
import { fetchOutbreaks, Outbreak } from "@/lib/api";

const OutbreakMap = () => {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    const load = () => {
      fetchOutbreaks({ limit: 5 })
        .then((data) => {
          if (!mounted) return;
          setOutbreaks(data);
          setError("");
        })
        .catch(() => {
          if (!mounted) return;
          setError("Failed to load outbreaks");
        })
        .finally(() => mounted && setLoading(false));
    };

    load();
    timer = window.setInterval(load, 20000);

    return () => {
      mounted = false;
      if (timer) window.clearInterval(timer);
    };
  }, []);

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
          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {error && <div className="text-sm text-destructive">{error}</div>}
          {!loading && !error && outbreaks.map((outbreak) => {
            const totalCases = outbreak.symptoms?.reduce((sum, s) => sum + (s.cases_count || 0), 0);
            const severity = outbreak.symptoms?.some(s => s.is_threshold_exceeded) ? 'high' : 'low';
            return (
              <div key={outbreak.outbreak_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`status-indicator ${
                    severity === 'high' ? 'status-danger' : 'status-safe'
                  }`}></div>
                  <div>
                    <p className="font-medium text-sm">{outbreak.region || 'Unknown region'}</p>
                    <p className="text-xs text-muted-foreground">{outbreak.description || 'Outbreak'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{totalCases ?? 0} cases</p>
                  <Badge variant={severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                    {outbreak.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default OutbreakMap;
