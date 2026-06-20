/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>رمز التحقق الخاص بك</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>جامعة أفريقيا الفرنسية العربية الافتراضية</Heading>
        </Section>
        <Section style={card}>
          <Heading style={h1}>تأكيد إعادة المصادقة</Heading>
          <Text style={text}>استخدم الرمز أدناه لتأكيد هويتك:</Text>
          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={footer}>
            سينتهي صلاحية هذا الرمز خلال فترة قصيرة. إذا لم تطلب ذلك، يمكنك
            تجاهل هذه الرسالة بأمان.
          </Text>
        </Section>
        <Text style={brandFooter}>
          مكتب القبول — جامعة أفريقيا الفرنسية العربية الافتراضية
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  color: 'hsl(215, 65%, 28%)',
  letterSpacing: '6px',
  backgroundColor: 'hsl(215, 15%, 95%)',
  padding: '16px 24px',
  borderRadius: '8px',
  display: 'inline-block',
  margin: '0',
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
