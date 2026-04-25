/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>تأكيد بريدك الإلكتروني في {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>جامعة أفريقيا الفرنسية العربية</Heading>
        </Section>
        <Section style={card}>
          <Heading style={h1}>تأكيد البريد الإلكتروني</Heading>
          <Text style={text}>
            شكراً لتسجيلك في{' '}
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>
            .
          </Text>
          <Text style={text}>
            يرجى تأكيد عنوان بريدك الإلكتروني (
            <Link href={`mailto:${recipient}`} style={link}>
              {recipient}
            </Link>
            ) بالضغط على الزر أدناه:
          </Text>
          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Button style={button} href={confirmationUrl}>
              تأكيد البريد الإلكتروني
            </Button>
          </Section>
          <Text style={footer}>
            إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذه الرسالة بأمان.
          </Text>
        </Section>
        <Text style={brandFooter}>
          مكتب القبول — جامعة أفريقيا الفرنسية العربية
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif",
}
const container = { padding: '20px 25px', maxWidth: '600px' }
const header = {
  borderBottom: '3px solid hsl(43, 90%, 52%)',
  paddingBottom: '12px',
  marginBottom: '20px',
}
const brand = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: 'hsl(215, 65%, 28%)',
  margin: '0',
  textAlign: 'center' as const,
}
const card = {
  backgroundColor: '#ffffff',
  border: '1px solid hsl(215, 20%, 88%)',
  borderRadius: '8px',
  padding: '28px',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: 'hsl(215, 65%, 28%)',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(215, 30%, 25%)',
  lineHeight: '1.7',
  margin: '0 0 18px',
}
const link = { color: 'hsl(215, 65%, 28%)', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(215, 65%, 28%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '8px',
  padding: '14px 32px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = {
  fontSize: '13px',
  color: 'hsl(215, 10%, 45%)',
  margin: '25px 0 0',
  lineHeight: '1.6',
}
const brandFooter = {
  fontSize: '12px',
  color: 'hsl(215, 10%, 45%)',
  textAlign: 'center' as const,
  margin: '20px 0 0',
}
