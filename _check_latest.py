import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.161.245.49', username='ubuntu', password='zZ201621516', timeout=10)

sftp = client.open_sftp()
with sftp.open('/tmp/check_latest.py', 'w') as f:
    f.write("""
import sqlite3
db = sqlite3.connect('/var/lib/docker/volumes/imaginova_imaginova_data/_data/data.db')
cur = db.execute("SELECT COUNT(*) FROM users")
print(f"Total users: {cur.fetchone()[0]}")
cur = db.execute("SELECT id, email, credits, created_at FROM users ORDER BY id DESC LIMIT 5")
for r in cur.fetchall():
    print(f"  id={r[0]} {r[1]:<35} credits={r[2]:<4} created={r[3]} UTC")
db.close()
""")
sftp.close()

stdin, stdout, stderr = client.exec_command('sudo python3 /tmp/check_latest.py 2>&1')
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
