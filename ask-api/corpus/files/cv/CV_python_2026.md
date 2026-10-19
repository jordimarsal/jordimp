# JORDI MARÇAL POY

Sabadell (Barcelona), Spain · [contact: jordimp.net] · [contact: jordimp.net]  
github.com/jordimarsal · linkedin.com/in/jordi-marsal-poy · jordimp.net

## PROFESSIONAL PROFILE

Senior Backend Engineer (Python-first) with 9+ years designing REST APIs, microservices and production Python tooling for multi-country Kubernetes environments. Recent work includes a hexagonal RAG service (FastAPI, Pydantic v2, pgvector) whose retrieval quality is gated in CI (baseline mean recall@5 0.409). I apply SOLID, Clean Code and TDD in code reviews and mentor junior developers. MSc in Data Science.

## TECHNICAL SKILLS

**Python:** 3.13, FastAPI (async), Flask, SQLAlchemy (AsyncSession), Pydantic v2, PyMongo, Click / Typer, Poetry, pytest, mypy (strict), ruff, black, pre-commit, pgvector, MCP, Pillow

**APIs & data:** RESTful design, OpenAPI / Swagger v2-v3, MongoDB, MySQL, Redis, Elasticsearch, Oracle

**Architecture:** Microservices, hexagonal / ports & adapters, SOLID, Clean Code (KISS, DRY, YAGNI), separation of concerns, design patterns, async/await, concurrent & reactive programming

**DevOps & quality:** Git, GitHub / GitLab, CI/CD (Jenkins, GitHub Actions), Docker, Kubernetes, Ansible, RabbitMQ, TDD, unit & End-to-End testing, SonarQube / SonarLint, code reviews

**AI / LLM tooling:** RAG with CI-gated evals, Ollama / llama.cpp, Langfuse, MCP servers

*(Java / Kotlin experience available on request — Spring Boot, Play Framework, Reactor)*

## PROFESSIONAL EXPERIENCE

**Backend Developer (API Modernization)**  
January – May 2026  
AXPE CONSULTING — Mapfre

- Drove the modernisation analysis of 39 corporate APIs onto a single Node.js 24 / Serverless / AWS stack, reducing technical drift across the estate.
- Audited repository state (feature branches, open PRs, merge history) to establish precise starting points for each service.
- Tracked migration progress with Git Flow, Conventional Commits and multi-branch release flows.

Technologies: Git · Node.js 24 · TypeScript · Serverless Framework · AWS (Lambda, CDK, CloudFormation, API Gateway) · Jest · Python · Bash

**Backend Developer (Java/Python)**  
May 2022 – January 2026  
Telefónica Kernel — Open Gateway · opengateway.telefonica.com

- Designed and built REST adapter microservices exposing Open Gateway APIs per country on top of the internal Kernel API.
- Author and maintainer of a suite of 12+ Python CLI tools (Poetry + Docker image) that operate ~90 adapters across 4 countries and 5–6 environments each: deployment verification, pre-deploy checks, inter-adapter dependency management, database queries and Kibana/Elasticsearch tooling.
- Automated generation of documentation and sequence diagrams for every microservice, with End-to-End tests and traces in Elasticsearch, integrated into Jenkins CI/CD pipelines.
- Adapted the OpenAPI code generator (Swagger v2 & v3) to produce clients and servers for Play Framework, Spring Boot and Kotlin.
- Built an automatic mock generator in Next.js with Python and Docker.
- Conducted code reviews enforcing SOLID, Clean Code and design patterns; mentored junior developers.

Technologies: Java 11/21 · Play · Spring Boot 3 · Spring-Cloud · Reactor · Python 3.11 · Poetry · Pydantic · Click · Kubernetes SDK · Docker SDK · Ansible · Jenkins · Elasticsearch · Kibana · Redis · MySQL · Hibernate · Swagger/OpenAPI · JUnit 5 · Mockito · Git/GitHub · SonarLint · Scrum/Kanban

**Java Developer**  
November 2020 – May 2022  
Zitro Laboratory (online gaming / casinos) · zitrogames.com

- Maintained and evolved the Java betting-engine server, Backoffice and real-money casino integrations.
- Implemented async messaging between services with RabbitMQ.
- Implemented Apple Sign-In server-to-server; integrated historical data into AWS Snowflake + Cassandra; integrated OneSignal for commercial targeting.
- Performed architecture analysis for new features and wrote operational scripts in Python and Bash.

Technologies: Java 11-13 · Spring Boot 2.4 · MongoDB · Redis · Cassandra · MySQL · Hibernate · RabbitMQ · Swagger 3 · JUnit 5 · Mockito · Python · GitLab CI · Docker · Kubernetes · Jenkins · SonarQube

## PERSONAL PROJECTS (PYTHON)

- **CodebaseRAG** (open source) — Hexagonal RAG over a codebase: FastAPI, Pydantic v2, pgvector or Qdrant, Ollama embeddings. Retrieval quality is a CI gate (≥40 golden Q/A pairs; baseline mean recall@5 0.409). mypy strict.  
  github.com/jordimarsal/codebaserag

- **md-mermaid-pdf** (open source, MIT) — CLI that renders Markdown with Mermaid diagrams to PDF. Built with TDD (pytest + Codecov), mypy strict, ruff, black, pre-commit and GitHub Actions. Dependency-injection-friendly architecture.  
  github.com/jordimarsal/md-mermaid-pdf

- **mcp-transparent-png** (open source) — MCP server in Python 3.13 (Pillow) offering three transparency modes (rgb, auto, greenscreen) with GitHub Actions checks.  
  github.com/jordimarsal/mcp-transparent-png

- **Async REST API with FastAPI + SQLAlchemy** (URL shortener) — async/await endpoints, layered architecture (routers / services / CRUD), automatic OpenAPI docs and pytest suite.  
  github.com/jordimarsal

- **Rest360** (MSc thesis, Data Science) — Flask REST API with authentication and DAO pattern over MongoDB (PyMongo) for a banking domain.  
  openaccess.uoc.edu/webapps/o2/handle/10609/95366

## EDUCATION

2017 – 2019 · MSc in Data Science — UOC (Universitat Oberta de Catalunya)  
2012 – 2017 · BSc in Computer Engineering — UOC  
1991 – 1994 · Technical Industrial Engineering (Chemistry) — UPC

## ADDITIONAL TRAINING

2019 · Data Analytics Bootcamp — Ironhack (part-time)  
2019 · Deep Learning Technician (300 h) — UOC  
2018 · Spring Framework & Spring Boot — Udemy

## LANGUAGES

Spanish & Catalan (native) · French (B2) · English: strong listening, reading & writing; conversational speaking