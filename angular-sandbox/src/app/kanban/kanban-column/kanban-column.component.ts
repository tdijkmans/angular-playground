import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';
import { Column, Card } from '../kanban.types';

@Component({
  selector: 'app-kanban-column',
  imports: [FormsModule, CdkDropList, KanbanCardComponent],
  templateUrl: './kanban-column.component.html',
  styleUrl: './kanban-column.component.scss',
})
export class KanbanColumnComponent {
  @Input({ required: true }) column!: Column;
  @Input() connectedTo: string[] = [];
  @Output() cardDropped = new EventEmitter<CdkDragDrop<Card[]>>();
  @Output() addCard = new EventEmitter<{ columnId: string; title: string; description: string }>();
  @Output() deleteCard = new EventEmitter<{ columnId: string; cardId: string }>();
  @Output() updateCard = new EventEmitter<{ cardId: string; title: string; description: string }>();
  @Output() deleteColumn = new EventEmitter<string>();

  addingCard = signal(false);
  newCardTitle = '';
  newCardDescription = '';

  startAddCard(): void {
    this.addingCard.set(true);
    this.newCardTitle = '';
    this.newCardDescription = '';
  }

  submitCard(): void {
    const title = this.newCardTitle.trim();
    if (title) {
      this.addCard.emit({ columnId: this.column.id, title, description: this.newCardDescription.trim() });
    }
    this.addingCard.set(false);
  }

  cancelAdd(): void {
    this.addingCard.set(false);
  }

  onDeleteCard(cardId: string): void {
    this.deleteCard.emit({ columnId: this.column.id, cardId });
  }

  onUpdateCard(cardId: string, event: { title: string; description: string }): void {
    this.updateCard.emit({ cardId, ...event });
  }

  onDrop(event: CdkDragDrop<Card[]>): void {
    this.cardDropped.emit(event);
  }

  onDeleteColumn(): void {
    this.deleteColumn.emit(this.column.id);
  }
}
