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
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'جامعة أفريقيا الفرنسية العربية'

interface MofadlaConfirmationProps {
  fullName?: string
}

const MofadlaConfirmationEmail = ({ fullName }: MofadlaConfirmationProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>تم تسجيل طلبكم في مفاضلة القبول بنجاح</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>{SITE_NAME}</Heading>
          <Text style={subtitle}>مكتب القبول والتسجيل</Text>
        </Section>

        <Section style={contentSection}>
          <Text style={greeting}>
            {fullName
              ? `عزيزي/عزيزتي ${fullName}،`
              : 'عزيزي الطالب/عزيزتي الطالبة،'}
          </Text>
          <Text style={text}>تحية طيبة وبعد،</Text>
          <Text style={text}>
            نود إعلامكم بأنه قد تم تسجيل طلبكم في مفاضلة القبول في
            جامعة أفريقيا الفرنسية العربية بنجاح عبر النظام الإلكتروني،
            وتم حفظ بياناتكم ضمن قائمة المتقدمين.
          </Text>
          <Text style={text}>
            سيتم دراسة الطلب من قبل لجنة القبول، وسيتم التواصل معكم في
            حال الحاجة لأي معلومات إضافية أو مستندات داعمة، كما سيتم
            إشعاركم بنتيجة المفاضلة في الوقت المناسب.
          </Text>
          <Text style={text}>
            يرجى متابعة بريدكم الإلكتروني بشكل دوري لضمان استلام أي
            إشعارات صادرة عن مكتب القبول.
          </Text>
          <Text style={text}>مع أطيب التمنيات بالتوفيق والنجاح.</Text>
        </Section>

        <Section style={footerSection}>
          <Text style={footerTitle}>مكتب القبول</Text>
          <Text style={footerText}>{SITE_NAME}</Text>
          <Text style={footerText}>هاتف: 00963989801010</Text>
          <Text style={footerText}>
            البريد الإلكتروني: administration@upafa.education
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: MofadlaConfirmationEmail,
  subject: 'تأكيد تسجيل طلبكم في مفاضلة القبول - جامعة أفريقيا الفرنسية العربية',
  displayName: 'Mofadla Application Confirmation',
  previewData: { fullName: 'محمد أحمد' },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"Segoe UI", Tahoma, Arial, sans-serif',
  margin: 0,
  padding: 0,
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
}

const header = {
  textAlign: 'center' as const,
  padding: '24px 20px',
  backgroundColor: '#0a3d62',
  borderRadius: '8px 8px 0 0',
}

const h1 = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  margin: '0 0 6px',
}

const subtitle = {
  color: '#d4af37',
  fontSize: '14px',
  margin: 0,
}

const contentSection = {
  padding: '28px 24px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderTop: 'none',
}

const greeting = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#0a3d62',
  margin: '0 0 16px',
  textAlign: 'right' as const,
}

const text = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '1.8',
  margin: '0 0 14px',
  textAlign: 'right' as const,
}

const footerSection = {
  padding: '20px 24px',
  backgroundColor: '#f9fafb',
  borderRadius: '0 0 8px 8px',
  border: '1px solid #e5e7eb',
  borderTop: '2px solid #d4af37',
  textAlign: 'right' as const,
}

const footerTitle = {
  fontSize: '14px',
  fontWeight: 'bold' as const,
  color: '#0a3d62',
  margin: '0 0 6px',
}

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 4px',
  lineHeight: '1.6',
}
