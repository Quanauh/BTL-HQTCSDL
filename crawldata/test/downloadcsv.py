import kagglehub

# Download latest version
path = kagglehub.dataset_download("mrmars1010/filpkart-mobiles")

print("Path to dataset files:", path)