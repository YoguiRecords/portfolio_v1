FROM python:3.13-slim

# Install dependencies for Pillow WebP support
RUN apt-get update && apt-get install -y \
    libwebp-dev \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Durcissement portfolio : conteneur non-root (norme STACK_DOCKER).
RUN useradd --system --no-create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 5050

# Use Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5050", "app:app"]
