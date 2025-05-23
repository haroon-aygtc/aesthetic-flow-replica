
import * as React from "react";
import { TooltipContentProps } from "@radix-ui/react-tooltip";

export type SidebarState = "expanded" | "collapsed";

export interface SidebarContextType {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export const SidebarContext = React.createContext<SidebarContextType>({
  state: "expanded",
  open: true,
  setOpen: () => {},
  openMobile: false,
  setOpenMobile: () => {},
  isMobile: false,
  toggleSidebar: () => {},
});

export type SidebarCollapsibleType = "offcanvas" | "icon" | "none";
export type SidebarVariantType = "sidebar" | "floating" | "inset";
export type SidebarSideType = "left" | "right";

export type SidebarTooltipType = string | Omit<TooltipContentProps, "ref">;
