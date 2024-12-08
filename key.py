import secrets
secret_key = secrets.token_hex(32)
print(f"Your secret key is: {secret_key}")