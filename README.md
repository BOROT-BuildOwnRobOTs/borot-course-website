# BOROT Course Website (Next.js)

Run websites on any machine using Docker without installing Node.js/npm.

## Requirements
- Docker
- Docker Compose (v2)

---

## Run (Dev / Hot Reload)
```bash
docker compose up --build
```

## Run (Production)
```bash
docker build -t borot-course-website .
```
```bash
docker run --rm -p 3000:3000 borot-course-website
```

---

Open on your own computer:
- http://localhost:3000

Open from another computer on the same Wi-Fi:
- http://<YOUR_PC_IP>:3000