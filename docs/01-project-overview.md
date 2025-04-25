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
