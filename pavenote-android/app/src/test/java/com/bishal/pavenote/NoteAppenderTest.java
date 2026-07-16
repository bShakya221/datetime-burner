package com.bishal.pavenote;

import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class NoteAppenderTest {
    @Test public void appendsWithParagraphBreak() {
        assertEquals("Existing.\n\nModerate settlement.",
            NoteAppender.append("Existing.", "Moderate settlement."));
    }

    @Test public void ignoresBlankSpeech() {
        assertEquals("Existing.", NoteAppender.append("Existing.", "   "));
    }
}
