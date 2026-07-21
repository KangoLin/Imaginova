import httpx

sources = [
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=5000&country=all&ssl=all&anonymity=all",
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
    "https://raw.githubusercontent.com/MuRongDeYouSheng/FreeProxy/main/http.txt",
]

all_proxies = set()
for src in sources:
    try:
        resp = httpx.get(src, timeout=15)
        if resp.status_code == 200:
            lines = [l.strip() for l in resp.text.splitlines() if l.strip()]
            lines = [l for l in lines if not l.startswith("#")]
            all_proxies.update(lines)
            host = src.split("/")[2]
            print(f"OK {host}: {len(lines)} proxies")
        else:
            print(f"FAIL {src}: HTTP {resp.status_code}")
    except Exception as e:
        print(f"ERR {src}: {e}")

print(f"\nTotal unique: {len(all_proxies)}")
with open("free_proxies.txt", "w") as f:
    f.write("\n".join(sorted(all_proxies)))
print("Saved to free_proxies.txt")
