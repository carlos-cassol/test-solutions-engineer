# Carrier Data Automation & Summarization System

## 1. Microservices Architecture

### Service Structure
| Service               | Description                                  | Port  |
|-----------------------|----------------------------------------------|-------|
| `automation-service`  | Browser automation & data extraction         | 3000  |
| `gpt-service`         | OpenAI GPT summarization endpoint            | 3001  |

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

# Loadboard credentials (used for browser automation)
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


---

## 7. Simulated Post-Mortem

During development, the main challenges were handling unstable loadboard sites and maintaining Puppeteer stability across retries. Some selectors were inconsistent or dynamically injected, requiring custom wait logic. We also had to simulate some keyboard key-press like 'ENTER'. Its due to a specific scenario where the input doesn't accept just the writing and search-button press.

On the GPT side, the challenge was API reliability and cost optimization. I implemented exponential backoff and a fallback response in case of failures. The prompt was tuned to ensure clear summaries.

If extended, I would improve authentication, add Docker support, and implement CI/CD pipelines with GitHub Actions and Terraform for infrastructure automation.

For a distant future, I would recommend an heat-map visualization where we track all the collected and stored data with the insights, process it via LLM, and produce heatmaps for today, and a speculation heatmap for the future (like next month, semester and etc)
