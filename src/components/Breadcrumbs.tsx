import React from 'react';

export interface BreadcrumbItem {
  label: string;
  icon?: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-[12.5px] text-[#9A9892] select-none py-1 flex-wrap" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1 || item.active;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <i className="ti ti-chevron-right text-[11px] text-[#555] mx-0.5" aria-hidden="true"></i>
            )}

            {isLast || !item.onClick ? (
              <span
                className="flex items-center gap-1.5 font-medium text-[#F5F3EC] px-1 py-0.5"
                aria-current={isLast ? 'page' : undefined}
              >
                {item.icon && <i className={`ti ${item.icon} text-[13px] text-[#C7F26B]`} aria-hidden="true"></i>}
                <span>{item.label}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="flex items-center gap-1.5 text-[#9A9892] hover:text-[#F5F3EC] hover:bg-[#1C1C1C] rounded-[6px] px-1.5 py-0.5 border-0 bg-transparent cursor-pointer transition-colors"
              >
                {item.icon && <i className={`ti ${item.icon} text-[13px] text-[#9A9892]`} aria-hidden="true"></i>}
                <span>{item.label}</span>
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
