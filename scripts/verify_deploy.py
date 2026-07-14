import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.161.245.49', username='ubuntu', password='zZ201621516', timeout=10)

# Check git commit on server
stdin, stdout, stderr = client.exec_command("cd /opt/imaginova && sudo git log --oneline -1")
print("Server HEAD:", stdout.read().decode().strip())

# Check if new files exist in container
stdin, stdout, stderr = client.exec_command("sudo docker exec imaginova-imaginova-1 ls /app/route-progress.tsx 2>&1 || echo 'not in root'")
print("RouteProgress in root:", stdout.read().decode().strip())

# Check recent logs for errors
stdin, stdout, stderr = client.exec_command("sudo docker logs --tail 10 imaginova-imaginova-1 2>&1")
logs = stdout.read().decode(errors='replace')
print("\nRecent logs:")
print(logs[-500:] if len(logs) > 500 else logs)

# Check if the server env still has Chinese placeholder
stdin, stdout, stderr = client.exec_command("sudo docker exec imaginova-imaginova-1 env | grep OPENAI")
print("\nOPENAI_API_KEY:", stdout.read().decode().strip())

client.close()
