import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.161.245.49', username='ubuntu', password='zZ201621516', timeout=10)

sftp = client.open_sftp()
with sftp.open('/tmp/get_code.py', 'w') as f:
    f.write("""
import sqlite3
db = sqlite3.connect('/var/lib/docker/volumes/imaginova_imaginova_data/_data/data.db')
cur = db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='verification_codes'")
if cur.fetchone():
    cur = db.execute("SELECT id, email, code, used, expires_at, created_at FROM verification_codes ORDER BY id DESC LIMIT 10")
    print(f"{'id':<5} {'email':<35} {'code':<8} {'used':<5} {'expires_at':<25} {'created_at'}")
    print("-"*85)
    for r in cur.fetchall():
        print(f"{r[0]:<5} {r[1]:<35} {r[2]:<8} {r[3]:<5} {str(r[4] or ''):<25} {r[5]}")
else:
    print("No verification_codes table")
db.close()
""")
sftp.close()

stdin, stdout, stderr = client.exec_command('sudo python3 /tmp/get_code.py 2>&1')
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
