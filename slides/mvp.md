# AMP Report MVP

<style>
/* Glassmorphic Blue Theme for Reveal.js */
.reveal {
  background: linear-gradient(135deg, rgba(13, 110, 253, 0.5) 0%, rgba(13, 110, 253, 0.8) 100%);
  backdrop-filter: blur(25px);
}

.reveal .slides section {
  background: rgba(0, 0, 0, 0.65); /* stronger contrast */
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 2.5rem;
  backdrop-filter: blur(15px);
}

.reveal h1,
.reveal h2,
.reveal h3,
.reveal h4,
.reveal h5,
.reveal h6,
.reveal p,
.reveal li {
  color: #ffffff;
}

.reveal pre code,
.reveal code {
  background: rgba(0, 0, 0, 0.75);
  color: #ffffff;
}
</style>

---

## Vision

Deliver AI-powered analytics and amenity recommendations that help multifamily property owners maximise revenue and resident satisfaction.

---

## Problem

* Hard to understand true tenant demographics
* Amenities often chosen by intuition not data
* Manual market analysis is time-consuming

---

## Solution – AMP Report

1. Aggregates public & proprietary data
2. Uses OpenAI to build tenant profiles
3. Recommends high-ROI amenities
4. Generates shareable PDF reports

---

## Architecture Overview

```mermaid
flowchart TD
  %% Glassmorphic styled diagram for true tech stack
  subgraph Frontend ["Frontend (React)"]
    FE[React App] -->|tRPC/HTTPS| API
  end

  subgraph Backend ["Backend (Node.js + Express + tRPC)"]
    API[API Server] --> DB[(PostgreSQL)]
    API --> OpenAI[OpenAI API]
    API --> Maps[Google Maps API]
  end

  FE -. "Deployed on" .-> Vercel[Vercel]
  API -. "Deployed on" .-> CloudRun[Cloud Run]

  classDef primary fill:#0d6efd,color:#ffffff,stroke:#ffffff,stroke-width:2px,font-weight:bold;
  classDef default fill:#1a1a1a,color:#ffffff,stroke:#0d6efd,stroke-width:2px,font-weight:bold;
  classDef label fill:#000000,color:#ffffff,stroke:#333333,stroke-width:2px;
  
  class FE,API primary;
  
  %% Style improvements for better text legibility
  linkStyle 0,1,2,3,4,5 stroke:#ffffff,stroke-width:2px,fill:none
  
  %%{init: {'theme':'dark', 'themeVariables': { 'primaryTextColor':'#ffffff', 'edgeLabelBackground':'#000000', 'fontSize':'14px'}}}%%
```

---

## MVP Scope

* User authentication
* Property CRUD
* Tenant profile generation
* Amenity recommendation engine

---

## Demo

---

## Next Steps

* Add comparisons against competitor properties
* Cost-benefit calculations for amenities
* Multi-property portfolio dashboard
