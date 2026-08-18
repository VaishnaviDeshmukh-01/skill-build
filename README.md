# SkillBuild

SKILLBRIDGE

Career Aspiration & Skill Gap Analysis Platform for Youth

Build a complete, modern, production-quality web application called SkillBridge.

Tagline

"Turn Your Career Aspiration Into a Clear Action Plan."

SkillBridge is a CareerTech platform designed for students, graduates, and young people who want to understand their career options, evaluate their current skills, identify skill gaps, and receive a personalized roadmap toward career readiness.

The platform should solve this problem:

Many young people have a career aspiration but do not know what skills are required, how their current abilities compare with industry expectations, what they should learn next, or whether they are actually ready for their desired career.

SkillBridge should provide a complete journey:

Discover Career
       ↓
Set Career Goal
       ↓
Assess Skills
       ↓
Analyze Skill Gaps
       ↓
Calculate Career Readiness
       ↓
Generate Learning Roadmap
       ↓
Track Progress
       ↓
Get AI Career Guidance


1. CRITICAL TECHNOLOGY REQUIREMENT

Frontend

You have complete freedom to choose the frontend technology and framework that provides the best user experience and development experience.

Acceptable technologies include, but are not limited to:

React

TypeScript

JavaScript

HTML/CSS

Tailwind CSS

modern component libraries

Chart libraries

modern frontend routing/state-management solutions

Do NOT unnecessarily restrict the frontend architecture.

Choose a modern, maintainable frontend stack that works well with Lovable.

2. NON-NEGOTIABLE BACKEND REQUIREMENT

The backend MUST be written in Python.

Preferred backend framework:

FastAPI

Do NOT use:

Node.js backend

Express.js

Next.js API routes as the main backend

PHP backend

Java backend

The architecture must clearly separate:

Frontend
   ↓
REST API
   ↓
Python FastAPI Backend
   ↓
Database


All important business logic must live in the Python backend.

This includes:

Career matching

Skill-gap calculation

Career-readiness calculation

Assessment processing

Roadmap generation

User data processing

Database operations

AI orchestration

Authentication/business rules

Do not put the main business logic only in frontend JavaScript.

3. BACKEND ARCHITECTURE

Design the application so the Python backend can be developed separately from the frontend.

Preferred backend stack:

Python 3.11+

FastAPI

Pydantic

SQLAlchemy

PostgreSQL

JWT authentication

Alembic for migrations

The frontend communicates with the backend through REST APIs.

Example:

Frontend
   ↓
POST /api/assessment/submit
   ↓
FastAPI
   ↓
Assessment Service
   ↓
Skill Gap Service
   ↓
Career Readiness Service
   ↓
Database
   ↓
JSON Response
   ↓
Frontend Dashboard


4. PROJECT GOAL

The final product should not feel like a simple survey or quiz.

It should feel like a real CareerTech platform.

The user should finish an assessment and think:

"Now I know where I am, what skills I am missing, which skills I should prioritize, and what I should do next."

5. TARGET USERS

Primary users:

School/college students

Undergraduate students

Recent graduates

Job seekers

Young professionals

People exploring career options

The interface should be friendly to users who may have little knowledge about career planning.

6. DESIGN DIRECTION

Create a premium, modern CareerTech/EdTech SaaS design.

Visual characteristics:

Clean

Professional

Youth-oriented

Modern

Trustworthy

Accessible

Motivating

Responsive

Minimal but visually rich

Use:

Modern typography

Consistent spacing

Rounded cards

Subtle shadows

Clean icons

Professional charts

Progress indicators

Smooth micro-interactions

Clear CTAs

Avoid:

Generic templates

Excessive gradients

Excessive animations

Overcrowded dashboards

Too many colors

Fake statistics

Fake testimonials presented as real

Unnecessary decorative elements

Create a consistent design system.

7. APPLICATION PAGES

Create the following pages/screens:

Public

Landing Page

About

How It Works

Explore Careers

Career Details

Login

Register

Student

Onboarding

Career Discovery

Career Selection

Skill Assessment

Assessment Results

Skill Gap Analysis

Career Dashboard

Personalized Roadmap

Progress Tracking

AI Career Advisor

Profile

Settings

Admin

Admin Login

Admin Dashboard

Career Management

Skill Management

Assessment Analytics

Student Analytics

8. LANDING PAGE

Create an impressive landing page.

Navigation

Logo:

SkillBridge

Navigation:

Home

Explore Careers

How It Works

About

Login

Get Started

Primary CTA:

Start Free Assessment

9. HERO SECTION

Headline:

"Discover Your Career. Identify Your Skill Gaps. Build Your Future."

Supporting text:

"SkillBridge helps young people discover suitable career paths, assess their current skills, understand what they are missing, and build a personalized roadmap toward career readiness."

Buttons:

Start Free Assessment

Explore Careers

Include a visually impressive dashboard/product preview showing:

Career Goal
Full Stack Developer

Career Readiness
64%

Top Skill Gaps
JavaScript
React
Node.js

Next Step
Strengthen JavaScript


10. PROBLEM SECTION

Title:

"Having a Career Goal Isn't Enough."

Explain problems faced by youth:

Career Confusion

Many students don't know which career matches their interests and strengths.

Skill Awareness Gap

Students may not know which skills are required for their desired career.

Self-Assessment Problem

Students often don't know their actual skill level.

Learning Overload

There are thousands of courses and resources but no personalized order.

Employability Gap

Students don't know whether they are career-ready.

11. SOLUTION SECTION

Title:

"One Platform From Aspiration to Career Readiness."

Show five cards:

Discover

Explore career possibilities.

Assess

Understand your current skills.

Analyze

Compare your skills with career requirements.

Improve

Follow your personalized roadmap.

Track

Measure your progress.

12. CAREER CATEGORIES

Create career cards for at least:

Software Developer

Full Stack Developer

Data Analyst

Data Scientist

AI/ML Engineer

Cybersecurity Analyst

UI/UX Designer

Cloud Engineer

Mobile App Developer

Digital Marketer

Business Analyst

Product Manager

Each card should contain:

Career icon

Career name

Description

Key skills count

Career difficulty/level if appropriate

Explore button

13. CAREER DATABASE

Career information must eventually come from the Python backend/database.

Do not hardcode the entire career database into the frontend.

API:

GET /api/careers
GET /api/careers/{career_id}


Each career should contain:

id
name
description
category
responsibilities
salary_range_optional
skills
soft_skills
learning_path
projects


Do not present salary information as guaranteed income.

14. CAREER DETAILS PAGE

For each career display:

Overview

What this professional does.

Responsibilities

Typical responsibilities.

Required Skills

Technical skills and soft skills.

Example:

JavaScript       80%
React            75%
Node.js          70%
SQL              60%
Git              60%
Problem Solving  75%
Communication    70%


Recommended Learning Path

Show a progression from beginner to job-ready.

CTA:

Take Skill Assessment

15. AUTHENTICATION

Create registration and login screens.

Registration

Fields:

Full Name

Email

Password

Confirm Password

Education

Graduation/Study Year

Login

Fields:

Email

Password

Remember Me

Forgot Password

Backend APIs:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me


Use secure authentication.

Do not store raw passwords.

Do not expose secrets or API keys in the frontend.

16. STUDENT ONBOARDING

After registration, show a multi-step onboarding experience.

Step 1 — Education

Ask:

Current education level

Degree

Branch/field

College

Current year/semester

Step 2 — Interests

Allow multiple selections:

Coding

Mathematics

Data

Artificial Intelligence

Design

Business

Cybersecurity

Communication

Creativity

Leadership

Management

Step 3 — Career Aspiration

Ask:

"What career are you currently interested in?"

Options:

Software Developer

Full Stack Developer

Data Analyst

AI/ML Engineer

Cybersecurity Analyst

UI/UX Designer

Cloud Engineer

Digital Marketer

Other

I'm not sure

17. CAREER DISCOVERY MODE

If the user selects:

"I'm not sure"

start a Career Discovery assessment.

Create approximately 10–15 questions.

Evaluate:

Interests

Problem solving

Creativity

Mathematics

Technology

Communication

Data orientation

Design orientation

Leadership

Business interest

Preferred working style

The Python backend should calculate career matches.

Example:

Software Developer       86%
Data Analyst             74%
UI/UX Designer           61%
Business Analyst         57%


For each recommendation show:

Match percentage

Why it matches

Relevant strengths

Important skills

Explore button

Do not claim the recommendation is scientifically definitive.

Label it as:

"AI-assisted career match"

or

"Career compatibility estimate"

18. SKILL ASSESSMENT

Create a professional assessment experience.

Show one question at a time or organize skills into logical sections.

Sections:

Technical Skills

Examples:

HTML

CSS

JavaScript

Python

Java

SQL

Git

GitHub

React

Node.js

REST APIs

Data Analysis

Machine Learning

Cloud

Cybersecurity

Soft Skills

Examples:

Communication

Teamwork

Leadership

Problem Solving

Critical Thinking

Time Management

Adaptability

Creativity

Presentation

Skills should be dynamically selected based on the user's chosen career.

19. SKILL PROFICIENCY

For each skill ask:

"How comfortable are you with this skill?"

Options:

Never Used
Beginner
Basic
Intermediate
Advanced


Backend numerical mapping:

Never Used     = 0
Beginner       = 20
Basic          = 40
Intermediate   = 70
Advanced       = 90


The backend must be responsible for the official calculation.

20. OPTIONAL KNOWLEDGE QUESTIONS

For important technical skills, support objective assessment questions.

For example:

JavaScript:

Question:

"What does Array.map() return?"

The backend can evaluate the answer.

This allows the platform to eventually combine:

Self Assessment
+
Knowledge Assessment
=
More Reliable Skill Estimate


This feature can initially be implemented using a smaller set of demo questions.

21. ASSESSMENT API

Create the API contract:

POST /api/assessment/start

POST /api/assessment/submit

GET /api/assessment/{assessment_id}

GET /api/assessment/history


The backend should store:

User

Career

Answers

Skill levels

Assessment score

Timestamp

22. SKILL GAP ANALYSIS

This is the core functionality.

For every skill:

Required Skill Level
-
Current Skill Level
=
Skill Gap


Example:

JavaScript

Required = 80
Current = 45

Gap = 35


Classification:

0–10      Strong
11–30     Moderate
31–50     High
51+       Critical


The exact thresholds should be configurable in the backend rather than hardcoded throughout the frontend.

23. CAREER READINESS SCORE

Calculate an overall career-readiness indicator.

Example:

Career Readiness
64%


The backend should calculate this using the user's skill profile compared against the selected career's required skills.

Do not call it an official employability score.

Display:

"Estimated Career Readiness"

Include an explanation:

"This score represents how closely your assessed skills currently align with the skill profile configured for your selected career."

24. RESULTS PAGE

Create a visually impressive results page.

Show:

Your Career Goal

Full Stack Developer

Estimated Career Readiness

64%

Use:

Circular progress

Progress animation

Score explanation

Then:

Skill Comparison

Use a radar/bar chart.

Compare:

Your Level
vs
Required Level


25. SKILL GAP DASHBOARD

Create three sections.

🟢 Strong Skills

Skills meeting or exceeding requirements.

Example:

HTML — 85%

CSS — 78%

Git — 72%

🟡 Improve

Moderate gaps.

Example:

SQL — 40%

Communication — 55%

🔴 Priority Gaps

Large gaps.

Example:

JavaScript — 45%

React — 20%

Node.js — 10%

Each skill card should display:

Skill
Current
Required
Gap
Priority
Recommended action


26. PERSONALIZED RECOMMENDATIONS

Do not stop at showing gaps.

For each major gap provide:

Why this skill matters

Explain its relevance to the career.

What to learn

List important topics.

Suggested project

Recommend a practical project.

Estimated effort

Show approximate learning effort.

Example:

JavaScript

Current: 45%
Required: 80%

Priority: HIGH

Learn:
• Functions
• Arrays
• Objects
• DOM
• ES6+
• Async JavaScript
• APIs

Project:
Build a Personal Expense Tracker


27. PERSONALIZED ROADMAP

Generate a roadmap based on:

Career

Current skill levels

Skill gaps

User progress

Example:

Phase 1
JavaScript Fundamentals

Phase 2
Advanced JavaScript + APIs

Phase 3
React

Phase 4
Backend Development

Phase 5
Database

Phase 6
Full Stack Projects


The roadmap must be personalized.

Two users targeting the same career should be able to receive different starting points based on their skill gaps.

28. ROADMAP API

Backend endpoints:

GET /api/roadmap

GET /api/roadmap/{roadmap_id}

PUT /api/roadmap/{item_id}/progress

POST /api/roadmap/{item_id}/complete


Store progress in the database.

29. DASHBOARD

Create a professional student dashboard.

Header:

Good morning, [Name] 👋

Show:

Target Career

Full Stack Developer

Estimated Career Readiness

64%

Priority Skill Gaps

4

Roadmap Progress

32%

Skills Assessed

10

Projects Completed

2

30. DASHBOARD VISUALIZATIONS

Include:

Skill Radar

Current vs required.

Skill Gap Chart

Largest gaps first.

Roadmap Progress

Percentage complete.

Career Readiness

Current score.

Recent Activity

Examples:

Completed JavaScript assessment

Completed HTML roadmap item

Started React module

Use responsive charts.

31. AI CAREER ADVISOR

Create a dedicated AI chat experience.

Title:

AI Career Advisor

Subtitle:

"Ask questions about your career, skills, learning path and progress."

Suggested questions:

What should I learn next?

Which skills are my biggest gaps?

Am I ready for an internship?

What projects should I build?

How can I improve my JavaScript?

Which career matches my strengths?

Why is my readiness score low?

32. AI BACKEND

The AI API must be handled by the Python backend.

Frontend:

POST /api/ai/chat


Backend sends the relevant context to the selected AI provider.

Context may include:

User profile
Career aspiration
Career requirements
Current skills
Skill gaps
Readiness score
Roadmap
Progress
User question


IMPORTANT:

Never expose AI API keys in the frontend.

Store them as backend environment variables.

Example:

OPENAI_API_KEY


or

GEMINI_API_KEY


33. AI RESPONSE PRINCIPLES

The AI advisor should:

Use the user's actual assessment data.

Give actionable advice.

Avoid unrealistic promises.

Avoid guaranteeing jobs or salaries.

Encourage practical projects.

Recommend learning priorities.

Explain why a recommendation is made.

Example:

Instead of:

"Learn React."

Say:

"React is currently one of your larger skill gaps for your selected Full Stack Developer path. Since your JavaScript foundation is still developing, strengthen JavaScript fundamentals first and then move into React components, props and state."

34. PROFILE PAGE

Display:

Name

Email

Education

Interests

Career goal

Skills

Assessment history

Readiness history

Allow users to edit appropriate profile fields.

35. PROGRESS TRACKING

Track:

Skills improved

Roadmap items completed

Projects completed

Assessment history

Readiness score over time

Create a simple progress timeline.

Example:

August 1
Readiness: 42%

August 15
Readiness: 51%

September 1
Readiness: 64%


This should come from actual assessment history in the backend.

36. ADMIN DASHBOARD

Create an admin dashboard.

Admin features:

Overview

Show:

Total registered users

Assessments completed

Most selected careers

Average readiness score

Most common skill gaps

Career Management

Admin can:

Create career

Edit career

Delete career

Configure required skills

Skill Management

Admin can:

Create skill

Edit skill

Categorize skill

Set skill requirements

Analytics

Show:

Popular careers

Common skill gaps

Assessment completion rate

Average readiness

37. DATABASE DESIGN

Use PostgreSQL for production.

Recommended entities:

users

user_profiles

careers

skills

career_skills

user_skills

assessments

assessment_questions

assessment_answers

skill_gaps

career_matches

roadmaps

roadmap_items

progress

projects

ai_conversations

ai_messages


Relationships should be properly normalized.

Use SQLAlchemy models.

Use Alembic migrations.

38. BACKEND PROJECT STRUCTURE

Generate/prepare the project architecture around:

backend/

├── app/
│
├── main.py
│
├── config/
│   └── settings.py
│
├── database/
│   ├── connection.py
│   └── migrations/
│
├── models/
│
├── schemas/
│
├── routers/
│   ├── auth.py
│   ├── users.py
│   ├── careers.py
│   ├── skills.py
│   ├── assessment.py
│   ├── skill_gap.py
│   ├── dashboard.py
│   ├── roadmap.py
│   ├── progress.py
│   └── ai.py
│
├── services/
│   ├── career_matching.py
│   ├── skill_gap.py
│   ├── readiness.py
│   ├── roadmap.py
│   └── ai_advisor.py
│
├── utils/
│
└── tests/


Keep business logic inside services rather than putting everything into route handlers.

39. API DESIGN

Prepare REST APIs for:

Authentication

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me


Careers

GET /api/careers
GET /api/careers/{career_id}


Skills

GET /api/skills
GET /api/careers/{career_id}/skills


Assessment

POST /api/assessment/start
POST /api/assessment/submit
GET /api/assessment/{assessment_id}
GET /api/assessment/history


Skill Gap

GET /api/skill-gap/{assessment_id}


Dashboard

GET /api/dashboard


Roadmap

GET /api/roadmap
GET /api/roadmap/{roadmap_id}
PUT /api/roadmap/{item_id}/progress
POST /api/roadmap/{item_id}/complete


AI

POST /api/ai/chat
GET /api/ai/history


40. FRONTEND API ARCHITECTURE

Create a centralized API client/service.

Do not scatter API requests throughout UI components.

Use a structure conceptually similar to:

frontend/
├── services/
│   ├── api
│   ├── auth
│   ├── careers
│   ├── assessment
│   ├── dashboard
│   ├── roadmap
│   └── ai


Use an environment variable for:

API_BASE_URL


Example:

http://localhost:8000/api


for development.

Production should use the deployed FastAPI URL.

41. MOCK DATA DEVELOPMENT

Initially, the frontend should be fully functional with realistic mock data.

Create demo data such as:

Name:
Demo Student

Career:
Full Stack Developer

HTML:
85%

CSS:
78%

JavaScript:
45%

React:
20%

Node.js:
10%

SQL:
40%

Git:
72%

Communication:
65%


The frontend should be built so mock data can later be replaced by real API responses without rewriting the UI.

Clearly separate mock data from production API logic.

42. LOADING STATES

Every API-driven page should support:

Loading

Success

Empty

Error

Unauthorized

Retry

Do not display blank screens while data loads.

Use skeleton loaders where appropriate.

43. ERROR HANDLING

Create friendly messages.

Example:

"We couldn't load your assessment results. Please try again."

Provide:

Try Again

Do not expose raw backend errors to normal users.

44. SECURITY

Follow secure development practices.

Passwords

Never store raw passwords.

Authentication

Use secure JWT/session handling.

API Keys

Never expose AI API keys.

Database

Use parameterized queries/ORM.

CORS

Configure appropriately for frontend/backend deployment.

Authorization

Users should only access their own assessment and profile data.

Admin endpoints require admin authorization.

45. ACCESSIBILITY

Use:

Semantic HTML

Proper labels

Keyboard navigation

Focus states

Accessible buttons

Appropriate contrast

ARIA where necessary

The assessment should be usable on mobile and keyboard devices.

46. RESPONSIVE DESIGN

Support:

1440px
1024px
768px
480px
375px


Ensure:

No horizontal scrolling

Mobile navigation

Responsive charts

Touch-friendly controls

Responsive cards

Readable typography

Proper spacing

47. PERFORMANCE

Optimize:

Images

JavaScript

API calls

Chart rendering

Component rendering

Avoid unnecessary API calls.

Use caching where appropriate.

48. DATA VALIDATION

Validate user input on both:

Frontend

For immediate feedback.

Backend

For actual security and data integrity.

Never rely only on frontend validation.

49. NO FAKE CLAIMS

Do not create fake:

User numbers

Success rates

Salary statistics

Company partnerships

Testimonials

Employment guarantees

If sample data is necessary for the demo, clearly label it:

Demo Data

or

Example

50. PROJECT DEMO MODE

Create a way to easily demonstrate the platform.

A demo user should be able to explore:

Demo Student
      ↓
Full Stack Developer
      ↓
Skill Assessment
      ↓
Results
      ↓
Skill Gaps
      ↓
Roadmap
      ↓
Dashboard
      ↓
AI Advisor


This is important because the project will be presented to judges/teachers.

51. KEY DIFFERENTIATOR

SkillBridge should not only identify skill gaps.

It must turn the gap into an action plan.

Example:

Skill Gap
     ↓
Why it matters
     ↓
What to learn
     ↓
Recommended resources
     ↓
Practice task
     ↓
Project
     ↓
Progress tracking


This is one of the most important product concepts.

52. OPTIONAL FUTURE FEATURES

Design the architecture so these can be added later:

Resume analysis

Job-role matching

Internship recommendations

Course recommendations

GitHub profile analysis

LinkedIn profile analysis

Skill certificates

Gamification

Badges

Peer comparison

Mentor connection

Job market trend analysis

College career dashboard

Do not implement all of these now.

Keep them as future extensions.

53. MVP PRIORITY

The first complete MVP must focus on:

Must Have

User registration/login

Student onboarding

Career selection

Career discovery

Skill assessment

Skill-gap analysis

Career-readiness score

Dashboard

Personalized roadmap

Progress tracking

Python FastAPI backend

Database

REST API integration

Second Priority

AI Career Advisor

Admin dashboard

Assessment history

Advanced analytics

Future

Resume analysis

Job matching

Internship recommendations

GitHub analysis

54. DEVELOPMENT STRATEGY

Do not attempt to build every feature at once.

Build incrementally.

Phase 1 — UI/UX

Create:

Landing page

Careers

Authentication screens

Onboarding

Assessment

Results

Dashboard

Roadmap

AI Advisor

Profile

Use realistic mock data.

Phase 2 — Frontend Logic

Implement:

Form validation

Assessment navigation

Progress indicators

Charts

Mock skill-gap calculations

Roadmap interactions

Phase 3 — Python Backend

Create:

FastAPI application

Database

Models

Schemas

Authentication

Career APIs

Skill APIs

Assessment APIs

Phase 4 — Business Logic

Implement in Python:

Career matching

Skill-gap calculation

Career readiness

Personalized roadmap

Phase 5 — Integration

Connect:

Lovable Frontend
        ↓
REST APIs
        ↓
FastAPI
        ↓
PostgreSQL


Replace mock data with live backend data.

Phase 6 — AI

Implement:

Frontend
 ↓
FastAPI
 ↓
AI Service
 ↓
Personalized Response


Phase 7 — Testing

Test:

Authentication

Assessment

Skill calculations

Career matching

Dashboard

Roadmap

API failures

Mobile UI

55. FINAL PRODUCT EXPERIENCE

The complete experience should be:

                    SKILLBRIDGE

                        ↓

              "What is your goal?"

                        ↓

              Career Discovery
                    OR
              Career Selection

                        ↓

               Skill Assessment

                        ↓

             ┌──────────────────┐
             │ Career Readiness │
             │       64%        │
             └──────────────────┘

                        ↓

               Skill Gap Analysis

          ┌────────┬────────┬────────┐
          │ Strong │ Improve│ Priority│
          └────────┴────────┴────────┘

                        ↓

             Personalized Roadmap

                        ↓

                Track Progress

                        ↓

               AI Career Advisor

                        ↓

                 CAREER READY


56. FINAL IMPLEMENTATION RULE

The application should be designed as a real full-stack system.

The frontend technology is flexible.

The backend technology is NOT flexible.

Required:

Python + FastAPI backend

Required:

REST API communication

Required:

Database-backed application

Required:

Business logic on the Python backend

Required:

Secure authentication

Required:

Modular architecture

Required:

Responsive UI

Required:

Production-quality user experience

57. START NOW

Start by creating the frontend MVP with realistic demo data and a polished user experience.

Create the complete navigation and user journey first.

Do not wait for the Python backend.

However, structure the frontend from the beginning so that every mock-data feature can later be replaced by a REST API without redesigning the application.

After the frontend MVP is complete, prepare the application for integration with a separate Python FastAPI backend.

The final goal is:

SkillBridge — a complete career aspiration, skill assessment, skill-gap analysis, personalized roadmap and AI career guidance platform for youth.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://skillleap-journey.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/316fbc41-82bf-4ba8-8eac-89b5c4db5fd0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
