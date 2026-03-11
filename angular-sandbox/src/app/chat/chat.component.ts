import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [];
  newMessage = '';
  username = 'You';
  wsUrl = 'ws://localhost:8080';
  isConnected = false;
  connectionError = false;

  private subscription: Subscription | null = null;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.connectToServer();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.chatService.disconnect();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private sentIds = new Set<string>();

  connectToServer(): void {
    this.connectionError = false;
    this.subscription?.unsubscribe();

    this.subscription = this.chatService.connect(this.wsUrl).subscribe({
      next: (msg: ChatMessage) => {
        // Skip messages that we already added locally (our own sent messages)
        if (this.sentIds.has(msg.id)) {
          return;
        }
        msg.isSelf = false;
        this.messages.push(msg);
      },
      error: () => {
        this.isConnected = false;
        this.connectionError = true;
      },
      complete: () => {
        this.isConnected = false;
      },
    });

    this.isConnected = true;
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text || !this.isConnected) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      sender: this.username,
      text,
      timestamp: new Date().toISOString(),
      isSelf: true,
    };

    this.messages.push(message);
    this.sentIds.add(message.id);
    this.chatService.send(message);
    this.newMessage = '';
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch (_) {}
  }
}
