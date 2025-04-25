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
    User["Personal User<br/>[Person]"]
    OblivionArk["Oblivion Ark<br/>[Software System]<br/>Allows user to take notes<br/>and view them"]
    Ollama["Ollama<br/>[Software System]<br/>Local LLM Provider"]
    OS["Operating System<br/>[Software System]<br/>The operating system"]
    CloudStorage["Dropbox<br/>[Software System]<br/>Stores copy of<br/>the note database"]

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
    User["Personal User<br/>[Person]"]
    Ollama["Ollama<br/>[Software System]<br/>Local LLM Provider"]
    OS["Operating System<br/>[Software System]<br/>The operating system"]
    CloudStorage["Dropbox<br/>[Software System]<br/>Stores copy of the note database"]

    %% Container Boundary
    subgraph OblivionArk["Oblivion Ark"]
        DesktopApp["Desktop Application<br/>[Container: Javascript, Electron]<br/>Provides user interface for capturing and viewing notes"]
        BackendService["Backend Service<br/>[Container: Ruby]<br/>Processes notes, manages context awareness, and handles external integrations"]
        NoteStorage["Note Storage<br/>[Container: SQLite]<br/>Stores raw note content and metadata"]
        SemanticStorage["Semantic Note Storage<br/>[Container: Chroma]<br/>Stores vectorized representations of notes for semantic search"]
    end

    %% Relationships
    User --"Captures and retrieves notes"--> DesktopApp
    DesktopApp <--"Sends user input and requests<br/>[Unix Socket, JSON-RPC]"--> BackendService
    BackendService --"Reads from and writes to"--> NoteStorage
    BackendService --"Stores and queries note vectors"--> SemanticStorage
    BackendService --"Sends notes for vectorization and semantic analysis"--> Ollama
    BackendService --"Retrieves application context"--> OS
    BackendService --"Syncs and backs up notes"--> CloudStorage

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
