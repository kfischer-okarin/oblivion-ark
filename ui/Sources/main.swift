// The Swift Programming Language
// https://docs.swift.org/swift-book

import AppKit

@MainActor
class AppDelegate: NSObject, NSApplicationDelegate {
    var panel: NSPanel!
    var statusItem: NSStatusItem!

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Create a panel window with a small size
        panel = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: 300, height: 100),
            styleMask: [.titled, .closable, .nonactivatingPanel],
            backing: .buffered,
            defer: false
        )
        panel.title = "MindHub"
        panel.center()
        panel.isReleasedWhenClosed = false
        panel.level = .floating  // Make the panel float above others
        panel.isOpaque = false
        panel.backgroundColor = .clear

        // Create the content view with a light background
        let contentView = NSView(frame: panel.contentView!.bounds)
        contentView.wantsLayer = true
        contentView.layer?.backgroundColor = NSColor.windowBackgroundColor.withAlphaComponent(0.9).cgColor
        contentView.layer?.cornerRadius = 8

        // Create a text label
        let label = NSTextField(frame: NSRect(x: 0, y: 0, width: 200, height: 30))
        label.stringValue = "Hello World!"
        label.font = NSFont.systemFont(ofSize: 18, weight: .medium)
        label.textColor = NSColor.labelColor
        label.isEditable = false
        label.isBordered = false
        label.drawsBackground = false
        label.alignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false

        contentView.addSubview(label)

        // Center the label in the content view
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: contentView.centerYAnchor)
        ])

        panel.contentView = contentView
        panel.makeKeyAndOrderFront(nil)

        // Add a status bar item to control the panel
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.title = "MH"

        let statusMenu = NSMenu(title: "MindHub Menu")
        statusMenu.addItem(NSMenuItem(title: "Show Panel", action: #selector(showPanel), keyEquivalent: "s"))
        statusMenu.addItem(NSMenuItem(title: "Quit", action: #selector(quitApp), keyEquivalent: "q"))
        statusItem.menu = statusMenu

        // Position panel near the top of the screen
        if let screenFrame = NSScreen.main?.visibleFrame {
            let xPosition = (screenFrame.width - panel.frame.width) / 2
            let yPosition = screenFrame.height - panel.frame.height - 50
            panel.setFrameOrigin(NSPoint(x: xPosition, y: yPosition))
        }
    }

    @objc func showPanel() {
        panel.makeKeyAndOrderFront(nil)
    }

    @objc func quitApp() {
        NSApp.terminate(nil)
    }
}

// Create and set up the application
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate

// Run the application
app.run()
