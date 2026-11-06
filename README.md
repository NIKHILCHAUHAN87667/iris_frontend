# IRIS frontend

## Clerk authentication setup

1. In Clerk, open the IRIS application and set its access mode to **Invite-only** (Clerk may label this **Restricted**). This prevents public self-registration and makes sign-up available only through valid invitations.
2. In the Clerk Dashboard, create an invitation for each employee. For application-based invitation links, set the invitation redirect URL to your app's `/accept-invitation` route, for example `http://localhost:5173/accept-invitation` during local development. Clerk appends the invitation ticket to that URL.
3. Copy the Clerk **Publishable key** into `Frontend/.env`, and set the API address:

   ```dotenv
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_API_BASE_URL=http://localhost:3000
   ```

   `Frontend/.env.example` shows the expected variables. Restart Vite after adding them. The Clerk secret key must never be added to the frontend.
4. Add your local and deployed application URLs to Clerk's allowed redirect/origin settings. Set the production invitation redirect URL to the deployed `/accept-invitation` route.

The landing page is public. Employee dashboard, document, and workspace routes require both an active Clerk session and an active matching account record returned by `GET /api/users/me`. Direct visits to `/accept-invitation` without an invitation ticket show an invitation-required message. Backend and webhook setup instructions are in `Backend/README.md`.

The employee header and welcome message read the signed-in Clerk user's name, email, username, and profile image. To show department and job title, set these values in each user's **public metadata** in the Clerk Dashboard:

```json
{
  "department": "Engineering",
  "title": "Software Engineer"
}
```

The account menu opens Clerk's account profile UI and provides sign-out.

## Temporary admin dashboard

Open `/admin/login` (also linked as **Admin access** on the landing page). The API validates the demo credentials and returns an HttpOnly session cookie. The management page at `/admin/users` loads departments and registered users from the API, creates a pending roster entry, and asks Clerk to email an invitation. Once the invitee completes Clerk signup, their row shows **Awaiting approval**; select **Approve access** to activate the account. The employee cannot enter the workspace until that approval is recorded. The invite acceptance link can also be copied from the success panel.

Employees upload files from **Documents**. Uploads are stored privately in Supabase Storage and wait for admin review. Admins review them at `/admin/documents`, where they can preview, approve or reject each document, and select additional departments to share with. Approved documents appear to users only when their department is the document's owner department or has been explicitly granted access; opening a document requests a short-lived signed URL from the API. Admins can copy a request link for approved documents. Employees with the link can submit a reason for department access; requests appear in **Access Requests** at `/admin/access-requests`, where an admin approves or rejects them. The admin header shows a pending-request count and refreshes it every 30 seconds; this is an in-app notification, not an email.

The demo login defaults are configured on the backend (`admin` / `irisadmin123`) and can be overridden in `Backend/.env`. This is still a single shared demo administrator; replace it with individual server-authorized admin accounts before production.

The browser sends the Clerk session token to the API for verification. API authorization must continue to be enforced server-side for every protected endpoint; the frontend route gate is only a navigation guard.
