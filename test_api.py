import urllib.request
import json

# 1. Login to get token
req = urllib.request.Request("http://localhost:8000/api/auth/login", data=b"username=test@example.com&password=password", headers={"Content-Type": "application/x-www-form-urlencoded"})
try:
    res = urllib.request.urlopen(req)
    token = json.loads(res.read())["access_token"]
except Exception as e:
    print("Login failed:", e)
    token = None

if token:
    print("Logged in!")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get groups
    req = urllib.request.Request("http://localhost:8000/api/groups", headers=headers)
    try:
        res = urllib.request.urlopen(req)
        groups = json.loads(res.read())
        print("Groups:", [g["id"] for g in groups])
        
        if groups:
            group_id = groups[-1]["id"]
            # 3. Get group details
            print(f"Fetching details for {group_id}...")
            req = urllib.request.Request(f"http://localhost:8000/api/groups/{group_id}", headers=headers)
            try:
                res = urllib.request.urlopen(req)
                print("Success!")
            except Exception as e:
                print("Failed to fetch group details:", e)
                if hasattr(e, 'read'):
                    print(e.read().decode())
    except Exception as e:
        print("Failed to fetch groups:", e)
