![Alt Text](https://billor.us/images/logo.svg)

# Billor Coding Challenge: Solutions Engineer

This assessment is designed to evaluate advanced skills in microservices, containerization, browser automation, LLM integration (GPT Compute Preview), data modeling, and documentation in English.

**Delivery format:** Git repository (public or private) containing:

* `automation-service/` folder
* `gpt-service/` folder
* Docker configuration (`Dockerfile`s and `docker-compose.yml`)
* Migration scripts and SQL
* README.md with setup instructions and examples
* Tests and mocks

---

## 1. Microservices Architecture with Docker

**Objective:** Evaluate distributed system design, containerization, and orchestration.

**Task:**

* Define two services using **Docker Compose**:

  1. **`automation-service`** (Node.js/NestJS): responsible for running data extraction automations via Puppeteer.
  2. **`gpt-service`** (Node.js/NestJS): exposes a `/summarize-loads` endpoint that accepts JSON payloads of load data and returns a summary using GPT Compute Preview.

* Both services must share:

  * An internal network for communication
  * Volumes for logs
  * Secure environment variables (API keys, credentials)

**Deliverables:**

* `docker-compose.yml`
* `automation-service/Dockerfile` and `gpt-service/Dockerfile`
* README with build, `docker-compose up/down`, and health check instructions

**Evaluation Criteria:**

* Proper use of `depends_on` and `healthcheck`
* Optimized images (Alpine base, multi-stage builds)
* Service isolation and configuration

---

## 2. Data Extraction Automation

**Objective:** Test advanced browser automation and service integration.

**Task:**

* In **`automation-service`**, implement a script that:

  1. Logs into a fictional two loadboard portals (https://www.jbhunt.com/loadboard/load-board/map and https://www.landstaronline.com/loadspublic)
  2. Extracts the 20 most recent loads (origin, destination, price, ETA)
  3. Sends the extracted data via HTTP POST to `gpt-service` at `/summarize-loads`
* Implement retry/backoff logic on failure and expose Prometheus metrics (using `prom-client`).

**Deliverables:**

* TypeScript code (NestJS)
* End-to-end tests with Jest + Supertest (mock external services)
* A working `/metrics` endpoint

**Evaluation Criteria:**

* Robust error handling and retries
* Observability with properly labeled metrics
* Code quality and test coverage

---

## 3. GPT Compute Preview Integration

**Objective:** Use LLMs to generate insights from data.

**Task:**

* In **`gpt-service`**, implement a **`POST /summarize-loads`** endpoint that:

  1. Receives an array of load objects
  2. Dynamically constructs a prompt and calls the GPT Compute Preview API via the `openai` SDK
  3. Extracts price trends and route optimization suggestions
  4. Returns JSON:

  ```json
  {
    "summary": "…",
    "insights": ["…", "…"]
  }
  ```
* Validate the request payload and handle OpenAI API quotas and errors.

**Deliverables:**

* TypeScript code (`openai@"^4.x"`)
* API mocks for unit tests
* Example requests and responses in the README

**Evaluation Criteria:**

* Clarity and effectiveness of the generated prompt
* Error handling and fallback strategies
* Test coverage ≥ 80%

---

## 4. Database and Data Orchestration

**Objective:** Assess data modeling, performance, and orchestration.

**Task:**

* Add a PostgreSQL service via Docker Compose with tables:

  * `drivers`, `loads`, `summaries` (id, load\_id, summary\_text, created\_at)
* In `automation-service`, after posting data to GPT, store the AI responses in `summaries`.
* Create indexes for common queries and a materialized view joining `loads` and `summaries`.

**Deliverables:**

* `schema.sql` and migration scripts (TypeORM, Sequelize, or Knex)
* SQL to create the materialized view
* Example query for “Top 5 loads with best insights”

**Evaluation Criteria:**

* Correct relationships and data types
* Effective use of materialized view and indexes
* Idempotent migration scripts

---

## 5. CI/CD and Infrastructure as Code (Optional Bonus)

* **GitHub Actions:** Workflow for linting, testing, and building Docker images
* **Terraform:** Infrastructure definition (ECS/Fargate, RDS)
* **Kubernetes:** Manifests for Deployment, Service, and ConfigMap

---

## 6. Documentation and Communication

**Task:**

* Document the entire setup (multi-service Docker, environment variables, tests) in the README.md
* Write a simulated post-mortem (up to 300 words) in English, covering challenges, architectural decisions, and next steps

---

**Good luck!**
