import { useState } from 'react';
import { Shield, CheckCircle, XCircle, RefreshCw, Save } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const AccessControls = () => {
  const [permissions, setPermissions] = useState({
    'sales:read': { admin: true, sales_admin: true, sales_lead: true, sales_agent: true },
    'sales:create': { admin: true, sales_admin: true, sales_lead: true, sales_agent: true },
    'sales:update': { admin: true, sales_admin: true, sales_lead: true },
    'sales:delete': { admin: true, sales_admin: true },
    'sessions:read': { admin: true, tutor: true, student: true, lsm: true },
    'sessions:create': { admin: true, tutor: true },
    'sessions:update': { admin: true, tutor: true, lsm: true },
    'programs:read': { admin: true, 'program-manager': true, tutor: true },
    'programs:create': { admin: true, 'program-manager': true },
    'programs:update': { admin: true, 'program-manager': true },
  });

  const roles = ['admin', 'sales_admin', 'sales_lead', 'sales_agent', 'tutor', 'student', 'lsm', 'program-manager'];

  const togglePermission = (permission, role) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: {
        ...prev[permission],
        [role]: !prev[permission]?.[role],
      },
    }));
  };

  const handleSave = () => {
    // TODO: Save to backend
    toast.success('Access controls updated successfully');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Controls (RBAC)"
        description="Manage role-based access control permissions"
        actions={
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        }
      />

      <div className="rounded-xl border border-brintelli-border bg-brintelli-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">
                  Permission
                </th>
                {roles.map(role => (
                  <th key={role} className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-textMuted">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {Object.entries(permissions).map(([permission, rolePermissions]) => (
                <tr key={permission} className="hover:bg-brintelli-baseAlt/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-textMuted" />
                      <span className="text-sm font-medium text-text">{permission}</span>
                    </div>
                  </td>
                  {roles.map(role => (
                    <td key={role} className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePermission(permission, role)}
                        className={`inline-flex items-center justify-center h-6 w-6 rounded ${
                          rolePermissions[role]
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {rolePermissions[role] ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessControls;

