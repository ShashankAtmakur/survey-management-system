# AI-Powered Smart Survey Tool

A next-generation, AI-enhanced, multilingual and no-code survey platform built for MoSPI's Digital Innovation Challenge — a leap towards modern, inclusive, and intelligent data collection in India.

---

## 🚀 Overview

This project addresses the Ministry of Statistics & Programme Implementation’s (MoSPI) challenge to modernize national surveys by leveraging AI, LLMs, prompt-driven no-code tools, and data-driven workflows.

**Key features:**  
- No-code/prompt-based survey designer  
- Multi-language, multi-platform delivery (web, WhatsApp, IVR, more)  
- AI-assisted adaptive questioning  
- Real-time validation and auto-coding  
- Structured, secure data storage  
- Advanced dashboards for monitoring quality, progress and enumerator activity  
- Paradata capture and advanced privacy

[Challenge Brief](https://datainnovation.mospi.gov.in/)

---

## 🌟 Core Features

- **No-Code Survey Builder:** Drag, drop, and prompt to create surveys fast  
- **AI Question Bank:** Generate or auto-select questions from a curated library  
- **Multilingual Support:** Translate questions & collect answers in any major Indian language  
- **Voice and WhatsApp Support:** Collect data via web, mobile, messenger, or call  
- **Adaptive Flows:** LLM-powered dynamic follow-ups, conditional logic, and skip patterns  
- **Real-Time Validation:** Catch errors and inconsistent data on the fly  
- **Prepopulation:** Use IDs (Aadhaar, HH ID, Phone) to fill known fields  
- **Paradata & Quality Analytics:** Record time, device, location, pauses, and flag suspicious inputs  
- **Consent Management:** Transparent, auditable consent workflows  
- **Rich Dashboard:** Live progress, quality analytics, and enumerator comparisons

---

## 📦 Tech Stack

- **Frontend:** React, Material UI, Axios
- **Backend:** FastAPI, SQLAlchemy, OpenAI (LLMs)
- **DB:** SQLite/PostgreSQL (configurable)
- **Multi-Channel API:** Ready for WhatsApp bots, IVR, more
- **Analytics:** Advanced live summary and QA dashboards

---

## 🚩 How to Run

### 1. Clone the repo
`git clone https://github.com/yourusername/ai-smart-survey-tool.git`
`cd ai-smart-survey-tool`

### 2. Set up the Backend
- Go to the backend folder:  
  `cd backend`
- Create a `.env` file with:
    ```
    OPENAI_API_KEY=your_openai_api_key
    DATABASE_URL=sqlite:///./surveys.db  # or your Postgres url
    PORT=8000
    HOST=0.0.0.0
    ENVIRONMENT=development
    ```
- Install dependencies:  
  `pip install -r requirements.txt`
- Start the API:
  `uvicorn app.main:app --reload`
  
### 3. Set up the Frontend
- Go to the frontend folder:  
`cd frontend`
- Create a `.env` file:
  ```
  REACT_APP_API_URL=http://localhost:8000/api
  ```
- Install dependencies:  
`npm install`
- Run the app:
`npm start`

### 4. Production/Render Deployment
- **Frontend:**  
- Push to GitHub, connect repo to [https://render.com](https://render.com) as **Static Site**
- Build command: `npm install && npm run build`
- Publish directory: `build`
- Set `REACT_APP_API_URL` in Render settings to your backend URL.
- **Backend:**  
- As a web service on Render:  
  - Start command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
  - Add any needed secrets / DB URL.

---

## 🛠 MoSPI Key Requirements: How We Meet Them

| Requirement                                           | Our Solution                                      |
|-------------------------------------------------------|---------------------------------------------------|
| No-code, prompt-based survey creation                 | AI-assisted, drag-and-drop and prompt support     |
| Question bank & adaptive flows                        | Integrated LLM & custom libraries                 |
| Multichannel (web, WhatsApp, IVR, avatars)            | Web deployed; APIs open for bots, phone, avatars  |
| Prepopulation by identifiers                          | Ready for integration; DB schema supports it      |
| Multilingual & voice support                          | Multi-lang UI, text-to-speech/voice APIs          |
| Real-time validation, auto-coding, paradata, QA       | Built-in, extensible analytics engine             |
| Quality dashboard, consent, security                  | Supervisor dashboard, consent & privacy core      |
| Data security, encryption, privacy                    | HTTPS, secure APIs, privacy-by-design            |

---

## 👥 Team Members

| Role    | Name                        | Enrollment No.|
|---------|-----------------------------|---------------|
| Leader  | JADHAV PRAGATHI             | 23JJ1A0229    |
| Member  | SAI DATTATHREYA KUSHANAPELLI| 23JJ1A1232    |
| Member  | Rasamalla Akhila            | 23JJ1A0252    |
| Member  | Tulasi Adepu                | 24JJ5A0501    |
| Member  | Shashank Atmakur            | 24JJ5A0502    |

---

## 📄 License

This repository is for MoSPI challenge participation and is open for research, academic, and public sector non-commercial use.  
For broader deployment or commercial use, contact the team.

---

## 📢 References

- [MoSPI](https://mospi.gov.in/) | [Data Innovation Challenge](https://datainnovation.mospi.gov.in/)

---

> **Developed with a vision to make India’s official surveys faster, smarter, and more inclusive!**
