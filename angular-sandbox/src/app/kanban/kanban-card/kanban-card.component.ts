import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Card } from '../kanban.types';

@Component({
  selector: 'app-kanban-card',
  imports: [FormsModule, CdkDrag],
  templateUrl: './kanban-card.component.html',
  styleUrl: './kanban-card.component.scss',
})
export class KanbanCardComponent {
  @Input({ required: true }) card!: Card;
  @Output() deleteCard = new EventEmitter<string>();
  @Output() updateCard = new EventEmitter<{ title: string; description: string }>();

  editing = signal(false);
  editTitle = '';
  editDescription = '';

  startEdit(): void {
    this.editTitle = this.card.title;
    this.editDescription = this.card.description;
    this.editing.set(true);
  }

  saveEdit(): void {
    const title = this.editTitle.trim();
    if (title) {
      this.updateCard.emit({ title, description: this.editDescription.trim() });
    }
    this.editing.set(false);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  onDelete(): void {
    this.deleteCard.emit(this.card.id);
  }
}
