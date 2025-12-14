"use client"

import * as React from "react"
import {
    AlignLeft,
    MoveHorizontal,
    Bold,
    Settings2,
    ALargeSmall,
    ChevronRight,
    ChevronDown,
    ChevronLeft,
    ChevronUp,
    Scaling,
    RotateCcw
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Work } from "@/lib/db/schema"

export function Reader({ work }: { work: Work }) {
    const [fontSize, setFontSize] = React.useState([18])
    const [lineHeight, setLineHeight] = React.useState([1.6])
    const [letterSpacing, setLetterSpacing] = React.useState([0])
    const [maxWidth, setMaxWidth] = React.useState([100]) // Percentage
    const [fontFamily, setFontFamily] = React.useState("font-sans")
    const [fontWeight, setFontWeight] = React.useState("400")
    const [isCollapsed, setIsCollapsed] = React.useState(true)
    const [isLoaded, setIsLoaded] = React.useState(false)

    const resetSettings = () => {
        setFontSize([18])
        setLineHeight([1.6])
        setLetterSpacing([0])
        setMaxWidth([100])
        setFontFamily("font-sans")
        setFontWeight("400")
    }

    // Load preferences from local storage
    React.useEffect(() => {
        const savedPrefs = localStorage.getItem("reader-preferences")
        if (savedPrefs) {
            try {
                const parsed = JSON.parse(savedPrefs)
                if (parsed.fontSize) setFontSize(parsed.fontSize)
                if (parsed.lineHeight) setLineHeight(parsed.lineHeight)
                if (parsed.letterSpacing) setLetterSpacing(parsed.letterSpacing)
                if (parsed.maxWidth) setMaxWidth(parsed.maxWidth)
                if (parsed.fontFamily) setFontFamily(parsed.fontFamily)
                if (parsed.fontWeight) setFontWeight(parsed.fontWeight)
                if (parsed.isCollapsed !== undefined) setIsCollapsed(parsed.isCollapsed)
            } catch (e) {
                console.error("Failed to parse reader preferences", e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save preferences to local storage
    React.useEffect(() => {
        if (!isLoaded) return
        const prefs = {
            fontSize,
            lineHeight,
            letterSpacing,
            maxWidth,
            fontFamily,
            fontWeight,
            isCollapsed
        }
        localStorage.setItem("reader-preferences", JSON.stringify(prefs))
    }, [fontSize, lineHeight, letterSpacing, maxWidth, fontFamily, fontWeight, isCollapsed, isLoaded])

import { getWorkTitle } from "@/lib/utils";

    return (
        <div className="flex flex-col lg:flex-row justify-center gap-6 relative my-8">
            {/* Main Content Area */}
            <main 
                className="w-full order-2 lg:order-1 transition-all duration-200 ease-in-out"
                style={{
                    maxWidth: `calc(56rem * ${maxWidth[0] / 100})`
                }}
            >
                <article>
                    <Card className="prose dark:prose-invert w-full max-w-none">
                        <CardHeader>
                            <h1 className="text-2xl font-bold mb-0">{getWorkTitle(work)}</h1>
                            {work.publicationDate && (
                                <time className="text-sm text-muted-foreground block mt-2" dateTime={new Date(work.publicationDate).toISOString()}>
                                    Veröffentlicht am {new Date(work.publicationDate).toLocaleDateString("de-DE")}
                                </time>
                            )}
                        </CardHeader>
                        <CardContent
                            className={cn(fontFamily)}
                            style={{
                                fontSize: `${fontSize[0]}px`,
                                lineHeight: lineHeight[0],
                                letterSpacing: `${letterSpacing[0]}em`,
                                fontWeight: fontWeight,
                            }}>
                            {work.content ? (
                                work.content.split('\n').map((line, i) => (
                                    line.trim() === "" 
                                        ? <br key={i} className="my-4" /> 
                                        : <p key={i} className="mb-4 whitespace-pre-wrap">{line}</p>
                                ))
                            ) : (
                                <p className="text-muted-foreground italic">Kein Inhalt.</p>
                            )}
                        </CardContent>
                    </Card>
                </article>
            </main>

            {/* Controls Sidebar */}
            <aside className={cn(
                "shrink-0 order-1 lg:order-2 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-auto" : "w-full lg:w-80"
            )}>
                <div className="lg:sticky lg:top-20 flex justify-end">
                    {isCollapsed ? (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsCollapsed(false)}
                            className="h-10 w-10 rounded-full shadow-md"
                            title="Einstellungen öffnen"
                        >
                            <Settings2 className="h-5 w-5" />
                        </Button>
                    ) : (
                        <Card className="w-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Settings2 className="w-4 h-4" />
                                    Leseeinstellungen
                                </CardTitle>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={resetSettings}
                                        title="Einstellungen zurücksetzen"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setIsCollapsed(true)}
                                        title="Einstellungen minimieren"
                                    >
                                        <ChevronLeft className="h-4 w-4 hidden lg:block" />
                                        <ChevronUp className="h-4 w-4 lg:hidden" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">

                                {/* Font Family */}
                                <div className="space-y-2">
                                    <ToggleGroup type="single" value={fontFamily} onValueChange={(value) => value && setFontFamily(value)}>
                                        <ToggleGroupItem value="font-serif" aria-label="Serif" className="flex-1">
                                            <span className="font-serif text-lg">Serif</span>
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="font-sans" aria-label="Sans" className="flex-1">
                                            <span className="font-sans text-lg">Sans</span>
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="font-mono" aria-label="Mono" className="flex-1">
                                            <span className="font-mono text-lg">Mono</span>
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </div>
                                <Separator />

                                {/* Font Weight */}
                                <div className="space-y-2">
                                    <ToggleGroup type="single" value={fontWeight} onValueChange={(value) => value && setFontWeight(value)}>
                                        <ToggleGroupItem value="300" className="flex-1 text-lg font-light">Leicht</ToggleGroupItem>
                                        <ToggleGroupItem value="400" className="flex-1 text-lg">Normal</ToggleGroupItem>
                                        <ToggleGroupItem value="600" className="flex-1 text-lg font-semibold">Dick</ToggleGroupItem>
                                    </ToggleGroup>
                                </div>

                                <Separator />

                                {/* Font Size */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="flex items-center gap-2">
                                            <ALargeSmall className="w-4 h-4" /> Textgröße
                                        </Label>
                                        <span className="text-sm text-muted-foreground">{fontSize[0]}px</span>
                                    </div>
                                    <Slider
                                        value={fontSize}
                                        defaultValue={[18]}
                                        onValueChange={setFontSize}
                                        min={12}
                                        max={32}
                                        step={1}
                                    />
                                </div>

                                {/* Line Height */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="flex items-center gap-2">
                                            <AlignLeft className="w-4 h-4" /> Zeilenhöhe
                                        </Label>
                                        <span className="text-sm text-muted-foreground">{lineHeight[0]}</span>
                                    </div>
                                    <Slider
                                        value={lineHeight}
                                        onValueChange={setLineHeight}
                                        min={1.0}
                                        max={2.5}
                                        step={0.1}
                                    />
                                </div>

                                {/* Letter Spacing */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="flex items-center gap-2">
                                            <MoveHorizontal className="w-4 h-4" /> Zeichenabstand
                                        </Label>
                                        <span className="text-sm text-muted-foreground">{letterSpacing[0]}em</span>
                                    </div>
                                    <Slider
                                        value={letterSpacing}
                                        onValueChange={setLetterSpacing}
                                        min={-0.05}
                                        max={0.25}
                                        step={0.01}
                                    />
                                </div>

                                {/* Content Width */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="flex items-center gap-2">
                                            <Scaling className="w-4 h-4" /> Inhaltsbreite
                                        </Label>
                                        <span className="text-sm text-muted-foreground">{maxWidth[0]}%</span>
                                    </div>
                                    <ToggleGroup type="single" value={maxWidth[0].toString()} onValueChange={(value) => value && setMaxWidth([parseInt(value)])}>
                                        <ToggleGroupItem value="50" className="flex-1">50%</ToggleGroupItem>
                                        <ToggleGroupItem value="75" className="flex-1">75%</ToggleGroupItem>
                                        <ToggleGroupItem value="100" className="flex-1">100%</ToggleGroupItem>
                                    </ToggleGroup>
                                </div>

                            </CardContent>
                        </Card>
                    )}
                </div>
            </aside>
        </div>
    )
}