import React from "react";
import { 
  BarChart3, 
  BookOpen, 
  BrainCircuit, 
  FolderOpen, 
  GraduationCap, 
  Zap, 
  ArrowUpRight,
  Plus
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const DashboardPage = () => {
  return (
    <div className="space-y-10 p-2 sm:p-4">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-600 to-purple-700 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] -z-0 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-[80px] -z-0 rounded-full -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase">
              Command Center
            </h1>
            <p className="text-lg sm:text-xl font-medium text-white/80 max-w-xl">
              Precision management for your professional narrative. Welcome back to the executive dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/project/create">
              <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest shadow-xl">
                <Plus className="mr-2 h-4 w-4" /> Initialize project
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Portfolio Projects", count: "12+", icon: FolderOpen, color: "blue" },
          { label: "Technical Skills", count: "24+", icon: BrainCircuit, color: "purple" },
          { label: "Career Milestones", count: "8+", icon: BookOpen, color: "emerald" },
          { label: "Academic Credits", count: "4+", icon: GraduationCap, color: "amber" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/60 backdrop-blur-xl border-border/40 shadow-xl rounded-[32px] overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:bg-${stat.color}-500 group-hover:text-white transition-all duration-500 shadow-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black">{stat.count}</h3>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl rounded-[32px]">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-blue-500/80">Systems Operations</CardTitle>
            <CardDescription className="text-base font-bold text-foreground">Immediate Directives</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-4">
            {[
              { label: "Refine Bio Persona", href: "/bio", icon: Zap },
              { label: "Append Experience", href: "/experience/create", icon: Zap },
              { label: "Catalog New Skill", href: "/skills/create", icon: Zap },
              { label: "Document Degree", href: "/education/create", icon: Zap },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="flex">
                <Button variant="ghost" className="w-full justify-start rounded-2xl h-14 px-6 hover:bg-blue-500/5 group">
                  <action.icon className="mr-4 h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold">{action.label}</span>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* System Pulse / Chart / News Area */}
        <Card className="lg:col-span-2 bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl rounded-[32px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
             <BarChart3 className="h-24 w-24 text-blue-500/5 rotate-12" />
          </div>
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-purple-500/80">Analytics Overview</CardTitle>
            <CardDescription className="text-base font-bold text-foreground">Content Engagement Hub</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-border/20 rounded-[24px] bg-muted/10">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-blue-500/10 text-blue-500 mb-2">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">Visualization of your portfolio reach will appear here.</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Tracking across all nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
