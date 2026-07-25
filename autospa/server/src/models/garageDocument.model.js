import mongoose from 'mongoose'

const { Schema, model } = mongoose

export const DOCUMENT_STATUS = ['PENDING', 'APPROVED', 'REJECTED']

const documentItemSchema = new Schema(
  {
    type: { type: String, required: true }, // e.g. "business_license"
    url: { type: String, required: true },
  },
  { _id: false }
)

// GarageDocuments — verification documents submitted by a garage owner.
const garageDocumentSchema = new Schema(
  {
    garageId: {
      type: Schema.Types.ObjectId,
      ref: 'Garage',
      required: true,
      index: true,
    },
    documents: {
      type: [documentItemSchema],
      validate: [(v) => v.length > 0, 'At least one document is required'],
    },
    status: { type: String, enum: DOCUMENT_STATUS, default: 'PENDING' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v
        return ret
      },
    },
  }
)

const GarageDocument = model('GarageDocument', garageDocumentSchema)

export default GarageDocument
