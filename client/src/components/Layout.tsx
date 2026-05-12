import { Link, Outlet } from "react-router"
import { Sidebar, SidebarContent, SidebarMenu, SidebarTrigger, SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar"

export default function Layout() {
  return (
    <div className="flex h-screen w-full">
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/dashboard">Dashboard</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/orders">Orders</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/customers">Customers</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/products">Products</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar >
      <main className="flex-1 p-6 overflow-auto">
        <SidebarTrigger />
        <Outlet />
      </main>
    </div>
  )
}
