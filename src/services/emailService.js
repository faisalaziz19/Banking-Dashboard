// const RESEND_API_KEY = "re_LEACPbCx_NfgwYEz6rPG6sFtfaZcrSV2S";
// const FROM_EMAIL = "notification@dashboard-project-ay.site";

// export async function sendEmail(to, subject, htmlContent) {
//   try {
//     const res = await fetch("https://api.resend.com/emails", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${RESEND_API_KEY}`,
//       },
//       body: JSON.stringify({
//         from: FROM_EMAIL,
//         to,
//         subject,
//         html: htmlContent,
//       }),
//     });

//     if (!res.ok) {
//       throw new Error("Failed to send email");
//     }

//     return await res.json();
//   } catch (error) {
//     console.error("Email sending failed:", error);
//     throw error;
//   }
// }

// export async function sendWelcomeEmail(userEmail) {
//   return sendEmail(
//     userEmail,
//     "Welcome to Dashboard - Account Created",
//     `<p>Thank you for signing up! Your account has been created successfully.</p>
//      <p>An administrator will assign you an appropriate role shortly.</p>`
//   );
// }

// export async function notifyAdminsNewUser(adminEmails, newUser) {
//   const notifications = adminEmails.map((adminEmail) =>
//     sendEmail(
//       adminEmail,
//       "New User Registration",
//       `<p>A new user has signed up:</p>
//        <p>Name: ${newUser.fullName}</p>
//        <p>Email: ${newUser.email}</p>
//        <p>Please assign an appropriate role to this user.</p>`
//     )
//   );

//   return Promise.all(notifications);
// }

// export async function sendRoleAssignedEmail(userEmail, role) {
//   return sendEmail(
//     userEmail,
//     "Role Assigned Successfully",
//     `<p>Your role has been successfully assigned as "${role}".</p>
//      <p>You can now log in to access your account.</p>`
//   );
// }

const BACKEND_URL = "http://localhost:5000/api"; // Adjust based on your backend URL

export async function sendEmail(to, subject, htmlContent) {
  try {
    const res = await fetch(`${BACKEND_URL}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to send email");
    }

    return await res.json();
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(userEmail) {
  return sendEmail(
    userEmail,
    "Welcome to Dashboard - Account Created",
    `<p>Thank you for signing up! Your account has been created successfully.</p>
     <p>An administrator will assign you an appropriate role shortly.</p>`
  );
}

export async function notifyAdminsNewUser(adminEmails, newUser) {
  console.log("Notifying admins about the new user:", newUser); // Log the new user data
  const notifications = adminEmails.map((adminEmail) => {
    console.log("Sending email to admin:", adminEmail); // Log each admin email
    return sendEmail(
      adminEmail,
      "New User Registration",
      `<p>A new user has signed up:</p>
         <p>Name: ${newUser.fullName}</p>
         <p>Email: ${newUser.email}</p>
         <p>Please assign an appropriate role to this user.</p>`
    );
  });

  try {
    await Promise.all(notifications);
    console.log("All admin notifications sent successfully.");
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
}

export async function sendRoleAssignedEmail(userEmail, role) {
  // Set email subject and body based on the role condition
  let emailData;

  if (role === "Pending") {
    emailData = {
      to: userEmail,
      subject: "Temporary Block",
      html: `<p>Your account has been temporarily blocked. Please contact administrator regarding the same.</p>`,
    };
  } else {
    emailData = {
      to: userEmail,
      subject: "Role Assigned Successfully",
      html: `<p>Your role has been successfully assigned as "${role}".</p>
               <p>You can now log in to access your account.</p>`,
    };
  }

  console.log("Email data to send:", emailData); // Debug log for email data

  try {
    const response = await fetch("http://localhost:5000/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Email sent successfully:", data); // Log success
    } else {
      console.error(
        "Failed to send email:",
        response.status,
        response.statusText,
        data
      ); // Log detailed error
    }
  } catch (error) {
    console.error("Error in sending email:", error); // Log network errors
  }
}

export async function sendAccountDeletedEmail(userEmail) {
  const emailData = {
    to: userEmail,
    subject: "Account Deleted Notification",
    html: `<p>Your account has been deleted by an administrator. If you believe this is a mistake, please contact support.</p>`,
  };

  console.log("Email data for account deletion:", emailData); // Debug log for email data

  try {
    const response = await fetch("http://localhost:5000/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Account deletion email sent successfully:", data);
    } else {
      console.error(
        "Failed to send account deletion email:",
        response.status,
        response.statusText,
        data
      );
    }
  } catch (error) {
    console.error("Error in sending account deletion email:", error);
  }
}
