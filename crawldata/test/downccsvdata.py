import kagglehub

# Download latest version
path = kagglehub.dataset_download("yaminh/smartphone-sale-dataset")

print("Path to dataset files:", path)