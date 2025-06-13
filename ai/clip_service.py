import io
import torch
import clip
from PIL import Image
from flask import Flask, request, jsonify
from ultralytics import YOLO



app = Flask(__name__)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = None
preprocess = None

# model = YOLO("yolov8n.pt")

def load_model():
    global model, preprocess
    if model is None or preprocess is None:
        model, preprocess = clip.load("RN50", device=device)

@app.route('/embed', methods=['POST'])
def embed():
    load_model()

    if 'image' not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    image_file = request.files['image']

    try:
        image = Image.open(image_file.stream).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image: {str(e)}"}), 400

    image_input = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        image_features = model.encode_image(image_input)
        image_features /= image_features.norm(dim=-1, keepdim=True)

    embedding = image_features.cpu().numpy()[0].tolist()
    return jsonify({"embedding": embedding})

@app.route('/check-tshirt', methods=['POST'])
def check_tshirt():
    load_model()

    if 'image' not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    image_file = request.files['image']

    try:
        image = Image.open(image_file.stream).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image: {str(e)}"}), 400

    image_input = preprocess(image).unsqueeze(0).to(device)

    text_labels = ["a photo of a t-shirt", "a photo of a shoe", "a photo of a bag", "a random object"]
    text_tokens = clip.tokenize(text_labels).to(device)

    with torch.no_grad():
        image_features = model.encode_image(image_input)
        text_features = model.encode_text(text_tokens)

        image_features /= image_features.norm(dim=-1, keepdim=True)
        text_features /= text_features.norm(dim=-1, keepdim=True)

        similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)

    probs = similarity[0].tolist()
    results = [{"label": label, "probability": round(prob, 3)} for label, prob in zip(text_labels, probs)]
    return jsonify({"data": results})

@app.route('/check-tshirt-yolo', methods=['POST'])
def check_tshirt_yolo():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    # Read image from the request
    image_file = request.files['image']
    try:
        image = Image.open(image_file.stream).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image: {str(e)}"}), 400


    # Run inference
    results = model(image)

    detections = []
    for box in results[0].boxes:
        label = model.names[int(box.cls)]
        conf = float(box.conf)
        if label.lower() in ['t-shirt', 'shirt']:  # adjust labels if needed
            detections.append({
                'label': label,
                'probability': round(conf, 2),
                'box': box.xyxy[0].tolist()
            })
    return jsonify({"data": detections})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
