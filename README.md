# Aether Health: Clinical Decision Support System

A full-stack clinical decision-support prototype in which five specialized AI agents coordinate a patient case, from symptom intake through risk triage, diagnosis support and follow-up scheduling.

> This is an academic prototype, not a medical product. It does not replace professional medical advice, and a clinician must review every output.

## What it does
A clinician enters a patient's symptoms, vitals and history. The system passes the case through five agents, each with one clinical task and a structured JSON output that is validated before it appears in the interface.

## The five agents
1. **Patient Intake Agent:** turns raw symptoms, demographics, vitals and the chief complaint into a structured clinical profile with severity indices.
2. **EHR Records Agent:** cross-references the intake data with patient health records, covering past history, chronic conditions, current medications and contraindication risks.
3. **Diagnosis Agent:** produces a ranked differential diagnosis with ICD-10 codes, probability scores, suggested tests and confidence for the top three suspected conditions.
4. **Emergency Triage Agent:** classifies risk as Red, Yellow or Green, flags abnormal vitals and triggers escalation alerts.
5. **Scheduling Agent:** recommends specialist consultations, maps urgency to the right department and generates follow-up timelines.

## How the agents run
- The Intake and EHR agents run first, in sequence, so the context is built before diagnosis.
- The Diagnosis, Emergency Triage and Scheduling agents then run in parallel.
- Emergency triage does not wait for the diagnosis result.
- Each response is validated against a JSON schema before it reaches the interface.

## Modules
- Dashboard with live agent status
- Patient intake (symptoms and vitals)
- Differential diagnosis and guideline matching
- Emergency triage and red-flag alerts
- Clinical records (SOAP notes and ICD-10 coding)
- Scheduling and referrals
- Clinical report analyzer (lab reports)
- Patient care summary with PDF export

## API
- `POST /api/analyze-case`: runs the full five-agent pipeline
- `POST /api/analyze-report`: analyzes lab reports and clinical documents
- `GET /api/health`: service status check

## Tech stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Node.js, Express
- **AI:** Google Gemini 2.5 Flash through the Gemini API
- The API key is kept on the server and is never exposed to the browser.

## Getting started
1. Clone the repository: `git clone https://github.com/siddiqualaaisha-arch/CDSS.git`
2. Install dependencies: `npm install`
3. Create a `.env` file 
4. Start the app: `npm run dev` 
5. Open `http://localhost:3000`

## What I learned
- Giving each agent one clear job and a structured output format
- Running some agent calls in sequence and others in parallel
- Validating AI responses before showing them to the user
- Keeping API keys on the server

## Limitations and future work
- HL7 / FHIR integration
- Audit trails and secure data handling
- Broader clinical evaluation

## Author
Aaisha Siddiqua L: [LinkedIn](https://www.linkedin.com/in/aaishasiddiqua)
