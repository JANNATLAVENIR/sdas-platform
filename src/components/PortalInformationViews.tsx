import React from 'react';
import { ShieldCheck, MapPin, QrCode, FileText, Download, CheckCircle2, Building, Layers } from 'lucide-react';

interface ServicesViewProps {
  onNavigate: (view: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
      <div className="bg-white p-4 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-2">
        <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
          Government Addressing Services
        </h2>
        <p className="text-xs text-slate-500">
          Official municipal and national digital addressing capabilities for citizens, businesses, and institutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5 text-[#1565C0]" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Citizen Address Registration</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Register your residence, commercial office, or compound to obtain a standardized, verifiable public address code with official recognition.
          </p>
          <button
            onClick={() => onNavigate('request')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            Apply for an Address →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5 text-[#1565C0]" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Physical House Plates & Signage</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Order official reflective blue metal address plaques with laser-etched QR code for durable installation on exterior gates and entrance pillars.
          </p>
          <button
            onClick={() => onNavigate('plates')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            Order Address Plate →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-[#1565C0]" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Public Code & QR Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Verify official authenticity of any given SDAS public token or printable certificate with instant lookup against the national canonical store.
          </p>
          <button
            onClick={() => onNavigate('search')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            Verify a Code →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">SMS & USSD Mobile Gateway (*282#)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Instant address lookup on feature phones via Hormuud & Somtel shortcode *282# or sending an SMS to 282. Zero internet required.
          </p>
          <button
            onClick={() => onNavigate('ussd')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            Launch USSD Simulator →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-900 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5 text-rose-700" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Emergency & Institutional Geocoding</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            High-availability dispatch geocoding interfaces for police (888), ambulance (999), and national postal delivery operators under data agreements.
          </p>
          <button
            onClick={() => onNavigate('partners')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            Open Dispatch Console →
          </button>
        </div>
      </div>
    </div>
  );
};

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
          About SDAS — Somali Digital Addressing System
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            The <strong>Somali Digital Addressing System (SDAS)</strong> is an authoritative national digital addressing platform established under the authority of the Federal Government of Somalia, led by the Ministry of Communications & Technology (MOCT) in operational alignment with the Banaadir Regional Administration (BRA).
          </p>
          <p>
            SDAS assigns every addressable structure, building entrance, and commercial unit a persistent, human-shareable public code (such as <code className="bg-slate-100 text-blue-900 font-mono px-1.5 py-0.5 rounded">SDAS-MOG-7482</code>) tied to high-precision GNSS coordinates.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-md space-y-2 text-xs">
          <h3 className="font-bold text-slate-900">Key Pillars:</h3>
          <ul className="space-y-1.5 text-slate-600">
            <li>• <strong>Privacy by Design:</strong> No occupant names, personal telephone numbers, or family compositions are stored in the public registry.</li>
            <li>• <strong>Non-Cadastral Notice:</strong> An SDAS address designation is an authoritative spatial location reference, not a land title or proof of property tenure.</li>
            <li>• <strong>Open Standards:</strong> Engineered in conformance with ISO 19160-1 addressing standards and UPU S42 international profiles.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const ResourcesView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
          Official Documents & Resources
        </h2>
        <p className="text-xs text-slate-500">
          Official publications, address plate specifications, and guidelines issued by the Ministry of Communications & Technology.
        </p>

        <div className="divide-y divide-slate-200 pt-3 text-xs">
          <div className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
            <div>
              <span className="font-bold text-slate-900 block">SDAS Master Blueprint v3.0</span>
              <span className="text-slate-500 text-[11px]">Project blueprint and consolidated addressing requirements.</span>
            </div>
            <a href="/assets/aistudio/SDAS_Master_Blueprint_V3_0_Mogadishu_Consolidated__1__4a545dab.pdf" target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold flex items-center gap-1.5 transition shrink-0 focus-visible:outline-2 focus-visible:outline-blue-900">
              <Download aria-hidden="true" className="w-3.5 h-3.5" /> Open PDF
            </a>
          </div>
          <div className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
            <div>
              <span className="font-bold text-slate-900 block">SDAS Citizen Guide (Somali / English)</span>
              <span className="text-slate-500 text-[11px]">How to locate and share your official address code.</span>
            </div>
            <details className="max-w-sm shrink-0 rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <summary className="cursor-pointer font-semibold text-blue-900">Read quick guide</summary>
              <p className="mt-2 max-w-xs text-[11px] leading-relaxed text-slate-600">Search by public address code or use the map to browse published locations. Share only the address code. For an incorrect public record, use the request page to submit a correction for review.</p>
            </details>
          </div>

          <div className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
            <div>
              <span className="font-bold text-slate-900 block">Signage & Building Plate Standards Manual</span>
              <span className="text-slate-500 text-[11px]">Technical specifications for aluminum plates, reflectivity, and QR tokens.</span>
            </div>
            <span className="rounded bg-slate-100 px-3 py-1.5 text-[11px] text-slate-600">Reference summary</span>
          </div>

          <div className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
            <div>
              <span className="font-bold text-slate-900 block">Banaadir District Addressing Codebook</span>
              <span className="text-slate-500 text-[11px]">List of officially gazetted street names, sectors, and localities.</span>
            </div>
            <span className="rounded bg-slate-100 px-3 py-1.5 text-[11px] text-slate-600">Reference summary</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PoliciesView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
            National Addressing & Data Protection Policies
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aligned with the Somalia Data Protection Act (Law No. 005 of 2023) and Municipal Governance Directives.
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
            <h3 className="font-bold text-slate-900">1. Non-Cadastral Address Designation Policy</h3>
            <p className="text-xs text-slate-600">
              An official SDAS digital address code and certificate serve exclusively as a standardized physical location reference for civic services, mail delivery, and emergency dispatch. It does not confer, alter, or prove land ownership or property tenure.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
            <h3 className="font-bold text-slate-900">2. Privacy & Personal Data Minimization</h3>
            <p className="text-xs text-slate-600">
              Public registry lookups expose only non-personal spatial descriptors (district, locality, street, entrance point, and official public code). No resident names, telephone numbers, or household records are published.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
            <h3 className="font-bold text-slate-900">3. Separation of Duties & Accountability</h3>
            <p className="text-xs text-slate-600">
              No individual official may submit, verify, and approve the same address record. High-impact policy and boundary changes require dual-control approval and permanent audit logging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HelpCenterView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
            SDAS Citizen & Partner Help Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Frequently asked questions on finding, verifying, correcting, or ordering your building address plate.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-1">
            <h4 className="font-bold text-slate-900">How do I find or verify my address without internet?</h4>
            <p className="text-slate-600">
              Dial <strong>*282#</strong> from any Hormuud or Somtel mobile line, or send your SDAS code via SMS to <strong>282</strong>. You can also test it online in our USSD simulator.
            </p>
            <button onClick={() => onNavigate('ussd')} className="text-blue-900 font-semibold underline cursor-pointer pt-1">
              Open *282# Mobile Lookup →
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-1">
            <h4 className="font-bold text-slate-900">How do I request a correction for a street name or gate location?</h4>
            <p className="text-slate-600">
              Open your address certificate in Address Verification and select <em>Correction Request</em>. An independent verifier reviews corrections within 2–3 business days.
            </p>
            <button onClick={() => onNavigate('search')} className="text-blue-900 font-semibold underline cursor-pointer pt-1">
              Verify & Report Correction →
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-1">
            <h4 className="font-bold text-slate-900">How can I obtain a physical metal address plate?</h4>
            <p className="text-slate-600">
              Once your address is verified and officially approved, use the House Plates portal to preview and place an order for installation by your District Office.
            </p>
            <button onClick={() => onNavigate('plates')} className="text-blue-900 font-semibold underline cursor-pointer pt-1">
              Order Official House Plate →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactView: React.FC = () => {
  const [sent, setSent] = React.useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
            Official Contact & Mogadishu Service Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ministry of Communications & Technology (MOCT) & Banaadir Regional Administration (BRA).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3 bg-slate-50 p-5 rounded-md border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block">National Addressing Authority Office</span>
              <span className="text-slate-600">Jamhuuriya Road, Boondheere District, Mogadishu</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Citizen Support Shortcode</span>
              <span className="font-mono text-blue-900 font-bold">*282# (USSD) | 282 (SMS)</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Official Inquiries</span>
              <span className="font-mono text-slate-700">sdas-support@moct.gov.so</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Service Desk Hours</span>
              <span className="text-slate-600">Saturday – Thursday, 08:00 – 16:00 EAT</span>
            </div>
          </div>

          <div className="space-y-3">
            {sent ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-md text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-slate-900">Demo message recorded in this preview</div>
                <p className="text-slate-600 text-[11px]">
                  This frontend preview does not send messages to the service desk. No reply will be generated.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Axmed Maxamed..."
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District / Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Hodan District Inquiry..."
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your addressing inquiry..."
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#0c243e] hover:bg-blue-900 text-white font-semibold px-4 py-2 rounded text-xs cursor-pointer"
                >
                  Send Official Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
