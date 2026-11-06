
import { NavLink } from "react-router-dom";

function AdminSidebarItem({
  icon: Icon,
  label,
  to,
  active = false,
  onClick,
}) {
  const classes = (isActive) =>
    `flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
      isActive
        ? "bg-[#0C3B2E] text-white shadow-sm"
        : "text-[#18352D] hover:bg-[#EAF2EC]"
    }`;

  if (to) {
    return (
      <NavLink
        to={to}
        end={to === "/admin"}
        className={({ isActive }) => classes(isActive)}
      >
        {({ isActive }) => (
          <>
            <Icon
              size={22}
              strokeWidth={1.8}
              className={isActive ? "!text-white" : ""}
            />

            <span
              className={`text-[15px] font-medium ${
                isActive ? "!text-white" : ""
              }`}
            >
              {label}
            </span>
          </>
        )}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes(active)}
    >
      <Icon
        size={22}
        strokeWidth={1.8}
        className={active ? "!text-white" : ""}
      />

      <span
        className={`text-[15px] font-medium ${
          active ? "!text-white" : ""
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export default AdminSidebarItem;
