import csv
import random

random.seed(42)

data = {
    "Road Damage": [
        "There is a large pothole on the main road",
        "The road near the school is badly damaged",
        "Several potholes are present on our street",
        "The road surface is broken near the bus stop",
        "Vehicles are struggling because of damaged roads",
        "There are deep potholes in our village road",
        "The main road needs urgent repair",
        "The road has many cracks and potholes",
        "The street road is completely damaged",
        "A large pothole is causing accidents"
    ],

    "Water Supply": [
        "There is no drinking water in our area",
        "Water supply has stopped for three days",
        "Our village is facing a water shortage",
        "The water pipeline is not supplying water",
        "Residents are not receiving drinking water",
        "There is very low water pressure",
        "Water supply is unavailable in our locality",
        "The village water connection is not working",
        "There is a problem with the water pipeline",
        "Our area has no regular water supply"
    ],

    "Garbage": [
        "Garbage has not been collected for several days",
        "There is a large pile of garbage near houses",
        "The garbage bin is overflowing",
        "Waste is accumulating on the street",
        "Garbage collection is not happening",
        "There is garbage near the school",
        "Household waste is not being collected",
        "The garbage area is creating a bad smell",
        "Waste has been dumped on the roadside",
        "Our locality has an overflowing garbage bin"
    ],

    "Drainage": [
        "The drainage is overflowing near our houses",
        "The street drain is blocked",
        "Drain water is entering the road",
        "There is stagnant water because of blocked drainage",
        "Sewage is overflowing on the street",
        "The drainage pipe is damaged",
        "Dirty water is coming from the drain",
        "The drainage system needs immediate repair",
        "Water is not flowing through the drain",
        "The main drain is completely blocked"
    ],

    "Street Light": [
        "The street light is not working",
        "There is no light on our street at night",
        "The light near the bus stop is broken",
        "Several street lights are not working",
        "Our street is completely dark at night",
        "The lamp post light has stopped working",
        "Street lights are not switching on",
        "The road has no working lights",
        "The street light needs repair",
        "A broken street light is causing safety problems"
    ],

    "Electricity": [
        "There are frequent power cuts in our area",
        "Electricity supply is unstable",
        "There is a problem with the power line",
        "Power supply has stopped in our street",
        "The electric pole has a problem",
        "Our locality is facing frequent power interruptions",
        "Electricity is unavailable in the area",
        "The electrical connection is not working",
        "There is an issue with the electricity supply",
        "Power is going off frequently"
    ],

    "Sanitation": [
        "The public area is not being cleaned",
        "Sanitation is poor in our locality",
        "The public toilet is not maintained",
        "Our area needs immediate cleaning",
        "The surroundings are unhygienic",
        "Public sanitation facilities are not maintained",
        "The market area has poor hygiene",
        "Cleaning workers are not visiting regularly",
        "The public place needs sanitation work",
        "Our locality has serious cleanliness problems"
    ],

    "Other": [
        "There is a civic problem in our locality",
        "A public facility needs attention",
        "Residents are facing a local public issue",
        "A government facility needs maintenance",
        "Our locality needs immediate attention",
        "There is an unresolved public issue",
        "Please inspect the public infrastructure",
        "A public service needs attention",
        "Residents need help with a civic issue",
        "Please investigate this local problem"
    ]
}


rows = []

for category, sentences in data.items():

    for sentence in sentences:

        for i in range(15):

            rows.append({
                "complaint_text": sentence,
                "category": category
            })


random.shuffle(rows)

with open(
    "civic_complaints.csv",
    "w",
    newline="",
    encoding="utf-8"
) as file:

    writer = csv.DictWriter(
        file,
        fieldnames=["complaint_text", "category"]
    )

    writer.writeheader()
    writer.writerows(rows)


print("===================================")
print("CivicConnect ML Dataset Created!")
print("===================================")
print("Total records:", len(rows))
print("Categories:", len(data))
print("File: civic_complaints.csv")