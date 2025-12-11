import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"
import PixelList from "../../PixelList.js"
import DrawText from "../../draw/DrawText.js"
import Font from "../../Font.js"
import Color from "../../Color.js"
import type ColorInterface from "../../ColorInterface.js"

// Animation types for text
export enum TextAnimationType {
    Static = "static",
    ScrollHorizontal = "scroll-horizontal",
    ScrollVertical = "scroll-vertical",
    StarWarsIntro = "starwars-intro",
    Typewriter = "typewriter",
    Fade = "fade",
    Wave = "wave",
    Bounce = "bounce"
}

// Text source types
export enum TextSourceType {
    Manual = "manual",
    RSS = "rss",
    JSON = "json"
}

interface TextSpriteState extends SpriteState {
    text?: string;
    lines?: string[];
    currentCharIndex?: number;
    fadeAlpha?: number;
    wavePhase?: number;
    bouncePhase?: number;
    scrollOffsetX?: number;
    scrollOffsetY?: number;
    perspectiveY?: number;
}

/**
 * Base TextSprite class for rendering text with various animation effects
 */
export class TextSprite extends SpriteAnimator {
    protected font: Font;
    protected color: ColorInterface;
    protected animationType: TextAnimationType;
    protected textContent: string;
    protected textLines: string[];
    protected animationSpeed: number;
    protected maxWidth: number;
    protected hAlign: 'left' | 'center' | 'right';
    protected vAlign: 'top' | 'center' | 'bottom';
    protected textSize: number;
    private boxWidth: number = 0;
    private boxHeight: number = 0;
    
    // Animation-specific properties
    private charIndex: number = 0;
    private fadeAlpha: number = 0;
    private wavePhase: number = 0;
    private bouncePhase: number = 0;
    private scrollOffsetX: number = 0;
    private scrollOffsetY: number = 0;
    private perspectiveY: number = 0;

    protected textUpdateCallback?: () => string;
    
    constructor(
        x: number,
        y: number,
        font: Font,
        text: string,
        color: ColorInterface,
        animationType: TextAnimationType = TextAnimationType.Static,
        animationSpeed: number = 1.0,
        maxWidth?: number,
        hAlign: 'left' | 'center' | 'right' = 'center',
        vAlign: 'top' | 'center' | 'bottom' = 'center',
        textSize: number = 1.0,
        textUpdateCallback?: () => string
    ) {
        const initialState: TextSpriteState = {
            x,
            y,
            text,
            currentCharIndex: 0,
            fadeAlpha: animationType === TextAnimationType.Fade ? 0 : 1,
            wavePhase: 0,
            bouncePhase: 0,
            scrollOffsetX: 0,
            scrollOffsetY: 0,
            perspectiveY: 0
        };

        // Create a dummy sprite string (text rendering happens in render())
        super(".", initialState, {
            bounceOnEdges: false,
            wrapAround: false
        });

        this.font = font;
        this.color = color;
        this.animationType = animationType;
        this.textContent = text;
        this.animationSpeed = animationSpeed;
        this.maxWidth = maxWidth || 1000;
        this.hAlign = hAlign;
        this.vAlign = vAlign;
        this.textSize = textSize;
        this.textUpdateCallback = textUpdateCallback;
        // Load font
        this.font.load();
        
        // Measure actual font dimensions for accurate wrapping
        const measurements = this.font.measureActualDimensions();
        if (measurements.width > 0) {
            this.font.width = measurements.width;
        }
        if (measurements.height > 0) {
            this.font.height = measurements.height;
        }
        
        // Split and wrap text to fit display width
        this.textLines = this.wrapText(text);
    }

    /**
     * Auto-scale text to fit within display if needed
     */
    private autoScaleToFit() {
        if (this.boxWidth === 0 || this.boxHeight === 0) return; // Not initialized yet
        
        // Calculate total text dimensions with current scale
        const scaledFontHeight = this.font.height * this.textSize;
        const lineSpacing = 2 * this.textSize;
        const totalHeight = this.textLines.length * (scaledFontHeight + lineSpacing);
        
        // Find longest line
        let maxLineWidth = 0;
        for (const line of this.textLines) {
            const lineWidth = line.length * this.font.width * this.textSize;
            if (lineWidth > maxLineWidth) {
                maxLineWidth = lineWidth;
            }
        }
        
        // Check if text fits
        const widthRatio = maxLineWidth / (this.boxWidth * 0.99);
        const heightRatio = totalHeight / (this.boxHeight * 0.99);
        const maxRatio = Math.max(widthRatio, heightRatio);
        
        // If text doesn't fit, remove auto-scaling
        if (maxRatio > 1) {
            // Text doesn't fit - would need scaling which we removed
            // Just let it overflow or truncate
        }
    }

    /**
     * Wrap text to fit within maxWidth, breaking on word boundaries
     */
    private wrapText(text: string): string[] {
        const lines: string[] = [];
        const paragraphs = text.split('\n');
        
        // Calculate max characters per line based on font width - use 99% of display width
        // Use boxWidth if available (after first update), otherwise fall back to maxWidth
        const displayWidth = this.boxWidth > 0 ? this.boxWidth : this.maxWidth;
        const effectiveWidth = displayWidth * 0.99;
        const scaledFontWidth = this.font.width * this.textSize;
        const maxCharsPerLine = Math.floor(effectiveWidth / scaledFontWidth);
        
        for (const paragraph of paragraphs) {
            if (paragraph.length === 0) {
                lines.push('');
                continue;
            }
            
            // If paragraph fits, use it as-is
            if (paragraph.length <= maxCharsPerLine) {
                lines.push(paragraph);
                continue;
            }
            
            // Word wrap the paragraph
            const words = paragraph.split(' ');
            let currentLine = '';
            
            for (const word of words) {
                // If word itself is too long, break it
                if (word.length > maxCharsPerLine) {
                    if (currentLine.length > 0) {
                        lines.push(currentLine.trim());
                        currentLine = '';
                    }
                    // Break long word into chunks
                    for (let i = 0; i < word.length; i += maxCharsPerLine) {
                        lines.push(word.substring(i, i + maxCharsPerLine));
                    }
                    continue;
                }
                
                // Check if adding this word exceeds line length
                const testLine = currentLine.length > 0 ? currentLine + ' ' + word : word;
                
                if (testLine.length <= maxCharsPerLine) {
                    currentLine = testLine;
                } else {
                    // Current line is full, start new line
                    if (currentLine.length > 0) {
                        lines.push(currentLine.trim());
                    }
                    currentLine = word;
                }
            }
            
            // Add remaining text
            if (currentLine.length > 0) {
                lines.push(currentLine.trim());
            }
        }
        
        return lines;
    }

    /**
     * Update text content (useful for dynamic text sources)
     */
    setText(newText: string) {
        this.textContent = newText;
        this.textLines = this.wrapText(newText);
        // Reset animation-specific states when text changes
        if (this.animationType === TextAnimationType.Typewriter) {
            this.charIndex = 0;
        }
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        const firstUpdate = this.boxWidth === 0;
        this.boxWidth = boxWidth;
        this.boxHeight = boxHeight;
        
        // Update text content if callback is provided
        if (this.textUpdateCallback) {
            const newText = this.textUpdateCallback();
            if (newText !== this.textContent) {
                this.textContent = newText;
                this.textLines = this.wrapText(this.textContent);
            }
        }
        
        // Re-wrap text on first update when we know actual box dimensions
        if (firstUpdate) {
            this.textLines = this.wrapText(this.textContent);
            // Auto-scale if text doesn't fit
            this.autoScaleToFit();
            // Initialize Star Wars scroll position at bottom
            if (this.animationType === TextAnimationType.StarWarsIntro) {
                this.perspectiveY = boxHeight;
            }
        }
        
        switch (this.animationType) {
            case TextAnimationType.ScrollHorizontal:
                this.updateScrollHorizontal(frameNr, boxWidth);
                break;
            case TextAnimationType.ScrollVertical:
                this.updateScrollVertical(frameNr, boxHeight);
                break;
            case TextAnimationType.StarWarsIntro:
                this.updateStarWarsIntro(frameNr, boxHeight);
                break;
            case TextAnimationType.Typewriter:
                this.updateTypewriter(frameNr);
                break;
            case TextAnimationType.Fade:
                this.updateFade(frameNr);
                break;
            case TextAnimationType.Wave:
                this.updateWave(frameNr);
                break;
            case TextAnimationType.Bounce:
                this.updateBounce(frameNr);
                break;
            case TextAnimationType.Static:
            default:
                // No animation updates needed
                break;
        }
    }

    private updateScrollHorizontal(frameNr: number, boxWidth: number) {
        // For horizontal scroll, use single line text for continuous scrolling
        const singleLineText = this.textContent.replace(/\n/g, ' ');
        const textWidth = singleLineText.length * this.font.width * this.textSize;
        const spacing = 20 * this.textSize; // Spacing between loop iterations
        
        const scrollSpeed = this.animationSpeed * 0.5;
        this.scrollOffsetX -= scrollSpeed;
        
        // Loop seamlessly: when text + spacing scrolls off, reset
        if (this.scrollOffsetX < -(textWidth + spacing)) {
            this.scrollOffsetX = 0;
        }
    }

    private updateScrollVertical(frameNr: number, boxHeight: number) {
        const scrollSpeed = this.animationSpeed * 0.3;
        
        this.scrollOffsetY -= scrollSpeed;
        
        // Wrap around when text scrolls off top with scaled height
        const scaledFontHeight = this.font.height * this.textSize;
        const lineSpacing = 2 * this.textSize;
        const totalHeight = this.textLines.length * (scaledFontHeight + lineSpacing);
        
        // Complete scroll: text enters from bottom, scrolls up, exits top, then wraps
        if (this.scrollOffsetY < -totalHeight) {
            this.scrollOffsetY = boxHeight;
        }
    }

    private updateStarWarsIntro(frameNr: number, boxHeight: number) {
        // Scroll upward from bottom to top
        const scrollSpeed = this.animationSpeed * 0.3;
        
        // Calculate total text height
        const lineHeight = (this.font.height + 2) * this.textSize;
        const totalTextHeight = this.textLines.length * lineHeight;
        
        // Scroll upward
        this.perspectiveY -= scrollSpeed;
        
        // Reset when all text has scrolled past the top
        if (this.perspectiveY < -totalTextHeight) {
            this.perspectiveY = boxHeight;
        }
    }

    private updateTypewriter(frameNr: number) {
        // Gradually reveal characters
        const charsPerFrame = this.animationSpeed * 0.2;
        
        if (this.charIndex < this.textContent.length) {
            this.charIndex += charsPerFrame;
        } else {
            // Hold complete text for a moment, then reset
            if (frameNr % (60 * 5) === 0) { // 5 second pause at 60fps
                this.charIndex = 0;
            }
        }
    }

    private updateFade(frameNr: number) {
        // Fade in, hold fully visible, then fade out
        const fadeSpeed = this.animationSpeed * 0.02;
        
        this.fadeAlpha += fadeSpeed;
        
        // Hold at full opacity for a moment (pause between 0.9 and 1.1)
        if (this.fadeAlpha >= 0.9 && this.fadeAlpha <= 1.1) {
            // Slow down at peak visibility
            this.fadeAlpha += fadeSpeed * 0.2;
        }
        
        // Cycle: fade in (0-1), hold (1), fade out (1-2), reset
        if (this.fadeAlpha > 2) {
            this.fadeAlpha = 0;
        }
    }

    private updateWave(frameNr: number) {
        // Update wave phase for sine wave motion
        this.wavePhase = frameNr * this.animationSpeed * 0.1;
    }

    private updateBounce(frameNr: number) {
        // Update bounce phase
        this.bouncePhase = frameNr * this.animationSpeed * 0.15;
    }

    render(): PixelList {
        const pixels = new PixelList();

        switch (this.animationType) {
            case TextAnimationType.ScrollHorizontal:
                this.renderScrollHorizontal(pixels);
                break;
            case TextAnimationType.ScrollVertical:
                this.renderScrollVertical(pixels);
                break;
            case TextAnimationType.StarWarsIntro:
                this.renderStarWarsIntro(pixels);
                break;
            case TextAnimationType.Typewriter:
                this.renderTypewriter(pixels);
                break;
            case TextAnimationType.Fade:
                this.renderFade(pixels);
                break;
            case TextAnimationType.Wave:
                this.renderWave(pixels);
                break;
            case TextAnimationType.Bounce:
                this.renderBounce(pixels);
                break;
            case TextAnimationType.Static:
            default:
                this.renderStatic(pixels);
                break;
        }

        return pixels;
    }

    private renderStatic(pixels: PixelList) {
        // Calculate total text height with scaling
        const scaledFontHeight = this.font.height * this.textSize;
        const lineSpacing = 2 * this.textSize;
        const totalTextHeight = this.textLines.length * (scaledFontHeight + lineSpacing) - lineSpacing;
        
        // Calculate starting Y based on vertical alignment
        let yStart = this.state.y;
        if (this.vAlign === 'center') {
            yStart = this.state.y - (totalTextHeight / 2);
        } else if (this.vAlign === 'bottom') {
            yStart = this.state.y - totalTextHeight;
        }
        // For 'top', yStart stays at this.state.y
        
        let yOffset = 0;
        for (const line of this.textLines) {
            const lineWidth = line.length * this.font.width * this.textSize;
            
            // Calculate X position based on horizontal alignment
            let xPos = this.state.x;
            if (this.hAlign === 'center') {
                xPos = this.state.x - (lineWidth / 2);
            } else if (this.hAlign === 'right') {
                xPos = this.state.x - lineWidth;
            }
            // For 'left', xPos stays at this.state.x
            
            const text = new DrawText(
                (xPos + 0.5) | 0,
                (yStart + yOffset + 0.5) | 0,
                this.font,
                line,
                this.color,
                this.textSize
            );
            pixels.add(text);
            yOffset += scaledFontHeight + lineSpacing;
        }
    }

    private renderScrollHorizontal(pixels: PixelList) {
        // For horizontal scroll, use original unwrapped text on a single line
        // Replace newlines with spaces to keep it continuous
        const singleLineText = this.textContent.replace(/\n/g, ' ');
        const textWidth = singleLineText.length * this.font.width * this.textSize;
        
        // Center vertically
        const scaledFontHeight = this.font.height * this.textSize;
        let yPos = this.state.y;
        if (this.vAlign === 'center') {
            yPos = this.state.y + ((this.boxHeight - scaledFontHeight) / 2);
        } else if (this.vAlign === 'bottom') {
            yPos = this.state.y + (this.boxHeight - scaledFontHeight);
        }
        
        // Render the scrolling text
        const xPos = this.state.x + this.scrollOffsetX;
        const text = new DrawText(
            (xPos + 0.5) | 0,
            (yPos + 0.5) | 0,
            this.font,
            singleLineText,
            this.color,
            this.textSize
        );
        pixels.add(text);
        
        // Also render a copy for seamless looping
        // When text scrolls off left, the copy appears from right
        const text2 = new DrawText(
            (xPos + textWidth + 20 * this.textSize + 0.5) | 0,
            (yPos + 0.5) | 0,
            this.font,
            singleLineText,
            this.color,
            this.textSize
        );
        pixels.add(text2);
    }

    private renderScrollVertical(pixels: PixelList) {
        // Calculate total text height with scaling
        const scaledFontHeight = this.font.height * this.textSize;
        const lineSpacing = 2 * this.textSize;
        const totalTextHeight = this.textLines.length * (scaledFontHeight + lineSpacing) - lineSpacing;
        
        // Calculate starting Y based on vertical alignment
        let yStart = this.scrollOffsetY;
        if (this.vAlign === 'center') {
            yStart = this.scrollOffsetY - (totalTextHeight / 2);
        } else if (this.vAlign === 'bottom') {
            yStart = this.scrollOffsetY - totalTextHeight;
        }
        
        for (const line of this.textLines) {
            const lineWidth = line.length * this.font.width * this.textSize;
            
            // Calculate X position based on horizontal alignment
            let xPos = this.state.x;
            if (this.hAlign === 'center') {
                xPos = this.state.x - (lineWidth / 2);
            } else if (this.hAlign === 'right') {
                xPos = this.state.x - lineWidth;
            }
            const text = new DrawText(
                (xPos + 0.5) | 0,
                (yStart + 0.5) | 0,
                this.font,
                line,
                this.color,
                this.textSize
            );
            pixels.add(text);
            yStart += scaledFontHeight + lineSpacing;
        }
    }

    private renderStarWarsIntro(pixels: PixelList) {
        // Star Wars style crawl: scroll from bottom to top with fade at top
        const lineHeight = (this.font.height + 2) * this.textSize;
        const fadeZone = this.boxHeight * 0.3; // Top 30% fades out
        
        let currentY = this.perspectiveY;
        
        for (let i = 0; i < this.textLines.length; i++) {
            const line = this.textLines[i];
            
            // Calculate alpha based on Y position - fade at top
            let alpha = 1.0;
            if (currentY < fadeZone) {
                // Fade from full opacity at fadeZone to 0 at top
                alpha = Math.max(0, currentY / fadeZone);
            }
            
            // Only render if visible and not fully transparent
            if (currentY > -lineHeight && currentY < this.boxHeight && alpha > 0.01) {
                const lineWidth = line.length * this.font.width * this.textSize;
                
                // Calculate X position based on horizontal alignment
                let xPos = this.state.x;
                if (this.hAlign === 'center') {
                    xPos = this.state.x - (lineWidth / 2);
                } else if (this.hAlign === 'right') {
                    xPos = this.state.x - lineWidth;
                }
                
                // Create color with fade
                const fadeColor = new Color(
                    this.color.r,
                    this.color.g,
                    this.color.b,
                    alpha * (this.color.a || 1)
                );
                
                const text = new DrawText(
                    (xPos + 0.5) | 0,
                    (currentY + 0.5) | 0,
                    this.font,
                    line,
                    fadeColor,
                    this.textSize
                );
                pixels.add(text);
            }
            
            // Move to next line
            currentY += lineHeight;
        }
    }

    private renderTypewriter(pixels: PixelList) {
        // Only show characters up to charIndex - need to account for wrapped lines
        const visibleText = this.textContent.substring(0, (this.charIndex + 0.5) | 0);
        // Re-wrap the visible portion to match display wrapping
        const visibleLines = this.wrapText(visibleText);
        // Calculate total text height with scaling
        const scaledFontHeight = this.font.height * this.textSize;
        const lineSpacing = 2 * this.textSize;
        const totalTextHeight = visibleLines.length * (scaledFontHeight + lineSpacing) - lineSpacing;
        
        // Calculate starting Y based on vertical alignment
        let yStart = this.state.y;
        if (this.vAlign === 'center') {
            yStart = this.state.y - (totalTextHeight / 2);
        } else if (this.vAlign === 'bottom') {
            yStart = this.state.y - totalTextHeight;
        }
        
        let yOffset = 0;
        for (const line of visibleLines) {
            if (line.length > 0) {
                const lineWidth = line.length * this.font.width * this.textSize;
                
                // Calculate X position based on horizontal alignment
                let xPos = this.state.x;
                if (this.hAlign === 'center') {
                    xPos = this.state.x - (lineWidth / 2);
                } else if (this.hAlign === 'right') {
                    xPos = this.state.x - lineWidth;
                }
                const text = new DrawText(
                    (xPos + 0.5) | 0,
                    (yStart + yOffset + 0.5) | 0,
                    this.font,
                    line,
                    this.color,
                    this.textSize
                );
                pixels.add(text);
            }
            yOffset += scaledFontHeight + lineSpacing;
        }
    }

    private renderFade(pixels: PixelList) {
        // Calculate alpha based on fade cycle
        let alpha = this.fadeAlpha;
        if (alpha > 1) {
            alpha = 2 - alpha; // Fade out phase
        }
        // Create color with alpha
        const fadedColor = new Color(
            this.color.r,
            this.color.g,
            this.color.b,
            alpha
        );
        // Calculate total text height with scaling
        const scaledFontHeight = this.font.height * this.textSize;
        const lineSpacing = 2 * this.textSize;
        const totalTextHeight = this.textLines.length * (scaledFontHeight + lineSpacing) - lineSpacing;
        
        // Calculate starting Y based on vertical alignment
        let yStart = this.state.y;
        if (this.vAlign === 'center') {
            yStart = this.state.y - (totalTextHeight / 2);
        } else if (this.vAlign === 'bottom') {
            yStart = this.state.y - totalTextHeight;
        }
        
        let yOffset = 0;
        for (const line of this.textLines) {
            const lineWidth = line.length * this.font.width * this.textSize;
            
            // Calculate X position based on horizontal alignment
            let xPos = this.state.x;
            if (this.hAlign === 'center') {
                xPos = this.state.x - (lineWidth / 2);
            } else if (this.hAlign === 'right') {
                xPos = this.state.x - lineWidth;
            }
            const text = new DrawText(
                (xPos + 0.5) | 0,
                (yStart + yOffset + 0.5) | 0,
                this.font,
                line,
                fadedColor,
                this.textSize
            );
            pixels.add(text);
            yOffset += scaledFontHeight + lineSpacing;
        }
    }

    private renderWave(pixels: PixelList) {
        // Render text with sine wave vertical offset per character
        // Calculate total text height with scaling
        const scaledFontHeight = this.font.height * this.textSize;
        const lineSpacing = 2 * this.textSize;
        const totalTextHeight = this.textLines.length * (scaledFontHeight + lineSpacing) - lineSpacing;
        
        // Calculate starting Y based on vertical alignment
        let yStart = this.state.y;
        if (this.vAlign === 'center') {
            yStart = this.state.y - (totalTextHeight / 2);
        } else if (this.vAlign === 'bottom') {
            yStart = this.state.y - totalTextHeight;
        }
        
        let yOffset = 0;
        for (const line of this.textLines) {
            const lineWidth = line.length * this.font.width * this.textSize;
            let charX = 0;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const waveOffset = Math.sin(this.wavePhase + i * 0.5) * 3 * this.textSize;
                
                // Calculate X position based on horizontal alignment
                let xPos = this.state.x + charX;
                if (this.hAlign === 'center') {
                    xPos = this.state.x + charX - (lineWidth / 2);
                } else if (this.hAlign === 'right') {
                    xPos = this.state.x + charX - lineWidth;
                }
                const text = new DrawText(
                    (xPos + 0.5) | 0,
                    (yStart + yOffset + waveOffset + 0.5) | 0,
                    this.font,
                    char,
                    this.color,
                    this.textSize
                );
                pixels.add(text);
                charX += this.font.width * this.textSize;
            }
            yOffset += scaledFontHeight + lineSpacing;
        }
    }

    private renderBounce(pixels: PixelList) {
        // Bounce text up and down
        const bounceOffset = Math.sin(this.bouncePhase) * 5 * this.textSize;
        // Calculate total text height with scaling
        const scaledFontHeight = this.font.height * this.textSize;
        const lineSpacing = 2 * this.textSize;
        const totalTextHeight = this.textLines.length * (scaledFontHeight + lineSpacing) - lineSpacing;
        
        // Calculate starting Y based on vertical alignment
        let yStart = this.state.y;
        if (this.vAlign === 'center') {
            yStart = this.state.y - (totalTextHeight / 2);
        } else if (this.vAlign === 'bottom') {
            yStart = this.state.y - totalTextHeight;
        }
        
        let yOffset = 0;
        for (const line of this.textLines) {
            const lineWidth = line.length * this.font.width * this.textSize;
            
            // Calculate X position based on horizontal alignment
            let xPos = this.state.x;
            if (this.hAlign === 'center') {
                xPos = this.state.x - (lineWidth / 2);
            } else if (this.hAlign === 'right') {
                xPos = this.state.x - lineWidth;
            }
            const text = new DrawText(
                (xPos + 0.5) | 0,
                (yStart + yOffset + bounceOffset + 0.5) | 0,
                this.font,
                line,
                this.color,
                this.textSize
            );
            pixels.add(text);
            yOffset += scaledFontHeight + lineSpacing;
        }
    }
}

/**
 * Dynamic text sprite that can fetch content from external sources
 */
export class DynamicTextSprite extends TextSprite {
    private sourceType: TextSourceType;
    private sourceUrl?: string;
    private updateInterval: number;
    private lastUpdate: number = 0;
    private fetchInProgress: boolean = false;

    constructor(
        x: number,
        y: number,
        font: Font,
        initialText: string,
        color: ColorInterface,
        animationType: TextAnimationType,
        sourceType: TextSourceType,
        sourceUrl?: string,
        updateInterval: number = 300, // Update every 300 frames (5 minutes at 60fps)
        animationSpeed: number = 1.0,
        maxWidth?: number,
        hAlign: 'left' | 'center' | 'right' = 'center',
        vAlign: 'top' | 'center' | 'bottom' = 'center',
        textSize: number = 1.0
    ) {
        super(x, y, font, initialText, color, animationType, animationSpeed, maxWidth, hAlign, vAlign, textSize);
        
        this.sourceType = sourceType;
        this.sourceUrl = sourceUrl;
        this.updateInterval = updateInterval;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Call parent animation update
        super.update(frameNr, boxWidth, boxHeight);
        
        // Check if we need to fetch new content
        if (this.sourceType !== TextSourceType.Manual && 
            frameNr - this.lastUpdate > this.updateInterval &&
            !this.fetchInProgress) {
            this.fetchContent();
            this.lastUpdate = frameNr;
        }
    }

    private async fetchContent() {
        if (!this.sourceUrl) return;
        
        this.fetchInProgress = true;
        
        try {
            if (this.sourceType === TextSourceType.RSS) {
                await this.fetchRSS();
            } else if (this.sourceType === TextSourceType.JSON) {
                await this.fetchJSON();
            }
        } catch (error) {
            // Silently fail - network errors or invalid URLs shouldn't crash
        } finally {
            this.fetchInProgress = false;
        }
    }

    private async fetchRSS() {
        // Note: RSS fetching would typically use a helper like getRssFeedData
        // For now, this is a placeholder that shows the structure
        try {
            const response = await fetch(this.sourceUrl!);
            const text = await response.text();
            
            // Parse RSS (simplified - in production use proper RSS parser)
            const titleMatch = text.match(/<title>([^<]+)<\/title>/);
            if (titleMatch) {
                this.setText(titleMatch[1]);
            }
        } catch (error) {
            // Silently fail - keep fallback text
        }
    }

    private async fetchJSON() {
        try {
            const response = await fetch(this.sourceUrl!);
            const data = await response.json();
            
            // Assume JSON has a 'text' or 'message' field
            const newText = data.text || data.message || JSON.stringify(data);
            this.setText(newText);
        } catch (error) {
            // Silently fail - keep fallback text
        }
    }

    /**
     * Manually update the source URL
     */
    setSourceUrl(url: string) {
        this.sourceUrl = url;
        this.lastUpdate = 0; // Force update on next frame
    }
}

export const TextSprites = {
    Text: TextSprite,
    DynamicText: DynamicTextSprite
};
