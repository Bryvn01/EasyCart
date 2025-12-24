# Azure Resource Provisioning & Environment Setup Checklist

## 1. Azure Resource Provisioning (Manual)

### a. Azure App Service (Backend)
- Create a new **App Service** (Linux) for your Django backend
- Choose Python 3.12 runtime
- Set up a **PostgreSQL** database (Azure Database for PostgreSQL Flexible Server)
- (Optional) Set up **Azure Key Vault** for secrets management

### b. Azure Static Web Apps (Frontend)
- Create a new **Azure Static Web App** for your React frontend
- Connect to your GitHub repo for CI/CD

### c. Cloudinary (Media Storage)
- Ensure your Cloudinary account is active and API keys are available

---

## 2. Environment Variables (App Service Backend)
Set these in the Azure Portal > App Service > Configuration:

- `DJANGO_SECRET_KEY` (strong random value)
- `DJANGO_DEBUG` = `False`
- `ALLOWED_HOSTS` = `<your-app-service-name>.azurewebsites.net`
- `DATABASE_URL` = `postgres://<user>:<password>@<host>:5432/<dbname>`
- `CLOUDINARY_URL` = `cloudinary://<api_key>:<api_secret>@<cloud_name>`
- Any other secrets (email, third-party APIs, etc.)

---

## 3. GitHub Secrets (for CI/CD)
- In your GitHub repo, go to **Settings > Secrets and variables > Actions**
- Add secret: `AZURE_WEBAPP_PUBLISH_PROFILE` (download from Azure Portal > App Service > Get publish profile)

---

## 4. Frontend Environment Variables (Static Web Apps)
- In Azure Portal > Static Web App > Configuration, set:
  - `REACT_APP_API_URL` = `https://<your-app-service-name>.azurewebsites.net/api/`
  - Any other frontend secrets (never expose sensitive backend secrets here)

---

## 5. Final Steps
- Push to `main`/`master` to trigger CI/CD
- Monitor deployments in Azure Portal
- Test both frontend and backend endpoints
- Review logs for errors (App Service > Log Stream)

---

**Tip:** For production, always use strong secrets, restrict allowed hosts, and enable HTTPS.
