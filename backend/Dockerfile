FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and ReportLab fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY forensic_core/ forensic_core/
COPY ai/ ai/
COPY backend/ backend/
COPY sample_data/ sample_data/

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
