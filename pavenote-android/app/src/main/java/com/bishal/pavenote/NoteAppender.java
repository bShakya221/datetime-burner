package com.bishal.pavenote;

public final class NoteAppender {
    private NoteAppender() {}

    public static String append(String existing, String recognized) {
        String left = existing == null ? "" : existing.trim();
        String right = recognized == null ? "" : recognized.trim();
        if (right.isEmpty()) return left;
        if (left.isEmpty()) return right;
        return left + "\n\n" + right;
    }
}
