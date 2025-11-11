import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EditableSubjectComponent } from './editable-subject/editable-subject.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, EditableSubjectComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'angular-sandbox';

  onSubjectSaved(value: string) {
    console.log('Subject saved:', value);
  }

  onSubjectReset() {
    console.log('Subject reset');
  }
}
