
import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/react";
import {
  Bell,
  ChevronDown,
  UserRound,
  LogOut,
  Mail,
} from "lucide-react";

function Header() {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!profileOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileOpen]);

  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "";

  const metadata = user?.publicMetadata ?? {};

  const metadataName =
    typeof metadata.full_name === "string" ? metadata.full_name : "";

  const displayName =
    user?.fullName ||
    user?.firstName ||
    metadataName ||
    user?.username ||
    primaryEmail.split("@")[0] ||
    "Account";

  const department =
    typeof metadata.department === "string"
      ? metadata.department
      : "Workspace member";

  const initials =
    displayName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <header className="relative z-20 flex h-[106px] shrink-0 items-center justify-end border-b border-[#E2E7E1] bg-[#F8F6EF] px-9">
      <div className="flex shrink-0 items-center gap-7">
        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#18352D] transition hover:bg-[#EAF2EC]"
          aria-label="Notifications"
        >
          <Bell size={25} strokeWidth={1.8} />

          <span className="absolute right-[7px] top-[5px] h-2.5 w-2.5 rounded-full border-2 border-[#F8F6EF] bg-red-500" />
        </button>

        <div className="h-11 w-px bg-[#E2E7E1]" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            className="flex items-center gap-4 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[#6D9775]"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label="Open account menu"
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-1 ring-[#DDE5DC]"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0C3B2E] text-lg font-semibold text-white">
                {isLoaded ? initials : "…"}
              </span>
            )}

            <span className="hidden min-w-[110px] sm:block">
              <span className="block max-w-[165px] truncate text-[17px] font-semibold text-[#101820]">
                {isLoaded ? displayName : "Loading…"}
              </span>

              <span className="block max-w-[165px] truncate text-[16px] text-[#718079]">
                {isLoaded ? department : ""}
              </span>
            </span>

            <ChevronDown
              size={21}
              strokeWidth={1.8}
              className={`ml-2 text-[#18352D] transition-transform ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Account dropdown */}
          {profileOpen && user && (
            <div
              className="absolute right-0 top-[calc(100%+14px)] z-50 w-[min(320px,calc(100vw-32px))] overflow-hidden rounded-xl border border-[#E0E7DE] bg-white shadow-[0_18px_55px_rgba(17,48,38,0.16)]"
              role="menu"
              aria-label="Account menu"
            >
              <div className="border-b border-[#EDF0EA] bg-[#F8F9F5] px-5 py-4">
                <div className="flex items-center gap-3">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#0C3B2E] font-semibold text-white">
                      {initials}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#173D32]">
                      {displayName}
                    </p>

                    <p className="truncate text-xs text-[#718079]">
                      {department}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-5 py-4 text-xs text-[#617169]">
                {primaryEmail && (
                  <p className="flex items-center gap-2.5 break-all">
                    <Mail
                      size={14}
                      className="shrink-0 text-[#839187]"
                    />
                    {primaryEmail}
                  </p>
                )}

                {user.username && (
                  <p className="flex items-center gap-2.5">
                    <UserRound
                      size={14}
                      className="shrink-0 text-[#839187]"
                    />
                    @{user.username}
                  </p>
                )}

                {typeof metadata.title === "string" &&
                  metadata.title && (
                    <p className="pl-[24px] text-[#617169]">
                      {metadata.title}
                    </p>
                  )}
              </div>

              <div className="border-t border-[#EDF0EA] p-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    openUserProfile();
                  }}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#23483B] transition hover:bg-[#F1F5EF]"
                >
                  Manage account
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#8D4C39] transition hover:bg-[#FBF2EE]"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
