import React, { useState } from 'react';
import { AddressRecord, Language, UserRole } from '../types/sdas';
import { MOCK_ADDRESSES, MOCK_DISTRICTS, UI_STRINGS } from '../data/mockData';
import { filterAddressesByRole, filterDistrictsByRole, getRoleExperience } from '../utils/rolePolicy';
import { Search, CheckCircle2, X, Lock, ShieldAlert } from 'lucide-react';

interface AddressDirectoryViewProps {
  language: Language;
  activeRole: UserRole;
  breakGlassActive?: boolean;
  onSelectAddress: (addr: AddressRecord) => void;
}

export const AddressDirectoryView: React.FC<AddressDirectoryViewProps> = ({
  language,
  activeRole,
  breakGlassActive = false,
  onSelectAddress
}) => {
  const t = UI_STRINGS[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [activeModalRecord, setActiveModalRecord] = useState<AddressRecord | null>(null);

  const exp = getRoleExperience(activeRole, breakGlassActive);
  const scopedAddresses = filterAddressesByRole(MOCK_ADDRESSES, activeRole);
  const scopedDistricts = filterDistrictsByRole(MOCK_DISTRICTS, activeRole);

  const filtered = scopedAddresses.filter((item) => {
    const matchesSearch =
      item.publicCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.components.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.components.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.components.street && item.components.street.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDistrict = selectedDistrict === 'all' || item.districtId === selectedDistrict;
    const matchesType = selectedType === 'all' || item.addressType === selectedType;

    return matchesSearch && matchesDistrict && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            {t.navRegistry} — Magaalada Muqdisho
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {exp.allowedDistrictIds !== 'all'
              ? `Scoped View (${exp.role.code}): ${exp.role.assignedArea}`
              : 'Diiwaanka rasmiga ah ee ciwaanada la xaqiijiyay ee 17-ka degmo ee Gobolka Banaadir.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {exp.isReadOnly && (
            <span className="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Read-Only Audit View
            </span>
          )}
          <div className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            Diiwaanka Muuqda: <strong className="text-slate-900">{scopedAddresses.length}</strong>
          </div>
        </div>
      </div>

      {exp.maskCoordinatesAndStreets && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-950 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>R01 Privacy Policy:</strong> Routine street and coordinate details are masked for National Super Administrator. Open <em>System Administration → Break-Glass</em> if emergency inspection is required.
          </span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Ka raadi koodka, xaafadda ama wadada..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
          />
        </div>

        <div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
          >
            <option value="all">{t.allDistricts}</option>
            {scopedDistricts.map((d) => (
              <option key={d.id} value={d.id}>{d.name} District</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
          >
            <option value="all">Dhammaan Noocyada</option>
            <option value="residential">{t.residential}</option>
            <option value="commercial">{t.commercial}</option>
            <option value="public_facility">{t.publicFacility}</option>
            <option value="administrative">Xarun Maamul</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">{t.code}</th>
                <th className="p-3.5">{t.district}</th>
                <th className="p-3.5">{t.locality} / Xaafadda</th>
                <th className="p-3.5">{t.street}</th>
                <th className="p-3.5">{t.filterType}</th>
                <th className="p-3.5">{t.status}</th>
                <th className="p-3.5 text-right">Ficilka</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-mono font-bold text-blue-900">
                    {item.publicCode}
                  </td>
                  <td className="p-3.5 font-medium text-slate-900">
                    {item.components.district}
                  </td>
                  <td className="p-3.5 text-slate-700">
                    {exp.maskCoordinatesAndStreets ? '[MASKED BY R01]' : item.components.locality}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {exp.maskCoordinatesAndStreets
                      ? '[BREAK-GLASS REQUIRED]'
                      : `${item.components.street || '—'} ${item.components.buildingNumber ? `(#${item.components.buildingNumber})` : ''}`}
                  </td>
                  <td className="p-3.5 capitalize text-slate-700">
                    {item.addressType.replace('_', ' ')}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      La Xaqiijiyay
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setActiveModalRecord(item)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#0B2545] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition cursor-pointer"
                    >
                      {t.inspectAddress}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspector Modal */}
      {activeModalRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-sm">Faahfaahinta Ciwaanka</h3>
                <span className="font-mono text-xs text-blue-900 font-bold">{activeModalRecord.publicCode}</span>
              </div>
              <button
                onClick={() => setActiveModalRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Degmada:</span>
                  <span className="font-bold text-slate-900">{activeModalRecord.components.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Xaafadda:</span>
                  <span className="font-bold text-slate-900">
                    {exp.maskCoordinatesAndStreets ? '[MASKED BY R01]' : activeModalRecord.components.locality}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wadada:</span>
                  <span className="font-bold text-slate-900">
                    {exp.maskCoordinatesAndStreets ? '[MASKED BY R01]' : (activeModalRecord.components.street || '—')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lambarka Guriga:</span>
                  <span className="font-bold text-slate-900">
                    {exp.maskCoordinatesAndStreets ? '[MASKED]' : (activeModalRecord.components.buildingNumber || '—')}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-900 block">Iskudhafka GPS:</span>
                <span className="font-mono text-slate-600">
                  {exp.maskCoordinatesAndStreets
                    ? '[MASKED — BREAK-GLASS REQUIRED]'
                    : `${activeModalRecord.location.coordinates[1]}° N, ${activeModalRecord.location.coordinates[0]}° E`}
                </span>
              </div>

              <div className="bg-emerald-50 text-emerald-900 p-3 rounded border border-emerald-200">
                <span className="font-semibold block">Tixraaca Rasmiga ah:</span>
                <span className="font-mono text-[11px]">{activeModalRecord.authorityReference || 'BRA/MOG/2026/REG-01'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  onSelectAddress(activeModalRecord);
                  setActiveModalRecord(null);
                }}
                className="bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold px-4 py-2 rounded transition cursor-pointer"
              >
                Fiiri Kaarka Shahaadada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
