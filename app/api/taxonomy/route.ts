import { NextResponse } from "next/server";
import { getJobCategories, getJobFamilies, getJobRoles, getIndustries } from "@/lib/taxonomy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");
  const familyId = searchParams.get("familyId");

  try {
    switch (type) {
      case "categories": {
        const categories = await getJobCategories();
        return NextResponse.json(categories);
      }
      
      case "families": {
        const families = await getJobFamilies(categoryId || undefined);
        return NextResponse.json(families);
      }
      
      case "roles": {
        const roles = await getJobRoles(familyId || undefined);
        return NextResponse.json(roles);
      }
      
      case "industries": {
        const industries = await getIndustries();
        return NextResponse.json(industries);
      }
      
      default:
        return NextResponse.json({ error: "Invalid type parameter. Use categories, families, roles, or industries." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in taxonomy API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
