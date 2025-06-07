import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { ChevronLeft, ChevronRight } from "lucide-react"
import clsx from "clsx"

export function AppSidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

   // Add this navigation handler
   const handleNavigation = (path) => {
    // Force a complete page reload when navigating
    window.location.href = path;
  }

  const navItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
    },
    {
      title: "Admin",
      path: "/admin",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: "Invoice Generator",
      path: "/invoice",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      title: "Payment Tracker",
      path: "/payment",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
    },
    {
      title: "Ledger & Reports",
      path: "/ledger",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
  ]

  return (
    <div
      className={clsx(
        "transition-all duration-300 border-r border-gray-200 bg-white h-full shadow-2xl flex-shrink-0",
        collapsed ? "w-[60px]" : "w-64"
      )}
      style={{ minWidth: collapsed ? '60px' : '256px', maxWidth: collapsed ? '60px' : '256px' }}
    >
      <div className={clsx(
        "p-4 flex items-center",
        collapsed ? "justify-center" : "justify-end"
      )}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#E6F2FF] transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <SidebarContent>
        <SidebarMenu className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={clsx(
                    "hover:bg-[#EDEFF2] py-6 transition-colors relative",
                    isActive && "bg-[#E6F2FF] py-6"
                  )}
                >
                  <Link
                    onClick={() => handleNavigation(item.path)}
                    className={clsx(
                      "flex items-center py-3 px-4 gap-4",
                      collapsed ? "justify-center" : "justify-start",
                      "text-base",
                      isActive && "before:absolute before:left-0 before:top-0 before:h-full before:w-[5px] before:rounded-none before:bg-blue-500"
                    )}
                  >
                    <span>{item.icon}</span>
                    {!collapsed && <span className="whitespace-nowrap text-lg">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </div>
  )
}

