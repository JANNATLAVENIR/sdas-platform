import React from 'react';
import { Language, UserRole } from '../types/sdas';
import { MOCK_DISTRICTS } from '../data/mockData';
import { filterDistrictsByRole, getRoleExperience } from '../utils/rolePolicy';

interface StatisticsViewProps {
  language: Language;
  activeRole: UserRole;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ activeRole }) => {
  const exp = getRoleExperience(activeRole);
  const scopedDistricts = filterDistrictsByRole(MOCK_DISTRICTS, activeRole);

  const totalMapped = scopedDistricts.reduce((acc, d) => acc + d.mappedBuildings, 0);
  const totalVerified = scopedDistricts.reduce((acc, d) => acc + d.verifiedEntrances, 0);
  const totalOfficial = scopedDistricts.reduce((acc, d) => acc + d.approvedDesignations, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            Tirakoobka Rasmiga ah ee Ciwaanada Gobolka Banaadir
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {exp.allowedDistrictIds !== 'all'
              ? `Scoped Analytics (${exp.role.code}): ${exp.role.assignedArea}`
              : 'Xogta rasmiga ah ee guryaha la diiwaangeliyay, irridaha la xaqiijiyay, iyo koodadka la bixiyay ee degmooyinka Muqdisho.'}
          </p>
        </div>
        <span className="text-xs font-mono bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded font-semibold">
          {exp.role.code}: {exp.role.scope.en}
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Guryaha Diiwaangashan</span>
          <span className="text-2xl font-serif font-bold text-slate-900 block">{totalMapped.toLocaleString()}</span>
          <span className="text-[11px] text-emerald-700 font-medium">
            {exp.allowedDistrictIds !== 'all' ? exp.role.scope.so : 'Degmooyinka Banaadir'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Irridaha La Xaqiijiyay</span>
          <span className="text-2xl font-serif font-bold text-blue-900 block">{totalVerified.toLocaleString()}</span>
          <span className="text-[11px] text-blue-700 font-medium">Xaqiijinta Goobta (GPS)</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Ciwaanada Rasmiga ah</span>
          <span className="text-2xl font-serif font-bold text-emerald-800 block">{totalOfficial.toLocaleString()}</span>
          <span className="text-[11px] text-emerald-700 font-medium">Shahaadooyinka La Bixiyay</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Degmooyinka Ku Jira</span>
          <span className="text-2xl font-serif font-bold text-slate-900 block">{scopedDistricts.length}</span>
          <span className="text-[11px] text-slate-500">Gobolka Banaadir</span>
        </div>
      </div>

      {/* District Coverage Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
          Kala Shaandheynta Degmooyinka Gobolka Banaadir ({scopedDistricts.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Degmada</th>
                <th className="p-3.5">Guryaha La Khariideeyay</th>
                <th className="p-3.5">Irridaha La Hubiyay</th>
                <th className="p-3.5">Ciwaanada Rasmiga ah</th>
                <th className="p-3.5">Xaaladda Adeegga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {scopedDistricts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">{d.name}</td>
                  <td className="p-3.5 font-mono text-slate-700">{d.mappedBuildings.toLocaleString()}</td>
                  <td className="p-3.5 font-mono text-slate-700">{d.verifiedEntrances.toLocaleString()}</td>
                  <td className="p-3.5 font-mono text-emerald-800 font-bold">{d.approvedDesignations.toLocaleString()}</td>
                  <td className="p-3.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                      Adeegga Wuu Furan yahay
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
