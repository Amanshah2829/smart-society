
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Server, Database, CheckCircle, AlertTriangle, Terminal, Cpu, MemoryStick, Network, Info, Trash2, Filter, Shield, Settings } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"


interface ServerStats {
  cpu: {
    currentLoad: number;
    brand: string;
    speed: number;
    cores: number;
  };
  memory: {
    usage: number;
    totalGb: number;
    usedGb: number;
  };
  network: {
    rx_sec: number;
    tx_sec: number;
  };
  os: {
    platform: string;
    distro: string;
    kernel: string;
  };
  dbStatus: 'online' | 'offline';
  apiEndpoints: ApiEndpoint[];
  logs: LogEntry[];
}

interface ApiEndpoint {
  path: string
  method: string
  status: "online" | "offline" | "degraded"
  description: string
}

type LogLevel = 'INFO' | 'WARN' | 'ERROR';
type LogEntry = {
    timestamp: string;
    level: LogLevel;
    message: string;
}

export default function ServerAdminPage() {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState<LogLevel | 'ALL'>('ALL');
  const { toast } = useToast()

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/server/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error("Failed to fetch server stats");
        toast({ variant: "destructive", title: "Failed to fetch server stats" })
      }
    } catch (error) {
      console.error("Error fetching server stats", error);
      toast({ variant: "destructive", title: "Error fetching server stats" })
    } finally {
      setLoading(false);
    }
  };
  
  const clearLogs = async () => {
    try {
       const response = await fetch('/api/server/stats/clear-logs', { method: 'POST' });
       if(response.ok) {
           toast({ title: "Logs Cleared", description: "The server log stream has been cleared." })
           fetchStats(); // Refresh stats to show empty logs
       } else {
            toast({ variant: "destructive", title: "Failed to clear logs" })
       }
    } catch (error) {
        toast({ variant: "destructive", title: "Error clearing logs" })
    }
  }


  useEffect(() => {
    fetchStats(); // Initial fetch
    const interval = setInterval(fetchStats, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ApiEndpoint['status']) => {
      switch(status) {
          case 'online': return 'bg-green-500/20 text-green-400 border-green-500/30';
          case 'offline': return 'bg-red-500/20 text-red-400 border-red-500/30';
          case 'degraded': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
          default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
  }

  const getLogColor = (level: LogEntry['level']) => {
    switch(level) {
        case 'INFO': return 'text-blue-400';
        case 'WARN': return 'text-yellow-400';
        case 'ERROR': return 'text-red-400';
    }
  }
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  const filteredLogs = stats?.logs.filter(log => logFilter === 'ALL' || log.level === logFilter) || [];

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <TooltipProvider>
      <div className="space-y-8 text-white">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Server Control Panel</h1>
          <p className="text-muted-foreground mt-2">Real-time monitoring and configuration of your application's backend services.</p>
        </div>
        
        {/* System Overview */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info /> System Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div>
                    <p className="text-muted-foreground">OS</p>
                    <p className="font-medium">{stats?.os.distro || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Platform</p>
                    <p className="font-medium">{stats?.os.platform || 'N/A'}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">Kernel</p>
                    <p className="font-medium">{stats?.os.kernel || 'N/A'}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">CPU</p>
                    <p className="font-medium">{stats?.cpu.brand || 'N/A'} @ {stats?.cpu.speed || 0}GHz</p>
                </div>
            </CardContent>
        </Card>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/5 border border-white/10 backdrop-blur-lg">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span>CPU Usage</span>
                        <Cpu className="text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <span className="text-3xl font-bold">{stats?.cpu.currentLoad.toFixed(1) || 0}%</span>
                    <Progress value={stats?.cpu.currentLoad || 0} className="h-2 mt-2" />
                     <p className="text-xs text-muted-foreground mt-2">{stats?.cpu.cores || 0} Cores</p>
                </CardContent>
            </Card>
            <Card className="bg-white/5 border border-white/10 backdrop-blur-lg">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span>Memory</span>
                        <MemoryStick className="text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <span className="text-3xl font-bold">{stats?.memory.usage.toFixed(1) || 0}%</span>
                    <Progress value={stats?.memory.usage || 0} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">{stats?.memory.usedGb.toFixed(2) || 0} GB / {stats?.memory.totalGb.toFixed(2) || 0} GB</p>
                </CardContent>
            </Card>
            <Card className="bg-white/5 border border-white/10 backdrop-blur-lg">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span>Network</span>
                        <Network className="text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-sm"><span className="text-muted-foreground">In:</span> {formatBytes(stats?.network.rx_sec || 0)}</p>
                     <p className="text-sm"><span className="text-muted-foreground">Out:</span> {formatBytes(stats?.network.tx_sec || 0)}</p>
                </CardContent>
            </Card>
            <Card className="bg-white/5 border border-white/10 backdrop-blur-lg">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span>Database</span>
                        <Database className="text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold flex items-center gap-2">
                        {stats?.dbStatus === "online" ? (
                          <>
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-green-400">Online</span>
                          </>
                        ) : (
                          <>
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-red-400">Offline</span>
                          </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Endpoint Monitoring */}
            <Card className="bg-white/5 border border-white/10 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Server /> API Service Health</CardTitle>
                <CardDescription>Status of individual microservices and endpoints.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats?.apiEndpoints.map((endpoint) => (
                  <Tooltip key={endpoint.path}>
                    <TooltipTrigger asChild>
                        <div className={`p-4 rounded-lg border ${getStatusColor(endpoint.status)}`}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-mono text-sm">{endpoint.path}</p>
                                <Badge variant="outline" className="font-mono text-xs">{endpoint.method}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">{endpoint.status}</p>
                        </div>
                     </TooltipTrigger>
                     <TooltipContent>
                        <p>{endpoint.description}</p>
                     </TooltipContent>
                  </Tooltip>
                ))}
              </CardContent>
            </Card>

            {/* Server Configuration */}
            <Card className="bg-white/5 border border-white/10 backdrop-blur-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings /> Server Configuration</CardTitle>
                    <CardDescription>Manage security and backend feature flags.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                      <Label htmlFor="sessionTimeout" className="text-white/80">Session Timeout (minutes)</Label>
                      <Input id="sessionTimeout" type="number" defaultValue="60" className="bg-black/30 border-white/20" />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border border-white/10 p-4">
                        <div>
                            <Label htmlFor="twoFactorAuth" className="text-white/80">Two-Factor Authentication (2FA)</Label>
                            <p className="text-sm text-muted-foreground">Require a second factor for all logins.</p>
                        </div>
                        <Switch id="twoFactorAuth"/>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 p-4">
                      <div>
                        <h4 className="font-medium text-white/80">Maintenance Mode</h4>
                        <p className="text-sm text-muted-foreground">
                          Temporarily disable access for non-admin users.
                        </p>
                      </div>
                      <Switch id="maintenanceMode" />
                    </div>
                    <div className="pt-4">
                        <Button variant="outline">Save Configuration</Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Log Viewer */}
        <Card className="bg-black/20 border border-white/10 backdrop-blur-lg">
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Terminal /> Live Log Stream
                </CardTitle>
                <div className="flex items-center gap-2">
                   <Select value={logFilter} onValueChange={(val) => setLogFilter(val as LogLevel | 'ALL')}>
                        <SelectTrigger className="w-32 bg-black/30 border-white/20">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Levels</SelectItem>
                            <SelectItem value="INFO">Info</SelectItem>
                            <SelectItem value="WARN">Warning</SelectItem>
                            <SelectItem value="ERROR">Error</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="destructive" size="icon" onClick={clearLogs}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
             </div>
            <CardDescription>Real-time feed of server logs and activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black/50 font-mono text-xs rounded-lg p-4 h-80 overflow-y-auto flex flex-col-reverse">
              {filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
                <p key={index} className="whitespace-pre-wrap leading-relaxed">
                  <span className="text-muted-foreground/50 mr-2">{log.timestamp}</span>
                  <span className={`${getLogColor(log.level)} font-bold mr-2`}>[{log.level}]</span>
                  <span>{log.message}</span>
                </p>
              )) : <p className="text-muted-foreground">No logs to display.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
      </TooltipProvider>
    </DashboardLayout>
  )
}
