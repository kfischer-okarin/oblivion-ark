# Oblivion Ark Project Overview

Oblivion Ark is a personal note-taking application.
Primary features are frictionless capturing of quick notes while working at the
computer and automatic AI-powered interconnections to other semantically or
contextually related notes.

## Architecture
### System Context
```mermaid
flowchart TD
    User["Personal User<br/>(Primary User)"]
    OblivionArk["Oblivion Ark<br/>(Desktop Note-taking Application)"]
    Ollama["Ollama<br/>(Local AI Service)"]
    OS["Operating System<br/>(Context Information)"]
    CloudStorage["Personal Cloud Storage<br/>(Dropbox/Google Drive)"]

    User --"Captures notes<br/>Retrieves information"--> OblivionArk
    OblivionArk --"AI-powered analysis<br/>Semantic connections"--> Ollama
    OblivionArk --"Retrieves context<br/>(Running applications)"--> OS
    OblivionArk --"Syncs/Backs up notes"--> CloudStorage

    classDef system fill:#1168bd,stroke:#0b4884,color:white
    classDef external fill:#999999,stroke:#666666,color:white
    classDef user fill:#08427b,stroke:#052E56,color:white

    class OblivionArk system
    class Ollama,OS,CloudStorage external
    class User user
```
