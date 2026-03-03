# Khaki Tours – Website Scraper (Full Stack) 🚀

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [API Reference](#api-reference)
- [Tech Stack](#tech-stack)

## Project Overview
A full‑stack web scraping system for https://khakitours.com. It provides an Express API backend that scrapes tour data and a React dashboard to view and manage the data.

## Features
- Automated scraping of tours, packages, team members, and media.
- SHA‑1 based unique identifiers for each entity.
- Caching of responses for 5 minutes.
- Timeout handling (10 s) to avoid hanging requests.
- Simple CRUD‑style API endpoints.
- Interactive dashboard built with React 18 + Vite.

## Screenshots 
(Visual representation of the scraping dashboard)
Agency Info :
<img width="2547" height="732" alt="image" src="https://github.com/user-attachments/assets/9cd53ac4-999a-4c47-9c8c-40b9e66027b7" />

Team Members :
<img width="2339" height="419" alt="image" src="https://github.com/user-attachments/assets/91c91d25-d9e8-43fb-8596-8f3a33fa3306" />

Tour Packages Overview :
<img width="2337" height="1184" alt="image" src="https://github.com/user-attachments/assets/14dff757-daad-46f3-bba1-0aa773254522" />

Media :
<img width="2311" height="888" alt="image" src="https://github.com/user-attachments/assets/1ab9b06b-2cb1-4105-9f39-1d4a36618a2d" />
<img width="2325" height="743" alt="image" src="https://github.com/user-attachments/assets/41cd2f71-51c5-4d50-9f50-11d1328db7f0" />

## Installation
```bash
# Clone the repo
git clone <(https://github.com/Sagarbisht07/Website-Scraper---Khaki-Tours--Full-Stack-.git)>
cd "Website Scraper – Khaki Tours (Full Stack)"

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Running the Project
### Backend API
```bash
cd backend
npm start
```
API runs at **http://localhost:5000**  
Scrape endpoint: **GET http://localhost:5000/scrape**

### Frontend Dashboard
```bash
cd frontend
npm run dev
```
Dashboard runs at **http://localhost:5173**

## API Reference
### GET /scrape
Returns JSON with the following structure:
```json
{
  "agency": { "name": "", "description": "", "contact": "", "email": "", "social_links": [] },
  "team": [{ "pid": "", "name": "", "role": "", "bio": "", "image": "" }],
  "packages": [{ "pid": "", "title": "", "price": "", "duration": "", "booking_link": "" }],
  "richMedia": { "hero_images": [], "gallery_images": [], "embedded_videos": [] },
  "metadata": { "total_packages": 0, "total_team_members": 0, "total_images": 0, "scraped_at": "" }
}
```
- Each entity has a **SHA1 PID** (`entity_type + primary_field + source_url + timestamp`).
- Responses are **cached for 5 minutes**.
- Scrape times out after **10 seconds**.

## Tech Stack
| Layer    | Technology        |
|----------|------------------|
| Scraping | Cheerio + Axios  |
| API      | Express.js (Node) |
| Frontend | React 18 + Vite  |
| Styling  | Vanilla CSS      |
