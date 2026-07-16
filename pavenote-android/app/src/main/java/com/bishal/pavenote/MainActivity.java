package com.bishal.pavenote;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.location.Location;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.view.Gravity;
import android.view.MotionEvent;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int REQ_CAPTURE = 100;
    private static final int REQ_AUDIO = 101;
    private static final int REQ_LOCATION = 102;

    private File originalFile;
    private File stampedFile;
    private Bitmap capturedBitmap;
    private long capturedAt;
    private Location lastLocation;
    private EditText noteEdit;
    private TextView statusText;
    private ImageView imageView;
    private SpeechRecognizer recognizer;

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        showLaunchScreen();
        requestLocation();
    }

    @Override protected void onDestroy() {
        if (recognizer != null) recognizer.destroy();
        super.onDestroy();
    }

    private void showLaunchScreen() {
        LinearLayout root = baseLayout();
        TextView title = label("PaveNote", 32);
        title.setGravity(Gravity.CENTER);
        root.addView(title, new LinearLayout.LayoutParams(-1, 0, 1f));

        TextView subtitle = label("Offline pavement photo notes\nOriginal photo preserved • no internet permission", 16);
        subtitle.setGravity(Gravity.CENTER);
        root.addView(subtitle);

        Button capture = new Button(this);
        capture.setText("OPEN CAMERA");
        capture.setTextSize(18);
        capture.setOnClickListener(v -> launchCamera());
        root.addView(capture, new LinearLayout.LayoutParams(-1, 150));
        setContentView(root);
    }

    private void launchCamera() {
        if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.CAMERA}, REQ_CAPTURE);
            return;
        }
        try {
            capturedAt = System.currentTimeMillis();
            originalFile = new File(getPhotoDir(), "PaveNote_" + capturedAt + "_original.jpg");
            Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".files", originalFile);
            Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            intent.putExtra(MediaStore.EXTRA_OUTPUT, uri);
            intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivityForResult(intent, REQ_CAPTURE);
        } catch (Exception e) {
            Toast.makeText(this, "Camera unavailable: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_CAPTURE && resultCode == RESULT_OK && originalFile != null && originalFile.exists()) {
            capturedBitmap = BitmapFactory.decodeFile(originalFile.getAbsolutePath());
            if (capturedBitmap == null) {
                Toast.makeText(this, "Could not read captured photo", Toast.LENGTH_LONG).show();
                return;
            }
            showReviewScreen();
        }
    }

    private void showReviewScreen() {
        LinearLayout root = baseLayout();
        imageView = new ImageView(this);
        imageView.setScaleType(ImageView.ScaleType.CENTER_CROP);
        imageView.setImageBitmap(capturedBitmap);
        root.addView(imageView, new LinearLayout.LayoutParams(-1, 0, 1f));

        statusText = label(SpeechRecognizer.isOnDeviceRecognitionAvailable(this)
                ? "Hold the microphone, speak, then release"
                : "Offline speech is unavailable. Type a note instead.", 15);
        statusText.setGravity(Gravity.CENTER);
        root.addView(statusText);

        noteEdit = new EditText(this);
        noteEdit.setHint("Field note");
        noteEdit.setTextColor(Color.WHITE);
        noteEdit.setHintTextColor(0xFFAAAAAA);
        noteEdit.setBackgroundColor(0xFF24272E);
        noteEdit.setMinLines(3);
        root.addView(noteEdit);

        LinearLayout actions = new LinearLayout(this);
        actions.setGravity(Gravity.CENTER);

        Button retake = new Button(this);
        retake.setText("RETAKE");
        retake.setOnClickListener(v -> launchCamera());
        actions.addView(retake, new LinearLayout.LayoutParams(0, 120, 1f));

        ImageButton mic = new ImageButton(this);
        mic.setImageResource(android.R.drawable.ic_btn_speak_now);
        mic.setContentDescription("Hold to add voice note");
        mic.setOnTouchListener((v, event) -> {
            if (event.getAction() == MotionEvent.ACTION_DOWN) { beginSpeech(); return true; }
            if (event.getAction() == MotionEvent.ACTION_UP || event.getAction() == MotionEvent.ACTION_CANCEL) { endSpeech(); return true; }
            return false;
        });
        actions.addView(mic, new LinearLayout.LayoutParams(120, 120));

        Button save = new Button(this);
        save.setText("SAVE");
        save.setOnClickListener(v -> saveStampedCopy());
        actions.addView(save, new LinearLayout.LayoutParams(0, 120, 1f));
        root.addView(actions);
        setContentView(root);
    }

    private void beginSpeech() {
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_AUDIO);
            return;
        }
        if (!SpeechRecognizer.isOnDeviceRecognitionAvailable(this)) {
            statusText.setText("Offline transcription unavailable; type the note manually.");
            return;
        }
        if (recognizer != null) recognizer.destroy();
        recognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(this);
        recognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle b) { statusText.setText("Listening… release when finished"); }
            @Override public void onBeginningOfSpeech() {}
            @Override public void onRmsChanged(float value) {}
            @Override public void onBufferReceived(byte[] bytes) {}
            @Override public void onEndOfSpeech() { statusText.setText("Transcribing locally…"); }
            @Override public void onError(int error) { statusText.setText("No speech captured. Try again or type the note."); }
            @Override public void onResults(Bundle results) {
                ArrayList<String> text = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (text != null && !text.isEmpty()) {
                    noteEdit.setText(NoteAppender.append(noteEdit.getText().toString(), text.get(0)));
                    noteEdit.setSelection(noteEdit.length());
                    statusText.setText("Transcript added. Edit it before saving if needed.");
                }
            }
            @Override public void onPartialResults(Bundle results) {
                ArrayList<String> text = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (text != null && !text.isEmpty()) statusText.setText(text.get(0));
            }
            @Override public void onEvent(int type, Bundle b) {}
        });
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
        recognizer.startListening(intent);
    }

    private void endSpeech() {
        if (recognizer != null) recognizer.stopListening();
    }

    private void saveStampedCopy() {
        try {
            Bitmap stamped = capturedBitmap.copy(Bitmap.Config.ARGB_8888, true);
            Canvas canvas = new Canvas(stamped);
            float textSize = Math.max(28f, stamped.getWidth() / 27f);
            float padding = textSize * 0.55f;
            float panelHeight = textSize * 3.1f;
            Paint panel = new Paint();
            panel.setColor(0xC7000000);
            canvas.drawRect(0, stamped.getHeight() - panelHeight, stamped.getWidth(), stamped.getHeight(), panel);
            Paint text = new Paint(Paint.ANTI_ALIAS_FLAG);
            text.setColor(Color.WHITE);
            text.setTextSize(textSize);
            String time = new SimpleDateFormat("MMM dd, yyyy  hh:mm:ss a", Locale.US).format(new Date(capturedAt));
            String location = lastLocation == null ? "Location unavailable" : String.format(Locale.US, "%.6f, %.6f", lastLocation.getLatitude(), lastLocation.getLongitude());
            canvas.drawText(time, padding, stamped.getHeight() - textSize * 1.65f, text);
            canvas.drawText(location, padding, stamped.getHeight() - textSize * 0.55f, text);

            stampedFile = new File(getPhotoDir(), "PaveNote_" + capturedAt + "_stamped.jpg");
            try (FileOutputStream out = new FileOutputStream(stampedFile)) {
                if (!stamped.compress(Bitmap.CompressFormat.JPEG, 92, out)) throw new IOException("JPEG encoding failed");
            }
            File note = new File(getPhotoDir(), "PaveNote_" + capturedAt + "_note.txt");
            try (FileOutputStream out = new FileOutputStream(note)) {
                out.write(noteEdit.getText().toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
            }
            publishToGallery(stampedFile);
            imageView.setImageBitmap(stamped);
            statusText.setText("Saved to Pictures/PaveNote. The untouched original remains private.");
            showShareButton();
        } catch (Exception e) {
            statusText.setText("Save failed: " + e.getMessage());
        }
    }

    private void showShareButton() {
        Button share = new Button(this);
        share.setText("SHARE STAMPED PHOTO");
        share.setOnClickListener(v -> {
            Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".files", stampedFile);
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("image/jpeg");
            intent.putExtra(Intent.EXTRA_STREAM, uri);
            intent.putExtra(Intent.EXTRA_TEXT, noteEdit.getText().toString());
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(Intent.createChooser(intent, "Share field photo"));
        });
        ((LinearLayout) statusText.getParent()).addView(share);
    }

    private void publishToGallery(File source) throws IOException {
        ContentValues values = new ContentValues();
        values.put(MediaStore.Images.Media.DISPLAY_NAME, source.getName());
        values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
        values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/PaveNote");
        Uri uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
        if (uri == null) throw new IOException("Gallery insert failed");
        try (FileInputStream in = new FileInputStream(source); java.io.OutputStream out = getContentResolver().openOutputStream(uri)) {
            if (out == null) throw new IOException("Gallery stream unavailable");
            byte[] buffer = new byte[8192];
            int read;
            while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
        }
    }

    private void requestLocation() {
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOCATION);
        } else fetchLocation();
    }

    private void fetchLocation() {
        try {
            LocationManager manager = getSystemService(LocationManager.class);
            if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                manager.getCurrentLocation(LocationManager.GPS_PROVIDER, null, getMainExecutor(), location -> lastLocation = location);
            } else if (checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                manager.getCurrentLocation(LocationManager.NETWORK_PROVIDER, null, getMainExecutor(), location -> lastLocation = location);
            }
        } catch (Exception ignored) {}
    }

    private File getPhotoDir() {
        File dir = new File(getFilesDir(), "photos");
        if (!dir.exists()) dir.mkdirs();
        return dir;
    }

    private LinearLayout baseLayout() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(24, 36, 24, 36);
        root.setBackgroundColor(0xFF111318);
        return root;
    }

    private TextView label(String value, float size) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextColor(Color.WHITE);
        view.setTextSize(size);
        view.setPadding(8, 12, 8, 12);
        return view;
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode == REQ_CAPTURE && results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) launchCamera();
        if (requestCode == REQ_LOCATION) fetchLocation();
        if (requestCode == REQ_AUDIO && statusText != null) statusText.setText("Hold the microphone again to dictate.");
    }
}
