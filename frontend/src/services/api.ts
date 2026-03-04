const API_BASE_URL = 'http://127.0.0.1:8000';

export interface ResumeUploadResponse {
  skills: string[];
  experience_level: string;
  session_id?: string;
  first_question?: string;
  first_audio?: string;
}

export interface SubmitAnswerResponse {
  final_score: number;
  technical: number;
  depth: number;
  clarity: number;
  confidence: number;
  improvement: string;
  next_question: string;
  transcript?: string;
  audio_base64?: string;
}

export interface ReportData {
  overall_score: number;
  technical: number;
  depth: number;
  clarity: number;
  confidence: number;
  skills_analysis: Array<{ skill: string; score: number }>;
  improvements: string[];
  strengths: string[];
}

export const api = {
  async submitJD(jdText: string): Promise<{ session_id: string }> {
    const response = await fetch(`${API_BASE_URL}/submit-jd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jd: jdText }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit Job Description');
    }

    return response.json();
  },

  async uploadResume(file: File, sessionId?: string): Promise<ResumeUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    const response = await fetch(`${API_BASE_URL}/upload-resume`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload resume');
    }

    return response.json();
  },

  async submitAnswer(audioBlob: Blob, sessionId?: string): Promise<SubmitAnswerResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'answer.wav');
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    const response = await fetch(`${API_BASE_URL}/submit-answer`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to submit answer');
    }

    return response.json();
  },

  async generateReport(sessionId?: string): Promise<ReportData> {
    const url = sessionId
      ? `${API_BASE_URL}/generate-report?session_id=${sessionId}`
      : `${API_BASE_URL}/generate-report`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return response.json();
  },
};
