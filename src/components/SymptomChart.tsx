import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const symptomData = [
  { name: 'Fever', current: 340, previous: 280, severity: 'high' },
  { name: 'Cough', current: 520, previous: 450, severity: 'medium' },
  { name: 'Fatigue', current: 280, previous: 320, severity: 'low' },
  { name: 'Headache', current: 190, previous: 180, severity: 'medium' },
  { name: 'Nausea', current: 150, previous: 200, severity: 'low' },
  { name: 'Sore Throat', current: 410, previous: 380, severity: 'medium' }
];

const trendData = [
  { week: 'W1', reports: 45 },
  { week: 'W2', reports: 78 },
  { week: 'W3', reports: 125 },
  { week: 'W4', reports: 89 },
  { week: 'W5', reports: 156 },
  { week: 'W6', reports: 203 },
  { week: 'W7', reports: 178 }
];

const SymptomChart = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="medical-card">
        <h3 className="text-xl font-semibold mb-6">Symptom Distribution</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={symptomData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="previous" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="medical-card">
        <h3 className="text-xl font-semibold mb-6">7-Day Trend</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="week" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="reports" 
                stroke="hsl(var(--success))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default SymptomChart;