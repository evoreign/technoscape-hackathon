import weaviate.classes as wvc
from weaviate.classes.config import Property, DataType

# Create a new data collection
collection = client.collections.create(
    name = "docs", # Name of the data collection
    properties=[
        Property(name="text", data_type=DataType.TEXT), # Name and data type of the property
    ],
)