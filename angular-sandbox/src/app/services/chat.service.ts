import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject, EMPTY } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSelf?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private socket$: WebSocketSubject<ChatMessage> | null = null;
  private destroy$ = new Subject<void>();

  connect(url: string): Observable<ChatMessage> {
    this.socket$ = webSocket<ChatMessage>({
      url,
      openObserver: {
        next: () => console.log('WebSocket connection opened'),
      },
      closeObserver: {
        next: () => console.log('WebSocket connection closed'),
      },
    });

    return this.socket$.pipe(
      takeUntil(this.destroy$),
      catchError((err) => {
        console.error('WebSocket error:', err);
        return EMPTY;
      })
    );
  }

  send(message: ChatMessage): void {
    this.socket$?.next(message);
  }

  disconnect(): void {
    this.socket$?.complete();
    this.socket$ = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
