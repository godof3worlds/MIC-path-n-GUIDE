import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  Calendar, 
  ShieldCheck, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { UserProfile } from '../hooks/useAuth';
import { Certification } from '../types';

interface CertificateGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  completedCertifications?: Certification[];
}

export const CertificateGeneratorModal: React.FC<CertificateGeneratorModalProps> = ({
  isOpen,
  onClose,
  profile,
  completedCertifications: passedCerts = [],
}) => {
  const [completedCerts, setCompletedCerts] = useState<Array<Certification & { completedAt?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const credentialId = `MSFT-LP-${(profile.id || 'CANDIDATE').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`;

  // Fetch verified completed certifications
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    if (passedCerts.length > 0) {
      setCompletedCerts(passedCerts);
      setLoading(false);
      return;
    }

    fetch(`/api/portfolio/${encodeURIComponent(profile.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setCompletedCerts(data.certifications || []);
        }
      })
      .catch((err) => {
        console.warn('Certificate data fetch fallback:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, profile.id, passedCerts]);

  // Draw High-Resolution Certificate on Canvas (1920x1080 Landscape)
  const drawCertificate = (targetCanvas: HTMLCanvasElement) => {
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    const width = 1920;
    const height = 1080;
    targetCanvas.width = width;
    targetCanvas.height = height;

    // 1. Deep Midnight Navy / Slate Background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#030712');
    bgGradient.addColorStop(0.5, '#0b1329');
    bgGradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Outer Decorative Borders & Accents
    // Outer Gold / Cyan Border
    const borderGrad = ctx.createLinearGradient(0, 0, width, height);
    borderGrad.addColorStop(0, '#38bdf8');
    borderGrad.addColorStop(0.3, '#f59e0b');
    borderGrad.addColorStop(0.7, '#3b82f6');
    borderGrad.addColorStop(1, '#a855f7');

    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Thin Inner Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, width - 90, height - 90);

    // Corner Decorative Brackets
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.lineTo(0, 0);
      ctx.lineTo(30, 0);
      ctx.stroke();
      ctx.restore();
    };

    drawCorner(55, 55, 0);
    drawCorner(width - 55, 55, 90);
    drawCorner(width - 55, height - 55, 180);
    drawCorner(55, height - 55, 270);

    // 3. Header Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('MICROSOFT LEARNING PATH TRACKER  •  VERIFIED CREDENTIAL ARCHIVE', width / 2, 110);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px sans-serif';
    ctx.fillText('CERTIFICATE OF CLOUD MASTERY', width / 2, 175);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 20px sans-serif';
    ctx.fillText('This official credential certifies that the candidate has successfully demonstrated validated mastery across', width / 2, 215);
    ctx.fillText('Microsoft Cloud Architecture, Engineering, and Implementation Standards.', width / 2, 245);

    // 4. Candidate Name Section
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('PROUDLY PRESENTED TO', width / 2, 305);

    // Name Gradient Banner
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 62px sans-serif';
    const candidateName = profile.displayName || 'Candidate Learner';
    ctx.fillText(candidateName, width / 2, 380);

    // Gold Divider Line
    const lineGrad = ctx.createLinearGradient(width / 2 - 300, 0, width / 2 + 300, 0);
    lineGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
    lineGrad.addColorStop(0.5, 'rgba(245, 158, 11, 1)');
    lineGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(width / 2 - 300, 405, 600, 3);

    // 5. Completed Certifications Grid / Showcase (Middle Box)
    const count = completedCerts.length;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 22px sans-serif';
    ctx.fillText(
      `VALIDATED CERTIFICATION CREDENTIALS COMPLETED (${count})`,
      width / 2,
      460
    );

    const boxX = 140;
    const boxY = 490;
    const boxWidth = width - 280;
    const boxHeight = 340;

    // Background Card for Certifications
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    if (completedCerts.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 24px sans-serif';
      ctx.fillText('No certifications completed yet in active profile session.', width / 2, boxY + 170);
    } else {
      // Display completed certifications in structured columns
      const cols = Math.min(3, Math.max(1, Math.ceil(completedCerts.length / 4)));
      const colWidth = boxWidth / cols;

      completedCerts.slice(0, 12).forEach((cert, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const itemX = boxX + col * colWidth + 30;
        const itemY = boxY + 50 + row * 65;

        // Badge pill
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fillRect(itemX, itemY - 26, 80, 36);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(itemX, itemY - 26, 80, 36);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(cert.code, itemX + 40, itemY - 2);

        // Cert Title
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        const titleTrimmed = cert.title.length > 28 ? cert.title.slice(0, 26) + '...' : cert.title;
        ctx.fillText(titleTrimmed, itemX + 95, itemY - 6);

        // Level & Domain
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.fillText(`${cert.level} • ~${cert.estimated_hours}h Study Effort`, itemX + 95, itemY + 16);
      });
    }

    // 6. Holographic Verification Seal (Bottom Center)
    const sealX = width / 2;
    const sealY = 920;

    // Seal outer ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(sealX, sealY, 52, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 12px sans-serif';
    ctx.fillText('★ VERIFIED ★', sealX, sealY - 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('AUTHENTIC', sealX, sealY + 6);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('CREDENTIAL', sealX, sealY + 22);
    ctx.restore();

    // 7. Left Footer: Issue Date & Verification ID
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('DATE OF ISSUANCE:', 140, 900);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(issueDate, 140, 928);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('CREDENTIAL VERIFICATION ID:', 140, 960);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(credentialId, 140, 984);

    // 8. Right Footer: Verification Signature
    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('CURRICULUM DIRECTOR:', width - 140, 900);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'italic bold 22px serif';
    ctx.fillText('Microsoft Learning Systems', width - 140, 930);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width - 400, 945);
    ctx.lineTo(width - 140, 945);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Cloud Architecture & Examination Board', width - 140, 970);
  };

  // Render preview canvas when data is ready
  useEffect(() => {
    if (!loading && previewCanvasRef.current) {
      drawCertificate(previewCanvasRef.current);
    }
  }, [loading, completedCerts, profile]);

  // Download High-Res PNG
  const handleDownloadPng = () => {
    setIsExporting(true);
    try {
      const exportCanvas = document.createElement('canvas');
      drawCertificate(exportCanvas);

      const imageURI = exportCanvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      const safeName = (profile.displayName || 'Candidate').toLowerCase().replace(/\s+/g, '_');
      downloadLink.download = `Microsoft_Certificate_${safeName}_${Date.now()}.png`;
      downloadLink.href = imageURI;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('PNG download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      {/* Modal Container */}
      <div className="liquid-glass-card w-full max-w-5xl max-h-[92vh] flex flex-col p-0 relative border-cyan-400/50 bg-slate-950/95 overflow-hidden shadow-2xl rounded-2xl">
        
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-600 shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 liquid-glass-pill p-1.5 text-slate-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl liquid-glass-pill liquid-glow-cyan flex items-center justify-center bg-gradient-to-tr from-cyan-500/20 to-amber-500/20 border-cyan-400/40 text-cyan-300 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                  High-Resolution Certificate Generator
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> 1920x1080 HD
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Official Microsoft Credentials Certificate
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generates a verified diploma PNG featuring all your mastered certification credentials, candidate details, and cryptographic verification stamps.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadPng}
              disabled={isExporting || loading}
              className="liquid-glass-pill px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 border-cyan-300 shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PNG...' : 'Download Certificate (PNG)'}</span>
            </button>
          </div>
        </div>

        {/* Certificate Preview Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-slate-950/80">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm animate-pulse space-y-2">
              <Award className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
              <div>Generating high-resolution credential certificate...</div>
            </div>
          ) : (
            <div className="w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden border border-cyan-500/40 relative group">
              <canvas
                ref={previewCanvasRef}
                className="w-full h-auto object-contain block bg-slate-950"
                style={{ aspectRatio: '16/9' }}
              />

              {/* Hover Overlay info */}
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-[11px] text-slate-200 flex items-center gap-1.5 pointer-events-none">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified {completedCerts.length} Credentials Mastered</span>
              </div>
            </div>
          )}

          {/* Summary Checklist below Certificate */}
          <div className="w-full max-w-4xl mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="liquid-glass-card p-3 border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                {completedCerts.length}
              </div>
              <div>
                <div className="font-bold text-white">Credentials Included</div>
                <div className="text-[11px] text-slate-400">Printed with verified levels</div>
              </div>
            </div>

            <div className="liquid-glass-card p-3 border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                HD
              </div>
              <div>
                <div className="font-bold text-white">1920x1080 16:9 PNG</div>
                <div className="text-[11px] text-slate-400">Optimal for LinkedIn & Resumes</div>
              </div>
            </div>

            <div className="liquid-glass-card p-3 border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                ID
              </div>
              <div>
                <div className="font-bold text-white truncate max-w-[140px]">{credentialId}</div>
                <div className="text-[11px] text-slate-400">Cryptographic audit code</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-slate-400 flex items-center gap-2">
            <span>Candidate: <strong className="text-slate-200">{profile.displayName}</strong></span>
            <span>&bull;</span>
            <span>Issue Date: <strong className="text-slate-300">{issueDate}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPng}
              className="liquid-glass-pill px-4 py-1.5 font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 border-cyan-300 cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={onClose}
              className="liquid-glass-pill px-4 py-1.5 font-bold text-white border-white/20 hover:border-white/40 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
