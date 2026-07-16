import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.161.245.49', username='ubuntu', password='zZ201621516', timeout=10)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd + " 2>&1")
    return stdout.read().decode(errors='replace')

# Check the main app's .env file
print("=== Main app .env (SMTP settings) ===")
out = run("sudo cat /opt/imaginova/.env 2>&1 | grep -i -E 'smtp|mail|from'")
print(out if out.strip() else "(no SMTP settings found)")

# Check all env vars in docker-compose
print("\n=== docker-compose env for imaginova ===")
out = run("sudo grep -A20 'imaginova:' /opt/imaginova/docker-compose.yml 2>&1 | grep -E 'SMTP|MAIL|FROM|HOST|PORT|USER|PASS'")
print(out if out.strip() else "(no SMTP in docker-compose)")

# Check docker env
print("\n=== Docker container env ===")
out = run("sudo docker inspect imaginova-imaginova-1 2>&1 | python3 -c \"import sys,json; d=json.load(sys.stdin); env=d[0]['Config']['Env']; [print(e) for e in env if 'SMTP' in e.upper() or 'MAIL' in e.upper()]\"")
print(out if out.strip() else "(no SMTP env in container)")

# Check the register API response
print("\n=== Last register API logs ===")
out = run('sudo docker logs imaginova-imaginova-1 --tail 50 2>&1 | grep -i -E "verification|mail|smtp|send"')
print(out if out.strip() else "(no verification/smtp logs)")

client.close()
