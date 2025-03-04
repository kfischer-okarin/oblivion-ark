// The Swift Programming Language
// https://docs.swift.org/swift-book

import AppKit

@MainActor
class AppDelegate: NSObject, NSApplicationDelegate {
    var panel: NSPanel!
    var statusItem: NSStatusItem!

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Get screen dimensions to calculate panel size and position
        let screenFrame = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1200, height: 800)
        let panelWidth = screenFrame.width * 0.6

        // Create a panel window with no title bar or buttons
        panel = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: panelWidth, height: 100),
            styleMask: [.nonactivatingPanel, .borderless, .hudWindow],
            backing: .buffered,
            defer: false
        )
        panel.isReleasedWhenClosed = false
        panel.level = .floating  // Make the panel float above others
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = true
        panel.isMovableByWindowBackground = true  // Allow dragging the panel

        // Create the content view with a light background and rounded corners
        let contentView = NSView(frame: panel.contentView!.bounds)
        contentView.wantsLayer = true
        contentView.layer?.backgroundColor = NSColor.windowBackgroundColor.withAlphaComponent(0.9).cgColor
        contentView.layer?.cornerRadius = 12
        contentView.layer?.borderWidth = 1
        contentView.layer?.borderColor = NSColor.gray.withAlphaComponent(0.3).cgColor

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

        // Center the panel on the screen
        let xPosition = (screenFrame.width - panel.frame.width) / 2 + screenFrame.origin.x
        let yPosition = (screenFrame.height - panel.frame.height) / 2 + screenFrame.origin.y
        panel.setFrameOrigin(NSPoint(x: xPosition, y: yPosition))

        panel.makeKeyAndOrderFront(nil)

        // Add a status bar item to control the panel
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.title = "MH"

        let statusMenu = NSMenu(title: "MindHub Menu")
        statusMenu.addItem(NSMenuItem(title: "Show/Hide Panel", action: #selector(togglePanel), keyEquivalent: "s"))
        statusMenu.addItem(NSMenuItem(title: "Quit", action: #selector(quitApp), keyEquivalent: "q"))
        statusItem.menu = statusMenu
    }

    @objc func togglePanel() {
        if panel.isVisible {
            panel.orderOut(nil)
        } else {
            panel.makeKeyAndOrderFront(nil)
        }
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
