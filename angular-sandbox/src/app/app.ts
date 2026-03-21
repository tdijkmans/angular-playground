import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoList } from './todo-list/todo-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TodoList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'angular-sandbox';
}
