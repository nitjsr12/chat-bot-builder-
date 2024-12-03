"use client"; // For Next.js client component rendering

import { Home, TrendingUp, BarChart, Grid } from "lucide-react"; // Import available icons

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"; // Ensure these components are correctly exported

// Updated menu items with available icons
const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Flow", url: "/flow", icon: TrendingUp }, // Replaced "Flow" icon with "TrendingUp"
  { title: "Analysis", url: "#", icon: BarChart },
  { title: "Dashboard", url: "#", icon: Grid },
];

export function AppSidebar() {
  return (
    <Sidebar className=" text-white w-44 h-full">
      <SidebarContent className="bg-blue-600">
        <SidebarGroup>
          <SidebarGroupLabel className="text-red-500 text-sm font-semibold pl-4 py-2">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="hover:bg-blue-700 rounded-md">
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center space-x-3 p-2">
                      <item.icon className="text-gray-200 w-5 h-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
