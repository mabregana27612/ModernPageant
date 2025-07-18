
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function updateUserRole() {
  try {
    const userId = "40942172";
    
    // Update the user's role to admin
    const [updatedUser] = await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, userId))
      .returning();
    
    if (updatedUser) {
      console.log(`Successfully updated user ${userId} to admin role`);
      console.log(`User: ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email})`);
    } else {
      console.log(`User with ID ${userId} not found`);
    }
  } catch (error) {
    console.error("Error updating user role:", error);
  } finally {
    process.exit(0);
  }
}

updateUserRole();
