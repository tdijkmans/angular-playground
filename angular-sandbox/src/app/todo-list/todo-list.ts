import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder, moveItemInArray } from '@angular/cdk/drag-drop';

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

@Component({
  selector: 'app-todo-list',
  imports: [FormsModule, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss',
})
export class TodoList {
  newItemText = '';
  nextId = 4;

  items: TodoItem[] = [
    { id: 1, text: 'Buy groceries', completed: false },
    { id: 2, text: 'Walk the dog', completed: true },
    { id: 3, text: 'Read a book', completed: false },
  ];

  addItem(): void {
    const text = this.newItemText.trim();
    if (!text) return;
    this.items.push({ id: this.nextId++, text, completed: false });
    this.newItemText = '';
  }

  deleteItem(id: number): void {
    this.items = this.items.filter((item) => item.id !== id);
  }

  drop(event: CdkDragDrop<TodoItem[]>): void {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }
}
