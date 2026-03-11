import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LocationMessage {
  type: 'location';
  id: string;
  name: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  timestamp: number;
}

export interface LeaveMessage {
  type: 'leave';
  id: string;
}

export type WsMessage = LocationMessage | LeaveMessage;

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private ws: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly messages$ = new Subject<WsMessage>();
  readonly connected$ = new Subject<boolean>();

  connect(): void {
    if (this.ws) return;
    this._open();
  }

  private _open(): void {
    this.ws = new WebSocket(environment.wsUrl);

    this.ws.onopen = () => {
      this.connected$.next(true);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as WsMessage;
        this.messages$.next(msg);
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.connected$.next(false);
      this.ws = null;
      // Auto-reconnect after 3 seconds
      this.reconnectTimeout = setTimeout(() => this._open(), 3000);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  send(message: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.connected$.next(false);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
