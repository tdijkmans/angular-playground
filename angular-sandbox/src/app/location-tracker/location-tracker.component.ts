import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import mapboxgl from 'mapbox-gl';
import { environment } from '../../environments/environment';
import { WebsocketService, LocationMessage } from '../services/websocket.service';

interface DeviceLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  timestamp: number;
  marker: mapboxgl.Marker;
  popup: mapboxgl.Popup;
}

@Component({
  selector: 'app-location-tracker',
  imports: [CommonModule, FormsModule],
  templateUrl: './location-tracker.component.html',
  styleUrl: './location-tracker.component.scss',
})
export class LocationTrackerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  readonly myId = this._generateId();
  myName = signal(localStorage.getItem('lt-name') || '');
  isConnected = signal(false);
  isTracking = signal(false);
  statusMessage = signal('Not started');
  deviceList = signal<DeviceLocation[]>([]);
  deviceCount = computed(() => this.deviceList().length);

  private map!: mapboxgl.Map;
  private _devicesById = new Map<string, DeviceLocation>();
  private _watchId: number | null = null;
  private _subs = new Subscription();

  constructor(private ws: WebsocketService) {}

  ngOnInit(): void {
    this._subs.add(
      this.ws.connected$.subscribe((connected) => {
        this.isConnected.set(connected);
        this.statusMessage.set(connected ? 'Connected' : 'Disconnected – reconnecting…');
      })
    );

    this._subs.add(
      this.ws.messages$.subscribe((msg) => {
        if (msg.type === 'location') {
          this._updateDevice(msg);
        } else if (msg.type === 'leave') {
          this._removeDevice(msg.id);
        }
      })
    );

    this.ws.connect();
  }

  ngAfterViewInit(): void {
    (mapboxgl as unknown as { accessToken: string }).accessToken = environment.mapboxToken;

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [4.9, 52.37], // Amsterdam as default
      zoom: 12,
    });

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }

  startTracking(): void {
    if (!this.myName()) {
      this.statusMessage.set('Please enter your name first');
      return;
    }
    localStorage.setItem('lt-name', this.myName());

    if (!navigator.geolocation) {
      this.statusMessage.set('Geolocation is not supported by this browser');
      return;
    }

    this.isTracking.set(true);
    this.statusMessage.set('Requesting location…');

    this._watchId = navigator.geolocation.watchPosition(
      (pos) => this._onPosition(pos),
      (err) => {
        this.statusMessage.set(`Location error: ${err.message}`);
        this.isTracking.set(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }

  stopTracking(): void {
    if (this._watchId !== null) {
      navigator.geolocation.clearWatch(this._watchId);
      this._watchId = null;
    }
    this.isTracking.set(false);
    this.statusMessage.set('Stopped tracking');
  }

  private _onPosition(pos: GeolocationPosition): void {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords;
    this.statusMessage.set(`Sharing location (±${Math.round(accuracy)}m)`);

    // Fly to own position on first fix
    if (!this._devicesById.has(this.myId)) {
      this.map.flyTo({ center: [lng, lat], zoom: 15 });
    }

    this.ws.send({
      type: 'location',
      id: this.myId,
      name: this.myName(),
      lat,
      lng,
      accuracy,
    });
  }

  private _updateDevice(msg: LocationMessage): void {
    const existing = this._devicesById.get(msg.id);
    const isMe = msg.id === this.myId;
    const color = isMe ? '#e74c3c' : '#3498db';

    if (existing) {
      existing.marker.setLngLat([msg.lng, msg.lat]);
      existing.popup.setHTML(this._popupHtml(msg));
      existing.lat = msg.lat;
      existing.lng = msg.lng;
      existing.timestamp = msg.timestamp;
    } else {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(this._popupHtml(msg));

      const el = document.createElement('div');
      el.className = 'device-marker';
      el.style.cssText = `
        width: 24px; height: 24px; border-radius: 50%;
        background: ${color}; border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,.5); cursor: pointer;
      `;
      if (isMe) {
        el.title = 'You';
      }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([msg.lng, msg.lat])
        .setPopup(popup)
        .addTo(this.map);

      const device: DeviceLocation = {
        id: msg.id,
        name: msg.name,
        lat: msg.lat,
        lng: msg.lng,
        accuracy: msg.accuracy,
        timestamp: msg.timestamp,
        marker,
        popup,
      };
      this._devicesById.set(msg.id, device);
    }

    this.deviceList.set([...this._devicesById.values()]);
  }

  private _removeDevice(id: string): void {
    const device = this._devicesById.get(id);
    if (device) {
      device.marker.remove();
      this._devicesById.delete(id);
      this.deviceList.set([...this._devicesById.values()]);
    }
  }

  private _popupHtml(msg: LocationMessage): string {
    const isMe = msg.id === this.myId;
    const label = isMe ? `<strong>${msg.name}</strong> (you)` : `<strong>${msg.name}</strong>`;
    const acc = msg.accuracy ? `<br><small>±${Math.round(msg.accuracy)}m accuracy</small>` : '';
    return `${label}${acc}`;
  }

  private _generateId(): string {
    const stored = localStorage.getItem('lt-id');
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem('lt-id', id);
    return id;
  }

  ngOnDestroy(): void {
    this.stopTracking();
    this._subs.unsubscribe();
    this.ws.disconnect();
    this.map?.remove();
  }
}
