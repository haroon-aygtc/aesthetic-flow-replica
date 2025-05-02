
import * as React from "react";
import { TooltipContentProps } from "@radix-ui/react-tooltip";

export type SidebarState = "expanded" | "collapsed";

export interface SidebarContext {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export type SidebarCollapsibleType = "offcanvas" | "icon" | "none";
export type SidebarVariantType = "sidebar" | "floating" | "inset";
export type SidebarSideType = "left" | "right";

export type SidebarTooltipType = string | React.ComponentProps<typeof TooltipContentProps>;
