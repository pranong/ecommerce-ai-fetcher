# FROM python:3.10-slim

# WORKDIR /app
# COPY . .
# RUN apt-get update && apt-get install -y \
#     git \
#     libgl1 \
#     libglib2.0-0 \
#     libsm6 \
#     libxrender1 \
#     libxext6 \
#     libatlas-base-dev \
#     libjpeg-dev \
#     libpng-dev \
#     ffmpeg \
#     && rm -rf /var/lib/apt/lists/*
# RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
# RUN pip install -r requirements.txt
# RUN pip install git+https://github.com/openai/CLIP.git

# EXPOSE 5000

# CMD ["python", "clip_service.py"]

FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y git && apt-get clean

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY clip_service_eco.py ./

EXPOSE 5000

CMD ["uvicorn", "clip_service_eco:app", "--host", "0.0.0.0", "--port", "5000"]