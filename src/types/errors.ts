/**
 * @fileoverview Error handling system for the Public Bingo application.
 * This file contains error classes, types, and interfaces for handling various error scenarios.
 * 
 * @module errors
 * @version 1.0.0
 */

/**
 * Core error types used throughout the application
 */
export type ErrorCode = 
  | 'GAME_ERROR'
  | 'ROOM_ERROR'
  | 'VALIDATION_ERROR'
  | 'EVENT_ERROR'
  | 'AUTH_ERROR'
  | 'WEBSOCKET_ERROR'
  | 'CONNECTION_ERROR'
  | 'ROUTE_ERROR'
  | 'NAVIGATION_ERROR'
  | 'STATE_ERROR'
  | 'PLAYER_ERROR';

export type ErrorResponse = {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: number;
  requestId?: string;
  source?: string;
};

/**
 * Interface Registry
 * 
 * This registry maintains a central record of all error interfaces in the system.
 * It provides validation, documentation, and migration capabilities.
 */
export const ErrorInterfaceRegistry = {
  /**
   * Registry of all error interfaces
   */
  interfaces: new Map<string, ErrorInterfaceDefinition>(),
  
  /**
   * Register a new error interface
   * @param definition - The interface definition to register
   */
  register(definition: ErrorInterfaceDefinition): void {
    this.interfaces.set(definition.name, definition);
  },
  
  /**
   * Get an error interface by name
   * @param name - The name of the interface to retrieve
   * @returns The interface definition or undefined if not found
   */
  get(name: string): ErrorInterfaceDefinition | undefined {
    return this.interfaces.get(name);
  },
  
  /**
   * Validate an object against a registered interface
   * @param name - The name of the interface to validate against
   * @param obj - The object to validate
   * @returns Validation result with any errors found
   */
  validate(name: string, obj: unknown): ValidationResult {
    const definition = this.interfaces.get(name);
    if (!definition) {
      return {
        valid: false,
        errors: [`Interface "${name}" not found in registry`]
      };
    }
    
    return this.validateObject(obj, definition);
  },
  
  /**
   * Validate an object against an interface definition
   * @param obj - The object to validate
   * @param definition - The interface definition to validate against
   * @returns Validation result with any errors found
   */
  validateObject(obj: unknown, definition: ErrorInterfaceDefinition): ValidationResult {
    if (!obj || typeof obj !== 'object') {
      return {
        valid: false,
        errors: [`Expected object, got ${typeof obj}`]
      };
    }
    
    const errors: string[] = [];
    
    // Check required properties
    for (const prop of definition.requiredProperties) {
      if (!(prop in obj)) {
        errors.push(`Missing required property: ${prop}`);
      }
    }
    
    // Check property types
    for (const [prop, type] of Object.entries(definition.propertyTypes)) {
      if (prop in obj) {
        const value = (obj as Record<string, unknown>)[prop];
        if (!this.isValidType(value, type)) {
          errors.push(`Property "${prop}" has invalid type: expected ${type}, got ${typeof value}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Check if a value matches the expected type
   * @param value - The value to check
   * @param type - The expected type
   * @returns True if the value matches the expected type
   */
  isValidType(value: unknown, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return value !== null && typeof value === 'object';
      case 'array':
        return Array.isArray(value);
      case 'function':
        return typeof value === 'function';
      case 'undefined':
        return value === undefined;
      case 'null':
        return value === null;
      default:
        // Handle union types like 'string | number'
        return type.split('|').map(t => t.trim()).some(t => this.isValidType(value, t));
    }
  },
  
  /**
   * Generate documentation for all registered interfaces
   * @returns Markdown documentation for all interfaces
   */
  generateDocumentation(): string {
    let doc = '# Error Interface Documentation\n\n';
    
    // Use Object.entries instead of Map iterator
    for (const [name, def] of Object.entries(ErrorInterfaceRegistry.interfaces)) {
      doc += `## ${name} (v${def.version})\n\n`;
      doc += `${def.description}\n\n`;
      doc += '### Properties\n\n';
      
      for (const prop of def.requiredProperties) {
        doc += `- ${prop} (${def.propertyTypes[prop]}, required)\n`;
        doc += `  ${def.propertyDescriptions[prop]}\n\n`;
      }
      
      for (const [prop, type] of Object.entries(def.propertyTypes)) {
        if (!def.requiredProperties.includes(prop)) {
          doc += `- ${prop} (${type}, optional)\n`;
          doc += `  ${def.propertyDescriptions[prop]}\n\n`;
        }
      }
      
      doc += '\n';
    }
    
    return doc;
  },
  
  /**
   * Generate migration code for updating objects to match a new interface version
   * @param fromVersion - The current version
   * @param toVersion - The target version
   * @returns Migration code as a string
   */
  generateMigrationCode(fromVersion: string, toVersion: string): string {
    const fromDef = this.interfaces.get(fromVersion);
    const toDef = this.interfaces.get(toVersion);
    
    if (!fromDef || !toDef) {
      return `// Migration from ${fromVersion} to ${toVersion} not possible: interface not found`;
    }
    
    let code = `/**
 * Migrates an object from ${fromVersion} to ${toVersion}
 * @param obj - The object to migrate
 * @returns A new object conforming to ${toVersion}
 */
export function migrate${fromVersion}To${toVersion}(obj: any): any {
  const result: any = {};
  
  // Copy existing properties
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  
  // Add new required properties
`;
    
    // Add code for new required properties
    for (const prop of toDef.requiredProperties) {
      if (!fromDef.requiredProperties.includes(prop) && !fromDef.propertyTypes[prop]) {
        code += `  // Set default value for new required property: ${prop}\n`;
        code += `  result.${prop} = ${this.getDefaultValue(toDef.propertyTypes[prop])};\n`;
      }
    }
    
    // Add code for property type changes
    for (const [prop, type] of Object.entries(toDef.propertyTypes)) {
      if (fromDef.propertyTypes[prop] && fromDef.propertyTypes[prop] !== type) {
        code += `  // Convert property type: ${prop} from ${fromDef.propertyTypes[prop]} to ${type}\n`;
        code += `  if (result.${prop} !== undefined) {\n`;
        code += `    result.${prop} = ${this.getTypeConversion(prop, fromDef.propertyTypes[prop], type)};\n`;
        code += `  }\n`;
      }
    }
    
    code += `  
  return result;
}
`;
    
    return code;
  },
  
  /**
   * Get a default value for a type
   * @param type - The type to get a default value for
   * @returns A default value for the type
   */
  getDefaultValue(type: string): string {
    switch (type) {
      case 'string':
        return '""';
      case 'number':
        return '0';
      case 'boolean':
        return 'false';
      case 'object':
        return '{}';
      case 'array':
        return '[]';
      case 'function':
        return '() => {}';
      case 'undefined':
        return 'undefined';
      case 'null':
        return 'null';
      default:
        return 'undefined';
    }
  },
  
  /**
   * Get code for converting a property from one type to another
   * @param prop - The property name
   * @param fromType - The source type
   * @param toType - The target type
   * @returns Code for the type conversion
   */
  getTypeConversion(prop: string, fromType: string, toType: string): string {
    // Handle common type conversions
    if (fromType === 'string' && toType === 'number') {
      return `Number(result.${prop})`;
    }
    if (fromType === 'number' && toType === 'string') {
      return `String(result.${prop})`;
    }
    if (fromType === 'boolean' && toType === 'string') {
      return `String(result.${prop})`;
    }
    if (fromType === 'string' && toType === 'boolean') {
      return `result.${prop}.toLowerCase() === 'true'`;
    }
    
    // Default case: just return the property
    return `result.${prop}`;
  }
};

/**
 * Interface for error interface definitions
 */
export interface ErrorInterfaceDefinition {
  /** The name of the interface */
  name: string;
  /** Description of the interface */
  description: string;
  /** Version of the interface */
  version: string;
  /** Required properties of the interface */
  requiredProperties: string[];
  /** Types of all properties */
  propertyTypes: Record<string, string>;
  /** Descriptions of all properties */
  propertyDescriptions: Record<string, string>;
}

/**
 * Interface for validation results
 */
export interface ValidationResult {
  /** Whether the object is valid */
  valid: boolean;
  /** Any validation errors found */
  errors: string[];
}

/**
 * Migration tool for updating error objects to new interface versions
 */
export const ErrorMigrationTool = {
  /**
   * Migrate an error object to a new interface version
   * @param obj - The error object to migrate
   * @param fromVersion - The current version
   * @param toVersion - The target version
   * @returns The migrated object
   */
  migrate(obj: unknown, fromVersion: string, toVersion: string): unknown {
    const fromDef = ErrorInterfaceRegistry.get(fromVersion);
    const toDef = ErrorInterfaceRegistry.get(toVersion);
    
    if (!fromDef || !toDef) {
      throw new Error(`Migration from ${fromVersion} to ${toVersion} not possible: interface not found`);
    }
    
    if (!obj || typeof obj !== 'object') {
      throw new Error(`Cannot migrate non-object value: ${typeof obj}`);
    }
    
    const result: Record<string, unknown> = {};
    
    // Copy existing properties
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = (obj as Record<string, unknown>)[key];
      }
    }
    
    // Add new required properties
    for (const prop of toDef.requiredProperties) {
      if (!fromDef.requiredProperties.includes(prop) && !fromDef.propertyTypes[prop]) {
        result[prop] = this.getDefaultValue(toDef.propertyTypes[prop]);
      }
    }
    
    // Convert property types
    for (const [prop, type] of Object.entries(toDef.propertyTypes)) {
      if (fromDef.propertyTypes[prop] && fromDef.propertyTypes[prop] !== type) {
        if (result[prop] !== undefined) {
          result[prop] = this.convertType(result[prop], fromDef.propertyTypes[prop], type);
        }
      }
    }
    
    return result;
  },
  
  /**
   * Get a default value for a type
   * @param type - The type to get a default value for
   * @returns A default value for the type
   */
  getDefaultValue(type: string): unknown {
    switch (type) {
      case 'string':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'object':
        return {};
      case 'array':
        return [];
      case 'function':
        return () => {};
      case 'undefined':
        return undefined;
      case 'null':
        return null;
      default:
        return undefined;
    }
  },
  
  /**
   * Convert a value from one type to another
   * @param value - The value to convert
   * @param fromType - The source type
   * @param toType - The target type
   * @returns The converted value
   */
  convertType(value: unknown, fromType: string, toType: string): unknown {
    // Handle common type conversions
    if (fromType === 'string' && toType === 'number') {
      return Number(value);
    }
    if (fromType === 'number' && toType === 'string') {
      return String(value);
    }
    if (fromType === 'boolean' && toType === 'string') {
      return String(value);
    }
    if (fromType === 'string' && toType === 'boolean') {
      return String(value).toLowerCase() === 'true';
    }
    
    // Default case: just return the value
    return value;
  }
};

// Register base error interfaces
ErrorInterfaceRegistry.register({
  name: 'GameError',
  description: 'Base error class for all game-related errors',
  version: '1.0.0',
  requiredProperties: ['message', 'name', 'code'],
  propertyTypes: {
    message: 'string',
    name: 'string',
    code: 'string',
    details: 'object'
  },
  propertyDescriptions: {
    message: 'Error message',
    name: 'Error name',
    code: 'Error code',
    details: 'Additional error details'
  }
});

export class GameError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(message: string, code = 'GAME_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = 'GameError';
    this.code = code;
    this.details = details;
  }
}

export class RoomError extends GameError {
  constructor(message: string, code = 'ROOM_ERROR', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'RoomError';
  }
}

export class ValidationError extends GameError {
  readonly field?: string;
  
  constructor(message: string, field?: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', { field, ...details });
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class EventError extends GameError {
  readonly eventType: string;
  readonly eventId?: string;
  readonly errorType: EventErrorType;
  readonly retryable: boolean;
  readonly queueable: boolean;

  constructor(
    message: string, 
    eventType: string, 
    errorType: EventErrorType,
    retryable = true,
    queueable = true,
    details?: Record<string, unknown>
  ) {
    super(message, `EVENT_${errorType}`, { eventType, ...details });
    this.name = 'EventError';
    this.eventType = eventType;
    this.errorType = errorType;
    this.retryable = retryable;
    this.queueable = queueable;
  }

  canRetry(): boolean {
    return this.retryable && (
      this.errorType === 'DELIVERY_FAILED' ||
      this.errorType === 'TIMEOUT' ||
      this.errorType === 'NETWORK_ERROR'
    );
  }

  canQueue(): boolean {
    return this.queueable && (
      this.errorType === 'RATE_LIMIT' ||
      this.errorType === 'TEMPORARY_FAILURE' ||
      this.errorType === 'NETWORK_ERROR'
    );
  }
}

export class EventValidationError extends EventError {
  readonly validationErrors: ValidationErrorDetail[];

  constructor(
    message: string,
    eventType: string,
    validationErrors: ValidationErrorDetail[],
    details?: Record<string, unknown>
  ) {
    super(message, eventType, 'VALIDATION_FAILED', false, false, {
      validationErrors,
      ...details
    });
    this.name = 'EventValidationError';
    this.validationErrors = validationErrors;
  }
}

export class EventQueueError extends EventError {
  readonly queueName: string;
  readonly maxRetries?: number;

  constructor(
    message: string,
    eventType: string,
    queueName: string,
    maxRetries?: number,
    details?: Record<string, unknown>
  ) {
    super(message, eventType, 'QUEUE_ERROR', true, false, {
      queueName,
      maxRetries,
      ...details
    });
    this.name = 'EventQueueError';
    this.queueName = queueName;
    this.maxRetries = maxRetries;
  }
}

export class EventAckError extends EventError {
  readonly ackId: string;
  readonly timeout: number;

  constructor(
    message: string,
    eventType: string,
    ackId: string,
    timeout: number,
    details?: Record<string, unknown>
  ) {
    super(message, eventType, 'ACK_TIMEOUT', true, true, {
      ackId,
      timeout,
      ...details
    });
    this.name = 'EventAckError';
    this.ackId = ackId;
    this.timeout = timeout;
  }
}

export class EventRetryError extends EventError {
  readonly attemptNumber: number;
  readonly maxAttempts: number;
  readonly nextRetryDelay?: number;

  constructor(
    message: string,
    eventType: string,
    attemptNumber: number,
    maxAttempts: number,
    nextRetryDelay?: number,
    details?: Record<string, unknown>
  ) {
    super(message, eventType, 'RETRY_FAILED', false, true, {
      attemptNumber,
      maxAttempts,
      nextRetryDelay,
      ...details
    });
    this.name = 'EventRetryError';
    this.attemptNumber = attemptNumber;
    this.maxAttempts = maxAttempts;
    this.nextRetryDelay = nextRetryDelay;
  }

  canRetryAgain(): boolean {
    return this.attemptNumber < this.maxAttempts;
  }
}

export class AuthError extends GameError {
  readonly authErrorType: AuthErrorType;
  readonly retryable: boolean;

  constructor(message: string, authErrorType: AuthErrorType, retryable = true, details?: Record<string, unknown>) {
    super(message, `AUTH_${authErrorType}`, details);
    this.name = 'AuthError';
    this.authErrorType = authErrorType;
    this.retryable = retryable;
  }

  isTokenExpired(): boolean {
    return this.authErrorType === 'TOKEN_EXPIRED';
  }

  isRefreshRequired(): boolean {
    return this.authErrorType === 'TOKEN_EXPIRED' || this.authErrorType === 'TOKEN_INVALID';
  }

  canRetry(): boolean {
    return this.retryable && (
      this.authErrorType === 'TOKEN_EXPIRED' ||
      this.authErrorType === 'NETWORK_ERROR' ||
      this.authErrorType === 'CONNECTION_ERROR'
    );
  }
}

export class TokenRefreshError extends AuthError {
  readonly originalError?: Error;

  constructor(message: string, originalError?: Error, details?: Record<string, unknown>) {
    super(message, 'TOKEN_REFRESH_FAILED', false, {
      originalError: originalError?.message,
      ...details
    });
    this.name = 'TokenRefreshError';
    this.originalError = originalError;
  }
}

export class AuthStateError extends AuthError {
  readonly stateKey?: string;

  constructor(message: string, stateKey?: string, details?: Record<string, unknown>) {
    super(message, 'STATE_PERSISTENCE', true, {
      stateKey,
      ...details
    });
    this.name = 'AuthStateError';
    this.stateKey = stateKey;
  }
}

export class AuthRecoveryError extends AuthError {
  readonly recoveryPhase: AuthRecoveryPhase;

  constructor(message: string, phase: AuthRecoveryPhase, details?: Record<string, unknown>) {
    super(message, 'RECOVERY_FAILED', true, {
      phase,
      ...details
    });
    this.name = 'AuthRecoveryError';
    this.recoveryPhase = phase;
  }
}

export class WebSocketError extends GameError {
  constructor(message: string, code = 'WEBSOCKET_ERROR', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'WebSocketError';
  }
}

export class ConnectionError extends WebSocketError {
  constructor(message: string, code = 'CONNECTION_ERROR', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'ConnectionError';
  }
}

export class ReconnectionError extends WebSocketError {
  readonly attemptNumber: number;
  
  constructor(message: string, attemptNumber: number, details?: Record<string, unknown>) {
    super(message, 'RECONNECTION_ERROR', { attemptNumber, ...details });
    this.name = 'ReconnectionError';
    this.attemptNumber = attemptNumber;
  }
}

export class ConnectionTimeoutError extends ConnectionError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONNECTION_TIMEOUT_ERROR', details);
    this.name = 'ConnectionTimeoutError';
  }
}

export class ConnectionHealthError extends ConnectionError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONNECTION_HEALTH_ERROR', details);
    this.name = 'ConnectionHealthError';
  }
}

export class RouteError extends GameError {
  readonly route: string;
  readonly errorType: RouteErrorType;
  readonly recoverable: boolean;

  constructor(
    message: string,
    route: string,
    errorType: RouteErrorType,
    recoverable = true,
    details?: Record<string, unknown>
  ) {
    super(message, `ROUTE_${errorType}`, { route, ...details });
    this.name = 'RouteError';
    this.route = route;
    this.errorType = errorType;
    this.recoverable = recoverable;
  }

  canRecover(): boolean {
    return this.recoverable && (
      this.errorType === 'STATE_CORRUPTED' ||
      this.errorType === 'AUTH_REQUIRED' ||
      this.errorType === 'TRANSITION_INTERRUPTED'
    );
  }
}

export class RouteAuthError extends RouteError {
  readonly requiredRole?: string;
  readonly currentRole?: string;

  constructor(
    message: string,
    route: string,
    requiredRole?: string,
    currentRole?: string,
    details?: Record<string, unknown>
  ) {
    super(message, route, 'AUTH_REQUIRED', true, {
      requiredRole,
      currentRole,
      ...details
    });
    this.name = 'RouteAuthError';
    this.requiredRole = requiredRole;
    this.currentRole = currentRole;
  }

  hasInsufficientPermissions(): boolean {
    return this.requiredRole !== undefined && this.currentRole !== this.requiredRole;
  }
}

export class RouteStateError extends RouteError {
  readonly stateKey: string;
  readonly expectedType?: string;
  readonly actualType?: string;

  constructor(
    message: string,
    route: string,
    stateKey: string,
    expectedType?: string,
    actualType?: string,
    details?: Record<string, unknown>
  ) {
    super(message, route, 'STATE_CORRUPTED', true, {
      stateKey,
      expectedType,
      actualType,
      ...details
    });
    this.name = 'RouteStateError';
    this.stateKey = stateKey;
    this.expectedType = expectedType;
    this.actualType = actualType;
  }

  isTypeMismatch(): boolean {
    return this.expectedType !== undefined && 
           this.actualType !== undefined && 
           this.expectedType !== this.actualType;
  }
}

export class RouteTransitionError extends RouteError {
  readonly fromRoute: string;
  readonly toRoute: string;
  readonly guardType: RouteGuardType;
  readonly guardCondition?: string;

  constructor(
    message: string,
    fromRoute: string,
    toRoute: string,
    guardType: RouteGuardType,
    guardCondition?: string,
    details?: Record<string, unknown>
  ) {
    super(message, toRoute, 'TRANSITION_INTERRUPTED', true, {
      fromRoute,
      guardType,
      guardCondition,
      ...details
    });
    this.name = 'RouteTransitionError';
    this.fromRoute = fromRoute;
    this.toRoute = toRoute;
    this.guardType = guardType;
    this.guardCondition = guardCondition;
  }

  isPreventable(): boolean {
    return this.guardType === 'PREVENT_LEAVE' || this.guardType === 'PREVENT_ENTER';
  }

  requiresConfirmation(): boolean {
    return this.guardType === 'CONFIRM_LEAVE' || this.guardType === 'CONFIRM_ENTER';
  }
}

export class RouteRecoveryError extends RouteError {
  readonly recoveryPhase: RouteRecoveryPhase;
  readonly previousRoute?: string;
  readonly attemptedRoute?: string;

  constructor(
    message: string,
    route: string,
    recoveryPhase: RouteRecoveryPhase,
    previousRoute?: string,
    attemptedRoute?: string,
    details?: Record<string, unknown>
  ) {
    super(message, route, 'RECOVERY_FAILED', false, {
      recoveryPhase,
      previousRoute,
      attemptedRoute,
      ...details
    });
    this.name = 'RouteRecoveryError';
    this.recoveryPhase = recoveryPhase;
    this.previousRoute = previousRoute;
    this.attemptedRoute = attemptedRoute;
  }
}

export type AuthErrorType = 
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'TOKEN_REFRESH_FAILED'
  | 'TOKEN_MISSING'
  | 'STATE_PERSISTENCE'
  | 'RECOVERY_FAILED'
  | 'NETWORK_ERROR'
  | 'CONNECTION_ERROR'
  | 'UNAUTHORIZED'
  | 'SESSION_EXPIRED';

export type AuthRecoveryPhase = 
  | 'STATE_LOAD'
  | 'TOKEN_REFRESH'
  | 'CONNECTION_RETRY'
  | 'STATE_RESTORE';

export type EventErrorType =
  | 'VALIDATION_FAILED'
  | 'DELIVERY_FAILED'
  | 'QUEUE_ERROR'
  | 'ACK_TIMEOUT'
  | 'RETRY_FAILED'
  | 'RATE_LIMIT'
  | 'TEMPORARY_FAILURE'
  | 'NETWORK_ERROR'
  | 'TIMEOUT';

export type ValidationErrorDetail = {
  field: string;
  error: string;
  constraint?: string;
  value?: unknown;
};

export type EventQueueState = 
  | 'PENDING'
  | 'PROCESSING'
  | 'RETRYING'
  | 'FAILED'
  | 'COMPLETED';

export type EventAckStatus =
  | 'PENDING'
  | 'ACKNOWLEDGED'
  | 'TIMEOUT'
  | 'FAILED';

export type RouteErrorType =
  | 'AUTH_REQUIRED'
  | 'STATE_CORRUPTED'
  | 'TRANSITION_INTERRUPTED'
  | 'RECOVERY_FAILED'
  | 'NOT_FOUND'
  | 'INVALID_PARAMS'
  | 'CIRCULAR_REDIRECT';

export type RouteGuardType =
  | 'PREVENT_LEAVE'
  | 'PREVENT_ENTER'
  | 'CONFIRM_LEAVE'
  | 'CONFIRM_ENTER'
  | 'REDIRECT';

export type RouteRecoveryPhase =
  | 'STATE_RESTORE'
  | 'AUTH_REFRESH'
  | 'GUARD_RECHECK'
  | 'PARAM_VALIDATION'
  | 'FALLBACK_ROUTE';

export type RouteTransitionStatus =
  | 'PENDING'
  | 'GUARD_CHECK'
  | 'PARAMS_CHECK'
  | 'AUTH_CHECK'
  | 'STATE_CHECK'
  | 'COMPLETED'
  | 'FAILED';

export type WebSocketHealthStatus =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'UNHEALTHY'
  | 'UNKNOWN';

export type ConnectionState =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'RECONNECTING'
  | 'FAILED';

export type ConnectionStorageType =
  | 'LOCAL_STORAGE'
  | 'SESSION_STORAGE'
  | 'MEMORY'
  | 'CUSTOM';

export type ConnectionStorageOperation =
  | 'READ'
  | 'WRITE'
  | 'DELETE'
  | 'CLEAR'
  | 'STORAGE_UNAVAILABLE'
  | 'DATA_CORRUPTED';

export type ConnectionRecoveryPhase =
  | 'STATE_RESTORE'
  | 'AUTH_REFRESH'
  | 'RECONNECT'
  | 'STATE_SYNC'
  | 'FALLBACK';

export type StateErrorType =
  | 'VERSION_MISMATCH'
  | 'CONFLICT_DETECTED'
  | 'VALIDATION_FAILED'
  | 'CORRUPTED'
  | 'RECOVERY_FAILED'
  | 'SYNC_FAILED'
  | 'PERSISTENCE_FAILED'
  | 'INITIALIZATION_FAILED';

export type StateConflictType =
  | 'CONCURRENT_MODIFICATION'
  | 'DELETED_REMOTELY'
  | 'DELETED_LOCALLY'
  | 'TYPE_MISMATCH'
  | 'SCHEMA_MISMATCH'
  | 'CUSTOM_CONFLICT';

export type StateConflictResolutionStrategy =
  | 'CLIENT_WINS'
  | 'SERVER_WINS'
  | 'MERGE'
  | 'LAST_WRITE_WINS'
  | 'MANUAL_RESOLUTION';

export type StateCorruptionType =
  | 'STRUCTURE_CORRUPTED'
  | 'TYPE_CORRUPTED'
  | 'REFERENCE_CORRUPTED'
  | 'CIRCULAR_REFERENCE'
  | 'INVALID_STATE_TRANSITION'
  | 'UNKNOWN_CORRUPTION';

export type StateRecoveryPhase =
  | 'VALIDATION'
  | 'BACKUP_RESTORE'
  | 'CONFLICT_RESOLUTION'
  | 'VERSION_SYNC'
  | 'STATE_REBUILD'
  | 'FALLBACK_STATE';

export type PlayerErrorType =
  | 'STATE_CORRUPTED'
  | 'VALIDATION_FAILED'
  | 'SYNC_FAILED'
  | 'PERSISTENCE_FAILED'
  | 'RECOVERY_FAILED'
  | 'CONNECTION_FAILED'
  | 'NOT_FOUND'
  | 'INVALID_OPERATION'
  | 'PERMISSION_DENIED'
  | 'TIMEOUT';

export type PlayerSyncType =
  | 'STATE_SYNC'
  | 'PROFILE_SYNC'
  | 'GAME_STATE_SYNC'
  | 'SCORE_SYNC'
  | 'ACHIEVEMENT_SYNC'
  | 'INVENTORY_SYNC';

export type PlayerPersistenceType =
  | 'LOCAL_STORAGE'
  | 'SESSION_STORAGE'
  | 'INDEXED_DB'
  | 'COOKIE'
  | 'CUSTOM_STORAGE';

export type PlayerRecoveryPhase =
  | 'STATE_RESTORE'
  | 'PROFILE_RESTORE'
  | 'GAME_STATE_RESTORE'
  | 'BACKUP_RESTORE'
  | 'DEFAULT_STATE'
  | 'REINITIALIZATION';

export type PlayerConnectionType =
  | 'WEBSOCKET'
  | 'HTTP'
  | 'P2P'
  | 'CUSTOM';