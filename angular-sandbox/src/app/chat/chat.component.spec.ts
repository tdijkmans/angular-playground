import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { ChatComponent } from './chat.component';
import { ChatService, ChatMessage } from '../services/chat.service';

describe('ChatComponent', () => {
  let messages$: Subject<ChatMessage>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;

  beforeEach(async () => {
    messages$ = new Subject<ChatMessage>();
    chatServiceSpy = jasmine.createSpyObj('ChatService', [
      'connect',
      'send',
      'disconnect',
    ]);
    chatServiceSpy.connect.and.returnValue(messages$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [{ provide: ChatService, useValue: chatServiceSpy }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call connect on init', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    expect(chatServiceSpy.connect).toHaveBeenCalledWith(
      fixture.componentInstance.wsUrl
    );
  });

  it('should display the empty-state when there are no messages', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    const empty = fixture.debugElement.query(By.css('.empty-state'));
    expect(empty).toBeTruthy();
  });

  it('should append a message when sendMessage() is called', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.newMessage = 'Hello world';
    component.sendMessage();
    fixture.detectChanges();

    expect(component.messages.length).toBe(1);
    expect(component.messages[0].text).toBe('Hello world');
    expect(component.messages[0].isSelf).toBeTrue();
  });

  it('should call chatService.send when a message is sent', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.newMessage = 'Test';
    component.sendMessage();

    expect(chatServiceSpy.send).toHaveBeenCalled();
  });

  it('should clear the input after sending', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.newMessage = 'Hello';
    component.sendMessage();

    expect(component.newMessage).toBe('');
  });

  it('should not send blank messages', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.newMessage = '   ';
    component.sendMessage();

    expect(chatServiceSpy.send).not.toHaveBeenCalled();
    expect(component.messages.length).toBe(0);
  });

  it('should add an incoming message from the WebSocket stream', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    const incomingMsg: ChatMessage = {
      id: 'abc',
      sender: 'Bot',
      text: 'Hey!',
      timestamp: new Date().toISOString(),
      isSelf: false,
    };

    messages$.next(incomingMsg);
    fixture.detectChanges();

    expect(component.messages.length).toBe(1);
    expect(component.messages[0].text).toBe('Hey!');
  });

  it('should render message bubbles in the DOM', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.newMessage = 'Hi there';
    component.sendMessage();
    fixture.detectChanges();

    const bubbles = fixture.debugElement.queryAll(By.css('.bubble'));
    expect(bubbles.length).toBe(1);
    expect(bubbles[0].nativeElement.textContent).toContain('Hi there');
  });

  it('should not add a duplicate when the server echoes back the sent message id', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.newMessage = 'Echo me';
    component.sendMessage();
    fixture.detectChanges();

    // Simulate server echoing the same message back
    const sentMsg = component.messages[0];
    messages$.next({ ...sentMsg, isSelf: false });
    fixture.detectChanges();

    // Should still be exactly 1 message (no duplicate)
    expect(component.messages.length).toBe(1);
  });

  it('should disconnect on destroy', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    fixture.destroy();
    expect(chatServiceSpy.disconnect).toHaveBeenCalled();
  });
});
