"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { 
  GalleryVerticalEndIcon, 
  AudioLinesIcon, 
  TerminalIcon, 
  TerminalSquareIcon, 
  BotIcon, 
  BookOpenIcon, 
  Settings2Icon, 
  FrameIcon, 
  PieChartIcon, 
  MapIcon,
  LayoutDashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  FolderOpenIcon,
  FileTextIcon,
  DollarSignIcon,
  BarChart3Icon,
  CogIcon
} from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      isActive: false,
    },
    {
      title: "HR Management",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: false,
      items: [
        {
          title: "Employee",
          url: "/users",
        },
        {
          title: "Department",
          url: "/pengaturan/hc/departemen",
        },
        {
          title: "Division",
          url: "#",
        },
        {
          title: "Position",
          url: "/pengaturan/hc/jabatan",
        },
        {
          title: "Attendance",
          url: "#",
        },
        {
          title: "Leave",
          url: "#",
        },
        {
          title: "Public Holiday",
          url: "/pengaturan/hc/kalender",
        },
        {
          title: "Reimburse",
          url: "#",
        },
        {
          title: "Payroll",
          url: "#",
        },
        {
          title: "Recruitment",
          url: "#",
        },
        {
          title: "Training",
          url: "#",
        },
        {
          title: "Shift",
          url: "/pengaturan/hc/shift",
        },
        {
          title: "Grade",
          url: "/pengaturan/hc/grade",
        },
        {
          title: "Area Kerja",
          url: "/pengaturan/hc/area-kerja",
        },
        {
          title: "UMR",
          url: "/pengaturan/hc/umr",
        },
        {
          title: "BPJS",
          url: "/pengaturan/hc/bpjs",
        },
        {
          title: "Pajak",
          url: "/pengaturan/hc/pajak",
        },
        {
          title: "Komponen Gaji",
          url: "/pengaturan/hc/komponen-gaji",
        },
      ],
    },
    {
      title: "Client Management",
      url: "#",
      icon: <BotIcon />,
      items: [
        {
          title: "Client",
          url: "#",
        },
        {
          title: "Company",
          url: "#",
        },
      ],
    },
    {
      title: "Leads Management",
      url: "/leads",
      icon: <BookOpenIcon />,
      isActive: false,
      items: [
        {
          title: "Pipeline",
          url: "#",
        },
        {
          title: "Stage",
          url: "#",
        },
        {
          title: "Leads",
          url: "/leads",
        },
        {
          title: "Product & Service",
          url: "#",
        },
      ],
    },
    {
      title: "Project Management",
      url: "#",
      icon: <Settings2Icon />,
      items: [
        {
          title: "Project",
          url: "#",
        },
        {
          title: "Board Task",
          url: "#",
        },
        {
          title: "Timeline",
          url: "#",
        },
        {
          title: "Project Briefs",
          url: "/project-briefs/new",
        },
      ],
    },
    {
      title: "Transaction",
      url: "#",
      icon: <DollarSignIcon />,
      items: [
        {
          title: "Quotation",
          url: "#",
        },
        {
          title: "Order",
          url: "#",
        },
        {
          title: "Invoice",
          url: "#",
        },
        {
          title: "Receipt",
          url: "#",
        },
      ],
    },
    {
      title: "Finance & Accounting",
      url: "#",
      icon: <BarChart3Icon />,
      items: [
        {
          title: "Chart of Account",
          url: "#",
        },
        {
          title: "Journal History",
          url: "#",
        },
        {
          title: "General Ledger",
          url: "#",
        },
        {
          title: "Profit & Loss",
          url: "#",
        },
        {
          title: "Income Statement",
          url: "#",
        },
        {
          title: "Balance Sheet",
          url: "#",
        },
        {
          title: "Cash Flow",
          url: "#",
        },
        {
          title: "Forecast Cash Out",
          url: "#",
        },
        {
          title: "Forecast Cash In",
          url: "#",
        },
      ],
    },
    {
      title: "Report",
      url: "#",
      icon: <FileTextIcon />,
      items: [
        {
          title: "Summary",
          url: "#",
        },
        {
          title: "Leads Monitoring",
          url: "#",
        },
        {
          title: "Transaction Monitoring",
          url: "#",
        },
        {
          title: "Project Monitoring",
          url: "#",
        },
        {
          title: "Finance Monitoring",
          url: "#",
        },
        {
          title: "Dynamic Report",
          url: "#",
        },
      ],
    },
    {
      title: "Configuration",
      url: "#",
      icon: <CogIcon />,
      items: [
        {
          title: "Sidebar Menu",
          url: "#",
        },
        {
          title: "Access Management",
          url: "#",
        },
        {
          title: "Role",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
