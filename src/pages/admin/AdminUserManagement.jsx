import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, Clipboard, MailPlus, Plus, RefreshCw, UsersRound } from "lucide-react";

import AdminLayout from "../../components/admin/layout/AdminLayout";
import { approveAdminUser, createAdminDepartment, createUserInvitation, getAdminDepartments, getAdminUsers } from "../../services/adminApi";

const initialForm = {
  fullName: "",
  email: "",
  employeeCode: "",
  departmentId: "",
  title: "",
  role: "employee",
};

function AdminUserManagement() {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [copied, setCopied] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [approvingUserId, setApprovingUserId] = useState("");

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [departmentResult, userResult] = await Promise.all([getAdminDepartments(), getAdminUsers()]);
      setDepartments(departmentResult.departments);
      setUsers(userResult.users);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setNotice(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice(null);
    setCopied(false);
    try {
      const result = await createUserInvitation(form);
      setNotice({ ...result, invitationUrl: result.invitation?.url });
      setForm(initialForm);
      await refreshData();
    } catch (inviteError) {
      setError(inviteError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepartmentSubmit = async (event) => {
    event.preventDefault();
    setCreatingDepartment(true);
    setError("");
    setNotice(null);
    try {
      const { department } = await createAdminDepartment(departmentName.trim());
      setDepartmentName("");
      await refreshData();
      setForm((current) => ({ ...current, departmentId: department.dept_id }));
    } catch (createError) {
      setError(createError.message);
    } finally {
      setCreatingDepartment(false);
    }
  };

  const handleApproveUser = async (user) => {
    setApprovingUserId(user.id);
    setError("");
    try {
      await approveAdminUser(user.id);
      await refreshData();
    } catch (approvalError) {
      setError(approvalError.message);
    } finally {
      setApprovingUserId("");
    }
  };

  const copyInvitation = async () => {
    if (!notice?.invitationUrl) return;
    try {
      await navigator.clipboard.writeText(notice.invitationUrl);
      setCopied(true);
    } catch {
      setError("Could not copy the invitation link. Select and copy it manually.");
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-full bg-[#F8F6EF] px-8 pb-12 pt-8 lg:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6D9775]">PEOPLE & ACCESS</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0C3B2E]">User management</h1>
            <p className="mt-2 text-sm text-[#64746C]">Register employees and send their secure Clerk invitation.</p>
          </div>
          <button type="button" onClick={refreshData} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#DCE4DA] bg-white px-3.5 py-2.5 text-sm font-medium text-[#31594C] transition hover:bg-[#F0F5EF] disabled:opacity-60">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh list
          </button>
        </div>

        {error && <div className="mb-5 rounded-lg border border-[#EBC8BD] bg-[#FFF5F1] px-4 py-3 text-sm text-[#934A39]" role="alert">{error}</div>}

        {notice && (
          <section className="mb-6 rounded-xl border border-[#C9DFCD] bg-[#F0F7F0] p-5" aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#DDEFE0] text-[#28634F]"><Check size={18} /></span>
                <div>
                  <h2 className="font-semibold text-[#173D32]">Invitation created for {notice.user.email}</h2>
                  <p className="mt-1 text-sm text-[#64746C]">Clerk was asked to email the sign-up link. After the employee completes signup, approve access from the roster below.</p>
                </div>
              </div>
              {notice.invitationUrl && <button type="button" onClick={copyInvitation} className="inline-flex items-center gap-2 rounded-lg border border-[#C7D9C9] bg-white px-3.5 py-2 text-sm font-semibold text-[#28634F] hover:bg-[#F8FBF7]">
                {copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? "Copied link" : "Copy invitation link"}
              </button>}
            </div>
            {notice.invitationUrl && <p className="mt-4 break-all rounded-md bg-white/80 px-3 py-2 font-mono text-xs text-[#62746A]">{notice.invitationUrl}</p>}
          </section>
        )}

        <section className="mb-6 rounded-xl border border-[#E2E7E1] bg-white p-5 shadow-sm lg:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-[#173D32]">Departments</h2>
              <p className="mt-1 text-sm text-[#758178]">Create a department to make it available in employee invitations.</p>
            </div>
            <span className="rounded-full bg-[#F0F3ED] px-2.5 py-1 text-xs font-medium text-[#64746C]">{departments.length} active</span>
          </div>
          <form onSubmit={handleDepartmentSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              aria-label="New department name"
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#DCE4DA] bg-white px-3.5 text-sm text-[#193B32] outline-none transition placeholder:text-[#9AA69F] focus:border-[#6D9775] focus:ring-2 focus:ring-[#6D9775]/15"
              value={departmentName}
              onChange={(event) => { setDepartmentName(event.target.value); setError(""); }}
              placeholder="e.g. Engineering"
              minLength={2}
              maxLength={100}
              required
            />
            <button type="submit" disabled={creatingDepartment || loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#C9D9CC] bg-[#F4F8F3] px-4 text-sm font-semibold text-[#28634F] transition hover:bg-[#EAF2EC] disabled:cursor-not-allowed disabled:opacity-60">
              <Plus size={16} />{creatingDepartment ? "Adding…" : "Add department"}
            </button>
          </form>
          {departments.length > 0 && <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active departments">{departments.map((department) => <li key={department.dept_id} className="rounded-full border border-[#E3EAE1] bg-[#FBFCF9] px-3 py-1.5 text-xs font-medium text-[#52645D]">{department.dept_name}</li>)}</ul>}
        </section>

        <section className="mb-8 rounded-xl border border-[#E2E7E1] bg-white p-6 shadow-sm lg:p-7">
          <div className="mb-6 flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#EAF2EC] text-[#28634F]"><MailPlus size={20} /></span>
            <div>
              <h2 className="text-lg font-semibold text-[#173D32]">Register an employee</h2>
              <p className="mt-1 text-sm text-[#758178]">An invitation email is sent by Clerk as soon as you submit.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
            {!loading && departments.length === 0 && <p className="rounded-md bg-[#FFF4DB] px-3 py-2 text-sm text-[#806321] md:col-span-2 xl:col-span-3">There are no active departments yet. Add one in the Departments section above before inviting employees.</p>}
            <label className="admin-field">Full name
              <input name="fullName" required minLength={2} maxLength={150} value={form.fullName} onChange={updateField} placeholder="Employee name" autoComplete="name" />
            </label>
            <label className="admin-field">Work email
              <input name="email" type="email" required maxLength={255} value={form.email} onChange={updateField} placeholder="name@company.com" autoComplete="email" />
            </label>
            <label className="admin-field">Employee code <span className="font-normal text-[#95A097]">(optional)</span>
              <input name="employeeCode" maxLength={50} value={form.employeeCode} onChange={updateField} placeholder="e.g. IR-1042" />
            </label>
            <label className="admin-field">Department
              <select name="departmentId" required value={form.departmentId} onChange={updateField}>
                <option value="">{loading ? "Loading departments…" : "Select a department"}</option>
                {departments.map((department) => <option key={department.dept_id} value={department.dept_id}>{department.dept_name}</option>)}
              </select>
            </label>
            <label className="admin-field">Job title <span className="font-normal text-[#95A097]">(optional)</span>
              <input name="title" maxLength={100} value={form.title} onChange={updateField} placeholder="e.g. Product Designer" />
            </label>
            <label className="admin-field">Access role
              <select name="role" value={form.role} onChange={updateField}>
                <option value="employee">Employee</option>
                <option value="reviewer">Reviewer</option>
                <option value="dept_admin">Department admin</option>
              </select>
            </label>
            <div className="md:col-span-2 xl:col-span-3 flex justify-end pt-2">
              <button type="submit" disabled={submitting || loading || departments.length === 0} className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-[#0C3B2E] px-5 text-sm font-semibold text-white transition hover:bg-[#175440] disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? "Sending invitation…" : "Register & send invite"}<ArrowRight size={16} />
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#E2E7E1] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E9EDE7] px-5 py-4 lg:px-6">
            <div className="flex items-center gap-2.5">
              <UsersRound size={19} className="text-[#567B67]" />
              <h2 className="font-semibold text-[#173D32]">IRIS roster</h2>
              <span className="rounded-full bg-[#F0F3ED] px-2 py-0.5 text-xs text-[#64746C]">{users.length}</span>
            </div>
            <span className="text-xs text-[#87938E]">Showing latest 100</span>
          </div>
          {loading ? <p className="px-6 py-9 text-sm text-[#758178]">Loading users…</p> : users.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <UsersRound className="mx-auto mb-3 text-[#9DA99F]" size={27} />
              <p className="font-medium text-[#31594C]">No users in the roster yet</p>
              <p className="mt-1 text-sm text-[#87938E]">Register an employee above to send the first invitation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#F8F9F6] text-[11px] uppercase tracking-[0.1em] text-[#7B8980]">
                  <tr><th className="px-6 py-3 font-semibold">Employee</th><th className="px-4 py-3 font-semibold">Department</th><th className="px-4 py-3 font-semibold">Role</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Access</th><th className="px-6 py-3 text-right font-semibold">Added</th></tr>
                </thead>
                <tbody className="divide-y divide-[#EDF0EA]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#FBFCF9]">
                      <td className="px-6 py-4"><p className="font-medium text-[#193B32]">{user.name}</p><p className="mt-0.5 text-xs text-[#87938E]">{user.email}{user.employeeCode ? ` · ${user.employeeCode}` : ""}</p></td>
                      <td className="px-4 py-4 text-[#52645D]">{user.department}</td>
                      <td className="px-4 py-4 capitalize text-[#52645D]">{user.role.replaceAll("_", " ")}</td>
                      <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.status === "active" ? "bg-[#EAF4EA] text-[#34734B]" : user.status === "pending" ? "bg-[#FFF4DB] text-[#8B6823]" : "bg-[#F1F2F0] text-[#697570]"}`}>{user.status === "pending" ? user.hasCompletedSignup ? "Awaiting approval" : "Pending invite" : user.status}</span></td>
                      <td className="px-4 py-4">{user.status === "pending" && user.hasCompletedSignup ? <button type="button" onClick={() => handleApproveUser(user)} disabled={Boolean(approvingUserId)} className="rounded-md bg-[#0C3B2E] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#175440] disabled:cursor-wait disabled:opacity-60">{approvingUserId === user.id ? "Approving…" : "Approve access"}</button> : <span className="text-xs text-[#87938E]">{user.status === "active" ? "Granted" : "—"}</span>}</td>
                      <td className="px-6 py-4 text-right text-xs text-[#87938E]">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminUserManagement;
