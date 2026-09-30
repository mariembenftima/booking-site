import { Resend } from 'resend'

const TO = 'mariembenftima@gmail.com'

const resend = new Resend(process.env.RESEND_API_KEY)
const { data, error } = await resend.emails.send({
  from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  to: TO,
  subject: 'Test from the booking site 🌿',
  text: 'If you can read this, Resend works!',
})

console.log(error ? `❌ ${error.message}` : `✅ Sent, id ${data?.id}`)
process.exit(0)