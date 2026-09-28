import { Section } from '../../components/layout/Section';
import { Stack } from '../../components/layout/Stack';
import { Heading, Text } from '../../components/typography/Typography';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { Checkbox } from '../../components/forms/Checkbox';
import { FileUpload } from '../../components/forms/FileUpload';
import { Select } from '../../components/forms/Select';
import { Textarea } from '../../components/forms/Textarea';
import { TextField } from '../../components/forms/TextField';
import { serviceInterestOptions } from '../../data/sample-content';

export function FormsSection() {
  return (
    <Section id="forms" background="stone" spacing="lg">
      <Stack space="xl">
        <SectionHeader
          eyebrow="Form Fields"
          heading="Essential inputs, not a full form"
          description="These are the field-level building blocks only. Complete contact and career forms are out of scope for this phase."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TextField label="Full name" placeholder="Ahmed Al Mansoori" required />
          <TextField type="email" label="Email address" placeholder="ahmed@company.ae" required />
          <TextField type="tel" label="Phone number" placeholder="+971 50 000 0000" helperText="Include country code." />
          <Select label="Service interest" placeholder="Select a service" options={serviceInterestOptions} required />
          <TextField label="Company" placeholder="Company name" error="Company name is required." />
          <FileUpload label="Project brief" helperText="PDF or DWG, up to 10MB." />
        </div>

        <Textarea label="Project details" placeholder="Tell us about your project scope, timeline, and location." helperText="Minimum 50 characters." />

        <Checkbox label="Send me updates on MENASCO projects and insights" />

        <Text variant="caption" muted>
          Every field carries a `FormLabel`, optional `HelperText`, and an `ErrorMessage` state with `aria-invalid` and `aria-describedby` wired correctly.
        </Text>
      </Stack>
    </Section>
  );
}
