import mongoose from 'mongoose'

const { Schema, model } = mongoose

// Atomic sequence counters, used to build human-readable booking numbers.
const counterSchema = new Schema({
  _id: { type: String, required: true }, // e.g. "booking-20260711"
  seq: { type: Number, default: 0 },
})

const Counter = model('Counter', counterSchema)

export default Counter
