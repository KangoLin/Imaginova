import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.161.245.49', username='ubuntu', password='zZ201621516', timeout=10)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd + " 2>&1")
    return stdout.read().decode(errors='replace')

# Check if send-code route has the cold-start req.json issue
print("=== send-code route ===")
out = run('sudo docker logs imaginova-imaginova-1 --tail 100 2>&1 | grep -i -E "send.code|syntax.*json|Unexpected token|verification"')
print(out if out.strip() else "(no relevant logs)")

# Check for any 500 errors on send-code
print("\n=== All errors ===")
out = run('sudo docker logs imaginova-imaginova-1 --tail 200 2>&1 | grep -iE "error|500|SyntaxError|code" | head -20')
print(out if out.strip() else "(none)")

client.close()
