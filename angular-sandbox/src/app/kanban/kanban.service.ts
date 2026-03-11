import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { retryWhen, delayWhen } from 'rxjs/operators';
import { BoardState, WsMessage } from './kanban.types';

const WS_URL = 'ws://localhost:8080';
const RECONNECT_DELAY_MS = 3000;

@Injectable({ providedIn: 'root' })
export class KanbanService implements OnDestroy {
  private socket$!: WebSocketSubject<WsMessage>;
  private boardState$ = new BehaviorSubject<BoardState>({ columns: [] });
  private connected$ = new BehaviorSubject<boolean>(false);
  private subscription?: Subscription;

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket$ = webSocket<WsMessage>(WS_URL);
    this.subscription = this.socket$
      .pipe(retryWhen((errors) => errors.pipe(delayWhen(() => timer(RECONNECT_DELAY_MS)))))
      .subscribe({
        next: (msg) => {
          if (msg.type === 'BOARD_STATE') {
            this.boardState$.next(msg.payload as BoardState);
            this.connected$.next(true);
          }
        },
        error: () => {
          this.connected$.next(false);
        },
        complete: () => {
          this.connected$.next(false);
        },
      });
  }

  get board$(): Observable<BoardState> {
    return this.boardState$.asObservable();
  }

  get isConnected$(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  addCard(columnId: string, title: string, description = ''): void {
    this.socket$.next({ type: 'ADD_CARD', payload: { columnId, title, description } });
  }

  moveCard(cardId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number): void {
    this.socket$.next({ type: 'MOVE_CARD', payload: { cardId, sourceColumnId, targetColumnId, targetIndex } });
  }

  deleteCard(cardId: string): void {
    this.socket$.next({ type: 'DELETE_CARD', payload: { cardId } });
  }

  updateCard(cardId: string, title: string, description: string): void {
    this.socket$.next({ type: 'UPDATE_CARD', payload: { cardId, title, description } });
  }

  addColumn(title: string): void {
    this.socket$.next({ type: 'ADD_COLUMN', payload: { title } });
  }

  deleteColumn(columnId: string): void {
    this.socket$.next({ type: 'DELETE_COLUMN', payload: { columnId } });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.socket$.complete();
  }
}
