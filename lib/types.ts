export type Role = "citizen" | "admin" | "department_staff";

export type ComplaintStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: Role;
  department_id: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  complaint_code: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  severity: Severity;
  priority_score: number;
  department: string | null;
  status: ComplaintStatus;
  latitude: number;
  longitude: number;
  address: string | null;
  image_url: string | null;
  ai_confidence: number | null;
  spam_score: number;
  is_suspicious: boolean;
  duplicate_group_id: string | null;
  resolution_note: string | null;
  resolution_image_path: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ComplaintHistoryRow {
  id: string;
  complaint_id: string;
  changed_by: string | null;
  old_status: ComplaintStatus | null;
  new_status: ComplaintStatus | null;
  note: string | null;
  created_at: string;
}

export interface ComplaintAIAnalysis {
  id: string;
  complaint_id: string;
  category: string | null;
  severity: Severity | null;
  priority_score: number | null;
  department: string | null;
  impact: string | null;
  confidence: number | null;
  ai_description: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}
