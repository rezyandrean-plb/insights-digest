import { NextResponse } from "next/server";
import { db } from "@/db";
import { enquiries } from "@/db/schema";

export type ContactFormPayload = {
    enquiryAbout: string;
    fullName: string;
    email: string;
    contactNumber?: string;
    company?: string;
    inquiryContext?: string;
    lookingToAchieve?: string;
    projectTimeline?: string;
    estimatedBudget?: string;
    stage?: string;
    propertyType?: string;
    describeSituation?: string;
};

export async function POST(request: Request) {
    let body: ContactFormPayload;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { enquiryAbout, fullName, email } = body;
    if (!enquiryAbout?.trim() || !fullName?.trim() || !email?.trim()) {
        return NextResponse.json(
            { error: "Enquiry type, full name, and email are required." },
            { status: 400 }
        );
    }

    try {
        await db.insert(enquiries).values({
            enquiryAbout: enquiryAbout.trim(),
            fullName: fullName.trim(),
            email: email.trim(),
            contactNumber: body.contactNumber?.trim() ?? "",
            company: body.company?.trim() ?? "",
            inquiryContext: body.inquiryContext?.trim() ?? "",
            lookingToAchieve: body.lookingToAchieve?.trim() ?? "",
            projectTimeline: body.projectTimeline?.trim() ?? "",
            estimatedBudget: body.estimatedBudget?.trim() ?? "",
            stage: body.stage?.trim() ?? "",
            propertyType: body.propertyType?.trim() ?? "",
            describeSituation: body.describeSituation?.trim() ?? "",
        });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Contact form: failed to save enquiry", err);
        return NextResponse.json(
            { error: "Failed to save your enquiry. Please try again." },
            { status: 500 }
        );
    }
}
