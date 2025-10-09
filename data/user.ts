import { apiClient } from "@/hooks/api-client";

const login = async (email: string, password: string) => {
  try {
    const result = await signIn.create({
      identifier: email,
      password,
    });

    if (result.status === "complete") {
      await signIn.setActive({ session: result.createdSessionId });

      const response = await apiClient.post("/auth/login", {
        clerkId: result.createdUserId,
        email,
      });

      return response.data;
    } else {
      throw new Error("Login incomplete. Additional steps required.");
    }
  } catch (error: any) {
    console.error("Clerk login failed:", error.errors?.[0]?.message || error.message);
    throw error;
  }
};


const register = async (email: string, password: string) => {
  const clerkUser = await createUser({ emailAddress: [email], password });

  // const response = await apiClient.post("/auth/register", {
  //   clerkId: clerkUser.id,
  //   email,
  // });

  return clerkUser;
};

const requestPasswordReset = async (email: string) => {
  try {
    const result = await signIn.create({
      strategy: "reset_password_email_code",
      identifier: email,
    });
    return result;
  } catch (error: any) {
    console.error("Password reset request failed:", error.errors?.[0]?.message || error.message);
    throw error;
  }
};

const resetPassword = async (email: string, code: string, newPassword: string) => {
  try {
    const result = await signIn.attemptFirstFactor({
      strategy: "reset_password_email_code",
      code,
      password: newPassword,
    });

    if (result.status === "complete") {
      await signIn.setActive({ session: result.createdSessionId });
      return result;
    } else {
      throw new Error("Password reset incomplete. Additional steps required.");
    }
  } catch (error: any) {
    console.error("Password reset failed:", error.errors?.[0]?.message || error.message);
    throw error;
  }
};

export { login, register, requestPasswordReset, resetPassword };

