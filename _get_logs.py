import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.161.245.49', username='ubuntu', password='zZ201621516', timeout=10)

stdin, stdout, stderr = client.exec_command('sudo docker logs imaginova-imaginova-1 --tail 200 2>&1 | grep -E "\\[video|\\[sse" 2>&1')
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
