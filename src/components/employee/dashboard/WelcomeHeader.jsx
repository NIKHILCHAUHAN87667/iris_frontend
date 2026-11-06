import { useUser } from "@clerk/react";

function WelcomeHeader() {
  const { user, isLoaded } = useUser();
  const invitedName = typeof user?.publicMetadata?.full_name === "string" ? user.publicMetadata.full_name : "";
  const name = user?.firstName || user?.fullName?.split(" ")[0] || invitedName.split(" ")[0] || user?.username || "there";

  return (
    <section className="px-10 pb-8 pt-10">
      <p className="mb-2 text-sm font-medium uppercase tracking-[0.16em] text-[#6D9775]">
        Employee Workspace
      </p>

      <h1 className="text-4xl font-bold tracking-tight text-[#0C3B2E]">
        {isLoaded ? `Good to see you, ${name}` : "Welcome to your workspace"} 👋
      </h1>

      <p className="mt-3 max-w-2xl text-lg text-[#64746C]">
        What would you like to know today?
      </p>
    </section>
  );
}

export default WelcomeHeader;
