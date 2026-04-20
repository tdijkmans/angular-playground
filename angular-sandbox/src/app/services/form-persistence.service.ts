import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FormPersistenceService {
  private buildKey(formId: string, caseId: string): string {
    return `draft_${formId}_${caseId}`;
  }

  getItem(formId: string, caseId: string): Record<string, unknown> | null {
    const key = this.buildKey(formId, caseId);
    try {
      const raw = sessionStorage.getItem(key);
      if (raw === null) {
        return null;
      }
      return JSON.parse(raw) as Record<string, unknown>;
    } catch (error) {
      console.warn(`[FormPersistenceService] Failed to read key "${key}":`, error);
      return null;
    }
  }

  setItem(formId: string, caseId: string, value: Record<string, unknown>): void {
    const key = this.buildKey(formId, caseId);
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[FormPersistenceService] Failed to write key "${key}":`, error);
    }
  }

  removeItem(formId: string, caseId: string): void {
    const key = this.buildKey(formId, caseId);
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`[FormPersistenceService] Failed to remove key "${key}":`, error);
    }
  }
}
