from fastapi import FastAPI, File, UploadFile
import uvicorn
import tensorflow as tf
import numpy as np
from PIL import Image
from io import BytesIO

app = FastAPI()

# Load pretrained MobileNetV2 once
model = tf.keras.applications.MobileNetV2(weights="imagenet")
decode_predictions = tf.keras.applications.mobilenet_v2.decode_predictions

CLOTHING_KEYWORDS = [
    "apron","backpack","baseball_cap","bow_tie","bikini","bulletproof_vest","cardigan",
    "cloak","cowboy_hat","diaper","dress","hood","gown","hat","jersey","jean","jeans",
    "lab_coat","maillot","miniskirt","neck_brace","necklace","overskirt","pajama","poncho",
    "purse","raincoat","sandal","sarong","sweatshirt","sweater","t-shirt","tank_top","tie",
    "top_hat","trench_coat","uniform","veil","vest","wedding_gown","windbreaker","sock",
    "shoe","boot","loafer","sneaker","moccasin","slipper","cloak","cape","belt","jersey","quilt","velvet","wool","cashmere","plush","fur","cloth","towel","sash","screen","mask"
]

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Load image
        img = Image.open(BytesIO(await file.read())).convert("RGB")
        x = np.expand_dims(np.array(img), axis=0)
        x = tf.keras.applications.mobilenet_v2.preprocess_input(x)

        # Predict
        preds = model.predict(x, verbose=0)
        results = decode_predictions(preds, top=5)[0]

        # Log top predictions with percentages
        print("AI Predictions:")
        for (_, label, score) in results:
            print(f"  {label}: {score*100:.2f}%")

        MIN_CONFIDENCE = 0.5  # 50% minimum score

        # Check for clothing keywords
        is_clothing = any(
            score >= MIN_CONFIDENCE and any(label.lower() == word.lower() for word in CLOTHING_KEYWORDS + FABRIC_KEYWORDS)
            for (_, label, score) in results
        )
        print("AI shirt Predictions:")
        print(f"  is_clothing: {is_clothing}")
        return {"is_clothing": is_clothing}

    except Exception as e:
        return {"error": str(e), "is_clothing": False}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
