"use client"

import type React from "react"

import { useState } from "react"
import {
  BarChart3,
  Users,
  TrendingDown,
  Award,
  DollarSign,
  Settings,
  HelpCircle,
  Bell,
  Search,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const navItems = [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard", active: true },
    { icon: Users, label: "Employees", href: "/employees" },
    { icon: TrendingDown, label: "Turnover", href: "/turnover" },
    { icon: Award, label: "Performance", href: "/performance" },
    { icon: DollarSign, label: "Compensation", href: "/compensation" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: HelpCircle, label: "Help", href: "/help" },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20",
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <h1 className={cn("font-semibold text-xl", !isSidebarOpen && "hidden")}>HR Analytics</h1>
          {!isSidebarOpen && <BarChart3 className="mx-auto" />}
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <ul className="space-y-2 px-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span className={cn(!isSidebarOpen && "hidden")}>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b px-4">
            <h1 className="font-semibold text-xl">HR Analytics</h1>
          </div>
          <nav className="flex-1 overflow-auto py-4">
            <ul className="space-y-2 px-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                />
              </div>
            </form>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <img
              src="/placeholder.svg?height=32&width=32"
              alt="Avatar"
              className="rounded-full"
              height={32}
              width={32}
            />
            <span className="sr-only">Profile</span>
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
