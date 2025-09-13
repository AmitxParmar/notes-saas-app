import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

const router = Router();

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceStatus;
    cache: ServiceStatus;
    externalApi: ServiceStatus;
  };
  metrics: {
    responseTime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastChecked: string;
}

class HealthCheckService {
  private static instance: HealthCheckService;
  private startTime: number;

  private constructor() {
    this.startTime = Date.now();
  }

  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  private async checkDatabaseHealth(): Promise<ServiceStatus> {
    const start = performance.now();
    try {
      // Simulate database check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
      const responseTime = performance.now() - start;
      
      return {
        status: responseTime < 100 ? 'up' : 'degraded',
        responseTime: Math.round(responseTime),
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkCacheHealth(): Promise<ServiceStatus> {
    const start = performance.now();
    try {
      // Simulate cache check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30));
      const responseTime = performance.now() - start;
      
      return {
        status: responseTime < 50 ? 'up' : 'degraded',
        responseTime: Math.round(responseTime),
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkExternalApiHealth(): Promise<ServiceStatus> {
    const start = performance.now();
    try {
      // Simulate external API check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
      const responseTime = performance.now() - start;
      
      return {
        status: responseTime < 500 ? 'up' : 'degraded',
        responseTime: Math.round(responseTime),
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private determineOverallStatus(services: HealthCheckResponse['services']): HealthCheckResponse['status'] {
    const serviceStatuses = Object.values(services).map(service => service.status);
    
    if (serviceStatuses.every(status => status === 'up')) {
      return 'healthy';
    } else if (serviceStatuses.some(status => status === 'down')) {
      return 'unhealthy';
    } else {
      return 'degraded';
    }
  }

  public async performHealthCheck(): Promise<HealthCheckResponse> {
    const checkStart = performance.now();
    
    const [database, cache, externalApi] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkCacheHealth(),
      this.checkExternalApiHealth()
    ]);

    const services = { database, cache, externalApi };
    const responseTime = Math.round(performance.now() - checkStart);

    return {
      status: this.determineOverallStatus(services),
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      metrics: {
        responseTime,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };
  }
}

export const getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const healthService = HealthCheckService.getInstance();
    const healthCheck = await healthService.performHealthCheck();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    next(error);
  }
};

