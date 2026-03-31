import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Settings
    const settings = [
      { key: "coupleName", value: "Lauretta & Caleb" },
      { key: "weddingDate", value: "SATURDAY, THE 25TH OF APRIL, 2026" },
      { key: "venue", value: "Royal Gardens, Lagos" },
      { key: "ceremonyTime", value: "2:00 PM" },
      { key: "receptionTime", value: "5:00 PM" },
    ];

    for (const s of settings) {
      await prisma.setting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: s,
      });
    }

    // Schedule events
    const scheduleEvents = [
      { time: "1:30 PM", event: "Guest Arrival", location: "Royal Gardens", order: 0 },
      { time: "2:00 PM", event: "Wedding Ceremony", location: "Chapel of Grace", order: 1 },
      { time: "3:30 PM", event: "Cocktail Hour", location: "Garden Terrace", order: 2 },
      { time: "5:00 PM", event: "Reception & Dinner", location: "Grand Ballroom", order: 3 },
      { time: "7:00 PM", event: "First Dance", location: "Grand Ballroom", order: 4 },
      { time: "9:00 PM", event: "Evening Celebration", location: "Grand Ballroom", order: 5 },
    ];

    await prisma.scheduleEvent.deleteMany();
    for (const e of scheduleEvents) {
      await prisma.scheduleEvent.create({ data: e });
    }

    // Menu
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();

    const menuData = [
      { name: "Starters", order: 0, items: ["Pepper Soup", "Asaro (Yam Porridge)", "Spring Rolls"] },
      { name: "Main Course", order: 1, items: ["Jollof Rice & Chicken", "Egusi Soup & Fufu", "Fried Rice & Beef"] },
      { name: "Desserts", order: 2, items: ["Puff Puff", "Chin Chin", "Ice Cream"] },
      { name: "Drinks", order: 3, items: ["Chapman", "Palm Wine", "Zobo", "Soft Drinks"] },
    ];

    for (const cat of menuData) {
      await prisma.menuCategory.create({
        data: {
          name: cat.name,
          order: cat.order,
          items: {
            create: cat.items.map((name) => ({ name })),
          },
        },
      });
    }

    // Tables
    await prisma.weddingTable.deleteMany();
    for (let i = 1; i <= 10; i++) {
      await prisma.weddingTable.create({ data: { number: i } });
    }

    // Sample guests
    await prisma.guest.deleteMany();
    const sampleGuests = [
      { name: "Adewale Johnson", email: "adewale@email.com", phone: "+234 801 234 5678", status: "attending", guestCount: 2 },
      { name: "Chioma Okafor", email: "chioma@email.com", phone: "+234 802 345 6789", status: "attending", guestCount: 1 },
      { name: "David Mensah", email: "david@email.com", phone: "+234 803 456 7890", status: "pending", guestCount: 3 },
      { name: "Fatima Bello", email: "fatima@email.com", phone: "+234 804 567 8901", status: "declined", guestCount: 1 },
      { name: "Emmanuel Eze", email: "emmanuel@email.com", phone: "+234 805 678 9012", status: "attending", guestCount: 2 },
    ];

    for (const g of sampleGuests) {
      await prisma.guest.create({ data: g });
    }

    return NextResponse.json({ success: true, message: "Database seeded!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
