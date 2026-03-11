import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { KanbanService } from '../kanban.service';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { Card, Column } from '../kanban.types';

@Component({
  selector: 'app-kanban-board',
  imports: [AsyncPipe, FormsModule, DragDropModule, KanbanColumnComponent],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.scss',
})
export class KanbanBoardComponent {
  private kanban = inject(KanbanService);

  board$ = this.kanban.board$;
  isConnected$ = this.kanban.isConnected$;

  addingColumn = signal(false);
  newColumnTitle = '';

  getColumnIds(columns: Column[]): string[] {
    return columns.map((c) => c.id);
  }

  onCardDropped(event: CdkDragDrop<Card[]>, columns: Column[]): void {
    const card = event.item.data as Card;
    if (!card?.id) {
      return;
    }
    const sourceListId = event.previousContainer.id;
    const targetListId = event.container.id;
    const targetIndex = event.currentIndex;

    if (sourceListId === targetListId && event.previousIndex === targetIndex) {
      return;
    }

    this.kanban.moveCard(card.id, sourceListId, targetListId, targetIndex);
  }

  onAddCard(event: { columnId: string; title: string; description: string }): void {
    this.kanban.addCard(event.columnId, event.title, event.description);
  }

  onDeleteCard(event: { columnId: string; cardId: string }): void {
    this.kanban.deleteCard(event.cardId);
  }

  onUpdateCard(event: { cardId: string; title: string; description: string }): void {
    this.kanban.updateCard(event.cardId, event.title, event.description);
  }

  onDeleteColumn(columnId: string): void {
    this.kanban.deleteColumn(columnId);
  }

  startAddColumn(): void {
    this.addingColumn.set(true);
    this.newColumnTitle = '';
  }

  submitColumn(): void {
    const title = this.newColumnTitle.trim();
    if (title) {
      this.kanban.addColumn(title);
    }
    this.addingColumn.set(false);
  }

  cancelAddColumn(): void {
    this.addingColumn.set(false);
  }
}
