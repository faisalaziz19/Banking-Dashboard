const RESEND_API_KEY = "re_LEACPbCx_NfgwYEz6rPG6sFtfaZcrSV2S";

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${RESEND_API_KEY}`,
  },
  body: JSON.stringify({
    from: "notification@dashboard-project-ay.site",
    to: ["arpityadav.exe@gmail.com"],
    subject: "Test Email",
    html: "<strong>it works!</strong>",
  }),
});
