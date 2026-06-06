export type EmailTone = "formal" | "casual" | "direct";

export interface DraftEmailRequest {
  tone?: EmailTone;
}

export interface DraftEmailResponse {
  subject: string;
  body: string;
}

export interface ContactFormValues {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  job_title: string;
  linkedin_url: string;
  website: string;
  location: string;
  context_notes: string;
  tags: string;
  source: string;
}
