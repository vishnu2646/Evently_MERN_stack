import { Schema, models, model } from "mongoose";

export interface IEvent extends Document {
    _id: string;
    title: string;
    description?: string; // Note: There is a typo in the schema ("desription" instead of "description")
    locations?: string;
    createdAt?: Date;
    imageUrl: string;
    startDateTime?: Date;
    endDateTime?: Date;
    price?: string;
    isFree: boolean;
    url?: string;
    category?: { _id: number, name: string };
    organizer?: {  _id: number, firstName: string, lastName: string }
}

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    locations: { type: String },
    createdAt: { type: Date, default: Date.now },
    imageUrl: { type: String, required: true },
    startDateTime: { type: Date, default: Date.now },
    endDateTime: { type: Date, default: Date.now },
    price: { type: String },
    isFree: { type: Boolean, required: true },
    url: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    organizer: { type: Schema.Types.ObjectId, ref: 'User' }
});

const Event = models.Event || model('Event', EventSchema);

export default Event;