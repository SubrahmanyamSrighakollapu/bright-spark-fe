export type LocationStatus =
  | 'GRANTED'
  | 'DENIED'
  | 'TIMEOUT'
  | 'UNSUPPORTED'
  | 'ERROR'
  | 'PENDING'
  | 'UNAVAILABLE';

export interface LoginLocation {
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  locationStatus: LocationStatus;
  locationCapturedAt?: string | null;
}

export interface CaptureLoginLocationOptions {
  timeoutMs?: number;
  maximumAgeMs?: number;
  enableHighAccuracy?: boolean;
}

const DEFAULT_OPTIONS: Required<CaptureLoginLocationOptions> = {
  timeoutMs: 20000,
  maximumAgeMs: 0,
  enableHighAccuracy: false,
};

export function isGeolocationSupported(): boolean {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return false;
  if (typeof window !== 'undefined' && window.isSecureContext === false) return false;
  return true;
}

export function captureLoginLocation(
  options: CaptureLoginLocationOptions = {}
): Promise<LoginLocation> {
  const merged = { ...DEFAULT_OPTIONS, ...options };

  if (!isGeolocationSupported()) {
    return Promise.resolve<LoginLocation>({
      locationStatus: 'UNSUPPORTED',
    });
  }

  return new Promise<LoginLocation>((resolve) => {
    const finish = (value: LoginLocation) => {
      clearTimeout(fallbackTimer);
      resolve(value);
    };

    const fallbackTimer = setTimeout(() => {
      finish({ locationStatus: 'TIMEOUT' });
    }, merged.timeoutMs);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          finish({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locationAccuracy: position.coords.accuracy,
            locationStatus: 'GRANTED',
            locationCapturedAt: new Date(position.timestamp).toISOString(),
          });
        },
        (error) => {
          let status: LocationStatus = 'ERROR';
          if (error.code === 1) status = 'DENIED';
          else if (error.code === 2) status = 'UNAVAILABLE';
          else if (error.code === 3) status = 'TIMEOUT';
          finish({ locationStatus: status });
        },
        {
          enableHighAccuracy: merged.enableHighAccuracy,
          timeout: merged.timeoutMs,
          maximumAge: merged.maximumAgeMs,
        }
      );
    } catch {
      finish({ locationStatus: 'ERROR' });
    }
  });
}
