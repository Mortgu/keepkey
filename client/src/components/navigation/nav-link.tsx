import { createLink, type LinkComponent } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { tv } from "tailwind-variants";

const itemStyles = tv({
  base: "mx-1.5 flex items-center gap-2.5 rounded-[5px] px-3.5 py-1.5 text-[15px] font-light text-(--text-inv) transition-colors hover:bg-(--fg-3) hover:text-(--text-inv)",
  variants: {
    indent: {
      true: "py-1.5 pl-[38px] pr-3.5",
      false: "",
    },
    isActive: {
      true: "bg-(--fg-2)  text-(--text-inv) hover:bg-(--fg-3) hover:text-(--text-inv)",
      false: "",
    },
  },
  defaultVariants: { indent: false, isActive: false },
});

const iconStyles = tv({
  base: "flex shrink-0",
  variants: {
    isActive: {
      true: "text-(--text-inv)",
      false: "text-(--text-inv)",
    },
  },
});

const badgeStyles = tv({
  base: "rounded-full px-[7px] py-[1px] text-[10px] font-semibold tabular-nums",
  variants: {
    isActive: {
      true: "bg-(--primary-100) text-(--primary)",
      false: "bg-(--subtle-50) text-(--fg-2)",
    },
  },
});

type NavItemContentProps = {
  icon?: React.ReactNode;
  label: React.ReactNode;
  badge?: number | string;
  trailing?: React.ReactNode;
  isActive?: boolean;
};

function NavItemContent({
  icon,
  label,
  badge,
  trailing,
  isActive,
}: NavItemContentProps) {
  return (
    <>
      {icon && <span className={iconStyles({ isActive })}>{icon}</span>}
      <span className="flex-1 truncate text-left">{label}</span>
      {badge !== undefined && (
        <span className={badgeStyles({ isActive })}>{badge}</span>
      )}
      {trailing}
    </>
  );
}

type BasicLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  indent?: boolean;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  badge?: number | string;
};

const BasicLinkComponent = React.forwardRef<HTMLAnchorElement, BasicLinkProps>(
  ({ className, indent, icon, label, badge, children, ...props }, ref) => {
    const content = label ?? children;
    return (
      <a
        ref={ref}
        {...props}
        className={itemStyles({ indent, className })}
      >
        <NavItemContent icon={icon} label={content} badge={badge} />
      </a>
    );
  },
);

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const NavLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return (
    <CreatedLinkComponent
      {...props}
      activeOptions={{ exact: true }}
      activeProps={{
        className: itemStyles({ indent: props.indent, isActive: true }),
      }}
    />
  );
};

type NavButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  NavItemContentProps & { indent?: boolean };

export const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ icon, label, badge, trailing, isActive, indent, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      {...props}
      className={itemStyles({ indent, isActive, className })}
    >
      <NavItemContent
        icon={icon}
        label={label}
        badge={badge}
        trailing={trailing}
        isActive={isActive}
      />
    </button>
  ),
);
NavButton.displayName = "NavButton";

type NavGroupProps = {
  icon?: React.ReactNode;
  label: React.ReactNode;
  badge?: number | string;
  defaultOpen?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
};

export function NavGroup({
  icon,
  label,
  badge,
  defaultOpen = false,
  isActive,
  children,
}: NavGroupProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <>
      <NavButton
        icon={icon}
        label={label}
        badge={badge}
        isActive={isActive}
        onClick={() => setOpen((v) => !v)}
        trailing={
          <ChevronDown
            size={11}
            strokeWidth={2.4}
            className={`text-(--fg-3) transition-transform duration-150 ${open ? "" : "-rotate-90"
              }`}
          />
        }
      />
      {open && <div className="flex flex-col gap-0.5">{children}</div>}
    </>
  );
}
