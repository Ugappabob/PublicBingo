import { EventValidator, EventValidationResult, EventValidators, GameEvent } from '../types/events';

export class EventValidatorImpl implements EventValidator {
  private validators: EventValidators = {};

  validateEvent(event: unknown): EventValidationResult {
    const result: EventValidationResult = {
      isValid: false,
      errors: [],
      event: event as GameEvent
    };

    if (!event || typeof event !== 'object') {
      result.errors.push('Event must be an object');
      return result;
    }

    const gameEvent = event as GameEvent;
    if (!gameEvent.type) {
      result.errors.push('Event must have a type property');
      return result;
    }

    const validator = this.validators[gameEvent.type];
    if (!validator) {
      result.errors.push(`No validator registered for event type: ${gameEvent.type}`);
      return result;
    }

    if (!validator(gameEvent.payload)) {
      result.errors.push(`Invalid payload for event type: ${gameEvent.type}`);
      return result;
    }

    result.isValid = true;
    return result;
  }

  validatePayload(eventType: string, payload: unknown): EventValidationResult {
    const result: EventValidationResult = {
      isValid: false,
      errors: [],
      event: { type: eventType, payload } as GameEvent
    };

    const validator = this.validators[eventType];
    if (!validator) {
      result.errors.push(`No validator registered for event type: ${eventType}`);
      return result;
    }

    if (!validator(payload)) {
      result.errors.push(`Invalid payload for event type: ${eventType}`);
      return result;
    }

    result.isValid = true;
    return result;
  }

  registerValidator(eventType: string, validator: (payload: unknown) => boolean): void {
    this.validators[eventType] = validator;
  }
}

// Create a singleton instance
export const eventValidator = new EventValidatorImpl(); 