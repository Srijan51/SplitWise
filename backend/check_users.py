import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    
    users = await db.user.find_many()
    print("Users in DB:")
    for u in users:
        print(f"- {u.email}")
        
    await db.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
