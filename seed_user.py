import asyncio
import bcrypt
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    
    email = "test@example.com"
    password = "password"
    
    # Check if user exists
    user = await db.user.find_first(where={"email": email})
    
    if not user:
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        await db.user.create(
            data={"email": email, "name": "Test User", "password": hashed_pw}
        )
        print(f"Created test user: {email} / {password}")
    else:
        # Update password just in case
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        await db.user.update(
            where={"email": email},
            data={"password": hashed_pw}
        )
        print(f"Updated password for test user: {email} / {password}")
        
    await db.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
