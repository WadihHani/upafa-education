/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>إعادة تعيين كلمة المرور لـ {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>جامعة أفريقيا الفرنسية العربية الافتراضية</Heading>
        </Section>
        <Section style={card}>
          <Heading style={h1}>إعادة تعيين كلمة المرور</Heading>
          <Text style={text}>
            تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في {siteName}.
            اضغط على الزر أدناه لاختيار كلمة مرور جديدة.
          </Text>
          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Button style={button} href={confirmationUrl}>
              إعادة تعيين كلمة المرور
            </Button>
          </Section>
          <Text style={footer}>
            إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان،
            ولن يتم تغيير كلمة المرور الخاصة بك.
          </Text>
        </Section>
        <Text style={brandFooter}>
          مكتب القبول — جامعة أفريقيا الفرنسية العربية الافتراضية
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
