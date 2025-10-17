const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:5001/api";

export type ApiListResponse<T> = {
  status: string;
  data: {
    [key: string]: any;
  } & T;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}` , {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export type Symptom = {
  symptom_id: string;
  name: string;
  severity: string;
  description?: string;
};

export type OutbreakSymptom = {
  symptom_id: Symptom;
  threshold?: number;
  cases_count?: number;
  is_threshold_exceeded?: boolean;
};

export type Outbreak = {
  outbreak_id: string;
  start_date: string;
  end_date?: string;
  status: string;
  description?: string;
  region?: string;
  symptoms: OutbreakSymptom[];
};

export async function fetchOutbreaks(params?: Record<string, string | number>): Promise<Outbreak[]> {
  const query = params
    ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
    : "";
  const json = await request<ApiListResponse<{ outbreaks: Outbreak[] }>>(`/outbreaks${query}`);
  return json.data.outbreaks || [];
}

export async function fetchSymptoms(params?: Record<string, string | number>): Promise<Symptom[]> {
  const query = params
    ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
    : "";
  const json = await request<ApiListResponse<{ symptoms: Symptom[] }>>(`/symptoms${query}`);
  return json.data.symptoms || [];
}

export async function submitPublicReport(payload: {
  report_id: string;
  symptoms_text: string;
  state: string;
  symptom_type?: string;
  severity?: string;
  patient_age?: string;
  additional_notes?: string;
}): Promise<{ status: string; message: string }>{
  await request(`/reports/public`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { status: 'success', message: 'Submitted' };
}

export async function publicRegister(payload: { email: string; password: string; name?: string }): Promise<{ token: string }>{
  const json = await request<ApiListResponse<{ user: any; token: string }>>(`/public/register`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { token: (json as any).data.token };
}

export async function publicLogin(payload: { email: string; password: string }): Promise<{ token: string }>{
  const json = await request<ApiListResponse<{ user: any; token: string }>>(`/public/login`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { token: (json as any).data.token };
}

export async function fetchMyPublicReports(token: string): Promise<any[]> {
  const json = await request<ApiListResponse<{ reports: any[] }>>(`/reports/public/mine`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return (json as any).data.reports || [];
}

export async function loginDoctor(payload: { email: string; password: string }): Promise<{ token: string; doctor: any }>{
  const json = await request<ApiListResponse<{ doctor: any; token: string }>>(`/auth/login`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { token: (json as any).data.token, doctor: (json as any).data.doctor };
}

export async function registerDoctor(payload: {
  doctor_id: string;
  name: string;
  email: string;
  password: string;
  specialty?: string;
  clinic_id: string;
}): Promise<{ token: string; doctor: any }>{
  const json = await request<ApiListResponse<{ doctor: any; token: string }>>(`/auth/register`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { token: (json as any).data.token, doctor: (json as any).data.doctor };
}


