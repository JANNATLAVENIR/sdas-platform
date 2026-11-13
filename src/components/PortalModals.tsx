import React, { useEffect, useState } from 'react';
import { X, Lock, ShieldCheck, User, AlertTriangle } from 'lucide-react';
import { Language } from '../types/sdas';
import { fetchDevAccounts, loginWithCredentials } from '../api/sdasClient';
import type { AuthUser, DevAccountSummary } from '../api/sdasClient';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAuthenticated: (user: AuthUser, breakGlassActive: boolean) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  language,
  onAuthenticated
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [devAccounts, setDevAccounts] = useState<DevAccountSummary[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      fetchDevAccounts().then((accounts) => setDevAccounts(accounts));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submitCredentials = async (targetEmail: string, targetPassword: string) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await loginWithCredentials(targetEmail, targetPassword);
      onAuthenticated(res.user, res.breakGlassActive);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCredentials(email, password);
  };

  const handleSelectDevAccount = async (acc: DevAccountSummary) => {
    setEmail(acc.email);
    setPassword('SdasDev!2026');
    await submitCredentials(acc.email, 'SdasDev!2026');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md shadow-xl max-w-2xl w-full p-4 sm:p-6 border border-slate-200 space-y-4 sm:space-y-5 max-h-[92dvh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="w-4 h-4 text-[#0c243e] shrink-0" />
            <h3 className="font-bold text-slate-900 text-sm truncate">
              {language === 'so'
                ? 'Galitaanka Nidaamka SDAS (Xisaabaad Dhab ah)'
                : language === 'ar'
                ? 'تسجيل الدخول إلى نظام العنونة الرقمية'
                : 'SDAS Portal Authentication'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Email & Password Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@sdas.gov.so"
                className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0c243e]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0c243e]"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0c243e] shrink-0" />
              <span>Sessions are verified server-side with role & geographic scoping.</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-[#0c243e] hover:bg-[#133860] disabled:bg-slate-400 text-white font-semibold px-4 py-2.5 sm:py-2 rounded text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </div>
        </form>

        {/* Development-Only Test Accounts (Shown only when /api/auth/dev-accounts responds 200 in non-prod) */}
        {devAccounts.length > 0 && (
          <div className="border-t border-slate-200 pt-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="text-xs font-bold text-slate-900">
                Development Test Accounts (Non-Production Only)
              </div>
              <span className="font-mono text-[11px] text-slate-500">14 Seeded Role Accounts</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Select any development account to sign in via <span className="font-mono">POST /api/auth/login</span> and enter its distinct role workspace. Disabled automatically when <span className="font-mono">NODE_ENV=production</span>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {devAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSelectDevAccount(acc)}
                  className="p-2.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition cursor-pointer min-w-0"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono font-bold text-[#0c243e] shrink-0">
                      {acc.order}. {acc.code}
                    </span>
                    <span className="font-mono text-slate-500 truncate">{acc.email}</span>
                  </div>
                  <div className="font-semibold text-xs text-slate-900 mt-0.5 truncate">{acc.fullName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{acc.assignedArea}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface LatestUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const LatestUpdateModal: React.FC<LatestUpdateModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="font-serif font-bold text-slate-900 text-sm">
            SDAS Phase II — City-Wide Rollout in Mogadishu
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            The Ministry of Communications & Technology, in operational partnership with the Banaadir Regional Administration (BRA), has commenced <strong>Phase II</strong> of the Somali Digital Addressing System across Mogadishu.
          </p>

          <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">Districts in Current Wave:</span>
            <ul className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
              <li>✓ Hodan District</li>
              <li>✓ Wadajir (Madina)</li>
              <li>✓ Warta Nabada</li>
              <li>✓ Shangaani District</li>
              <li>✓ Shibis District</li>
              <li>✓ Kaaraan District</li>
              <li>✓ Boondheere District</li>
              <li>✓ Waaberi District</li>
            </ul>
          </div>

          <p className="text-[11px] text-slate-500">
            Field survey teams equipped with GNSS receivers are verifying physical building entrances and issuing public codes with zero collection of resident personal identities.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            onClick={() => {
              onClose();
              onNavigate('map');
            }}
            className="bg-[#0c243e] hover:bg-blue-900 text-white font-semibold px-4 py-2 rounded text-xs transition cursor-pointer"
          >
            Explore Active Districts on Map →
          </button>
        </div>
      </div>
    </div>
  );
};
