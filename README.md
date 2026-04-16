# Clickable Interface Design (UniBuddy)

An interactive prototype project for the XJTLU campus tour scenario, built on React + Vite.
The project includes core functions such as campus maps, route exploration, blind box routes, custom routes, stamp collection and collection, etc. It is suitable for course presentation, interaction design demonstration and front-end prototype development.

"Online design draft.

- Figma: [Clickable-Interface-Design](https://www.figma.com/design/RLCy2VrVRj7BbKKFs5JFEj/Clickable-Interface-Design)

## Feature Highlights

- ** Immersive Startup Page ** : The brand's first screen and guiding entry in a cartoonish style
- ** Campus Homepage Navigation ** : Quickly access picture maps, route exploration, blind box routes, and custom routes
- ** Classroom Search and Navigation Information ** : Supports searching by classroom number/building and viewing walking and floor guidance
- ** Route Exploration System ** : Includes recommended routes, blind box routes (generated based on mood), and custom routes (multi-point planning)
- ** Personal Center Capabilities ** : Route collection, check-in stamp collection, photo recording and progress display
- ** Bilingual Chinese and English text ** : Built-in 'zh/en' copywriting resources for convenient international expansion

## Technology Stack

- ** Framework ** : React 18
- "Build Tool" : Vite 6
- ** Routing ** : React Router 7
- ** Style ** : Tailwind CSS 4 + Custom CSS
- ** Component Ecosystem ** : Radix UI, MUI, Lucide, Recharts, etc

Get started quickly

1) Install dependencies

```bash
npm install
` ` `

2) Start the development environment

```bash
npm run dev
` ` `

3) Package the production version

```bash
npm run build
` ` `

Project structure

```text
Clickable_Interface_Design/
├─ src/
│  ├─ app/
│ │ ├─ components/ # Pages and common components
│ │ ├─ context/ # Global State (Collection, language, camera, etc.)
│ │ ├─ data/ # Campus/classroom and other static data
│  │  ├─ App.tsx
│ │ └─ routes.tsx # Route configuration
│ ├─ styles/ # Global Styles and Themes
│ └─ main.tsx # Application entry
├─ index.html
├─ package.json
└─ vite.config.ts
` ` `

## Scalable directions

- Access real map API and real-time positioning (GPS) capabilities
- Path planning algorithm upgrade (Obstacle avoidance, accessibility priority, congestion avoidance)
Log in to the system and synchronize with the cloud (collection, check-in, photos)
Replace the mock data with the backend service interface

"License"

The current repository does not declare an open source license.
If you plan to distribute it publicly, it is recommended to supplement the 'LICENSE' file (such as MIT).
