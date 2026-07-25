/**
 * Dev seed — throwaway dummy data for local testing.
 *   node src/scripts/seed.js        (or: npm run seed --workspace server)
 *
 * Creates a garage owner, 3 APPROVED garages (with coordinates, working hours,
 * services and service bays) and 2 verified customers. Cars/bookings are left
 * to be created via the API during testing.
 */
import mongoose from 'mongoose'

import config from '../config/index.js'
import User from '../models/user.model.js'
import Garage from '../models/garage.model.js'
import Service from '../models/service.model.js'
import Car from '../models/car.model.js'
import Booking from '../models/booking.model.js'
import Counter from '../models/counter.model.js'

// Mon–Sun 09:00–18:00, open every day.
const allWeekOpen = Array.from({ length: 7 }, (_, day) => ({
  day,
  open: '09:00',
  close: '18:00',
  isClosed: false,
}))

// Base point (Bengaluru) and northward offsets (~1 deg lat ≈ 111 km).
const BASE_LNG = 77.5946
const BASE_LAT = 12.9716

async function run() {
  await mongoose.connect(config.mongoUri)
  console.log('connected:', mongoose.connection.host)

  await Promise.all([
    User.deleteMany({}),
    Garage.deleteMany({}),
    Service.deleteMany({}),
    Car.deleteMany({}),
    Booking.deleteMany({}),
    Counter.deleteMany({}),
  ])
  // Ensure indexes (incl. 2dsphere + partial unique) exist.
  await Promise.all([Garage.init(), Booking.init(), Service.init(), Car.init(), User.init()])

  const admin = await User.create({
    name: 'Nayan Dange',
    email: 'adminnayan@gmail.com',
    phone: '7389049902',
    password: 'Admin@2003',
    role: 'admin',
    isEmailVerified: true,
  })

  const owner = await User.create({
    name: 'Olive Owner',
    email: 'owner@example.com',
    phone: '+15550009999',
    password: 'Passw0rd!',
    role: 'garage_owner',
    isEmailVerified: true,
  })

  const garageDefs = [
    { name: 'Sparkle Auto Spa', bays: 2, featured: true, offsetLat: 0.0 }, // closest
    { name: 'Shine Masters', bays: 2, featured: false, offsetLat: 0.02 }, // ~2.2 km
    { name: 'Gleam Garage', bays: 3, featured: false, offsetLat: 0.05 }, // ~5.5 km
  ]

  const garages = []
  for (const def of garageDefs) {
    // eslint-disable-next-line no-await-in-loop
    const garage = await Garage.create({
      name: def.name,
      owner: owner._id,
      description: `${def.name} — dummy seed garage`,
      address: `${def.name}, Test City`,
      location: { type: 'Point', coordinates: [BASE_LNG, BASE_LAT + def.offsetLat] },
      serviceBays: def.bays,
      workingHours: allWeekOpen,
      slotDurationMinutes: 30,
      verificationStatus: 'APPROVED',
      isFeatured: def.featured,
      rating: 4.5,
    })

    // eslint-disable-next-line no-await-in-loop
    const services = await Service.create([
      { garageId: garage._id, name: 'Basic Wash', price: 20, durationMinutes: 30, category: 'wash', isPopular: true, bookingsCount: 50 },
      { garageId: garage._id, name: 'Full Detail', price: 80, durationMinutes: 60, category: 'detail', bookingsCount: 10 },
      { garageId: garage._id, name: 'Interior Clean', price: 50, durationMinutes: 45, category: 'interior', isPopular: true, bookingsCount: 30 },
    ])
    garages.push({ garage, services })
  }

  const customerPassword = 'Passw0rd!'
  const [cara, eve] = await Promise.all([
    User.create({ name: 'Cara Customer', email: 'cara@example.com', phone: '+15551110001', password: customerPassword, role: 'customer', isEmailVerified: true }),
    User.create({ name: 'Eve Customer', email: 'eve@example.com', phone: '+15551110002', password: customerPassword, role: 'customer', isEmailVerified: true }),
  ])

  const summary = {
    admin: admin.email,
    owner: owner.email,
    customers: [
      { email: cara.email, password: customerPassword, id: cara.id },
      { email: eve.email, password: customerPassword, id: eve.id },
    ],
    garages: garages.map(({ garage, services }) => ({
      id: garage.id,
      name: garage.name,
      serviceBays: garage.serviceBays,
      coordinates: garage.location.coordinates,
      isFeatured: garage.isFeatured,
      services: services.map((s) => ({ id: s.id, name: s.name, price: s.price, durationMinutes: s.durationMinutes })),
    })),
  }

  console.log('SEED_OUTPUT_START')
  console.log(JSON.stringify(summary, null, 2))
  console.log('SEED_OUTPUT_END')

  await mongoose.disconnect()
}

run().catch(async (err) => {
  console.error('seed failed:', err)
  await mongoose.disconnect().catch(() => { })
  process.exit(1)
})
