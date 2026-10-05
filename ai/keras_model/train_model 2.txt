
import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Reproducible demonstration run
np.random.seed(42)
tf.random.set_seed(42)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "civic_issue_model.keras"
SCALER_PATH = BASE_DIR / "scaler.json"
INFO_PATH = BASE_DIR / "model_info.json"

CATEGORIES = [
    "Road Damage",
    "Garbage",
    "Water Supply",
    "Drainage",
    "Street Light",
    "Electricity",
    "Sanitation",
    "Other",
]

# DEMO ONLY: synthetic feature data.
# Replace with real labelled complaint data before reporting
# real-world accuracy or integrating predictions into decisions.
SAMPLES_PER_CATEGORY = 250
FEATURE_COUNT = 6

features = []
labels = []

for category_index in range(len(CATEGORIES)):
    for _ in range(SAMPLES_PER_CATEGORY):
        row = np.random.normal(
            loc=category_index * 1.5,
            scale=0.8,
            size=FEATURE_COUNT,
        )
        features.append(row)
        labels.append(category_index)

X = np.asarray(features, dtype=np.float32)
y = np.asarray(labels, dtype=np.int32)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train).astype(np.float32)
X_test = scaler.transform(X_test).astype(np.float32)

model = keras.Sequential([
    keras.Input(shape=(FEATURE_COUNT,), name="civic_features"),
    keras.layers.Dense(32, activation="relu"),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(16, activation="relu"),
    keras.layers.Dense(len(CATEGORIES), activation="softmax"),
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

print("\nCivicConnect AI - Keras Demonstration Model")
model.summary()

history = model.fit(
    X_train,
    y_train,
    validation_split=0.2,
    epochs=10,
    batch_size=32,
    verbose=1,
)

test_loss, test_accuracy = model.evaluate(
    X_test,
    y_test,
    verbose=0,
)

model.save(MODEL_PATH)

# Store preprocessing values needed to transform future inputs.
SCALER_PATH.write_text(json.dumps({
    "mean": scaler.mean_.tolist(),
    "scale": scaler.scale_.tolist(),
}), encoding="utf-8")

info = {
    "project": "CivicConnect AI",
    "model_type": "Keras Sequential Neural Network",
    "framework": "TensorFlow / Keras",
    "input_features": FEATURE_COUNT,
    "output_classes": CATEGORIES,
    "total_parameters": int(model.count_params()),
    "trainable_parameters": int(sum(
        np.prod(weight.shape)
        for weight in model.trainable_weights
    )),
    "non_trainable_parameters": int(sum(
        np.prod(weight.shape)
        for weight in model.non_trainable_weights
    )),
    "optimizer": "Adam",
    "loss": "sparse_categorical_crossentropy",
    "epochs": len(history.history["loss"]),
    "test_loss": float(test_loss),
    "test_accuracy": float(test_accuracy),
    "dataset_type": "SYNTHETIC DEMONSTRATION DATA - NOT REAL-WORLD VALIDATION",
}

INFO_PATH.write_text(
    json.dumps(info, indent=2),
    encoding="utf-8",
)

print("\nTraining run completed.")
print("Model saved:", MODEL_PATH)
print("Scaler saved:", SCALER_PATH)
print("Model information saved:", INFO_PATH)
print("Parameters:", model.count_params())
print("Test accuracy on synthetic data:", round(test_accuracy * 100, 2), "%")
print("WARNING: This accuracy is only for synthetic demonstration data.")
