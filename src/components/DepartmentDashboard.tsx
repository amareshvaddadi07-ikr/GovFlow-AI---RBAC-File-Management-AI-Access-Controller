import React from 'react';
import { DocumentItem, UserSession, Department } from '../types';
import { Building, ShieldCheck, Lock, Unlock, FileText, CheckCircle2, XCircle, Users } from 'lucide-react';

interface DepartmentDashboardProps {
  documents: DocumentItem[];
  session: UserSession;
  onSelectDepartment: (dept: Department) => void;
}

export const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({
  documents,
  session,
  onSelectDepartment,
}) => {
  const departments: Department[] = [
    'Finance',
    'HR',
    'Operations',
    'IT & Security',
    'Legal & Compliance',
  ];

  const getDepartmentStats = (dept: Department) => {
    const deptDocs = documents.filter((d) => d.department.toLowerCase() === dept.toLowerCase());
    const confidentialCount = deptDocs.filter((d) => d.classification === 'Confidential' || d.classification === 'Top Secret' || d.classification === 'Restricted').length;
    const isUserDept = !session.role || session.role === 'Commissioner' || session.department.toLowerCase() === dept.toLowerCase();

    return {
      totalDocs: deptDocs.length,
      confidentialCount,
      isUserDept,
      docs: deptDocs,
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      
      {/* Title & Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Departmental Infrastructure & RBAC Matrix</h1>
            <p className="text-xs text-slate-500 font-mono">
              Role-Based Access Control Architecture & Department Clearance Boundaries
            </p>
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const stats = getDepartmentStats(dept);
          const isAccessible =
            session.role === 'Commissioner' || session.department.toLowerCase() === dept.toLowerCase();

          return (
            <div
              key={dept}
              onClick={() => onSelectDepartment(dept)}
              className={`bg-white border rounded-xl p-5 cursor-pointer transition-all hover:shadow-md shadow-sm group ${
                isAccessible
                  ? 'border-slate-200 hover:border-blue-400'
                  : 'border-red-200 bg-red-50/10 hover:border-red-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                    {dept.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{dept}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Department Hub</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase border flex items-center space-x-1 ${
                    isAccessible
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {isAccessible ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  <span>{isAccessible ? 'Accessible' : 'Restricted'}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Files</span>
                  <span className="text-base font-bold text-slate-900">{stats.totalDocs} Documents</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Confidential</span>
                  <span className="text-base font-bold text-amber-600">{stats.confidentialCount} Files</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-mono flex items-center justify-between pt-3 border-t border-slate-100">
                <span>Clearance: {dept} Officer or Commissioner</span>
                <span className="text-blue-600 font-bold group-hover:underline">Explore →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* RBAC Matrix Reference Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Role-Based Access Control (RBAC) Clearance Matrix</h2>
          <p className="text-xs text-slate-500">
            Enforcement mapping across User Roles, Department Assignments, and Document Clearances.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px]">
                <th className="p-3">User Role</th>
                <th className="p-3">Assigned Dept</th>
                {departments.map((d) => (
                  <th key={d} className="p-3 text-center">{d} Files</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr className="bg-purple-50/50 font-bold">
                <td className="p-3 text-purple-700">Commissioner</td>
                <td className="p-3 text-slate-600">Universal (All)</td>
                {departments.map((d) => (
                  <td key={d} className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      FULL ACCESS
                    </span>
                  </td>
                ))}
              </tr>

              {departments.map((officerDept) => (
                <tr key={officerDept} className="hover:bg-slate-50">
                  <td className="p-3 text-blue-700 font-bold">Officer</td>
                  <td className="p-3 font-bold text-slate-900">{officerDept}</td>
                  {departments.map((targetDept) => {
                    const isAllowed = officerDept.toLowerCase() === targetDept.toLowerCase();

                    return (
                      <td key={targetDept} className="p-3 text-center">
                        {isAllowed ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            ALLOWED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                            DENIED
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
