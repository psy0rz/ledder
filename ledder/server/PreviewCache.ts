/**
 * Decides which preset previews need to be re-rendered, by content instead of by modification time.
 *
 * Modification times are a bad fit here: a plain `npx tsc` rewrites every compiled .js (even the
 * unchanged ones), and a git clone/checkout stamps every file with the checkout time. Both make the
 * whole preview set look outdated and trigger a full, very slow re-render. At the same time mtimes
 * are too coarse in the other direction: editing a shared Component or Fx never marks the previews
 * of the animations that use it as outdated.
 *
 * So instead we hash what the preview actually depends on:
 *  - the preset .json,
 *  - the animation's compiled .js *and* every local module it imports, transitively (which reaches
 *    the Components/Fx/Draw helpers and the core framework),
 *  - the render signature (preview size/format), so changing the preview renderer rebuilds all.
 *
 * The resulting hashes are stored next to the previews in presets/previewhashes.json, and a preview
 * is re-rendered only when its hash changed or its .png is missing.
 */

import {createHash} from "crypto"
import {readFile, stat, writeFile} from "fs/promises"
import * as path from "path"

//bump when the hashing scheme itself changes, to invalidate all stored hashes
const hashSchemeVersion = 1

//matches the module specifier of `import x from "./y.js"`, `export * from "../z.js"`,
//`import "./a.js"` and `await import("./b.js")`. Only relative specifiers are captured: bare
//specifiers are node_modules and are covered by the package version, not by our own sources.
const relativeImportRegex = /(?:\bfrom|\bimport)\s*\(?\s*(['"])(\.[^'"]*)\1/g

//content hash of a file that could not be read, e.g. does not exist
const missingFileContentHash = ""

type ScannedFile = {
    contentHash: string
    //resolved absolute filenames of the relative imports, may point at nonexisting files
    importedFilenames: string[]
}

export class PreviewCache {

    private hashFilename: string
    private renderSignature: string

    //hashes as loaded from disk at startup, and the ones we (re)confirmed during this run.
    //confirmedHashes is written back at the end, so entries of deleted presets are pruned.
    private storedHashes: Record<string, string> = {}
    private confirmedHashes: Record<string, string> = {}

    //memoization, since animations share most of their module graph
    private scannedFileByName = new Map<string, ScannedFile>()
    private moduleGraphHashByEntry = new Map<string, string>()

    constructor(hashFilename: string, renderSignature: string) {
        this.hashFilename = hashFilename
        this.renderSignature = renderSignature
    }

    async loadStoredHashes() {
        this.storedHashes = {}
        try {
            const stored = JSON.parse(await readFile(this.hashFilename, 'utf8'))
            if (stored.version === hashSchemeVersion && stored.renderSignature === this.renderSignature)
                this.storedHashes = stored.hashes
        } catch (e) {
            //no (or unreadable) hash file: everything is simply considered outdated
        }
    }

    /**
     * Write the hashes back to disk.
     * pruneUnconfirmed drops everything we did not see during this run, and may only be used after
     * walking the complete preset list (e.g. buildpreviews). Otherwise the hashes of previews we
     * did not look at are kept.
     */
    async storeHashes(pruneUnconfirmed: boolean) {
        let hashesToStore = this.confirmedHashes
        if (!pruneUnconfirmed) {
            //re-read, so we merge with whatever a concurrently running buildpreviews stored
            await this.loadStoredHashes()
            hashesToStore = {...this.storedHashes, ...this.confirmedHashes}
        }

        await writeFile(this.hashFilename, JSON.stringify({
            version: hashSchemeVersion,
            renderSignature: this.renderSignature,
            hashes: hashesToStore
        }, undefined, ' '), 'utf8')
    }

    /**
     * Drop all memoized file contents. Needed in the long running server, where files change
     * (recompiled animations, saved presets) between two previews.
     */
    forgetFileContents() {
        this.scannedFileByName.clear()
        this.moduleGraphHashByEntry.clear()
    }

    /**
     * True when the preview .png is missing or no longer matches the current content of the
     * animation, its imports and the preset.
     */
    async previewOutdated(previewFilename: string, animationFilename: string, presetFilename: string) {
        const currentHash = await this.previewHash(animationFilename, presetFilename)

        if (this.storedHashes[previewFilename] === currentHash && await this.fileExists(previewFilename)) {
            //still valid: keep it in the hash file
            this.confirmedHashes[previewFilename] = currentHash
            return false
        }

        return true
    }

    /**
     * Remember that this preview was rendered succesfully from the current content.
     */
    async previewRendered(previewFilename: string, animationFilename: string, presetFilename: string) {
        this.confirmedHashes[previewFilename] = await this.previewHash(animationFilename, presetFilename)
    }

    private async previewHash(animationFilename: string, presetFilename: string) {
        const hash = createHash('sha1')
        hash.update(this.renderSignature)
        hash.update(await this.moduleGraphHash(animationFilename))
        //the default preset does not have to exist on disk
        hash.update((await this.scanFile(path.resolve(presetFilename))).contentHash)
        return hash.digest('hex')
    }

    /**
     * Hash of the animation module together with every local module it imports, transitively.
     */
    private async moduleGraphHash(entryFilename: string) {
        const memoized = this.moduleGraphHashByEntry.get(entryFilename)
        if (memoized !== undefined)
            return memoized

        const visitedFilenames = new Set<string>()
        const filenamesToVisit = [path.resolve(entryFilename)]
        while (filenamesToVisit.length) {
            const filename = filenamesToVisit.pop()
            if (visitedFilenames.has(filename))
                continue

            const scannedFile = await this.scanFile(filename)
            //an import that resolves to nothing: a stale import, or a false positive of the regex
            if (scannedFile.contentHash === missingFileContentHash)
                continue
            visitedFilenames.add(filename)

            for (const importedFilename of scannedFile.importedFilenames)
                if (!visitedFilenames.has(importedFilename))
                    filenamesToVisit.push(importedFilename)
        }

        //sorted, so the hash does not depend on traversal order
        const hash = createHash('sha1')
        for (const filename of [...visitedFilenames].sort()) {
            hash.update(filename)
            hash.update((await this.scanFile(filename)).contentHash)
        }

        const graphHash = hash.digest('hex')
        this.moduleGraphHashByEntry.set(entryFilename, graphHash)
        return graphHash
    }

    /**
     * Content hash and resolved relative imports of one file, from a single read.
     * Memoized: animations share almost their whole module graph, so without this every core file
     * would be read hundreds of times.
     */
    private async scanFile(filename: string): Promise<ScannedFile> {
        const memoized = this.scannedFileByName.get(filename)
        if (memoized !== undefined)
            return memoized

        let scannedFile: ScannedFile
        try {
            const source = await readFile(filename, 'utf8')

            const importedFilenames: string[] = []
            for (const match of source.matchAll(relativeImportRegex))
                importedFilenames.push(path.resolve(path.dirname(filename), match[2]))

            scannedFile = {
                contentHash: createHash('sha1').update(source).digest('hex'),
                importedFilenames
            }
        } catch (e) {
            scannedFile = {contentHash: missingFileContentHash, importedFilenames: []}
        }

        this.scannedFileByName.set(filename, scannedFile)
        return scannedFile
    }

    private async fileExists(filename: string) {
        try {
            await stat(filename)
            return true
        } catch (e) {
            return false
        }
    }
}
