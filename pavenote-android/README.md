# PaveNote Android MVP

Offline field camera prototype for pavement engineers.

## Workflow

1. Capture a photo.
2. Long-press the microphone button, speak, and release.
3. Review or edit the on-device transcript.
4. Save a separate timestamp/GPS-stamped JPEG.
5. The untouched original remains in app-private storage.

## Privacy

The manifest intentionally omits `android.permission.INTERNET`. Speech recognition uses `SpeechRecognizer.createOnDeviceSpeechRecognizer()` only.
