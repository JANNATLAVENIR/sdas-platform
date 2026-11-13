import React, { useState, useEffect } from 'react';
import { Language, UserRole } from '../types/sdas';
import { MOCK_PENDING_APPLICATIONS, MOCK_CORRECTIONS, MOCK_DISTRICTS } from '../data/mockData';
import { getRoleExperience, filterDistrictsByRole } from '../utils/rolePolicy';
import { CheckCircle2, Check, UserCheck, AlertTriangle, Lock } from 'lucide-react';

interface VerificationDeskViewProps {
  language: Language;
  activeRole?: UserRole;
}

export const VerificationDeskView: React.FC<VerificationDeskViewProps> = ({
  language,
  activeRole = 'district_admin'
}) => {
  const exp = getRoleExperience(activeRole);
  const scopedDistricts = filterDistrictsByRole(MOCK_DISTRICTS, activeRole);
  const canApproveQueue = ['district_admin', 'regional_admin', 'director_general', 'department_admin', 'national_authority_admin'].includes(activeRole);
  const canVerifyOnly = ['address_verifier', 'field_ops_supervisor', 'data_quality_officer'].includes(activeRole);

  const [activeTab, setActiveTab] = useState<'applications' | 'corrections'>('applications');
  const [applications, setApplications] = useState(MOCK_PENDING_APPLICATIONS);
  const visibleApplications =
    exp.allowedDistrictIds === 'all'
      ? applications
      : applications.filter((a) =>
          scopedDistricts.some((d) => d.name.toLowerCase() === a.district.toLowerCase())
        );

  const [selectedApp, setSelectedApp] = useState<any>(visibleApplications[0] || applications[0]);
  const [activeStep, setActiveStep] = useState(3); // 1: submitted, 2: under_review, 3: verification, 4: approved, 5: official
  const [notification, setNotification] = useState('');
  const [authorityRef, setAuthorityRef] = useState('BRA/MOG/EXEC/2026/099-B');

  useEffect(() => {
    if (visibleApplications.length > 0 && !visibleApplications.some((a) => a.id === selectedApp?.id)) {
      setSelectedApp(visibleApplications[0]);
      setActiveStep(visibleApplications[0].status === 'approved' ? 5 : 3);
    }
  }, [activeRole, visibleApplications, selectedApp?.id]);

  const advanceStep = () => {
    if (!canApproveQueue) return;
    if (activeStep < 5) {
      const next = activeStep + 1;
      setActiveStep(next);

      if (next === 4) {
        setNotification('Codsiga waa la oggolaaday (Approved by Authorized Official).');
      } else if (next === 5) {
        setNotification(`Ciwaanka waxaa loo aqoonsaday mid RASMI AH (Designated Official under Instrument ${authorityRef}).`);
        setApplications(
          applications.map((a) => (a.id === selectedApp.id ? { ...a, status: 'approved', statusLabel: 'Rasmi (Gov)' } : a))
        );
      }
      setTimeout(() => setNotification(''), 4500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
            {language === 'ar'
              ? 'مكتب التفتيش والتحقق والاعتماد الرسمي'
              : language === 'so'
              ? 'Xafiiska Kormeerka, Xaqiijinta & Ansixinta Rasmiga ah'
              : 'Inspection, Verification & Official Designation Desk'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar'
              ? 'إدارة طلبات العناوين الجديدة والتحقق من فصل المهام ومراحل الاعتماد الحكومي.'
              : language === 'so'
              ? 'Maamulka codsiyada ciwaanada cusub, hubinta kala soocidda awoodaha, iyo wejiyada ansixinta dowladeed.'
              : 'Manage incoming address applications, separation-of-duties enforcement, and government designation stages.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs bg-blue-50 text-blue-900 px-3 py-1.5 rounded border border-blue-200 font-semibold">
          <UserCheck className="w-4 h-4 text-blue-700" />
          <span>{exp.role.code}: {exp.role.name[language]}</span>
          {exp.isReadOnly && (
            <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
              READ-ONLY
            </span>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'applications'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Codsiyada Cusub ee Ciwaanada ({visibleApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('corrections')}
          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'corrections'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Dacwadaha & Saxidda Xogta ({MOCK_CORRECTIONS.length})
        </button>
      </div>

      {activeTab === 'applications' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Queue */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 flex justify-between items-center">
              <span>Safarka Codsiyada ({exp.role.assignedArea})</span>
              <span className="font-mono text-slate-500">{visibleApplications.length} Codsi</span>
            </div>
            <div className="divide-y divide-slate-200 text-xs">
              {visibleApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setActiveStep(app.status === 'approved' ? 5 : 3);
                  }}
                  className={`p-4 cursor-pointer transition ${
                    selectedApp?.id === app.id ? 'bg-blue-50/70 border-l-4 border-[#0B2545]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-slate-900">{app.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.statusLabel}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 mt-1">{app.applicantName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Degmada {app.district} — {app.locality}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Inspection & Lifecycle Progression Console */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Codsi La Doortay</span>
                <h3 className="font-serif font-bold text-slate-900 text-base">{selectedApp.id}</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Gudbiyay: {selectedApp.submittedAt}</span>
            </div>

            {/* Lifecycle Steps Visual Indicator */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Wejiyada Hubinta & Ansixinta Ciwaanka:</span>
              <div className="grid grid-cols-5 gap-1 text-[11px] text-center font-medium">
                <div className={`p-2 rounded border ${activeStep >= 1 ? 'bg-blue-900 text-white font-bold' : 'bg-slate-100 text-slate-500'}`}>
                  1. Submitted
                </div>
                <div className={`p-2 rounded border ${activeStep >= 2 ? 'bg-blue-900 text-white font-bold' : 'bg-slate-100 text-slate-500'}`}>
                  2. Under Review
                </div>
                <div className={`p-2 rounded border ${activeStep >= 3 ? 'bg-blue-900 text-white font-bold' : 'bg-slate-100 text-slate-500'}`}>
                  3. Field Verified
                </div>
                <div className={`p-2 rounded border ${activeStep >= 4 ? 'bg-blue-900 text-white font-bold' : 'bg-slate-100 text-slate-500'}`}>
                  4. Approved
                </div>
                <div className={`p-2 rounded border ${activeStep >= 5 ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-100 text-slate-500'}`}>
                  5. Official Gov
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Codsadaha:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedApp.applicantName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Degmada:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedApp.district}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Xaafadda & Wadada:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedApp.locality}, {selectedApp.street}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Nooca Hantida:</span>
                <span className="font-bold text-slate-900 mt-0.5 block capitalize">{selectedApp.propertyType}</span>
              </div>
            </div>

            {/* Separation of Duties Rule Check Box */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded text-xs space-y-1.5 text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Xeerka Kala Soocidda Awoodaha (Separation of Duties):</span>
              </div>
              <div className="text-[11px] leading-relaxed text-amber-900/90">
                • Gudbiyuhu ma xaqiijin karo (Submitter cannot verify).<br />
                • Xaqiijiyuhu ma oggolaan karo (Verifier cannot approve).<br />
                • Ansixinta Rasmiga ah waxay u baahan tahay tixraac wareegto dowladeed (Authority Reference).
              </div>
            </div>

            {activeStep >= 4 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
                <label className="block font-semibold text-slate-700">Tixraaca Wareegtada Rasmiga ah (Authority Instrument Reference)</label>
                <input
                  type="text"
                  value={authorityRef}
                  onChange={(e) => setAuthorityRef(e.target.value)}
                  disabled={!canApproveQueue}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-mono text-slate-900 disabled:bg-slate-100"
                />
              </div>
            )}

            {/* Progression Button */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              {activeStep === 5 ? (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-4 py-2 rounded border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Ciwaankani waa rasmi dowladeed (Official Government Designation Complete)
                </span>
              ) : canApproveQueue ? (
                <button
                  onClick={advanceStep}
                  className="px-6 py-2 bg-[#0c243e] hover:bg-blue-900 text-white font-semibold rounded text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {activeStep === 3 ? 'Ansixi Codsiga (Approve Address)' : 'U Gudbi Rasmi Qaran (Designate Official)'}
                  </span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-4 py-2 rounded border border-amber-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>
                    {canVerifyOnly
                      ? `${exp.role.code}: Xaqiijiye ama kormeere ma ansixin karo codsiga (Separation of Duties).`
                      : `${exp.role.code}: Doorkan ma haysto awoodda ansixinta safkan (Read-Only / Restricted).`}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Corrections Queue */
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
            Dacwadaha & Codsiyada Saxidda Xogta ee Taagan (Dispute Resolution Queue)
          </div>
          <div className="divide-y divide-slate-200 text-xs">
            {MOCK_CORRECTIONS.map((c) => (
              <div key={c.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900">{c.id}</span>
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">{c.addressCode}</span>
                    <span className="font-semibold text-slate-900">{c.category}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{c.submittedValue}</p>
                  <span className="text-[10px] text-slate-400">Gudbiyay: {c.proposer} | Target SLA: {c.targetResolution}</span>
                </div>
                {exp.isReadOnly ? (
                  <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-semibold text-xs flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Read-Only Audit
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setNotification(`Dacwada ${c.id} (${c.addressCode}) waxaa loo wareejiyay sarkaalka madaxa-bannaan ee dib-u-eegista.`);
                      setTimeout(() => setNotification(''), 4500);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs transition cursor-pointer"
                  >
                    Dib u Eeg Caddeymaha
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
