#!/usr/bin/env swift

import AppKit
import Foundation
import PDFKit

// Source-derived mock asset for BioMap Agent demo.
// Do not use as product UI asset outside mock conversation examples.

struct AssetCrop {
    let sourcePDF: String
    let pageNumber: Int
    let cropRect: CGRect
    let outputName: String
}

let repositoryRoot = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let outputDirectory = repositoryRoot.appendingPathComponent("src/assets/mock-biomap-os", isDirectory: true)

let proteinDesignPDF = "/Users/songxuzhengjun/Documents/wechat_cli/BioMapOS手册-V1.0/蛋白设计-用户手册.pdf"
let intelligentExperimentPDF = "/Users/songxuzhengjun/Documents/wechat_cli/BioMapOS手册-V1.0/智能实验-用户手册.pdf"

let scale: CGFloat = 2

let crops = [
    AssetCrop(
        sourcePDF: proteinDesignPDF,
        pageNumber: 19,
        cropRect: CGRect(x: 42, y: 126, width: 511, height: 590),
        outputName: "mock-protein-moo-results-overview.png"
    ),
    AssetCrop(
        sourcePDF: proteinDesignPDF,
        pageNumber: 21,
        cropRect: CGRect(x: 44, y: 114, width: 507, height: 612),
        outputName: "mock-protein-surface-coloring-detail.png"
    ),
    AssetCrop(
        sourcePDF: proteinDesignPDF,
        pageNumber: 25,
        cropRect: CGRect(x: 45, y: 136, width: 505, height: 572),
        outputName: "mock-submit-to-wet-lab-menu.png"
    ),
    AssetCrop(
        sourcePDF: intelligentExperimentPDF,
        pageNumber: 6,
        cropRect: CGRect(x: 41, y: 112, width: 513, height: 618),
        outputName: "mock-experiment-order-detail.png"
    ),
    AssetCrop(
        sourcePDF: intelligentExperimentPDF,
        pageNumber: 11,
        cropRect: CGRect(x: 42, y: 0, width: 512, height: 360),
        outputName: "mock-cro-route-config.png"
    ),
]

try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

func renderCrop(_ crop: AssetCrop) throws {
    let sourceURL = URL(fileURLWithPath: crop.sourcePDF)

    guard let document = PDFDocument(url: sourceURL) else {
        throw NSError(domain: "MockBioMapAssetExtraction", code: 1, userInfo: [
            NSLocalizedDescriptionKey: "Could not open PDF: \(crop.sourcePDF)",
        ])
    }

    guard let page = document.page(at: crop.pageNumber - 1) else {
        throw NSError(domain: "MockBioMapAssetExtraction", code: 2, userInfo: [
            NSLocalizedDescriptionKey: "Could not read page \(crop.pageNumber) from \(crop.sourcePDF)",
        ])
    }

    let pageBounds = page.bounds(for: .mediaBox)
    let pixelWidth = Int(crop.cropRect.width * scale)
    let pixelHeight = Int(crop.cropRect.height * scale)

    guard
        let bitmap = NSBitmapImageRep(
            bitmapDataPlanes: nil,
            pixelsWide: pixelWidth,
            pixelsHigh: pixelHeight,
            bitsPerSample: 8,
            samplesPerPixel: 4,
            hasAlpha: true,
            isPlanar: false,
            colorSpaceName: .deviceRGB,
            bytesPerRow: 0,
            bitsPerPixel: 0
        ),
        let graphicsContext = NSGraphicsContext(bitmapImageRep: bitmap)
    else {
        throw NSError(domain: "MockBioMapAssetExtraction", code: 3, userInfo: [
            NSLocalizedDescriptionKey: "Could not create graphics context for \(crop.outputName)",
        ])
    }

    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = graphicsContext
    defer { NSGraphicsContext.restoreGraphicsState() }

    NSColor.white.setFill()
    NSRect(x: 0, y: 0, width: pixelWidth, height: pixelHeight).fill()

    let context = graphicsContext.cgContext
    context.interpolationQuality = .high
    context.scaleBy(x: scale, y: scale)
    context.translateBy(x: -crop.cropRect.minX, y: crop.cropRect.minY - pageBounds.height + crop.cropRect.height)
    page.draw(with: .mediaBox, to: context)

    guard let pngData = bitmap.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "MockBioMapAssetExtraction", code: 4, userInfo: [
            NSLocalizedDescriptionKey: "Could not encode PNG for \(crop.outputName)",
        ])
    }

    let outputURL = outputDirectory.appendingPathComponent(crop.outputName)
    try pngData.write(to: outputURL, options: .atomic)
    print("Wrote \(outputURL.path)")
}

for crop in crops {
    try renderCrop(crop)
}
