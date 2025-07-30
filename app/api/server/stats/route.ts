
import { NextResponse } from 'next/server';
import si from 'systeminformation';
import dbConnect from "@/backend/lib/mongodb";
import mongoose from 'mongoose';

// Force Node.js runtime instead of edge
export const runtime = 'nodejs';

const initialApiEndpoints = [
  { path: "/api/auth/login", method: "POST", status: "online" as const, description: "User authentication" },
  { path: "/api/auth/logout", method: "POST", status: "online" as const, description: "User logout" },
  { path: "/api/auth/me", method: "GET", status: "online" as const, description: "Get current user" },
  { path: "/api/complaints", method: "GET, POST", status: "online" as const, description: "Manage complaints" },
  { path: "/api/bills", method: "GET, POST", status: "online" as const, description: "Manage bills" },
  { path: "/api/users", method: "GET, POST", status: "online" as const, description: "Manage users" },
  { path: "/api/visitors", method: "GET, POST", status: "online" as const, description: "Manage visitors" },
  { path: "/api/announcements", method: "GET, POST", status: "online" as const, description: "Manage announcements" },
];

let mockLogs: { timestamp: string; level: 'INFO' | 'WARN' | 'ERROR'; message: string }[] = [
    { timestamp: new Date().toLocaleTimeString(), level: 'INFO' as const, message: "Server initialized successfully." },
    { timestamp: new Date().toLocaleTimeString(), level: 'INFO' as const, message: "Database connection established." },
];

// This function will handle clearing the logs.
export async function POST(request: Request) {
    const { pathname } = new URL(request.url);
    if (pathname.endsWith('/clear-logs')) {
        mockLogs = [{ timestamp: new Date().toLocaleTimeString(), level: 'INFO' as const, message: "Log cleared by administrator." }];
        return NextResponse.json({ message: 'Logs cleared' });
    }
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}


export async function GET() {
  try {
    const [cpuData, memData, netStats, osInfo, cpuInfo] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.networkStats(),
        si.osInfo(),
        si.cpu()
    ]);
    
    // Check DB connection state
    let dbStatus: 'online' | 'offline' = 'offline';
    try {
        await dbConnect();
        const ping = await mongoose.connection.db.admin().ping();
        if (ping && ping.ok === 1) {
            dbStatus = 'online';
        }
    } catch (e) {
        dbStatus = 'offline';
    }


    // Simulate some logs
    const random = Math.random();
    if (random > 0.95) {
        mockLogs.unshift({ timestamp: new Date().toLocaleTimeString(), level: 'ERROR', message: `Database connection failed. Retrying...` });
    } else if (random > 0.85) {
         mockLogs.unshift({ timestamp: new Date().toLocaleTimeString(), level: 'WARN', message: `High memory usage detected: ${(memData.active / memData.total * 100).toFixed(1)}%` });
    } else if (random > 0.6) {
        const endpoint = initialApiEndpoints[Math.floor(Math.random() * initialApiEndpoints.length)];
        mockLogs.unshift({
            timestamp: new Date().toLocaleTimeString(),
            level: 'INFO',
            message: `API request to ${endpoint.path} (${endpoint.method}) completed with status 200`
        })
    }
    if (mockLogs.length > 50) {
        mockLogs.pop();
    }
    
    // Simulate API endpoint status changes
    const apiEndpoints = initialApiEndpoints.map(e => {
        const r = Math.random();
        if (r > 0.98) return {...e, status: 'offline' as const };
        if (r > 0.95) return {...e, status: 'degraded' as const };
        return {...e, status: 'online' as const };
    });


    const stats = {
      cpu: {
        currentLoad: cpuData.currentLoad,
        brand: cpuInfo.brand,
        speed: cpuInfo.speed,
        cores: cpuInfo.cores
      },
      memory: {
        usage: (memData.active / memData.total) * 100,
        totalGb: memData.total / (1024 * 1024 * 1024),
        usedGb: memData.active / (1024 * 1024 * 1024)
      },
      network: {
          rx_sec: netStats[0]?.rx_sec || 0,
          tx_sec: netStats[0]?.tx_sec || 0,
      },
      os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          kernel: osInfo.kernel
      },
      dbStatus,
      apiEndpoints,
      logs: mockLogs
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching server stats:', error);
    // Return a structured error response even on failure
    const errorResponse = {
        cpu: { currentLoad: 0, brand: 'N/A', speed: 0, cores: 0 },
        memory: { usage: 0, totalGb: 0, usedGb: 0 },
        network: { rx_sec: 0, tx_sec: 0 },
        os: { platform: 'N/A', distro: 'N/A', kernel: 'N/A' },
        dbStatus: 'offline' as const,
        apiEndpoints: initialApiEndpoints.map(e => ({...e, status: 'offline' as const})),
        logs: [{ timestamp: new Date().toLocaleTimeString(), level: 'ERROR' as const, message: 'Failed to fetch server stats.' }]
    }
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
