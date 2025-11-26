# Fishtank Text Feature - Quick Reference Guide

This guide covers all text display features in the Fishtank animation.

---

## 🎮 Text Controls

### Enable Text
**Switch:** Enable/disable the entire text display system  
**Default:** Disabled

---

## 📥 Text Source Configuration

### Text Source Type
Choose how text content is provided:

| Option | Description | Use Case |
|--------|-------------|----------|
| **Manual Input** | Type text directly | Static messages, titles, labels |
| **RSS Feed** | Fetch from RSS URL | News headlines, blog updates |
| **JSON URL** | Fetch from JSON endpoint | API data, dynamic content |

### Content Controls

#### Manual Input Mode
- **Text Content:** Enter your message (multi-line supported)
- Press Enter/Return for line breaks
- **Automatic Word Wrapping:** Long lines are automatically wrapped to fit display width

#### RSS/JSON Mode
- **RSS/JSON URL:** Enter the feed/endpoint URL
- **Update Interval:** How often to refresh (10-3600 seconds)
- **Text Content:** Fallback text shown while loading
- **Automatic Word Wrapping:** Fetched content is wrapped to fit display

---

## ✂️ Automatic Text Wrapping

The text system **automatically wraps long lines** to fit your display width:

- **Word-based wrapping:** Text breaks at word boundaries when possible
- **Display-optimized:** Calculates max characters per line based on font width
- **Multi-line support:** Manual line breaks (`\n`) are preserved
- **Long word handling:** Words longer than display width are split across lines
- **Smart formatting:** Maintains readability with proper spacing

**Example:**
```
Input: "This is a very long message that won't fit on one line"

Wrapped Output (on small display):
"This is a very"
"long message that"
"won't fit on one"
"line"
```

---

## 🎨 Text Appearance

### Font
Select from available fonts:
- **C64** - Classic Commodore 64 (recommended for readability)
- **Picopixel** - Tiny, minimal
- **Tiny 3x3** - Extremely compact
- **Pixel-Gosub** - Retro pixel style
- More fonts available in the font selector

### Text Color
**RGBA Color Picker**
- Red, Green, Blue channels (0-255)
- Alpha transparency (0-1)

**Popular Colors:**
- White: `255, 255, 255, 1`
- Cyan: `0, 255, 255, 1`
- Yellow: `255, 255, 0, 1`
- Green: `0, 255, 0, 1`

---

## 🎬 Animation Types

### 1. Static
**No animation** - Text stays in one place

**Settings:**
- Position: Where text appears
- Speed: Not applicable

**Best For:** Titles, labels, watermarks

---

### 2. Scroll Horizontal
**Scrolls left continuously** - Text moves right to left

**Settings:**
- Position Y: Vertical placement
- Position X: Starting point (usually 100 for right edge)
- Speed: 0.5-2.0 recommended

**Best For:** News tickers, announcements, credits

**Tips:**
- Higher speed = faster scrolling
- Text wraps from left to right edge
- Supports multi-line wrapped text
- All lines scroll together at same speed

---

### 3. Scroll Vertical
**Scrolls upward continuously** - Text moves bottom to top

**Settings:**
- Position X: Horizontal placement
- Position Y: Starting point (usually 100 for bottom)
- Speed: 0.3-1.5 recommended

**Best For:** Credits, multi-line messages, lists

**Tips:**
- Each line scrolls independently
- Good for long messages
- Text wraps from top to bottom

---

### 4. Star Wars Intro
**Scrolls with perspective** - Creates 3D depth effect

**Settings:**
- Position X/Y: Center recommended
- Speed: 0.4-1.2 recommended

**Best For:** Opening credits, dramatic text, storytelling

**Tips:**
- Text appears smaller as it scrolls away
- Works best with multi-line centered text
- Slower speeds enhance the effect

---

### 5. Typewriter
**Characters appear one-by-one** - Typing effect

**Settings:**
- Position X/Y: Where typing starts
- Speed: 0.2-1.0 recommended

**Best For:** Announcements, messages, dialogue

**Tips:**
- Lower speed = slower typing
- Supports multi-line text
- Characters appear left to right

---

### 6. Fade In/Out
**Smooth opacity cycling** - Text fades in and out

**Settings:**
- Position X/Y: Where text appears
- Speed: 0.5-2.0 recommended

**Best For:** Atmospheric text, gentle announcements

**Tips:**
- Complete cycle: fade in → hold → fade out
- Slower speed = longer hold time
- Works well with short text

---

### 7. Wave
**Wavy motion** - Each character moves up/down

**Settings:**
- Position X/Y: Baseline position
- Speed: 0.5-2.0 recommended

**Best For:** Fun titles, playful text, dynamic headers

**Tips:**
- Wave travels through the text
- Each character has offset motion
- Works best with horizontal text

---

### 8. Bounce
**Bouncing motion** - Entire text moves up/down

**Settings:**
- Position X/Y: Center of bounce
- Speed: 0.5-2.0 recommended

**Best For:** Attention-grabbing text, playful displays

**Tips:**
- Smooth sine wave motion
- Entire text moves together
- Higher speed = faster bouncing

---

## 📍 Position Control

### X Position (0-100%)
- **0** = Left edge
- **50** = Horizontal center
- **100** = Right edge

### Y Position (0-100%)
- **0** = Top edge
- **50** = Vertical center
- **100** = Bottom edge

### Position Tips by Animation

| Animation | Recommended X | Recommended Y |
|-----------|---------------|---------------|
| Static | 50 (center) | 10-20 (top) |
| Scroll Horizontal | 100 (right) | 50 (middle) |
| Scroll Vertical | 50 (center) | 100 (bottom) |
| Star Wars Intro | 50 (center) | 100 (bottom) |
| Typewriter | 10 (left) | 50 (middle) |
| Fade | 50 (center) | 50 (center) |
| Wave | 50 (center) | 30 (upper) |
| Bounce | 50 (center) | 50 (center) |

---

## ⚡ Animation Speed

**Range:** 0.1 - 5.0  
**Default:** 1.0

### Speed Guidelines

| Speed | Effect | Use Case |
|-------|--------|----------|
| 0.1-0.5 | Very slow | Gentle, atmospheric |
| 0.5-1.0 | Slow | Readable, relaxed |
| 1.0-2.0 | Medium | Standard, balanced |
| 2.0-3.0 | Fast | Energetic, quick |
| 3.0-5.0 | Very fast | Rapid, intense |

**Per Animation Type:**
- **Scroll Horizontal:** 0.5-1.5 for readability
- **Scroll Vertical:** 0.3-1.0 for readability
- **Star Wars:** 0.4-0.8 for dramatic effect
- **Typewriter:** 0.2-0.5 for natural typing
- **Fade:** 0.5-1.5 for smooth cycling
- **Wave:** 1.0-2.0 for visible motion
- **Bounce:** 0.5-1.5 for smooth bouncing

---

## 🌐 Remote Text Sources

### RSS Feed Setup

1. **Enable Text:** Turn on text display
2. **Text Source:** Select "RSS Feed"
3. **RSS/JSON URL:** Enter RSS feed URL
4. **Update Interval:** Set refresh rate (e.g., 300 seconds = 5 minutes)
5. **Text Content:** Enter fallback text (shown while loading)

**Popular RSS Feeds:**
```
BBC News: https://feeds.bbci.co.uk/news/rss.xml
NY Times: https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml
Reddit: https://www.reddit.com/.rss
```

**How it Works:**
- Fetches RSS feed at startup
- Extracts first `<title>` tag
- Auto-refreshes at specified interval
- Shows fallback text if fetch fails

---

### JSON URL Setup

1. **Enable Text:** Turn on text display
2. **Text Source:** Select "JSON URL"
3. **RSS/JSON URL:** Enter JSON endpoint
4. **Update Interval:** Set refresh rate
5. **Text Content:** Enter fallback text

**Expected JSON Format:**
```json
{
  "text": "Your message here"
}
```

Or:
```json
{
  "message": "Alternative message field"
}
```

**How it Works:**
- Fetches JSON from URL
- Looks for `text` or `message` field
- Auto-refreshes at specified interval
- Shows fallback text if fetch fails

**Example Custom Endpoint:**
```json
{
  "text": "Temperature: 22°C | Humidity: 65%",
  "timestamp": "2025-11-26T12:00:00Z"
}
```

---

## 📋 Common Use Cases

### News Ticker
```
Text Source: RSS Feed
URL: https://feeds.bbci.co.uk/news/rss.xml
Animation: Scroll Horizontal
Font: C64
Color: White (255,255,255,1)
Speed: 1.0
Position: X=100, Y=90
Update: 300 seconds
```

### Aquarium Title
```
Text Source: Manual Input
Text: "MY AQUARIUM"
Animation: Wave
Font: Pixel-Gosub
Color: Cyan (0,255,255,1)
Speed: 1.2
Position: X=50, Y=10
```

### Weather Display
```
Text Source: JSON URL
URL: https://your-api.com/weather
Animation: Static
Font: C64
Color: Yellow (255,255,0,1)
Position: X=50, Y=5
Update: 600 seconds
```

### Scrolling Credits
```
Text Source: Manual Input
Text: "FISHTANK\nCreated by...\nThank you!"
Animation: Star Wars Intro
Font: Tiny 3x3
Color: White (255,255,255,1)
Speed: 0.6
Position: X=50, Y=100
```

### Announcements
```
Text Source: Manual Input
Text: "FEEDING TIME"
Animation: Bounce
Font: Pixel-Gosub
Color: Red (255,0,0,1)
Speed: 1.5
Position: X=50, Y=50
```

---

## 🐛 Troubleshooting

### Text Not Showing
- ✓ Check "Enable Text" is ON
- ✓ Verify text content is not empty
- ✓ Check text color isn't transparent (alpha > 0)
- ✓ Ensure position is within visible area (0-100%)
- ✓ Font must be loaded (select from dropdown)

### RSS/JSON Not Updating
- ✓ Verify URL is accessible
- ✓ Check update interval is reasonable (>10 seconds)
- ✓ Look for CORS errors in browser console
- ✓ Ensure JSON has `text` or `message` field
- ✓ RSS must have valid `<title>` tags

### Animation Too Fast/Slow
- ✓ Adjust Animation Speed slider
- ✓ Use recommended speeds per animation type
- ✓ Lower speed for readability
- ✓ Higher speed for rapid displays

### Text Gets Cut Off
- ✓ Check position isn't too close to edge
- ✓ Use shorter text or smaller font
- ✓ For scrolling, text will wrap around
- ✓ Adjust X/Y position for better visibility

---

## 💡 Pro Tips

1. **Contrast:** Use bright colors on dark backgrounds or vice versa
2. **Readability:** C64 or Pixel-Gosub fonts work best for small displays
3. **Multi-line:** Use `\n` or Enter key for line breaks
4. **Layering:** Text renders on top of all other sprites
5. **Testing:** Start with Static animation to verify position
6. **Speed:** Test different speeds - what looks good at 1.0 might be better at 0.5
7. **Updates:** For RSS/JSON, don't set interval too low (causes excessive requests)
8. **Fallback:** Always provide fallback text for remote sources

---

**Last Updated:** November 26, 2025  
**Version:** 2.1  
**Feature Status:** ✅ Stable
