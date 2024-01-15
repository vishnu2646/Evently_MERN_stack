import { Webhook } from "svix";
import { headers } from 'next/headers';
import { WebhookEvent } from "@clerk/nextjs/server";
import { isDefined } from "@/utils/utils";
import { emails } from "@clerk/nextjs/api";
import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    const WEBHOOK_SECRET_KEY = process.env.WEBHOOK_SECRET_KEY

    if(!isDefined(WEBHOOK_SECRET_KEY)) {
        throw new Error('Please add WEBHOOK_SECRET_KEY from clerk Dashboard to .env or .env.local');
    }

    const heaserPayload = headers();
    const svix_id = heaserPayload.get('svix_id');
    const svix_timestamp = heaserPayload.get('svix-timestamp');
    const svix_signature= heaserPayload.get('svix-signature');

    if(!isDefined(svix_id) || !isDefined(svix_signature) || !isDefined(svix_timestamp)) {
        return new Response('Error occured -- no svix headers', {
            status: 400
        });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET_KEY as any);

    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        }) as WebhookEvent
    } catch(err) {
        console.error('Error verifying webhook', err);
        return new Response('Error Occured', {
            status: 400
        })
    }

    const { id } = evt.data;
    const eventType = evt.type;

    if(eventType === 'user.created') {
        const { id, email_addresses, image_url, first_name, last_name, username } = evt.data; 

        const user = {
            clerkId: id,
            email: email_addresses[0].email_address,
            username: username!,
            firstName: first_name,
            lastName: last_name,
            photo: image_url
        }

        const newUser = await createUser(user);

        if(isDefined(newUser)) {
            await clerkClient.users.updateUserMetadata(id, {
                publicMetadata: {
                    userId: newUser._id,
                }
            })
        }

        return NextResponse.json({ message: 'OK', user: newUser});
    }

    if(eventType === 'user.updated') {
        const { id, email_addresses, image_url, first_name, last_name, username } = evt.data; 

        const user = {
            clerkId: id,
            email: email_addresses[0].email_address,
            username: username!,
            firstName: first_name,
            lastName: last_name,
            photo: image_url
        }

        const updatedUser = await updateUser(id, user);

        if(isDefined(updatedUser)) {
            await clerkClient.users.updateUserMetadata(id, {
                publicMetadata: {
                    userId: updatedUser._id,
                }
            })
        }

        return NextResponse.json({ message: 'OK', user: updatedUser});
    }

    if(eventType === 'user.deleted') {
        const { id } = evt.data;
        const deletedUser = await deleteUser(id!);
        return NextResponse.json({ message: 'OK', user: deletedUser });
    }

    return new Response('Success', { status: 200 })
}