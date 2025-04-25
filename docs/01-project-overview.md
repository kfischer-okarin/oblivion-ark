# Oblivion Ark Project Overview

Oblivion Ark is a personal note-taking application.
Primary features are frictionless capturing of quick notes while working at the
computer and automatic AI-powered interconnections to other semantically or
contextually related notes.

## Architecture

### System Context

<!-- markdownlint-disable MD013 -->
```mermaid
flowchart TD
    User["<h4>Personal User</h4>[Person]"]
    OblivionArk["<h4>Oblivion Ark</h4>[Software System]<br/>Allows user to take notes<br/>and view them"]
    Ollama["<h4>Ollama</h4>[Software System]<br/>Local LLM Provider"]
    OS["<h4>Operating System</h4>[Software System]<br/>The operating system"]
    CloudStorage["<h4>Dropbox</h4>[Software System]<br/>Stores copy of<br/>the note database"]

    User --"Captures and retrieves notes"--> OblivionArk
    OblivionArk --"Analyses notes and discovers Semantic connections"--> Ollama
    OblivionArk --"Retrieves note taking context"--> OS
    OblivionArk --"Syncs/Backs up notes"--> CloudStorage

    classDef system fill:#1168bd,stroke:#0b4884,color:white
    classDef external fill:#999999,stroke:#666666,color:white
    classDef user fill:#08427b,stroke:#052E56,color:white

    class OblivionArk system
    class Ollama,OS,CloudStorage external
    class User user
```
<!-- markdownlint-enable MD013 -->

### Containers

<!-- markdownlint-disable MD013 -->
```mermaid
flowchart TD
    %% External Entities
    User["<h4>Personal User</h4>[Person]"]
    Ollama["<h4>Ollama</h4>[Software System]<br/>Local LLM Provider"]
    OS["<h4>Operating System</h4>[Software System]<br/>The operating system"]
    CloudStorage["<h4>Dropbox</h4>[Software System]<br/>Stores copy of<br/>the note database"]

    %% Container Boundary
    subgraph OblivionArk["Oblivion Ark"]
        DesktopApp["<h4>Electron UI</h4>[Container: Javascript, Electron]<br/>Provides user interface for capturing and viewing notes"]
        BackendService["<h4>Backend Service</h4>[Container: Ruby]<br/>Processes notes, manages context<br/>awareness, and handles external integrations"]
        NoteStorage["<h4>Note Storage</h4>[Container: SQLite]<br/>Stores raw note content and metadata"]
        SemanticStorage["<h4>Semantic Note Storage</h4>[Container: Chroma]<br/>Stores vectorized representations of notes for semantic search"]
    end

    %% Relationships
    User --"Captures and<br/>retrieves notes"--> DesktopApp
    DesktopApp <--"Sends user input and requests<br/>[Unix Socket, JSON-RPC]"--> BackendService
    BackendService --"Reads from and<br/>writes to"--> NoteStorage
    BackendService --"Stores and<br/>queries note vectors"--> SemanticStorage
    BackendService --"Sends notes for vectorization<br/>and semantic analysis"--> Ollama
    BackendService --"Retrieves<br/>application context"--> OS
    BackendService --"Syncs and<br/>backs up notes"--> CloudStorage

    %% Styling
    classDef container fill:#1168bd,stroke:#0b4884,color:white
    classDef database fill:#1168bd,stroke:#0b4884,color:white,shape:cylinder
    classDef external fill:#999999,stroke:#666666,color:white
    classDef user fill:#08427b,stroke:#052E56,color:white

    class DesktopApp,BackendService container
    class NoteStorage,SemanticStorage database
    class Ollama,OS,CloudStorage external
    class User user
```
<!-- markdownlint-enable MD013 -->
