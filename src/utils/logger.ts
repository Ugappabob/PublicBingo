import { getAnalytics, logEvent } from 'firebase/analytics';
import { performanceMonitor } from './performance';

/**
 * Log levels for the logger
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Interface for log entry
 */
export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: Error;
}

/**
 * Utility class for structured logging
 */
class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private subscribers: ((entry: LogEntry) => void)[] = [];
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';

  private constructor() {}

  /**
   * Get the singleton instance of Logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Subscribe to log updates
   * @param callback The callback function to be called when a log entry is added
   * @returns A function to unsubscribe from the logger
   */
  public subscribe(callback: (entry: LogEntry) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Add a log entry
   * @param entry The log entry to be added
   */
  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    this.subscribers.forEach(callback => callback(entry));
  }

  /**
   * Log a debug message
   * @param component The component that generated the log
   * @param message The message to log
   * @param data Additional data to log
   */
  public debug(component: string, message: string, data?: any): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'debug',
      component,
      message,
      data
    });
  }

  /**
   * Log an info message
   * @param component The component that generated the log
   * @param message The message to log
   * @param data Additional data to log
   */
  public info(component: string, message: string, data?: any): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'info',
      component,
      message,
      data
    });
  }

  /**
   * Log a warning message
   * @param component The component that generated the log
   * @param message The message to log
   * @param data Additional data to log
   */
  public warn(component: string, message: string, data?: any): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'warn',
      component,
      message,
      data
    });
  }

  /**
   * Log an error message
   * @param component The component that generated the log
   * @param message The message to log
   * @param error The error object
   * @param data Additional data to log
   */
  public error(component: string, message: string, error?: Error, data?: any): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'error',
      component,
      message,
      error,
      data
    });
  }

  /**
   * Get the log history
   * @param level Optional log level filter
   * @returns The log history
   */
  public getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Clear the log history
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /** @deprecated Prefer getLogs — alias for monitoring UI */
  public getLogHistory(): LogEntry[] {
    return this.getLogs();
  }

  /** @deprecated Prefer clearLogs */
  public clearLogHistory(): void {
    this.clearLogs();
  }

  /**
   * Log to console
   * @param logEntry The log entry
   */
  private logToConsole(logEntry: LogEntry): void {
    const { level, message, component, data, error } = logEntry;
    const timestamp = new Date(logEntry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${component ? ` [${component}]` : ''}`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, data || '');
        break;
      case 'info':
        console.info(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '', error || '');
        break;
    }
  }

  /**
   * Log to Firebase Analytics
   * @param logEntry The log entry
   */
  private logToAnalytics(logEntry: LogEntry): void {
    try {
      const analytics = getAnalytics();
      const { level, message, component, data, error } = logEntry;

      logEvent(analytics, `log_${level}`, {
        message,
        component: component || 'unknown',
        error_message: error?.message,
        error_stack: error?.stack,
        ...data
      });
    } catch (analyticsError) {
      console.error('Failed to log to Analytics:', analyticsError);
    }
  }

  /**
   * Create a performance trace for an error
   * @param logEntry The log entry
   */
  private createErrorTrace(logEntry: LogEntry): void {
    try {
      const { message, component, error } = logEntry;
      const traceName = `error_${component || 'unknown'}`;
      const traceId = performanceMonitor.startTrace(traceName, {
        error_message: message,
        error_details: error?.message || 'Unknown error'
      });

      if (traceId) {
        performanceMonitor.stopTrace(traceId);
      }
    } catch (traceError) {
      console.error('Failed to create error trace:', traceError);
    }
  }
}

export const logger = Logger.getInstance(); 