#exportacion necesaria para el funcionamiento
from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment
# credenciales de el entorno de Paypal sandbox (cambiar de ser necesario)
CLIENT_ID = "AWmlVBJOr6S8Zkq9YCJCu2MmszH9nypq-z2CBSiuqjtYhVLWxbN0sPuVHAT9L-A5SQQ5JXqblL93xBlR"
CLIENT_SECRET = "EKlRbWBlO1qmj_9iHpIYFdm0R8R_FVFbylnn0WqnvluZHpslBWIJNNM-oT8KUI2t88bVFIEUhRlGThUB"

environment = SandboxEnvironment(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET
)

client = PayPalHttpClient(environment)