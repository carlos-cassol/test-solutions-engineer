# Carrier Data Automation & Summarization System

## 1. Microservices Architecture

### Service Structure
| Service               | Description                                  | Port  |
|-----------------------|----------------------------------------------|-------|
| `automation-service`  | Browser automation & data extraction         | 3001  |
| `gpt-service`         | OpenAI GPT summarization endpoint            | 3000  |

**Communication:** HTTP POST requests between services.

---

## 2. Data Extraction Automation
**Location:** `automation-service`

### Workflow
1. Authenticates with:
   - JB Hunt Loadboard (`https://www.jbhunt.com`)
   - Landstar Online (`https://www.landstaronline.com`)
2. Extracts:
   - 20 most recent loads from Landstar (origin, destination, pay, ETA)
   - First 100 rows per state from JB Hunt
3. Processes data via GPT summarization
4. Persists results to PostgreSQL

### Features
Retry mechanism with exponential backoff  
Prometheus metrics at `/metrics`  
Prisma ORM integration  

---

## 3. GPT Integration
**Location:** `gpt-service`

### Endpoint
`POST /summarize-loads`

### Request example
```json
{
    "CarrierData":
    {
        "pickupDateTime": "2025-06-11T10:00:00Z",
        "deliveryDateTime": "2025-06-11T18:00:00Z",
        "origin": "Dallas, TX",
        "destination": "Atlanta, GA",
        "carrierPay": 1300,
        "miles": 780,
        "weight": 30000,
        "commodityCode": "FOOD",
    }
}
```
**Response Example:**

{ "summary": "Generated analysis of load patterns showing frequent routes between Texas and Georgia with average pay of $1,300 for 780-mile hauls." }

## 4. Database and Data Orchestration

**Used:** PostgreSQL + Prisma ORM

**Tables:**
- `insights`
- `carrier_info` 
- `driver_info` (Just for example, because no driver data is shown up at both websites)

**Connection:**  
Example:
Defined in `automation-service/.env`

```env
  DATABASE_URL="postgresql://postgres:root@localhost:5432/CarrierData"
```

---

## 5. Environment Configuration

Each service requires a `.env` file at its root. These files store sensitive configuration values such as credentials and API keys.

### `automation-service/.env`

```env
# PostgreSQL connection
(example connection string)
DATABASE_URL="postgresql://postgres:root@localhost:5432/CarrierData"

# Loadboard credentials (used for browser automation. Or leave a empty string to use debug credentials)
LANDSTAR_USERNAME="your_landstar_username"
LANDSTAR_PASSWORD="your_landstar_password"

```

### `gpt-service/.env`
```env
# OpenAI API Key
OPENAI_API_KEY="your_openai_api_key"

```

### `Folder Format Example`
```env
├── src/
├── prisma/
├── .env <-- Environment variables
├── package.json
├── tsconfig.json
└── ...

```

## 6. Setup Instructions

```bash 
git clone https://github.com/carlos-cassol/test-solutions-engineer.git

*Open bash in main folder*

# Automation Service:
cd automation-service
npm install
npx prisma migrate dev
npm run start

# GPT Service:
cd ../gpt-service
npm install
npm run start
```
## 7. Execution
A cron job runs every minute to execute all registered automations automatically.

### Key Behaviors:
    Prevents overlapping runs using an isRunning lock.

    Handles retry and logs errors for failed automations.

    Sends extracted data to GPT for summarization.

    Persists results into PostgreSQL using Prisma ORM.

    Exposes Prometheus metrics for observability.

### Automation flow:

    Iterates over all registered automations.

    Extracts carrier data.

    Sends it to gpt-service at /summarize-loads.

    Saves the summary and data into the database.

    This ensures near real-time data extraction and insight generation.

---

## 8. Post-Mortem

During development, the main challenges included dealing with unstable loadboard websites and ensuring Puppeteer stability. Some selectors were inconsistent or dynamically loaded, requiring custom wait logic and keypress simulations (e.g., pressing 'ENTER' to trigger searches).

A major blocker was running Puppeteer reliably inside a Docker container. Despite multiple attempts, I couldn't achieve full browser execution in the container due to dependency and sandboxing issues. As a workaround, Puppeteer was run locally for stability.

On the GPT side, reliability and cost were concerns. I implemented exponential backoff and a fallback response for API errors. The prompt was tuned to ensure consistent and useful summaries.

If extended, I would improve authentication, fully containerize all services, and implement CI/CD with GitHub Actions and Terraform. Long-term, I suggest adding a heatmap dashboard that processes and visualizes collected data with LLM insights—showing both current trends and future projections.

A great implementation would be a automation viewer panel to track executions and trigger manual runs when needed.
