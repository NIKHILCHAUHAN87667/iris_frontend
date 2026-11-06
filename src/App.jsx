import { BrowserRouter, Navigate, Route, Routes, Link, useLocation } from "react-router-dom";
import { Show, SignIn, SignUp, useAuth, useUser } from "@clerk/react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import UploadDocument from "./pages/employee/UploadDocument";
import SearchPage from "./pages/employee/SearchPage";
import AIAssistant from "./pages/employee/AIAssistant";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminDocumentReview from "./pages/admin/AdminDocumentReview";
import AdminIngestionMonitor from "./pages/admin/AdminIngestionMonitor";
import DocumentAccessRequest from "./pages/employee/DocumentAccessRequest";
import { getAdminSession } from "./services/adminApi";
import { fetchCurrentAppUser } from "./services/userApi";

function hasAdminIdentity(user) {
  const role = String(user?.publicMetadata?.role ?? user?.publicMetadata?.user_role ?? "").toLowerCase();
  return role === "admin" || role === "root" || role === "super_admin";
}

function SignedInRedirect() {
  const { isLoaded, user } = useUser();
  if (!isLoaded) return <div className="auth-loading" aria-label="Loading account" />;
  return <Navigate to={hasAdminIdentity(user) ? "/admin/login" : "/dashboard"} replace />;
}

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const [verification, setVerification] = useState({ state: "loading" });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return undefined;

    let cancelled = false;
    const verifyAppAccount = async () => {
      setVerification({ state: "loading" });
      for (let attempt = 0; attempt < 6; attempt += 1) {
        try {
          const token = await getToken();
          const user = await fetchCurrentAppUser(token);
          if (!cancelled) setVerification({ state: "allowed", user });
          return;
        } catch (error) {
          const hasWebhookDelay = error.code === "ACCOUNT_NOT_REGISTERED" || error.code === "ACCOUNT_SYNC_PENDING";
          if (hasWebhookDelay && attempt < 5) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
          if (!cancelled) setVerification({ state: "blocked", error });
          return;
        }
      }
    };

    verifyAppAccount();
    return () => { cancelled = true; };
  }, [getToken, isLoaded, isSignedIn, retry]);

  if (!isLoaded) return <div className="auth-loading" aria-label="Loading account" />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace state={{ from: location }} />;
  if (hasAdminIdentity(user)) return <Navigate to="/admin/login" replace />;
  if (verification.state === "allowed") return children;
  if (verification.state === "loading") {
    return <main className="auth-shell"><div className="auth-loading" /><p className="auth-intro">Checking your IRIS account…</p></main>;
  }

  const message = verification.error?.code === "ACCOUNT_NOT_ACTIVE"
    ? "Your IRIS account is not active yet. Please contact your administrator."
    : verification.error?.code === "ACCOUNT_SYNC_PENDING"
      ? "Your invitation was accepted. We’re waiting for the account sync to finish; try again in a moment."
    : verification.error?.code === "ACCOUNT_AWAITING_APPROVAL"
      ? "Your sign-up is complete and your account is awaiting administrator approval. You’ll be able to access IRIS once it’s approved."
    : verification.error?.code === "EMAIL_NOT_VERIFIED"
      ? "Verify the primary email on your Clerk account, then try again."
    : verification.error?.code === "ACCOUNT_NOT_REGISTERED"
      ? "We couldn’t find an IRIS account for this Clerk user. Ask your administrator to check your invitation and account setup."
      : "IRIS couldn’t verify your account right now. Check that the API and database are available, then try again.";

  return (
    <main className="auth-shell">
      <section className="auth-panel invitation-message">
        <p className="eyebrow">ACCOUNT CHECK</p>
        <h1>Access needs<br />a quick check.</h1>
        <p className="auth-intro">{message}</p>
        <button type="button" className="primary-link" onClick={() => setRetry((value) => value + 1)}>Try again <ArrowRight size={17} /></button>
      </section>
    </main>
  );
}

function AdminRoute({ children }) {
  const [session, setSession] = useState({ state: "checking" });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getAdminSession()
      .then(() => { if (!cancelled) setSession({ state: "allowed" }); })
      .catch((error) => {
        if (cancelled) return;
        setSession(error.status === 401
          ? { state: "unauthenticated" }
          : { state: "unavailable", error });
      });
    return () => { cancelled = true; };
  }, [retry]);

  if (session.state === "allowed") return children;
  if (session.state === "unauthenticated") return <Navigate to="/admin/login" replace />;
  if (session.state === "checking") return <main className="auth-shell"><div className="auth-loading" /><p className="auth-intro">Verifying administrator access…</p></main>;
  return (
    <main className="auth-shell">
      <section className="auth-panel invitation-message">
        <p className="eyebrow">ADMIN API UNAVAILABLE</p>
        <h1>Can’t verify<br />admin access.</h1>
        <p className="auth-intro">Start the backend API and check its connection, then retry.</p>
        <button type="button" className="primary-link" onClick={() => setRetry((value) => value + 1)}>Try again <ArrowRight size={17} /></button>
      </section>
    </main>
  );
}

function LandingPage() {
  return (
    <main className="landing-shell">
      <header className="landing-nav">
        <Link className="brand-lockup" to="/" aria-label="IRIS home">
          <span className="brand-mark">i</span>
          <span>IRIS<span className="brand-period">.</span></span>
        </Link>
        <Link className="nav-login" to="/sign-in">Employee sign in <ArrowRight size={16} /></Link>
      </header>
      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> INTERNAL KNOWLEDGE, IN FOCUS</p>
          <h1>Make every<br />document <em>count.</em></h1>
          <p className="hero-description">A considered workspace for the files, decisions, and knowledge that move your organization forward.</p>
          <Link className="primary-link" to="/sign-in">Continue to your workspace <ArrowRight size={17} /></Link>
          <div className="access-note"><LockKeyhole size={15} /><span>Private workspace · Access by invitation</span></div>
        </div>
        <div className="hero-art" aria-label="Document archive illustration">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="art-index">ARCHIVE / 01</div>
          <div className="paper paper-back"><span /><span /><span /></div>
          <div className="paper paper-front">
            <div className="paper-top"><span className="mini-mark">i</span><span>IRIS / KNOWLEDGE</span></div>
            <div className="paper-rule" />
            <p className="paper-kicker">FIELD NOTES · 2026</p>
            <div className="paper-title">Ideas live<br />longer when<br /><i>shared.</i></div>
            <div className="paper-lines"><span /><span /><span /></div>
            <div className="paper-foot"><span>INTERNAL DOCUMENT</span><span>001—024</span></div>
          </div>
          <div className="art-stamp"><ShieldCheck size={17} /><span>SECURE<br />BY DESIGN</span></div>
          <p className="art-caption">A calmer place for<br />work that matters.</p>
        </div>
      </section>
      <footer className="landing-footer"><span>IRIS · YOUR KNOWLEDGE, IN GOOD ORDER</span><span>ACCESS IS MANAGED BY YOUR ADMINISTRATOR</span><Link to="/admin/login" className="landing-admin-link">Admin access</Link></footer>
    </main>
  );
}

function SignInPage() {
  return (
    <main className="auth-shell">
      <Link className="brand-lockup auth-brand" to="/">
        <span className="brand-mark">i</span><span>IRIS<span className="brand-period">.</span></span>
      </Link>
      <section className="auth-panel">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Your workspace<br />is waiting.</h1>
        <p className="auth-intro">Sign in with the account provided by your administrator.</p>
        <SignIn routing="hash" forceRedirectUrl="/dashboard" signUpUrl="/accept-invitation" />
        <div className="invite-hint"><LockKeyhole size={15} /><span>New to IRIS? Ask your administrator for an invitation.</span></div>
        <Link className="back-link" to="/">Back to IRIS home</Link>
      </section>
      <p className="auth-legal">PRIVATE WORKSPACE <span>·</span> ACCESS BY INVITATION</p>
    </main>
  );
}

function InvitationPage() {
  const hasInvitation = new URLSearchParams(window.location.search).has("__clerk_ticket");
  if (!hasInvitation) {
    return (
      <main className="auth-shell">
        <Link className="brand-lockup auth-brand" to="/"><span className="brand-mark">i</span><span>IRIS<span className="brand-period">.</span></span></Link>
        <section className="auth-panel invitation-message">
          <p className="eyebrow">INVITATION REQUIRED</p>
          <h1>This door opens<br />with an invite.</h1>
          <p className="auth-intro">IRIS accounts are created by your administrator. Ask them to send you a personal invitation link.</p>
          <Link className="primary-link" to="/sign-in">Return to sign in <ArrowRight size={17} /></Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <Link className="brand-lockup auth-brand" to="/"><span className="brand-mark">i</span><span>IRIS<span className="brand-period">.</span></span></Link>
      <section className="auth-panel">
        <p className="eyebrow">YOUR INVITATION</p>
        <h1>Join your<br />workspace.</h1>
        <p className="auth-intro">Complete your account setup to get started.</p>
        <SignUp routing="hash" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
      </section>
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Show when="signed-out" fallback={<SignedInRedirect />}><LandingPage /></Show>} />
      <Route path="/sign-in/*" element={<Show when="signed-out" fallback={<SignedInRedirect />}><SignInPage /></Show>} />
      <Route path="/accept-invitation/*" element={<InvitationPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUserManagement /></AdminRoute>} />
      <Route path="/admin/documents" element={<AdminRoute><AdminDocumentReview /></AdminRoute>} />
      <Route path="/admin/ingestion" element={<AdminRoute><AdminIngestionMonitor /></AdminRoute>} />
      <Route path="/admin/access-requests" element={<AdminRoute><AdminDocumentReview initialView="requests" /></AdminRoute>} />
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/documents/upload" element={<ProtectedRoute><UploadDocument /></ProtectedRoute>} />
      <Route path="/documents/request/:documentId" element={<ProtectedRoute><DocumentAccessRequest /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
      <Route path="/collections" element={<ProtectedRoute><div>Collections</div></ProtectedRoute>} />
      <Route path="/workspace" element={<ProtectedRoute><div>My Workspace</div></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><div>Help</div></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}

export default App;
