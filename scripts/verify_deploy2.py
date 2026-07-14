import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.161.245.49', username='ubuntu', password='zZ201621516', timeout=10)

out = ""

stdin, stdout, stderr = client.exec_command("cd /opt/imaginova && sudo git log --oneline -1")
out += "Server HEAD: " + stdout.read().decode().strip() + "\n"

stdin, stdout, stderr = client.exec_command("sudo docker exec imaginova-imaginova-1 env | grep OPENAI")
out += "OPENAI_API_KEY: " + stdout.read().decode().strip() + "\n"

stdin, stdout, stderr = client.exec_command("sudo docker logs --tail 5 imaginova-imaginova-1 2>&1 | head -5")
logs = stdout.read().decode(errors='replace')
out += "Logs: " + logs[:300] + "\n"

stdin, stdout, stderr = client.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost/")
out += "Homepage HTTP: " + stdout.read().decode().strip()

client.close()

# Write to file to avoid encoding issues
with open('deploy_status.txt', 'w', encoding='utf-8') as f:
    f.write(out)
print(out)
