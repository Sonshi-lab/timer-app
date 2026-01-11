import { getServerSession } from "next-auth";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken as string });

        const tasks = google.tasks({ version: "v1", auth: oauth2Client });

        // First get the default task list
        const taskLists = await tasks.tasklists.list({ maxResults: 1 });
        const defaultListId = taskLists.data.items?.[0]?.id;

        if (!defaultListId) {
            return NextResponse.json({ tasks: [] });
        }

        // Then get tasks from that list
        const response = await tasks.tasks.list({
            tasklist: defaultListId,
            showCompleted: false,
            maxResults: 10,
        });

        return NextResponse.json({ tasks: response.data.items || [] });
    } catch (error) {
        console.error("Google Tasks API Error:", error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}
