export interface Card {
  id: string;
  title: string;
  description: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface BoardState {
  columns: Column[];
}

export type MessageType =
  | 'BOARD_STATE'
  | 'ADD_CARD'
  | 'MOVE_CARD'
  | 'DELETE_CARD'
  | 'UPDATE_CARD'
  | 'ADD_COLUMN'
  | 'DELETE_COLUMN';

export interface WsMessage {
  type: MessageType;
  payload: unknown;
}
