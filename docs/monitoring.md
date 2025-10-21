# Monitoring & Observability for EasyCart

## Backend (Django)
- Logs are written to `backend/logs/django.log`.
- To view logs in real time with Docker Compose:
  ```sh
  docker compose logs backend
  ```
- For local development, logs also appear in your terminal.

## Frontend (React)
- Errors and warnings appear in the browser console (F12 > Console tab).
- For advanced error tracking, consider integrating Sentry (free tier available).

## Error Tracking (Optional)
- [Sentry](https://sentry.io/) can be added to both backend and frontend for cloud-based error monitoring.
- See Sentry docs for Django and React integration guides.

---

**Tip:** Always check logs and browser console when debugging issues locally or in free-tier deployments.
