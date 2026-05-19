import { KeyRound, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import api from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  otp: ""
};

export default function SuperUserSettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const passwordsMatch = useMemo(
    () => !form.confirmPassword || form.newPassword === form.confirmPassword,
    [form.confirmPassword, form.newPassword]
  );

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    setStatus("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setStatus("Fill current password, new password, and confirm password first.");
      return;
    }

    if (!passwordsMatch) {
      setStatus("New password and confirm password do not match.");
      return;
    }

    setIsRequestingOtp(true);

    try {
      const response = await api.post("/auth/settings/password-otp/request", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      setOtpRequested(true);
      setStatus(response.data?.message || "OTP sent successfully.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to send OTP.");
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setStatus("");

    if (!otpRequested) {
      setStatus("Request OTP first before updating the password.");
      return;
    }

    if (!passwordsMatch) {
      setStatus("New password and confirm password do not match.");
      return;
    }

    if (!form.otp) {
      setStatus("Enter the OTP sent to your email.");
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await api.post("/auth/settings/password-otp/confirm", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        otp: form.otp
      });

      setStatus(response.data?.message || "Password updated successfully.");
      setOtpRequested(false);
      setForm(initialForm);
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="card-panel p-6 sm:p-8">
        <SectionHeader
          label="Admin Settings"
          title="Secure account settings"
          description="Change your admin password with email OTP confirmation. If the dashboard stays idle for 30 minutes, it will log out automatically."
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-brand-crimson" />
              <h3 className="text-xl font-semibold text-brand-ink">Account verification</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-brand-slate">
              OTP confirmations are sent to the configured admin inbox. Make sure the recipient mailbox is accessible before changing the password.
            </p>

            <div className="mt-6 rounded-2xl border border-brand-border bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Admin account</p>
              <p className="mt-2 text-lg font-semibold text-brand-ink">{user?.name || "Admin User"}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-surface p-6">
            <div className="flex items-center gap-3">
              <KeyRound size={18} className="text-brand-crimson" />
              <h3 className="text-xl font-semibold text-brand-ink">Update password</h3>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={savePassword}>
              <div>
                <label className="form-label" data-required="true">Current Password</label>
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(event) => updateField("currentPassword", event.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label" data-required="true">New Password</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(event) => updateField("newPassword", event.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" data-required="true">Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => updateField("confirmPassword", event.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>

              {otpRequested ? (
                <div>
                  <label className="form-label" data-required="true">Email OTP</label>
                  <input
                    value={form.otp}
                    onChange={(event) => updateField("otp", event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                </div>
              ) : null}

              {!passwordsMatch ? <p className="text-sm text-rose-500">New password and confirm password must match.</p> : null}
              {status ? <p className="text-sm text-brand-slate">{status}</p> : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  className="button-secondary px-4 py-2"
                  onClick={requestOtp}
                  disabled={isRequestingOtp || isSavingPassword}
                >
                  {isRequestingOtp ? "Sending OTP..." : otpRequested ? "Resend OTP" : "Send OTP"}
                </button>
                <button type="submit" className="button-primary px-4 py-2" disabled={isSavingPassword || isRequestingOtp || !otpRequested}>
                  {isSavingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
