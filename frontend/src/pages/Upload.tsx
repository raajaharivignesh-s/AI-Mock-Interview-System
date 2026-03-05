/**
 * pages/Upload.tsx
 * 
 * Step 2 of the interview flow. Provides a drag-and-drop interface for uploading
 * a resume (PDF/DOCX). Sends it to the backend to be parsed and cross-referenced
 * with the active session's Job Description.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { api, ResumeUploadResponse } from '../services/api';

/**
 * Resume Upload Component
 */
export default function Upload() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState<ResumeUploadResponse | null>(null);
  const [error, setError] = useState<string>('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or DOC file');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const sessionId = localStorage.getItem('sessionId') || undefined;
      if (!sessionId) {
        setError('Missing Session ID. Please go back and submit a Job Description first.');
        setUploading(false);
        return;
      }
      
      const data = await api.uploadResume(file, sessionId);
      setUploadData(data);
      
      if (data.first_question) {
        localStorage.setItem('firstQuestion', data.first_question);
      }
      if (data.first_audio) {
        localStorage.setItem('firstAudio', data.first_audio);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload resume. Please ensure your session is active.');
    } finally {
      setUploading(false);
    }
  };

  const startInterview = () => {
    navigate('/interview');
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-glow rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-glow rounded-full blur-[120px] opacity-20 pointer-events-none" />
      
      <div className="max-w-2xl w-full space-y-8 z-10 animate-fade-in-up">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Upload Resume</h1>
          <p className="text-lg text-dark-muted">We'll cross-reference this with the Job Description to tailor your interview</p>
        </div>

        {!uploadData ? (
          <div className="glass-panel p-8 rounded-2xl space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative p-12 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-dark-border bg-black/20 hover:border-white/20'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
              />

              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                {file ? (
                  <FileText className="w-16 h-16 text-primary mb-4 animate-float" />
                ) : (
                  <UploadIcon className="w-16 h-16 text-dark-muted mb-4 group-hover:text-primary transition-colors" />
                )}

                {file ? (
                  <div className="text-center">
                    <p className="text-white text-lg font-medium mb-2">{file.name}</p>
                    <p className="text-dark-muted text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-white text-lg font-medium mb-2 flex items-center justify-center gap-2">
                       Drag & drop your resume
                    </p>
                    <p className="text-dark-muted text-sm mb-4">or click to browse from computer</p>
                    <div className="flex gap-2 justify-center">
                        <span className="px-2 py-1 bg-white/5 rounded text-xs text-dark-muted border border-white/5">PDF</span>
                        <span className="px-2 py-1 bg-white/5 rounded text-xs text-dark-muted border border-white/5">DOCX</span>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full btn-primary"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Resume...</span>
                  </>
                ) : (
                  <>
                    <span>Upload & Extract Skills</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-panel p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-dark-border">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Resume Analyzed</h2>
                    <p className="text-sm text-dark-muted">Profile successfully linked to session</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wider mb-4">
                    Extracted Experience Level
                  </h3>
                  <div className="inline-flex px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium">
                      {uploadData.experience_level || "Professional"}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wider mb-4">
                    Key Skills Match
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {uploadData.skills.length > 0 ? (
                        uploadData.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-blue-300 text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))
                    ) : (
                        <span className="text-dark-muted text-sm italic">Analysis complete. Ready for interview.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={startInterview}
              className="w-full btn-primary text-lg"
            >
              <span>Initialize Interview Server</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Step indicator */}
        <div className="mt-8 flex justify-center items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
            <div className="w-8 h-[2px] bg-primary/50"></div>
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
            <div className="w-8 h-[2px] bg-dark-border"></div>
            <div className="w-2 h-2 rounded-full bg-dark-border"></div>
        </div>

      </div>
    </div>
  );
}
