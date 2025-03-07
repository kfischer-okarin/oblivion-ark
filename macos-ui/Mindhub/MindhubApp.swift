//
//  MindhubApp.swift
//  Mindhub
//
//  Created by Kevin Fischer on 2025/03/05.
//

import SwiftUI

@main
struct MindhubApp: App {
    @Environment(\.openWindow) private var openWindow

    var body: some Scene {
        MenuBarExtra {
            Button("Quick Capture") {
                openWindow(id: "quick-capture")
            }

        } label: {
            Image(systemName: "brain.head.profile")
            Text("Mindhub")
        }

        Window("Capture Note", id: "quick-capture") {
            QuickCaptureView()
            .onAppear {
                NSApp.activate(ignoringOtherApps: true)
            }
        }
        .windowLevel(.floating)
    }
}

struct QuickCaptureView: View {
    @State private var note: String = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack {
            TextEditor(text: $note)
                .frame(minWidth: 300, minHeight: 200)
                .padding()
                .focused($isFocused)
        }
        .onAppear() {
            isFocused = true
        }
    }
}
