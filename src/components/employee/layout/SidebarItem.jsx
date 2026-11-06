import { NavLink } from "react-router-dom";

function SidebarItem({
  icon: Icon,
  label,
  to,
}) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({ color: isActive ? "#FFFFFF" : "#18352D" })}
      className={({ isActive }) =>
        `flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
          isActive
            ? "bg-[#0C3B2E] shadow-sm"
            : "hover:bg-[#EAF2EC]"
        }`
      }
    >
      <Icon size={23} strokeWidth={1.8} />

      <span className="text-[16px] font-medium">
        {label}
      </span>
    </NavLink>
  );
}

export default SidebarItem;
