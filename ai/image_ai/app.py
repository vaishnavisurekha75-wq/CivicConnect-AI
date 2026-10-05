import os
import json

# ======================================================
# WINDOWS / OPENMP FIX
# ======================================================

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# ======================================================
# FLASK
# ======================================================

from flask import Flask, request, jsonify
from flask_cors import CORS

# ======================================================
# IMAGE
# ======================================================

from PIL import Image

# ======================================================
# PYTORCH
# ======================================================

import torch

# ======================================================
# TENSORFLOW / KERAS
# ======================================================

import tensorflow as tf
from tensorflow import keras

# ======================================================
# HUGGING FACE TRANSFORMERS
# ======================================================

from transformers import (
    BlipProcessor,
    BlipForConditionalGeneration,
    CLIPProcessor,
    CLIPModel
)


# ======================================================
# FLASK APP
# ======================================================

app = Flask(__name__)
CORS(app)


# ======================================================
# PROJECT PATHS
# ======================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

KERAS_DIR = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        "keras_model"
    )
)

KERAS_MODEL_PATH = os.path.join(
    KERAS_DIR,
    "civic_issue_model.keras"
)

KERAS_INFO_PATH = os.path.join(
    KERAS_DIR,
    "model_info.json"
)

KERAS_SCALER_PATH = os.path.join(
    KERAS_DIR,
    "scaler.json"
)


# ======================================================
# DEVICE
# ======================================================

device = (
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


print("")
print("==============================================")
print("CivicConnect AI - Image Analysis Service")
print("==============================================")
print("Running on:", device)
print("")


# ======================================================
# LOAD BLIP
# ======================================================

print("Loading BLIP image captioning model...")

blip_processor = BlipProcessor.from_pretrained(
    "Salesforce/blip-image-captioning-base"
)

blip_model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base"
)

blip_model.to(device)
blip_model.eval()

print("BLIP model loaded successfully!")


# ======================================================
# LOAD CLIP
# ======================================================

print("")
print("Loading CLIP image classification model...")

clip_processor = CLIPProcessor.from_pretrained(
    "openai/clip-vit-base-patch32"
)

clip_model = CLIPModel.from_pretrained(
    "openai/clip-vit-base-patch32"
)

clip_model.to(device)
clip_model.eval()

print("CLIP model loaded successfully!")


# ======================================================
# LOAD KERAS MODEL
# ======================================================

print("")
print("Loading Keras civic classification model...")

keras_model = None
keras_model_info = None
keras_load_status = "Not loaded"

try:

    if not os.path.exists(KERAS_MODEL_PATH):

        raise FileNotFoundError(
            "Keras model file not found: "
            + KERAS_MODEL_PATH
        )

    # Load trained Keras model
    keras_model = keras.models.load_model(
        KERAS_MODEL_PATH
    )

    keras_load_status = "Loaded successfully"

    print("Keras model loaded successfully!")
    print(
        "Keras parameters:",
        keras_model.count_params()
    )

    # --------------------------------------------------
    # Load technical information
    # --------------------------------------------------

    if os.path.exists(KERAS_INFO_PATH):

        with open(
            KERAS_INFO_PATH,
            "r",
            encoding="utf-8"
        ) as file:

            keras_model_info = json.load(file)

    else:

        keras_model_info = {
            "project": "CivicConnect AI",
            "model_type": "Keras Sequential Neural Network",
            "framework": "TensorFlow / Keras",
            "total_parameters": int(
                keras_model.count_params()
            ),
            "dataset_type":
                "Synthetic demonstration data"
        }

except Exception as e:

    keras_load_status = "Load failed"

    print("")
    print(
        "WARNING: Keras model could not be loaded."
    )

    print(
        "Reason:",
        str(e)
    )

    print(
        "BLIP and CLIP will continue normally."
    )

    print("")


# ======================================================
# CIVIC CATEGORIES
# ======================================================

CATEGORIES = [

    "Road Damage",

    "Garbage",

    "Water Supply",

    "Drainage",

    "Street Light",

    "Electricity",

    "Sanitation",

    "Other"

]


# ======================================================
# IMAGE CLASSIFICATION PROMPTS
# ======================================================

CATEGORY_PROMPTS = {

    "Road Damage": [

        "a photo of a damaged road",

        "a photo of potholes on a road",

        "a photo of broken road pavement",

        "a photo of cracked road",

        "a photo of a road with potholes",

        "a photo of a road with standing water and potholes"

    ],

    "Garbage": [

        "a photo of garbage",

        "a photo of trash dumped on a street",

        "a photo of waste accumulation",

        "a photo of garbage bins overflowing",

        "a photo of litter on a road"

    ],

    "Water Supply": [

        "a photo of a water supply problem",

        "a photo of a leaking water pipe",

        "a photo of water leakage",

        "a photo of a broken water pipeline",

        "a photo of a water tap problem"

    ],

    "Drainage": [

        "a photo of a drainage problem",

        "a photo of a blocked drain",

        "a photo of an open drain",

        "a photo of sewage water",

        "a photo of a flooded drainage system"

    ],

    "Street Light": [

        "a photo of a broken street light",

        "a photo of a street lamp problem",

        "a photo of a damaged street light pole",

        "a photo of a street without working lights"

    ],

    "Electricity": [

        "a photo of an electrical problem",

        "a photo of damaged electrical wires",

        "a photo of a broken electric pole",

        "a photo of fallen power lines",

        "a photo of an electricity infrastructure problem"

    ],

    "Sanitation": [

        "a photo of a sanitation problem",

        "a photo of an unhygienic public area",

        "a photo of a dirty public toilet",

        "a photo of poor public hygiene"

    ],

    "Other": [

        "a photo of a general civic problem",

        "a photo of an unrelated public issue"

    ]

}


# ======================================================
# DEPARTMENT
# ======================================================

def get_department(category):

    departments = {

        "Road Damage":
            "Roads & Buildings Department",

        "Garbage":
            "Municipal Sanitation Department",

        "Water Supply":
            "Water Supply Department",

        "Drainage":
            "Municipal Engineering Department",

        "Street Light":
            "Electrical Department",

        "Electricity":
            "Electricity Department",

        "Sanitation":
            "Municipal Sanitation Department",

        "Other":
            "General Civic Department"

    }

    return departments.get(
        category,
        "General Civic Department"
    )


# ======================================================
# PRIORITY
# ======================================================

def get_priority(category):

    high_priority = [

        "Road Damage",

        "Water Supply",

        "Drainage",

        "Electricity"

    ]

    medium_priority = [

        "Garbage",

        "Street Light",

        "Sanitation"

    ]

    if category in high_priority:

        return "High"

    if category in medium_priority:

        return "Medium"

    return "Low"


# ======================================================
# AI DESCRIPTION
# ======================================================

def create_description(
    category,
    caption
):

    descriptions = {

        "Road Damage":
            "The image shows a road surface with visible damage such as potholes, cracks or broken pavement. The issue may require road repair and maintenance.",

        "Garbage":
            "The image shows accumulated garbage, waste or litter in a public area. The location may require cleaning and waste removal.",

        "Water Supply":
            "The image shows a possible water-supply related issue such as leakage, damaged piping or a water infrastructure problem.",

        "Drainage":
            "The image shows a possible drainage or sewage-related problem that may require cleaning, maintenance or repair.",

        "Street Light":
            "The image shows a possible street-light infrastructure problem that may require inspection or repair.",

        "Electricity":
            "The image shows a possible electricity infrastructure problem involving electrical equipment, poles or wires.",

        "Sanitation":
            "The image shows a possible sanitation or public-hygiene issue that may require cleaning or maintenance.",

        "Other":
            "The AI could not confidently match the image to the supported civic issue categories."

    }

    return descriptions.get(
        category,
        descriptions["Other"]
    )


# ======================================================
# BLIP IMAGE CAPTION
# ======================================================

def generate_caption(image):

    inputs = blip_processor(
        images=image,
        return_tensors="pt"
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.no_grad():

        output = blip_model.generate(
            **inputs,
            max_new_tokens=40
        )

    caption = blip_processor.decode(
        output[0],
        skip_special_tokens=True
    )

    return caption


# ======================================================
# CLIP IMAGE CLASSIFICATION
# ======================================================

def classify_image(image):

    category_scores = {}

    # --------------------------------------------------
    # Calculate score for every civic category
    # --------------------------------------------------

    for category, prompts in CATEGORY_PROMPTS.items():

        inputs = clip_processor(
            text=prompts,
            images=image,
            return_tensors="pt",
            padding=True
        )

        inputs = {
            key: value.to(device)
            for key, value in inputs.items()
        }

        with torch.no_grad():

            outputs = clip_model(
                **inputs
            )

        # Image-text similarity
        logits = outputs.logits_per_image

        # Average prompt scores
        category_score = (
            logits.mean().item()
        )

        category_scores[
            category
        ] = category_score

    # --------------------------------------------------
    # Convert scores into probabilities
    # --------------------------------------------------

    categories = list(
        category_scores.keys()
    )

    scores = torch.tensor(
        [
            category_scores[category]
            for category in categories
        ],
        device=device
    )

    probabilities = torch.softmax(
        scores,
        dim=0
    )

    best_index = torch.argmax(
        probabilities
    ).item()

    best_category = categories[
        best_index
    ]

    confidence = (
        probabilities[best_index]
        .item()
        * 100
    )

    return (
        best_category,
        confidence,
        category_scores
    )


# ======================================================
# MODEL PARAMETER INFORMATION
# ======================================================

def get_model_parameters(model):

    total = sum(
        parameter.numel()
        for parameter in model.parameters()
    )

    trainable = sum(
        parameter.numel()
        for parameter in model.parameters()
        if parameter.requires_grad
    )

    non_trainable = (
        total - trainable
    )

    return {

        "total_parameters":
            int(total),

        "trainable_parameters":
            int(trainable),

        "non_trainable_parameters":
            int(non_trainable)

    }


# ======================================================
# GET BLIP TECHNICAL INFORMATION
# ======================================================

blip_parameters = get_model_parameters(
    blip_model
)


# ======================================================
# GET CLIP TECHNICAL INFORMATION
# ======================================================

clip_parameters = get_model_parameters(
    clip_model
)


# ======================================================
# AI INFORMATION ENDPOINT
# ======================================================

@app.route(
    "/ai-info",
    methods=["GET"]
)
def ai_info():

    keras_total_parameters = 0
    keras_trainable_parameters = 0
    keras_non_trainable_parameters = 0

    if keras_model is not None:

        keras_total_parameters = int(
            keras_model.count_params()
        )

        keras_trainable_parameters = int(
            sum(
                weight.numpy().size
                for weight in keras_model.trainable_weights
            )
        )

        keras_non_trainable_parameters = int(
            sum(
                weight.numpy().size
                for weight in keras_model.non_trainable_weights
            )
        )

    return jsonify({

        "project":
            "CivicConnect AI",

        "service":
            "AI Image Analysis Service",

        "device":
            device,

        "frameworks": [

            "PyTorch",

            "TensorFlow / Keras"

        ],

        "model_library":
            "Hugging Face Transformers",

        "models": {

            "BLIP": {

                "full_name":
                    "Bootstrapping Language-Image Pre-training",

                "model":
                    "Salesforce/blip-image-captioning-base",

                "purpose":
                    "Image caption generation",

                "total_parameters":
                    blip_parameters[
                        "total_parameters"
                    ],

                "trainable_parameters":
                    blip_parameters[
                        "trainable_parameters"
                    ],

                "non_trainable_parameters":
                    blip_parameters[
                        "non_trainable_parameters"
                    ]

            },

            "CLIP": {

                "full_name":
                    "Contrastive Language-Image Pre-training",

                "model":
                    "openai/clip-vit-base-patch32",

                "purpose":
                    "Zero-shot image-to-text similarity classification",

                "total_parameters":
                    clip_parameters[
                        "total_parameters"
                    ],

                "trainable_parameters":
                    clip_parameters[
                        "trainable_parameters"
                    ],

                "non_trainable_parameters":
                    clip_parameters[
                        "non_trainable_parameters"
                    ],

                "classification_type":
                    "Zero-Shot"

            },

            "Keras": {

                "status":
                    keras_load_status,

                "model":
                    "civic_issue_model.keras",

                "model_type":
                    "Keras Sequential Neural Network",

                "framework":
                    "TensorFlow / Keras",

                "total_parameters":
                    keras_total_parameters,

                "trainable_parameters":
                    keras_trainable_parameters,

                "non_trainable_parameters":
                    keras_non_trainable_parameters,

                "input_features":
                    6,

                "output_classes":
                    CATEGORIES,

                "optimizer":
                    (
                        keras_model_info.get(
                            "optimizer",
                            "Adam"
                        )
                        if keras_model_info
                        else "Adam"
                    ),

                "loss":
                    (
                        keras_model_info.get(
                            "loss",
                            "sparse_categorical_crossentropy"
                        )
                        if keras_model_info
                        else "sparse_categorical_crossentropy"
                    ),

                "epochs":
                    (
                        keras_model_info.get(
                            "epochs",
                            10
                        )
                        if keras_model_info
                        else 10
                    ),

                "test_accuracy":
                    (
                        keras_model_info.get(
                            "test_accuracy",
                            None
                        )
                        if keras_model_info
                        else None
                    ),

                "dataset_type":
                    (
                        keras_model_info.get(
                            "dataset_type",
                            "Synthetic demonstration data"
                        )
                        if keras_model_info
                        else "Synthetic demonstration data"
                    )

            }

        },

        "categories":
            CATEGORIES,

        "category_count":
            len(CATEGORIES),

        "decision_pipeline": [

            "Image upload",

            "BLIP image captioning",

            "CLIP zero-shot classification",

            "Confidence calculation",

            "Priority determination",

            "Department routing"

        ],

        "keras_note":
            "The Keras model is trained on synthetic demonstration features and is not used as an image classifier in the current production image-analysis pipeline."

    })


# ======================================================
# KERAS MODEL INFORMATION ENDPOINT
# ======================================================

@app.route(
    "/keras-info",
    methods=["GET"]
)
def keras_info():

    if keras_model is None:

        return jsonify({

            "success": False,

            "status":
                "Keras model unavailable",

            "message":
                "Keras model could not be loaded."

        }), 503

    return jsonify({

        "success": True,

        "status":
            "Keras model loaded successfully",

        "model":
            "civic_issue_model.keras",

        "framework":
            "TensorFlow / Keras",

        "model_type":
            "Sequential Neural Network",

        "parameters":
            int(
                keras_model.count_params()
            ),

        "trainable_parameters":
            int(
                sum(
                    weight.numpy().size
                    for weight
                    in keras_model.trainable_weights
                )
            ),

        "non_trainable_parameters":
            int(
                sum(
                    weight.numpy().size
                    for weight
                    in keras_model.non_trainable_weights
                )
            ),

        "input_features":
            6,

        "output_classes":
            CATEGORIES,

        "optimizer":
            (
                keras_model_info.get(
                    "optimizer",
                    "Adam"
                )
                if keras_model_info
                else "Adam"
            ),

        "loss":
            (
                keras_model_info.get(
                    "loss",
                    "sparse_categorical_crossentropy"
                )
                if keras_model_info
                else "sparse_categorical_crossentropy"
            ),

        "epochs":
            (
                keras_model_info.get(
                    "epochs",
                    10
                )
                if keras_model_info
                else 10
            ),

        "test_accuracy":
            (
                keras_model_info.get(
                    "test_accuracy",
                    None
                )
                if keras_model_info
                else None
            ),

        "dataset_type":
            (
                keras_model_info.get(
                    "dataset_type",
                    "Synthetic demonstration data"
                )
                if keras_model_info
                else "Synthetic demonstration data"
            ),

        "warning":
            "The reported accuracy belongs to synthetic demonstration data and is not real-world validation."

    })


# ======================================================
# ANALYZE IMAGE
# ======================================================

@app.route(
    "/analyze-image",
    methods=["POST"]
)
def analyze_image():

    try:

        print("")
        print("==============================================")
        print("NEW IMAGE ANALYSIS REQUEST")
        print("==============================================")


        # ==================================================
        # CHECK IMAGE
        # ==================================================

        if "image" not in request.files:

            return jsonify({

                "success": False,

                "message":
                    "No image uploaded"

            }), 400


        file = request.files["image"]


        if file.filename == "":

            return jsonify({

                "success": False,

                "message":
                    "No image selected"

            }), 400


        # ==================================================
        # OPEN IMAGE
        # ==================================================

        image = Image.open(
            file
        ).convert("RGB")


        print(
            "Image received:",
            file.filename
        )


        # ==================================================
        # BLIP CAPTION
        # ==================================================

        print(
            "Generating image caption..."
        )

        caption = generate_caption(
            image
        )

        print(
            "BLIP Caption:",
            caption
        )


        # ==================================================
        # CLIP CLASSIFICATION
        # ==================================================

        print(
            "Classifying image with CLIP..."
        )

        (
            category,
            confidence,
            category_scores
        ) = classify_image(
            image
        )


        print(
            "Detected Category:",
            category
        )

        print(
            "Confidence:",
            round(
                confidence,
                2
            ),
            "%"
        )


        # ==================================================
        # DESCRIPTION
        # ==================================================

        description = create_description(
            category,
            caption
        )


        # ==================================================
        # DEPARTMENT
        # ==================================================

        department = get_department(
            category
        )


        # ==================================================
        # PRIORITY
        # ==================================================

        priority = get_priority(
            category
        )


        # ==================================================
        # LOG RESULT
        # ==================================================

        print("")
        print("----------------------------------------------")
        print("AI ANALYSIS RESULT")
        print("----------------------------------------------")

        print(
            "Caption:",
            caption
        )

        print(
            "Category:",
            category
        )

        print(
            "Confidence:",
            round(
                confidence,
                2
            ),
            "%"
        )

        print(
            "Priority:",
            priority
        )

        print(
            "Department:",
            department
        )

        print("----------------------------------------------")
        print("")


        # ==================================================
        # RESPONSE
        # ==================================================

        return jsonify({

            "success":
                True,

            "caption":
                caption,

            "description":
                description,

            "category":
                category,

            "confidence":
                round(
                    confidence,
                    2
                ),

            "priority":
                priority,

            "department":
                department,

            "location":
                None,

            "message":
                "Image analyzed successfully."

        })


    except Exception as e:

        print("")
        print(
            "IMAGE AI ERROR:",
            str(e)
        )
        print("")

        return jsonify({

            "success":
                False,

            "message":
                str(e)

        }), 500


# ======================================================
# HEALTH CHECK
# ======================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "message":
            "CivicConnect Image AI is Running!",

        "models": [

            "BLIP Image Captioning",

            "CLIP Image Classification",

            "Keras Neural Network"

        ],

        "device":
            device,

        "endpoints": {

            "image_analysis":
                "POST /analyze-image",

            "ai_information":
                "GET /ai-info",

            "keras_information":
                "GET /keras-info"

        }

    })


# ======================================================
# START SERVER
# ======================================================

if __name__ == "__main__":

    print("")
    print("----------------------------------------")
    print("CivicConnect Image AI")
    print("----------------------------------------")
    print(
        "Server: http://localhost:5052"
    )
    print(
        "Endpoint: POST /analyze-image"
    )
    print(
        "Technical Info: GET /ai-info"
    )
    print(
        "Keras Info: GET /keras-info"
    )
    print("----------------------------------------")
    print("")

    app.run(

        host="0.0.0.0",

        port=5052,

        debug=False

    )